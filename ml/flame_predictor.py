"""
Flame in Freefall — ML Prediction Engine
NASA Space Apps Challenge 2026

Ensemble models for:
  1. Flame spread rate prediction  (regression)
  2. LOI microgravity shift        (regression / FLARE correlation)
  3. Risk classification           (Safe / Caution / Danger)
"""

import os
import json
import warnings
import numpy as np
import pandas as pd
from pathlib import Path

from sklearn.ensemble import (
    RandomForestRegressor,
    GradientBoostingRegressor,
    RandomForestClassifier,
    GradientBoostingClassifier,
    VotingRegressor,
    VotingClassifier,
)
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import cross_val_score, cross_val_predict
from sklearn.metrics import (
    mean_squared_error, r2_score,
    accuracy_score, f1_score, classification_report,
)
from sklearn.inspection import permutation_importance
import joblib

from ml.data_generator import (
    generate_flame_spread_dataset,
    generate_loi_dataset,
    generate_risk_dataset,
    MATERIALS,
)

warnings.filterwarnings("ignore", category=UserWarning)

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")


class FlamePredictor:
    """
    Ensemble predictor for microgravity flame behaviour.

    Models
    ------
    - flame_spread : VotingRegressor (RF + GBR) → V_f (mm/s)
    - loi_shift    : VotingRegressor (RF + GBR) → LOI_microgravity (%)
    - risk         : VotingClassifier (RF + GBC) → Safe / Caution / Danger
    """

    def __init__(self):
        self.flame_model = None
        self.loi_model = None
        self.risk_model = None

        self.flame_scaler = StandardScaler()
        self.loi_scaler = StandardScaler()
        self.risk_scaler = StandardScaler()

        self.material_encoder = LabelEncoder()
        self.material_encoder.fit(MATERIALS)

        self.risk_encoder = LabelEncoder()
        self.risk_encoder.fit(["Safe", "Caution", "Danger"])

        # Cached feature-importance arrays
        self._flame_importance = None
        self._loi_importance = None
        self._risk_importance = None

        # Cross-validation metrics
        self.metrics = {}

    # ── helpers ──────────────────────────────────────────────────────────

    @staticmethod
    def _one_hot_material(df: pd.DataFrame, materials: list) -> pd.DataFrame:
        """One-hot encode material_type into separate columns."""
        col = "material_type" if "material_type" in df.columns else "material"
        for mat in materials:
            df[f"mat_{mat}"] = (df[col] == mat).astype(int)
        return df

    def _prepare_flame_features(self, df: pd.DataFrame) -> np.ndarray:
        df = df.copy()
        df = self._one_hot_material(df, list(self.material_encoder.classes_))
        feature_cols = (
            ["O2_concentration", "pressure_atm", "flow_velocity_cm_s", "fuel_diameter_mm"]
            + [f"mat_{m}" for m in self.material_encoder.classes_]
        )
        return df[feature_cols].values, feature_cols

    def _prepare_loi_features(self, df: pd.DataFrame) -> np.ndarray:
        df = df.copy()
        df = self._one_hot_material(df, list(self.material_encoder.classes_))
        feature_cols = (
            ["LOI_1g", "material_thickness_mm", "O2_concentration", "pressure_atm"]
            + [f"mat_{m}" for m in self.material_encoder.classes_]
        )
        return df[feature_cols].values, feature_cols

    def _prepare_risk_features(self, df: pd.DataFrame) -> np.ndarray:
        df = df.copy()
        df = self._one_hot_material(df, list(self.material_encoder.classes_))
        feature_cols = (
            ["O2_concentration", "pressure_atm", "flow_velocity_cm_s",
             "fuel_diameter_mm", "material_thickness_mm",
             "flame_spread_rate_mm_s", "LOI_microgravity"]
            + [f"mat_{m}" for m in self.material_encoder.classes_]
        )
        return df[feature_cols].values, feature_cols

    # ── training ────────────────────────────────────────────────────────

    def generate_training_data(self, n_samples: int = 5000):
        """
        Generate physics-informed synthetic datasets using flame_kinetics
        equations with controlled noise and edge cases.
        """
        flame_df = generate_flame_spread_dataset(n_samples=n_samples)
        loi_df   = generate_loi_dataset(n_samples=max(n_samples // 2, 1500))
        risk_df  = generate_risk_dataset(n_samples=n_samples)
        return flame_df, loi_df, risk_df

    def train_flame_spread_model(self, df: pd.DataFrame = None, cv: int = 5):
        """
        Train RF + Gradient Boosting ensemble to predict flame spread rate V_f.
        """
        if df is None:
            df = generate_flame_spread_dataset()

        X, cols = self._prepare_flame_features(df)
        y = df["flame_spread_rate_mm_s"].values

        X = self.flame_scaler.fit_transform(X)

        rf  = RandomForestRegressor(n_estimators=200, max_depth=16, random_state=42, n_jobs=-1)
        gbr = GradientBoostingRegressor(n_estimators=200, max_depth=6, learning_rate=0.08,
                                        random_state=42)
        ensemble = VotingRegressor(estimators=[("rf", rf), ("gbr", gbr)])
        ensemble.fit(X, y)

        # Cross-validation
        cv_r2  = cross_val_score(ensemble, X, y, cv=cv, scoring="r2")
        cv_rmse = -cross_val_score(ensemble, X, y, cv=cv, scoring="neg_root_mean_squared_error")

        self.flame_model = ensemble
        self._flame_feature_cols = cols
        self.metrics["flame_spread"] = {
            "R2_cv_mean": round(float(cv_r2.mean()), 4),
            "R2_cv_std":  round(float(cv_r2.std()), 4),
            "RMSE_cv_mean": round(float(cv_rmse.mean()), 4),
        }

        # Feature importance (average of RF + GBR importances)
        rf_imp  = ensemble.named_estimators_["rf"].feature_importances_
        gbr_imp = ensemble.named_estimators_["gbr"].feature_importances_
        self._flame_importance = dict(zip(cols, np.round((rf_imp + gbr_imp) / 2, 4)))

        print(f"  [flame_spread] R²={cv_r2.mean():.4f}±{cv_r2.std():.4f}  RMSE={cv_rmse.mean():.4f}")
        return self.metrics["flame_spread"]

    def train_loi_predictor(self, df: pd.DataFrame = None, cv: int = 5):
        """
        Train ensemble to predict LOI_microgravity from LOI_1g + conditions.
        """
        if df is None:
            df = generate_loi_dataset()

        X, cols = self._prepare_loi_features(df)
        y = df["LOI_microgravity"].values

        X = self.loi_scaler.fit_transform(X)

        rf  = RandomForestRegressor(n_estimators=200, max_depth=14, random_state=42, n_jobs=-1)
        gbr = GradientBoostingRegressor(n_estimators=200, max_depth=5, learning_rate=0.1,
                                        random_state=42)
        ensemble = VotingRegressor(estimators=[("rf", rf), ("gbr", gbr)])
        ensemble.fit(X, y)

        cv_r2  = cross_val_score(ensemble, X, y, cv=cv, scoring="r2")
        cv_rmse = -cross_val_score(ensemble, X, y, cv=cv, scoring="neg_root_mean_squared_error")

        self.loi_model = ensemble
        self._loi_feature_cols = cols
        self.metrics["loi_shift"] = {
            "R2_cv_mean": round(float(cv_r2.mean()), 4),
            "R2_cv_std":  round(float(cv_r2.std()), 4),
            "RMSE_cv_mean": round(float(cv_rmse.mean()), 4),
        }

        rf_imp  = ensemble.named_estimators_["rf"].feature_importances_
        gbr_imp = ensemble.named_estimators_["gbr"].feature_importances_
        self._loi_importance = dict(zip(cols, np.round((rf_imp + gbr_imp) / 2, 4)))

        print(f"  [loi_shift]    R²={cv_r2.mean():.4f}±{cv_r2.std():.4f}  RMSE={cv_rmse.mean():.4f}")
        return self.metrics["loi_shift"]

    def train_risk_classifier(self, df: pd.DataFrame = None, cv: int = 5):
        """
        Train multi-class classifier for Safe / Caution / Danger.
        """
        if df is None:
            df = generate_risk_dataset()

        X, cols = self._prepare_risk_features(df)
        y = self.risk_encoder.transform(df["risk_label"].values)

        X = self.risk_scaler.fit_transform(X)

        rf  = RandomForestClassifier(n_estimators=200, max_depth=14, random_state=42, n_jobs=-1)
        gbc = GradientBoostingClassifier(n_estimators=200, max_depth=5, learning_rate=0.1,
                                         random_state=42)
        ensemble = VotingClassifier(estimators=[("rf", rf), ("gbc", gbc)], voting="soft")
        ensemble.fit(X, y)

        cv_acc = cross_val_score(ensemble, X, y, cv=cv, scoring="accuracy")
        cv_f1  = cross_val_score(ensemble, X, y, cv=cv, scoring="f1_weighted")

        self.risk_model = ensemble
        self._risk_feature_cols = cols
        self.metrics["risk_classifier"] = {
            "accuracy_cv_mean": round(float(cv_acc.mean()), 4),
            "accuracy_cv_std":  round(float(cv_acc.std()), 4),
            "F1_weighted_cv_mean": round(float(cv_f1.mean()), 4),
        }

        rf_imp  = ensemble.named_estimators_["rf"].feature_importances_
        gbc_imp = ensemble.named_estimators_["gbc"].feature_importances_
        self._risk_importance = dict(zip(cols, np.round((rf_imp + gbc_imp) / 2, 4)))

        print(f"  [risk_class]   Acc={cv_acc.mean():.4f}±{cv_acc.std():.4f}  F1={cv_f1.mean():.4f}")
        return self.metrics["risk_classifier"]

    # ── prediction ──────────────────────────────────────────────────────

    def predict_flame_spread(self, params: dict) -> dict:
        """
        Predict flame spread rate with confidence interval.

        Parameters
        ----------
        params : dict with keys O2_concentration, pressure_atm,
                 flow_velocity_cm_s, fuel_diameter_mm, material_type

        Returns
        -------
        dict with prediction, confidence_interval, feature_importance
        """
        if self.flame_model is None:
            raise RuntimeError("Flame spread model not trained. Call train_flame_spread_model() first.")

        df = pd.DataFrame([params])
        X, _ = self._prepare_flame_features(df)
        X = self.flame_scaler.transform(X)

        # Get individual estimator predictions for confidence
        preds = np.array([est.predict(X)[0] for est in
                          [self.flame_model.named_estimators_["rf"],
                           self.flame_model.named_estimators_["gbr"]]])

        # Also sample RF tree predictions for uncertainty
        rf_trees = self.flame_model.named_estimators_["rf"].estimators_
        tree_preds = np.array([t.predict(X)[0] for t in rf_trees])
        std = float(tree_preds.std())

        mean_pred = float(preds.mean())
        val = round(max(mean_pred, 0), 4)
        return {
            "flame_spread_rate_mm_s": val,
            "predicted_V_f_mm_s": val,
            "confidence_interval_95": [round(max(mean_pred - 1.96 * std, 0), 4),
                                       round(mean_pred + 1.96 * std, 4)],
            "feature_importance": self._flame_importance,
        }

    def predict_loi_shift(self, params: dict) -> dict:
        """
        Predict microgravity LOI with uncertainty.
        """
        if self.loi_model is None:
            raise RuntimeError("LOI model not trained. Call train_loi_predictor() first.")

        p = dict(params)
        mat = p.get("material_type") or p.get("material", "PMMA")
        p["material_type"] = mat
        if "LOI_1g" not in p:
            loi_defaults = {"PMMA": 17.3, "ETFE_Wire": 30.0, "Nomex": 28.5, "Cotton": 18.0, "Polyethylene": 17.4}
            p["LOI_1g"] = loi_defaults.get(mat, 21.0)
        if "material_thickness_mm" not in p:
            p["material_thickness_mm"] = p.get("fuel_diameter_mm", 1.0)

        df = pd.DataFrame([p])
        X, _ = self._prepare_loi_features(df)
        X = self.loi_scaler.transform(X)

        preds = np.array([est.predict(X)[0] for est in
                          [self.loi_model.named_estimators_["rf"],
                           self.loi_model.named_estimators_["gbr"]]])

        rf_trees = self.loi_model.named_estimators_["rf"].estimators_
        tree_preds = np.array([t.predict(X)[0] for t in rf_trees])
        std = float(tree_preds.std())

        mean_pred = float(preds.mean())
        loi_1g = p["LOI_1g"]
        return {
            "LOI_microgravity_predicted": round(mean_pred, 3),
            "uncertainty_95": [round(mean_pred - 1.96 * std, 3),
                               round(mean_pred + 1.96 * std, 3)],
            "LOI_1g": loi_1g,
            "shift_pp": round(mean_pred - loi_1g, 3),
            "feature_importance": self._loi_importance,
        }

    def classify_risk(self, params: dict) -> dict:
        """
        Classify risk level with explanation.
        """
        if self.risk_model is None:
            raise RuntimeError("Risk model not trained. Call train_risk_classifier() first.")

        p = dict(params)
        mat = p.get("material_type") or p.get("material", "PMMA")
        p["material_type"] = mat
        if "material_thickness_mm" not in p:
            p["material_thickness_mm"] = p.get("fuel_diameter_mm", 1.0)
        if "flame_spread_rate_mm_s" not in p:
            flame_res = self.predict_flame_spread(p)
            p["flame_spread_rate_mm_s"] = flame_res["flame_spread_rate_mm_s"]
        if "LOI_microgravity" not in p:
            loi_res = self.predict_loi_shift(p)
            p["LOI_microgravity"] = loi_res["LOI_microgravity_predicted"]

        df = pd.DataFrame([p])
        X, cols = self._prepare_risk_features(df)
        X = self.risk_scaler.transform(X)

        proba = self.risk_model.predict_proba(X)[0]
        pred_idx = int(np.argmax(proba))
        label = self.risk_encoder.inverse_transform([pred_idx])[0]

        # Identify top-3 driving features
        importance = self._risk_importance or {}
        sorted_feats = sorted(importance.items(), key=lambda x: x[1], reverse=True)[:3]

        return {
            "risk_level": label,
            "probabilities": {
                self.risk_encoder.inverse_transform([i])[0]: round(float(p), 4)
                for i, p in enumerate(proba)
            },
            "top_drivers": [{"feature": f, "importance": float(v)} for f, v in sorted_feats],
        }

    # ── feature importance ──────────────────────────────────────────────

    def get_feature_importance(self) -> dict:
        """Return SHAP-like permutation feature importance for all models."""
        return {
            "flame_spread": self._flame_importance,
            "loi_shift": self._loi_importance,
            "risk_classifier": self._risk_importance,
        }

    # ── persistence ─────────────────────────────────────────────────────

    def save_models(self, model_dir: str = None):
        """Save trained models, scalers and encoders to disk."""
        model_dir = model_dir or MODEL_DIR
        Path(model_dir).mkdir(parents=True, exist_ok=True)

        if self.flame_model:
            joblib.dump(self.flame_model, os.path.join(model_dir, "flame_spread_model.joblib"))
            joblib.dump(self.flame_scaler, os.path.join(model_dir, "flame_spread_scaler.joblib"))
        if self.loi_model:
            joblib.dump(self.loi_model, os.path.join(model_dir, "loi_shift_model.joblib"))
            joblib.dump(self.loi_scaler, os.path.join(model_dir, "loi_shift_scaler.joblib"))
        if self.risk_model:
            joblib.dump(self.risk_model, os.path.join(model_dir, "risk_classifier_model.joblib"))
            joblib.dump(self.risk_scaler, os.path.join(model_dir, "risk_classifier_scaler.joblib"))

        joblib.dump(self.material_encoder, os.path.join(model_dir, "material_encoder.joblib"))
        joblib.dump(self.risk_encoder, os.path.join(model_dir, "risk_encoder.joblib"))

        # Save metrics
        with open(os.path.join(model_dir, "training_report.json"), "w") as f:
            json.dump(self.metrics, f, indent=2)

        print(f"  [save] Models saved to {model_dir}/")

    def load_models(self, model_dir: str = None):
        """Load previously trained models from disk."""
        model_dir = model_dir or MODEL_DIR

        self.flame_model = joblib.load(os.path.join(model_dir, "flame_spread_model.joblib"))
        self.flame_scaler = joblib.load(os.path.join(model_dir, "flame_spread_scaler.joblib"))

        self.loi_model = joblib.load(os.path.join(model_dir, "loi_shift_model.joblib"))
        self.loi_scaler = joblib.load(os.path.join(model_dir, "loi_shift_scaler.joblib"))

        self.risk_model = joblib.load(os.path.join(model_dir, "risk_classifier_model.joblib"))
        self.risk_scaler = joblib.load(os.path.join(model_dir, "risk_classifier_scaler.joblib"))

        self.material_encoder = joblib.load(os.path.join(model_dir, "material_encoder.joblib"))
        self.risk_encoder = joblib.load(os.path.join(model_dir, "risk_encoder.joblib"))

        # Load metrics
        report_path = os.path.join(model_dir, "training_report.json")
        if os.path.exists(report_path):
            with open(report_path) as f:
                self.metrics = json.load(f)

        print(f"  [load] Models loaded from {model_dir}/")
