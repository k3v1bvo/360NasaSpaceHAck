"""
Flame in Freefall — System Verification & Test Suite
NASA Space Apps Challenge 2026

Runs comprehensive end-to-end sanity checks across:
1. Physical Simulation Engine (flame_kinetics.py)
2. Machine Learning Inference Pipeline (flame_predictor, cool_flame_detector, recommendation_engine)
3. NASA PSI Dataset and Knowledge Base Integrity
4. Streamlit Application Syntax and Structure
"""

import os
import sys
import json
import time

PROJECT_ROOT = os.path.abspath(os.path.dirname(__file__))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

def run_tests():
    print("=" * 65)
    print("  🔥 FLAME IN FREEFALL — TEST & VALIDATION SUITE")
    print("=" * 65)
    
    passed = 0
    total = 5

    # 1. Physics Engine
    print("\n[TEST 1/5] Verifying Physics Kinetics Simulation Engine...")
    try:
        from simulation.flame_kinetics import MicrogravityFlameKinetics
        kin = MicrogravityFlameKinetics(atmosphere="ISS_Standard")
        vf = kin.calculate_flame_spread(V_g=2.5, d_fuel=2.0, material="PMMA")
        cool = kin.simulate_cool_flame_transient(t_seconds=10.0)
        assert vf > 0, "Flame spread rate should be positive"
        assert len(cool["time"]) > 0, "Cool flame transient must return time series"
        print(f"  ✅ PASS: Physics engine active (V_f = {vf:.3f} mm/s for PMMA at 2.5 cm/s)")
        passed += 1
    except Exception as e:
        print(f"  ❌ FAIL: Physics engine error: {e}")

    # 2. ML Models
    print("\n[TEST 2/5] Verifying Machine Learning Prediction Models...")
    try:
        from ml.flame_predictor import FlamePredictor
        from ml.cool_flame_detector import CoolFlameDetector
        model_dir = os.path.join(PROJECT_ROOT, "ml", "models")
        
        predictor = FlamePredictor()
        predictor.load_models(model_dir)
        
        sample = {
            "material": "PMMA",
            "O2_concentration": 0.21,
            "pressure_atm": 1.0,
            "flow_velocity_cm_s": 2.5,
            "fuel_diameter_mm": 2.0,
            "material_thickness_mm": 2.0
        }
        res_flame = predictor.predict_flame_spread(sample)
        res_loi = predictor.predict_loi_shift(sample)
        res_risk = predictor.classify_risk(sample)
        
        assert "predicted_V_f_mm_s" in res_flame
        assert "LOI_microgravity_predicted" in res_loi
        assert res_risk["risk_level"] in ["Safe", "Caution", "Danger"]
        print(f"  ✅ PASS: ML Ensemble models loaded successfully.")
        print(f"         - Predicted V_f: {res_flame['predicted_V_f_mm_s']:.2f} mm/s")
        print(f"         - Predicted LOI_microg: {res_loi['LOI_microgravity_predicted']:.1f}%")
        print(f"         - Classified Risk: {res_risk['risk_level']}")
        passed += 1
    except Exception as e:
        print(f"  ❌ FAIL: ML Predictor error: {e}")

    # 3. Recommendation Engine
    print("\n[TEST 3/5] Verifying Safety Recommendation Engine...")
    try:
        from ml.recommendation_engine import SafetyRecommendationEngine
        rec_eng = SafetyRecommendationEngine(model_dir=os.path.join(PROJECT_ROOT, "ml", "models"))
        recs = rec_eng.recommend_structured({
            "material": "PMMA",
            "O2_concentration": 0.21,
            "pressure_atm": 1.0,
            "flow_velocity_cm_s": 2.5,
            "fuel_diameter_mm": 2.0,
            "material_thickness_mm": 2.0
        })
        assert len(recs["relevant_psi_investigations"]) > 0
        assert "operating_pressure_bar" in recs["suppression_strategy"]
        print(f"  ✅ PASS: Recommendation engine generated {len(recs['relevant_psi_investigations'])} PSI matches.")
        print(f"         - Suppression recommendation: {recs['suppression_strategy']['agent']}")
        passed += 1
    except Exception as e:
        print(f"  ❌ FAIL: Recommendation engine error: {e}")

    # 4. Data Assets
    print("\n[TEST 4/5] Verifying NASA PSI and Knowledge Base JSON Datasets...")
    try:
        psi_file = os.path.join(PROJECT_ROOT, "app", "data", "psi_investigations.json")
        kb_file = os.path.join(PROJECT_ROOT, "app", "data", "knowledge_base.json")
        mat_file = os.path.join(PROJECT_ROOT, "app", "data", "materials_flammability.json")
        
        with open(psi_file, "r", encoding="utf-8") as f:
            psi_json = json.load(f)
        with open(kb_file, "r", encoding="utf-8") as f:
            kb_json = json.load(f)
        with open(mat_file, "r", encoding="utf-8") as f:
            mat_json = json.load(f)
            
        assert len(psi_json) == 24, f"Expected 24 PSI investigations, found {len(psi_json)}"
        assert len(kb_json.get("entries", [])) >= 10, "Expected >=10 KB entries"
        assert len(mat_json) >= 5, "Expected >=5 materials"
        print(f"  ✅ PASS: Datasets intact:")
        print(f"         - 24/24 NASA PSI investigations verified")
        print(f"         - {len(kb_json.get('entries', []))} Knowledge Base entries indexed")
        print(f"         - {len(mat_json)} Materials in flammability catalog")
        passed += 1
    except Exception as e:
        print(f"  ❌ FAIL: Dataset verification error: {e}")

    # 5. App Structure
    print("\n[TEST 5/5] Verifying Streamlit Application Structure...")
    try:
        app_file = os.path.join(PROJECT_ROOT, "app", "app.py")
        pages_dir = os.path.join(PROJECT_ROOT, "app", "pages")
        expected_pages = [
            "1_Dashboard_Home.py",
            "2_PSI_Explorer.py",
            "3_Flame_Simulator.py",
            "4_AI_Assistant.py",
            "5_Risk_Matrix.py",
            "6_About.py"
        ]
        assert os.path.exists(app_file), "app/app.py missing"
        for p in expected_pages:
            p_path = os.path.join(pages_dir, p)
            assert os.path.exists(p_path), f"Page {p} missing"
        print(f"  ✅ PASS: All 6 Streamlit pages and app.py confirmed present.")
        passed += 1
    except Exception as e:
        print(f"  ❌ FAIL: Streamlit structure error: {e}")

    print("\n" + "=" * 65)
    if passed == total:
        print(f"  🎉 SUCCESS: ALL {passed}/{total} TESTS PASSED! THE SYSTEM IS READY TO TEST.")
        print("  🚀 Para iniciar el Dashboard:")
        print("     streamlit run app/app.py")
    else:
        print(f"  ⚠️ WARNING: {passed}/{total} tests passed. Check errors above.")
    print("=" * 65)

if __name__ == "__main__":
    run_tests()
