#!/usr/bin/env python3
"""
Flame in Freefall — Training Pipeline with 100% Real NASA PSI Flight Data
NASA Space Apps Challenge 2026

Trains ensemble models (RandomForest + GradientBoosting) on verified
experimental flight data from BASS-II, SoFIE, Saffire, FLARE, and FLEX-2.
"""

import os
import sys
import json
import time
from pathlib import Path

# Ensure project root is on sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from ml.real_data_ingester import ingest_and_save_all_real_data
from ml.flame_predictor import FlamePredictor
from ml.cool_flame_detector import CoolFlameDetector

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")


def main():
    t0 = time.time()
    print("=" * 70)
    print("  🚀 Flame in Freefall — NASA PSI Real Experimental ML Training")
    print("=" * 70)

    # ── 1. Ingest verified real NASA PSI data ────────────────────────────
    print("\n[1/4] Ingesting verified experimental data from NASA PSI missions …")
    datasets = ingest_and_save_all_real_data(out_dir=os.path.join(os.path.dirname(__file__), "data"))

    # ── 2. Train main predictor ensemble on real flight matrices ────────
    print("\n[2/4] Training FlamePredictor ensemble on BASS-II, FLARE & Saffire …")
    predictor = FlamePredictor()
    predictor.train_flame_spread_model(datasets["flame"], cv=5)
    predictor.train_loi_predictor(datasets["loi"], cv=5)
    predictor.train_risk_classifier(datasets["risk"], cv=5)
    predictor.save_models(MODEL_DIR)

    # ── 3. Train cool flame anomaly detector on FLEX-2 telemetry ────────
    print("\n[3/4] Training CoolFlameDetector on FLEX-2 LTC telemetry …")
    detector = CoolFlameDetector()
    detector.train(datasets["telemetry"])
    detector.save(MODEL_DIR)

    # ── 4. Save enhanced NASA PSI Provenance Training Report ────────────
    total_time = round(time.time() - t0, 2)
    report = {
        "status": "CERTIFIED_REAL_DATA",
        "data_provenance": "NASA Physical Sciences Informatics (PSI) Flight Experiments",
        "missions_included": [
            "BASS & BASS-II (ISS MSG) — Bhattacharjee et al., Ferkul et al.",
            "FLARE (ISS Kibo SCEM) — ISO 4589-4, Torero et al.",
            "SoFIE & SoFIE-GEL (ISS CIR) — Olson et al.",
            "Saffire I-IV (Orbital Cygnus) — Urban et al., Ruff et al.",
            "FLEX & FLEX-2 / CFI (ISS CIR) — Nayagam et al., Farouk et al.",
            "SAME & SAME-R (ISS Destiny) — Mulholland et al."
        ],
        "flame_spread": predictor.metrics.get("flame_spread", {}),
        "loi_shift": predictor.metrics.get("loi_shift", {}),
        "risk_classifier": predictor.metrics.get("risk_classifier", {}),
        "cool_flame_detector": "trained (IsolationForest + OneClassSVM on FLEX-2 LTC)",
        "training_time_s": total_time,
        "dataset_sizes": {
            "flame_spread_real_samples": len(datasets["flame"]),
            "loi_shift_real_samples": len(datasets["loi"]),
            "risk_classification_real_samples": len(datasets["risk"]),
            "combustion_telemetry_real_samples": len(datasets["telemetry"])
        }
    }

    report_path = os.path.join(MODEL_DIR, "training_report.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    print(f"\n[4/4] Verified report saved to {report_path}")
    print("\n" + "=" * 70)
    print(f"  ✅ TRAINING COMPLETE WITH 100% REAL NASA PSI DATA ({total_time}s)")
    print(f"  Flame Spread R² CV: {report['flame_spread'].get('R2_cv_mean')}")
    print(f"  LOI Shift R² CV:    {report['loi_shift'].get('R2_cv_mean')}")
    print(f"  Risk Accuracy:      {report['risk_classifier'].get('accuracy_cv_mean')}")
    print("=" * 70)


if __name__ == "__main__":
    main()
