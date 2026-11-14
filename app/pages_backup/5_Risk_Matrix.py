"""
Página 5: Risk Matrix — Matriz de Riesgo y Predicción con Modelos ML
Flame in Freefall — NASA Space Apps Challenge 2026
"""

import os
import sys
import json
import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go

# Add project root to sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from ml.flame_predictor import FlamePredictor
from ml.recommendation_engine import SafetyRecommendationEngine

# Custom CSS
css_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "style.css")
if os.path.exists(css_path):
    with open(css_path, "r", encoding="utf-8") as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

st.title("🛡️ Matriz de Riesgo y Evaluación Predictiva con IA")
st.markdown("Evalúa materiales para misiones espaciales mediante **modelos de Machine Learning entrenados con datos físicos de microgravedad**.")

# Load models
MODEL_DIR = os.path.join(PROJECT_ROOT, "ml", "models")

@st.cache_resource
def load_ml_engine():
    try:
        predictor = FlamePredictor()
        predictor.load_models(MODEL_DIR)
        rec_engine = SafetyRecommendationEngine(model_dir=MODEL_DIR)
        return predictor, rec_engine
    except Exception as e:
        return None, None

predictor, rec_engine = load_ml_engine()

# Section 1: Live ML Risk Evaluator
st.subheader("⚡ Evaluador Predictivo de Escenarios de Vuelo")
st.markdown("Introduce las condiciones de cabina y el material para obtener una predicción en tiempo real generada por el ensamble de ML (Random Forest + Gradient Boosting):")

c1, c2, c3, c4 = st.columns(4)

with c1:
    eval_mat = st.selectbox("Material a Evaluar:", ["PMMA", "ETFE_Wire", "Nomex", "Cotton", "Polyethylene"])
with c2:
    eval_o2 = st.slider("Concentración de O₂ (%):", min_value=15.0, max_value=40.0, value=21.0, step=0.5) / 100.0
with c3:
    eval_press = st.slider("Presión de Cabina (atm):", min_value=0.4, max_value=1.1, value=1.0, step=0.05)
with c4:
    eval_thick = st.slider("Espesor / Diámetro (mm):", min_value=0.3, max_value=8.0, value=1.5, step=0.1)

eval_flow = st.slider("Velocidad de Flujo HVAC (cm/s):", min_value=0.1, max_value=15.0, value=2.0, step=0.2)

if predictor:
    sample_input = {
        "material": eval_mat,
        "O2_concentration": eval_o2,
        "pressure_atm": eval_press,
        "flow_velocity_cm_s": eval_flow,
        "fuel_diameter_mm": eval_thick,
        "material_thickness_mm": eval_thick
    }
    
    # 1. Flame spread prediction
    flame_res = predictor.predict_flame_spread(sample_input)
    # 2. LOI shift prediction
    loi_res = predictor.predict_loi_shift(sample_input)
    # 3. Risk classification
    risk_res = predictor.classify_risk(sample_input)
    
    # Output metrics
    r1, r2, r3 = st.columns(3)
    
    risk_label = risk_res["risk_level"]
    risk_color = "#ef4444" if risk_label == "Danger" else ("#f59e0b" if risk_label == "Caution" else "#10b981")
    
    with r1:
        st.markdown(f"""
        <div class="kpi-card" style="border-left: 4px solid {risk_color};">
            <div class="kpi-title">Clasificación de Riesgo IA</div>
            <div class="kpi-value" style="color: {risk_color};">{risk_label.upper()}</div>
            <div class="kpi-sub">Probabilidad: {risk_res['probabilities'].get(risk_label, 1.0)*100:.1f}%</div>
        </div>
        """, unsafe_allow_html=True)
        
    with r2:
        st.markdown(f"""
        <div class="kpi-card" style="border-left: 4px solid #00d4ff;">
            <div class="kpi-title">LOI Proyectado en Micro-g</div>
            <div class="kpi-value" style="color: #00d4ff;">{loi_res['LOI_microgravity_predicted']:.1f}%</div>
            <div class="kpi-sub">LOI 1-g: {loi_res['LOI_1g']:.1f}% (Δ = {loi_res['shift_pp']:+.1f} pp)</div>
        </div>
        """, unsafe_allow_html=True)
        
    with r3:
        st.markdown(f"""
        <div class="kpi-card" style="border-left: 4px solid #ff6b35;">
            <div class="kpi-title">Tasa de Propagación Vf (ML)</div>
            <div class="kpi-value" style="color: #ff6b35;">{flame_res['predicted_V_f_mm_s']:.2f} mm/s</div>
            <div class="kpi-sub">IC 95%: [{flame_res['confidence_interval_95'][0]:.2f}, {flame_res['confidence_interval_95'][1]:.2f}]</div>
        </div>
        """, unsafe_allow_html=True)
        
    # Safety Recommendations
    if rec_engine:
        scenario = {
            "material": eval_mat,
            "atmosphere": "Custom",
            "O2_concentration": eval_o2,
            "pressure_atm": eval_press,
            "flow_velocity_cm_s": eval_flow,
            "fuel_diameter_mm": eval_thick,
            "material_thickness_mm": eval_thick
        }
        recs = rec_engine.recommend_structured(scenario)
        
        st.markdown("### 💡 Recomendaciones de Seguridad Generadas por el Sistema:")
        
        col_rec1, col_rec2 = st.columns(2)
        with col_rec1:
            st.markdown("#### 🔬 Investigaciones PSI Más Relevantes:")
            for psi in recs.get("relevant_psi_investigations", []):
                st.markdown(f"- 🛰️ **{psi['id']}**: {psi['name']} *(Relevancia: {psi.get('relevance_score', 0.9)*100:.0f}%)*")
                
            st.markdown("#### 📡 Configuración Óptima de Sensores:")
            sensor_cfg = recs.get("detection_sensor_configuration", {})
            st.markdown(f"- **Detector Incipiente:** {sensor_cfg.get('primary_detector', 'Brunswick Sub-micron')}")
            st.markdown(f"- **Canales TDLAS Clave:** {', '.join(sensor_cfg.get('tdlas_channels', ['H2O2', 'CO']))}")
            st.markdown(f"- **Umbral de Alerta:** `{sensor_cfg.get('alarm_threshold', 'Pico 10-100 nm')}`")
            
        with col_rec2:
            st.markdown("#### 💧 Estrategia de Supresión (NFPA 750):")
            supp_strat = recs.get("suppression_strategy", {})
            st.markdown(f"- **Agente Extintor:** {supp_strat.get('agent', 'Niebla de Agua a Alta Presión')}")
            st.markdown(f"- **Presión de Manifold:** `{supp_strat.get('operating_pressure_bar', 35)} bar` ({supp_strat.get('operating_pressure_bar', 35)*14.5:.0f} psi)")
            st.markdown(f"- **Diámetro Mediano Dv0.50:** `{supp_strat.get('droplet_dv050_um', 35)} µm`")
            st.markdown(f"- **Aditivo Encapsulante:** {supp_strat.get('additive', 'F-500 EA (1% v/v)')}")
            st.markdown(f"- **Tiempo Mínimo de Descarga:** `{supp_strat.get('discharge_duration_sec', 60)} segundos`")

st.markdown("---")

# Section 2: Comprehensive Materials Heatmap Table
st.subheader("📊 Tabla Comparativa de Materiales Espaciales")

mat_path = os.path.join(PROJECT_ROOT, "app", "data", "materials_flammability.json")
if os.path.exists(mat_path):
    with open(mat_path, "r", encoding="utf-8") as f:
        materials_data = json.load(f)
    
    df_m = pd.DataFrame(materials_data)
    
    # Format table for display
    df_display = df_m[["material", "category", "LOI_1g", "LOI_microg_estimated", "MOC_percent", "risk_level_ISS", "risk_level_Artemis", "psi_reference"]]
    df_display.columns = ["Material", "Categoría", "LOI 1-g (%)", "LOI Micro-g (%)", "MOC (%)", "Riesgo ISS", "Riesgo Artemis", "Referencia PSI"]
    
    st.dataframe(df_display, use_container_width=True, hide_index=True)
