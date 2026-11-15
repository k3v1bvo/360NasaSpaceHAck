"""
Flame in Freefall — Cool Flame Anomaly Detector
NASA Space Apps Challenge 2026

Detects cool flame (LTC) regimes and reignition risk using
Isolation Forest + One-Class SVM trained on normal combustion signatures.
"""

import os
import numpy as np
import pandas as pd
from pathlib import Path

from sklearn.ensemble import IsolationForest
from sklearn.svm import OneClassSVM
from sklearn.preprocessing import StandardScaler
import joblib

from ml.data_generator import generate_combustion_telemetry

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")


class CoolFlameDetector:
    """
    Anomaly detector for cool flame (Low-Temperature Chemistry) regimes.

    Uses an ensemble of Isolation Forest and One-Class SVM trained on
    *normal* hot-combustion telemetry. Points that deviate strongly from
    the learned normal manifold are flagged as probable cool flame events.
    """

    FEATURE_COLS = ["T_mean_K", "T_std_K", "H2O2_ppm", "CH2O_ppm", "CO_ppm"]

    # Cool flame signature thresholds (from SoFIE / BASS-II literature)
    COOL_FLAME_T_UPPER   = 850.0   # K
    COOL_FLAME_T_LOWER   = 550.0   # K
    COOL_FLAME_H2O2_MIN  = 10.0    # ppm
    COOL_FLAME_CH2O_MIN  = 8.0     # ppm

    def __init__(self):
        self.iso_forest = None
        self.ocsvm = None
        self.scaler = StandardScaler()

        # Tuneable alert thresholds
        self.alert_threshold_cool  = 0.60   # P(cool flame) > this → alert
        self.alert_threshold_reig  = 0.45   # P(reignition) > this → alert

    # ── training ────────────────────────────────────────────────────────

    def train(self, df: pd.DataFrame = None, contamination: float = 0.05):
        """
        Train anomaly detectors on *normal* combustion telemetry only.

        Parameters
        ----------
        df : DataFrame with at least FEATURE_COLS. If has 'regime' column,
             only 'normal' rows are used for training.
        contamination : expected fraction of anomalies (for IF threshold).
        """
        if df is None:
            df = generate_combustion_telemetry()

        if "regime" in df.columns:
            train_df = df[df["regime"] == "normal"].copy()
        else:
            train_df = df.copy()

        X = train_df[self.FEATURE_COLS].values
        X = self.scaler.fit_transform(X)

        # Isolation Forest
        self.iso_forest = IsolationForest(
            n_estimators=200,
            contamination=contamination,
            random_state=42,
            n_jobs=-1,
        )
        self.iso_forest.fit(X)

        # One-Class SVM
        self.ocsvm = OneClassSVM(
            kernel="rbf",
            gamma="scale",
            nu=contamination,
        )
        self.ocsvm.fit(X)

        print(f"  [cool_flame_detector] trained on {len(train_df)} normal samples")
        return self

    # ── detection ───────────────────────────────────────────────────────

    def detect_cool_flame(self, temperature_series: np.ndarray,
                          species_series: dict) -> dict:
        """
        Return probability that a given telemetry window is a cool flame regime.

        Parameters
        ----------
        temperature_series : 1-D array of recent temperature readings (K).
        species_series     : dict with keys 'H2O2_ppm', 'CH2O_ppm', 'CO_ppm'
                             (each a scalar or the mean over the window).

        Returns
        -------
        dict with probability, is_cool_flame, evidence
        """
        T_mean = float(np.mean(temperature_series))
        T_std  = float(np.std(temperature_series))
        H2O2   = float(species_series.get("H2O2_ppm", 0))
        CH2O   = float(species_series.get("CH2O_ppm", 0))
        CO     = float(species_series.get("CO_ppm", 0))

        features = np.array([[T_mean, T_std, H2O2, CH2O, CO]])

        # Rule-based score component (physics)
        rule_score = 0.0
        if self.COOL_FLAME_T_LOWER <= T_mean <= self.COOL_FLAME_T_UPPER:
            rule_score += 0.35
        if H2O2 >= self.COOL_FLAME_H2O2_MIN:
            rule_score += 0.25
        if CH2O >= self.COOL_FLAME_CH2O_MIN:
            rule_score += 0.20
        if T_std < 40:
            rule_score += 0.10

        # ML anomaly score component
        ml_score = 0.0
        if self.iso_forest is not None:
            X_scaled = self.scaler.transform(features)
            iso_score = -self.iso_forest.score_samples(X_scaled)[0]  # higher = more anomalous
            iso_score = np.clip((iso_score - 0.3) / 0.4, 0, 1)      # normalise to [0, 1]

            svm_pred = self.ocsvm.predict(X_scaled)[0]               # -1 = anomaly
            svm_flag = 1.0 if svm_pred == -1 else 0.0

            ml_score = 0.6 * iso_score + 0.4 * svm_flag

        probability = float(np.clip(0.4 * rule_score + 0.6 * ml_score, 0, 1))

        evidence = []
        if self.COOL_FLAME_T_LOWER <= T_mean <= self.COOL_FLAME_T_UPPER:
            evidence.append(f"Temperature {T_mean:.0f} K in cool-flame band (550-850 K)")
        if H2O2 >= self.COOL_FLAME_H2O2_MIN:
            evidence.append(f"H₂O₂ elevated ({H2O2:.1f} ppm ≥ {self.COOL_FLAME_H2O2_MIN})")
        if CH2O >= self.COOL_FLAME_CH2O_MIN:
            evidence.append(f"CH₂O elevated ({CH2O:.1f} ppm ≥ {self.COOL_FLAME_CH2O_MIN})")

        return {
            "cool_flame_probability": round(probability, 4),
            "is_cool_flame": probability >= self.alert_threshold_cool,
            "T_mean_K": round(T_mean, 1),
            "evidence": evidence,
        }

    def detect_reignition_risk(self, current_state: dict) -> dict:
        """
        Predict likelihood of reignition after apparent extinction.

        Reignition occurs when accumulated H₂O₂/CH₂O decompose exothermally,
        restarting the flame.  Risk correlates with residual peroxide
        concentration and oxygen availability.

        Parameters
        ----------
        current_state : dict with keys T_mean_K, H2O2_ppm, CH2O_ppm,
                        CO_ppm, O2_concentration
        """
        H2O2 = current_state.get("H2O2_ppm", 0)
        CH2O = current_state.get("CH2O_ppm", 0)
        T    = current_state.get("T_mean_K", 298)
        O2   = current_state.get("O2_concentration", 0.21)

        # Empirical reignition probability model (Nishioka et al.)
        peroxide_factor = np.clip(H2O2 / 40.0, 0, 1)
        formaldehyde_f  = np.clip(CH2O / 30.0, 0, 1)
        temp_factor     = np.clip((T - 500) / 300.0, 0, 1) if T < 850 else 0.2
        o2_factor       = np.clip(O2 / 0.21, 0.5, 1.5)

        probability = float(np.clip(
            0.35 * peroxide_factor + 0.25 * formaldehyde_f + 0.25 * temp_factor + 0.15 * o2_factor,
            0, 1
        ))

        risk_level = "High" if probability > 0.65 else ("Medium" if probability > 0.35 else "Low")

        factors = []
        if peroxide_factor > 0.5:
            factors.append(f"High H₂O₂ ({H2O2:.1f} ppm) — peroxide decomposition may trigger reignition")
        if formaldehyde_f > 0.5:
            factors.append(f"Elevated CH₂O ({CH2O:.1f} ppm) — formaldehyde pool active")
        if temp_factor > 0.5:
            factors.append(f"Temperature {T:.0f} K in NTC (Negative Temperature Coefficient) zone")

        return {
            "reignition_probability": round(probability, 4),
            "risk_level": risk_level,
            "is_alert": probability >= self.alert_threshold_reig,
            "contributing_factors": factors,
        }

    # ── threshold calibration ───────────────────────────────────────────

    def calibrate_thresholds(self, cool_threshold: float = None,
                             reignition_threshold: float = None):
        """Adjust alert thresholds."""
        if cool_threshold is not None:
            self.alert_threshold_cool = float(np.clip(cool_threshold, 0.1, 0.95))
        if reignition_threshold is not None:
            self.alert_threshold_reig = float(np.clip(reignition_threshold, 0.1, 0.95))
        print(f"  [thresholds] cool={self.alert_threshold_cool}  reignition={self.alert_threshold_reig}")

    # ── persistence ─────────────────────────────────────────────────────

    def save(self, model_dir: str = None):
        model_dir = model_dir or MODEL_DIR
        Path(model_dir).mkdir(parents=True, exist_ok=True)
        joblib.dump(self.iso_forest, os.path.join(model_dir, "cool_flame_iso_forest.joblib"))
        joblib.dump(self.ocsvm, os.path.join(model_dir, "cool_flame_ocsvm.joblib"))
        joblib.dump(self.scaler, os.path.join(model_dir, "cool_flame_scaler.joblib"))
        print(f"  [save] Cool flame detector saved to {model_dir}/")

    def load(self, model_dir: str = None):
        model_dir = model_dir or MODEL_DIR
        self.iso_forest = joblib.load(os.path.join(model_dir, "cool_flame_iso_forest.joblib"))
        self.ocsvm = joblib.load(os.path.join(model_dir, "cool_flame_ocsvm.joblib"))
        self.scaler = joblib.load(os.path.join(model_dir, "cool_flame_scaler.joblib"))
        print(f"  [load] Cool flame detector loaded from {model_dir}/")
