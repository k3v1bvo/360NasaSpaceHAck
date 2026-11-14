#!/usr/bin/env python3
"""
Flame in Freefall — Train All ML Models
NASA Space Apps Challenge 2026

Generates synthetic data, trains every model, evaluates via cross-validation,
and persists artefacts to ml/models/.
"""

import os
import sys
import json
import time
from pathlib import Path

# Ensure project root is on sys.path so `ml.*` imports resolve
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from ml.data_generator import save_all_datasets
from ml.flame_predictor import FlamePredictor
from ml.cool_flame_detector import CoolFlameDetector

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")


def main():
    t0 = time.time()
    print("=" * 60)
    print("  🔥 Flame in Freefall — ML Training Pipeline")
    print("=" * 60)

    # ── 1. Generate datasets ────────────────────────────────────────────
    print("\n[1/4] Generating physics-informed synthetic datasets …")
    datasets = save_all_datasets(out_dir=os.path.join(os.path.dirname(__file__), "data"))

    # ── 2. Train main predictor ensemble ────────────────────────────────
    print("\n[2/4] Training FlamePredictor models …")
    predictor = FlamePredictor()
    predictor.train_flame_spread_model(datasets["flame"])
    predictor.train_loi_predictor(datasets["loi"])
    predictor.train_risk_classifier(datasets["risk"])
    predictor.save_models(MODEL_DIR)

    # ── 3. Train cool flame anomaly detector ────────────────────────────
    print("\n[3/4] Training CoolFlameDetector …")
    detector = CoolFlameDetector()
    detector.train(datasets["telemetry"])
    detector.save(MODEL_DIR)

    # ── 4. Validation demos ─────────────────────────────────────────────
    print("\n[4/4] Running validation demos …")

    # Flame spread prediction
    sample = {
        "O2_concentration": 0.21,
        "pressure_atm": 1.0,
        "flow_velocity_cm_s": 5.0,
        "fuel_diameter_mm": 3.0,
        "material_type": "PMMA",
    }
    spread = predictor.predict_flame_spread(sample)
    print(f"  Flame spread (PMMA, ISS): {spread['flame_spread_rate_mm_s']:.3f} mm/s "
          f"  95% CI: {spread['confidence_interval_95']}")

    # LOI shift prediction
    loi_sample = {
        "LOI_1g": 17.3,
        "material_thickness_mm": 1.0,
        "material_type": "PMMA",
        "O2_concentration": 0.21,
        "pressure_atm": 1.0,
    }
    loi = predictor.predict_loi_shift(loi_sample)
    print(f"  LOI shift  (PMMA): {loi['LOI_1g']} → {loi['LOI_microgravity_predicted']:.2f} "
          f"(Δ = {loi['shift_pp']:.2f} pp)")

    # Risk classification
    risk_sample = {
        "O2_concentration": 0.34,
        "pressure_atm": 0.694,
        "flow_velocity_cm_s": 2.0,
        "fuel_diameter_mm": 1.0,
        "material_thickness_mm": 0.5,
        "material_type": "PMMA",
        "flame_spread_rate_mm_s": spread["flame_spread_rate_mm_s"],
        "LOI_microgravity": loi["LOI_microgravity_predicted"],
    }
    risk = predictor.classify_risk(risk_sample)
    print(f"  Risk level (Artemis atm, thin PMMA): {risk['risk_level']}  "
          f"probs={risk['probabilities']}")

    # Cool flame detection
    import numpy as np
    cool_result = detector.detect_cool_flame(
        temperature_series=np.array([710, 720, 700, 715, 705]),
        species_series={"H2O2_ppm": 25.0, "CH2O_ppm": 18.0, "CO_ppm": 35.0},
    )
    print(f"  Cool flame P={cool_result['cool_flame_probability']:.3f}  "
          f"alert={cool_result['is_cool_flame']}")

    # Reignition risk
    reig = detector.detect_reignition_risk({
        "T_mean_K": 720, "H2O2_ppm": 30.0, "CH2O_ppm": 20.0,
        "CO_ppm": 40.0, "O2_concentration": 0.21,
    })
    print(f"  Reignition risk: {reig['risk_level']} (P={reig['reignition_probability']:.3f})")

    # ── Save training report ────────────────────────────────────────────
    report = {
        **predictor.metrics,
        "cool_flame_detector": "trained (IF + OCSVM)",
        "training_time_s": round(time.time() - t0, 2),
        "dataset_sizes": {
            "flame_spread": len(datasets["flame"]),
            "loi_shift": len(datasets["loi"]),
            "risk_classification": len(datasets["risk"]),
            "combustion_telemetry": len(datasets["telemetry"]),
        },
    }
    report_path = os.path.join(MODEL_DIR, "training_report.json")
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)
    print(f"\n  [OK] Training report → {report_path}")

    elapsed = time.time() - t0
    print(f"\n{'=' * 60}")
    print(f"  ✅ All models trained and saved in {elapsed:.1f}s")
    print(f"     Models directory: {MODEL_DIR}/")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
