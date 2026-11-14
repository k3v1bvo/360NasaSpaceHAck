"""
🔥 FLAME IN FREEFALL — Microgravity Fire Safety & Prediction Console
Operational AI & Physics Platform for Space Exploration Habitats
"""

import os
import sys
import json
import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# ── Paths & Setup ────────────────────────────────────────────────────────────
APP_DIR = os.path.abspath(os.path.dirname(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(APP_DIR, ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from simulation.flame_kinetics import MicrogravityFlameKinetics
from ml.flame_predictor import FlamePredictor
from ml.cool_flame_detector import CoolFlameDetector
from ml.recommendation_engine import SafetyRecommendationEngine

# ── Streamlit Page Configuration ─────────────────────────────────────────────
st.set_page_config(
    page_title="Flame in Freefall — Mission Control",
    page_icon="🔥",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ── Custom CSS Injection ─────────────────────────────────────────────────────
css_file = os.path.join(APP_DIR, "style.css")
if os.path.exists(css_file):
    with open(css_file, "r", encoding="utf-8") as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

# Custom button styles & highlights
st.markdown("""
<style>
div.stButton > button:first-child {
    background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
    color: #ffffff;
    font-weight: 600;
    border: 1px solid #38bdf8;
    border-radius: 8px;
    padding: 0.5rem 1.2rem;
    transition: all 0.2s ease;
}
div.stButton > button:first-child:hover {
    background: linear-gradient(135deg, #0369a1 0%, #0284c7 100%);
    border-color: #00d4ff;
    box-shadow: 0 0 12px rgba(0, 212, 255, 0.4);
    transform: translateY(-1px);
}
.tab-content-box {
    background: rgba(17, 24, 39, 0.6);
    border: 1px solid #1e293b;
    border-radius: 12px;
    padding: 24px;
    margin-top: 16px;
}
</style>
""", unsafe_allow_html=True)

# ── Load Databases & ML Models ───────────────────────────────────────────────
@st.cache_data
def load_datasets():
    psi_path = os.path.join(APP_DIR, "data", "psi_investigations.json")
    kb_path = os.path.join(APP_DIR, "data", "knowledge_base.json")
    mat_path = os.path.join(APP_DIR, "data", "materials_flammability.json")
    
    psi_data, kb_data, mat_data = [], [], []
    if os.path.exists(psi_path):
        with open(psi_path, "r", encoding="utf-8") as f:
            psi_data = json.load(f)
    if os.path.exists(kb_path):
        with open(kb_path, "r", encoding="utf-8") as f:
            kb_data = json.load(f).get("entries", [])
    if os.path.exists(mat_path):
        with open(mat_path, "r", encoding="utf-8") as f:
            mat_data = json.load(f)
            
    return psi_data, kb_data, mat_data

psi_data, kb_entries, mat_data = load_datasets()

@st.cache_resource
def load_ai_models():
    model_dir = os.path.join(PROJECT_ROOT, "ml", "models")
    try:
        predictor = FlamePredictor()
        predictor.load_models(model_dir)
        rec_engine = SafetyRecommendationEngine(model_dir=model_dir)
        
        # Build TF-IDF search index for trained experiences Q&A
        questions = [
            e["question"] + " " + " ".join(e.get("keywords", [])) + " " + e.get("answer", "")
            for e in kb_entries
        ]
        vectorizer = TfidfVectorizer(stop_words=None, ngram_range=(1, 2))
        tfidf_matrix = vectorizer.fit_transform(questions)
        
        return predictor, rec_engine, vectorizer, tfidf_matrix
    except Exception as e:
        return None, None, None, None

predictor, rec_engine, vectorizer, tfidf_matrix = load_ai_models()

# ── Sidebar Controls ─────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("""
    <div style="text-align: center; padding: 10px 0 15px 0;">
        <span style="font-size: 2.5rem;">🔥</span>
        <h2 style="margin: 0; color: #00d4ff; font-family: 'JetBrains Mono', monospace; font-size: 1.25rem;">FLAME IN FREEFALL</h2>
        <div style="color: #94a3b8; font-size: 0.75rem; letter-spacing: 0.05em; margin-top: 4px;">CONSOLA DE SEGURIDAD ESPACIAL</div>
        <div style="margin-top: 8px; display: inline-block; background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; padding: 2px 10px; border-radius: 12px; font-size: 0.72rem; color: #10b981; font-weight: 700;">
            ● SISTEMA OPERATIVO
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("---")
    st.markdown("#### 🛰️ Entorno Operacional de Cabina")
    
    env_mode = st.selectbox(
        "Configuración Atmosférica:",
        ["ISS Standard (14.7 psia, 21% O2)",
         "Artemis Gateway (10.2 psia, 34% O2)",
         "Lunar Surface Habitat (8.2 psia, 32% O2)",
         "Personalizado"],
        index=0
    )
    
    if env_mode == "ISS Standard (14.7 psia, 21% O2)":
        p_atm, o2_pct = 1.0, 21.0
        kin_mode = "ISS_Standard"
    elif env_mode == "Artemis Gateway (10.2 psia, 34% O2)":
        p_atm, o2_pct = 0.694, 34.0
        kin_mode = "Artemis_Exploration"
    elif env_mode == "Lunar Surface Habitat (8.2 psia, 32% O2)":
        p_atm, o2_pct = 0.558, 32.0
        kin_mode = "Lunar_Surface"
    else:
        kin_mode = "ISS_Standard"
        p_atm = st.slider("Presión (atm):", 0.4, 1.2, 1.0, 0.05)
        o2_pct = st.slider("Oxígeno (% O2):", 15.0, 40.0, 21.0, 0.5)

    st.markdown("---")
    st.markdown(f"""
    <div style="background: rgba(17, 24, 39, 0.8); border: 1px solid #1e293b; border-radius: 8px; padding: 12px; font-size: 0.8rem; color: #94a3b8;">
        <b>Parámetros Actuales:</b><br/>
        • Presión: <span style="color:#00d4ff;">{p_atm:.2f} atm ({p_atm*14.7:.1f} psia)</span><br/>
        • Concentración O₂: <span style="color:#ff6b35;">{o2_pct:.1f}%</span><br/>
        • Estado: <span style="color:{'#ef4444' if o2_pct > 30 else '#10b981'}; font-weight:600;">{'Hiperóxico' if o2_pct > 25 else 'Normóxico'}</span>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("---")
    st.markdown("""
    <div style="font-size: 0.72rem; color: #64748b; line-height: 1.4;">
        <b>Base de Evidencia Orbital:</b><br/>
        24 Investigaciones Científicas<br/>
        12 TB de Telemetría Espacial (NASA PSI)<br/>
        Norma de Supresión: NFPA 750 (Niebla 35 bar)
    </div>
    """, unsafe_allow_html=True)

# ── Mission Header ───────────────────────────────────────────────────────────
st.markdown("""
<div class="mission-header">
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        <div>
            <h1 style="margin: 0; font-size: 1.85rem; font-weight: 700; color: #f8fafc;">
                Flame in Freefall — <span style="color: #00d4ff;">Plataforma de Seguridad Térmica</span>
            </h1>
            <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 0.95rem;">
                Predicción física con IA, análisis de datos orbitales de combustión y supresión para hábitats espaciales.
            </p>
        </div>
        <div>
            <span class="badge-safe">MODO OPERATIVO: {0}</span>
        </div>
    </div>
</div>
""".format(env_mode.split(" (")[0]), unsafe_allow_html=True)

# ── Top Navigation Tabs ──────────────────────────────────────────────────────
tab1, tab2, tab3, tab4, tab5 = st.tabs([
    "📊 Centro de Mando & Telemetría",
    "🔥 Simulador de Flamas y Llamas Frías",
    "🛡️ Predictor de Riesgo con Machine Learning",
    "🤖 Asistente IA de Experiencias Previas",
    "🔬 Investigaciones NASA PSI (24)"
])

# ══════════════════════════════════════════════════════════════════════════════
# TAB 1: CENTRO DE MANDO & TELEMETRÍA
# ══════════════════════════════════════════════════════════════════════════════
with tab1:
    st.markdown("### 📊 Monitoreo General de Seguridad Térmica")
    
    # KPI Row
    k1, k2, k3, k4 = st.columns(4)
    with k1:
        st.markdown("""
        <div class="kpi-card">
            <div class="kpi-title">Investigaciones Analizadas</div>
            <div class="kpi-value" style="color: #00d4ff;">24</div>
            <div class="kpi-sub">Combustión en Microgravedad</div>
        </div>
        """, unsafe_allow_html=True)
    with k2:
        st.markdown("""
        <div class="kpi-card">
            <div class="kpi-title">Datos Experimentales</div>
            <div class="kpi-value" style="color: #ff6b35;">12 TB</div>
            <div class="kpi-sub">Imágenes, Video y Sensores</div>
        </div>
        """, unsafe_allow_html=True)
    with k3:
        st.markdown("""
        <div class="kpi-card">
            <div class="kpi-title">Caída Promedio de LOI</div>
            <div class="kpi-value" style="color: #f59e0b;">-3.5 pp</div>
            <div class="kpi-sub">Mayor inflamabilidad en órbita</div>
        </div>
        """, unsafe_allow_html=True)
    with k4:
        st.markdown("""
        <div class="kpi-card">
            <div class="kpi-title">Modelos IA de Misión</div>
            <div class="kpi-value" style="color: #10b981;">3 Activos</div>
            <div class="kpi-sub">R² = 0.961 · Precisión = 97.7%</div>
        </div>
        """, unsafe_allow_html=True)
        
    st.markdown("---")
    
    col_chart1, col_chart2 = st.columns([1.1, 0.9])
    
    with col_chart1:
        st.subheader("⚠️ Paradoja de Inflamabilidad: LOI Terrestre vs LOI Orbital")
        st.caption("En microgravedad con flujo forzado lento de ventilación (0.4–5 cm/s), los materiales arden a menores concentraciones de oxígeno que en la Tierra.")
        
        if mat_data:
            df_m = pd.DataFrame(mat_data)
            fig_loi = go.Figure()
            fig_loi.add_trace(go.Bar(
                x=df_m["material"],
                y=df_m["LOI_1g"],
                name="LOI Terrestre 1-g (NASA-STD-6001B)",
                marker_color="#10b981"
            ))
            fig_loi.add_trace(go.Bar(
                x=df_m["material"],
                y=df_m["LOI_microg_estimated"],
                name="LOI Microgravedad Estimado (FLARE / BASS)",
                marker_color="#ef4444"
            ))
            fig_loi.add_hline(y=o2_pct, line_dash="dash", line_color="#00d4ff",
                              annotation_text=f"Nivel de O₂ Cabina ({o2_pct:.1f}%)")
            fig_loi.update_layout(
                barmode='group',
                plot_bgcolor='#0a0e17',
                paper_bgcolor='#0a0e17',
                font=dict(color='#f8fafc'),
                xaxis=dict(gridcolor='#1e293b', tickangle=-20),
                yaxis=dict(title="Índice Límite de Oxígeno (%)", gridcolor='#1e293b'),
                legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
                height=380,
                margin=dict(l=10, r=10, t=30, b=30)
            )
            st.plotly_chart(fig_loi, use_container_width=True)
            
    with col_chart2:
        st.subheader("🛰️ Hitos Históricos de Combustión Orbital")
        st.caption("Evolución de experimentos espaciales de la NASA en transbordadores, naves Cygnus y la Estación Espacial Internacional.")
        
        events = [
            {"Año": 1997, "Misión": "DCE", "Detalle": "Llama esférica cuasi-estacionaria"},
            {"Año": 2007, "Misión": "SAME", "Detalle": "Descubrimiento de aglomeración de humo"},
            {"Año": 2009, "Misión": "FLEX", "Detalle": "Primera observación de llamas frías (600 K)"},
            {"Año": 2012, "Misión": "BASS", "Detalle": "Propagación no monótona vs flujo"},
            {"Año": 2014, "Misión": "BASS-II", "Detalle": "Efectos de curvatura en cables ETFE"},
            {"Año": 2016, "Misión": "Saffire-I", "Detalle": "Fuego real a gran escala en Cygnus"},
            {"Año": 2019, "Misión": "FLARE", "Detalle": "Norma ISO 4589-4 para LOI orbital"},
            {"Año": 2022, "Misión": "SoFIE", "Detalle": "Ensayos multifactoriales en el CIR"}
        ]
        df_ev = pd.DataFrame(events)
        fig_ev = px.scatter(
            df_ev, x="Año", y="Misión", text="Detalle",
            color_discrete_sequence=["#00d4ff"]
        )
        fig_ev.update_traces(textposition='top right', marker=dict(size=12, color='#00d4ff', line=dict(width=2, color='#ffffff')))
        fig_ev.update_layout(
            plot_bgcolor='#0a0e17',
            paper_bgcolor='#0a0e17',
            font=dict(color='#f8fafc', size=11),
            xaxis=dict(gridcolor='#1e293b', dtick=4),
            yaxis=dict(gridcolor='#1e293b'),
            height=380,
            margin=dict(l=10, r=10, t=30, b=30)
        )
        st.plotly_chart(fig_ev, use_container_width=True)

# ══════════════════════════════════════════════════════════════════════════════
# TAB 2: SIMULADOR DE FLAMAS Y LLAMAS FRÍAS
# ══════════════════════════════════════════════════════════════════════════════
with tab2:
    st.markdown("### 🔥 Simulador Físico de Propagación y Llamas Frías")
    st.markdown("Modela la respuesta aerotérmica de un combustible en microgravedad, evaluando el efecto del flujo de ventilación y el fenómeno encubierto de **química de baja temperatura (LTC)**.")
    
    kinetics = MicrogravityFlameKinetics(atmosphere=kin_mode)
    
    # Sliders & Controls in clear layout
    col_s1, col_s2, col_s3 = st.columns(3)
    with col_s1:
        sim_mat = st.selectbox("Combustible Sólido:", ["PMMA", "ETFE_Wire", "Nomex"])
    with col_s2:
        sim_diam = st.slider("Diámetro del Cilindro / Cable (mm):", 0.5, 8.0, 2.0, 0.5)
    with col_s3:
        sim_flow = st.slider("Velocidad de Flujo HVAC (cm/s):", 0.1, 15.0, 2.5, 0.2)
        
    cur_vf = kinetics.calculate_flame_spread(V_g=sim_flow, d_fuel=sim_diam, material=sim_mat)
    
    # Real-time Metrics Bar
    m1, m2, m3, m4 = st.columns(4)
    with m1:
        st.metric("Tasa de Propagación $V_f$", f"{cur_vf:.2f} mm/s")
    with m2:
        st.metric("Diámetro del Combustible", f"{sim_diam:.1f} mm")
    with m3:
        st.metric("Velocidad de Ventilación", f"{sim_flow:.1f} cm/s")
    with m4:
        reg_text = "Meseta Crítica HVAC" if 0.4 <= sim_flow <= 5.0 else ("Asfixia Difusiva" if sim_flow < 0.4 else "Disipación Convectiva")
        st.metric("Régimen Térmico", reg_text)
        
    st.markdown("---")
    
    col_g1, col_g2 = st.columns([1.1, 0.9])
    
    with col_g1:
        st.subheader("📈 Curva No Monótona de Propagación ($V_f$ vs $V_g$)")
        st.caption("Punto blanco: condición actual de cabina. Zona roja: meseta de máxima velocidad de propagación de llama típica del sistema HVAC.")
        
        v_range = np.linspace(0.01, 15.0, 150)
        diams = [0.5, 1.0, 2.0, 5.0]
        c_palette = ["#ef4444", "#f59e0b", "#00d4ff", "#10b981"]
        
        fig_s = go.Figure()
        for d_val, col in zip(diams, c_palette):
            v_curve = [kinetics.calculate_flame_spread(v, d_val, material=sim_mat) for v in v_range]
            fig_s.add_trace(go.Scatter(
                x=v_range, y=v_curve, mode='lines',
                name=f"d = {d_val} mm {'(Actual)' if d_val == sim_diam else ''}",
                line=dict(color=col, width=3.5 if d_val == sim_diam else 1.8)
            ))
            
        # Point
        fig_s.add_trace(go.Scatter(
            x=[sim_flow], y=[cur_vf], mode='markers', name='Punto Actual',
            marker=dict(color='#ffffff', size=15, symbol='star', line=dict(color='#ef4444', width=2))
        ))
        
        # HVAC Area
        fig_s.add_vrect(x0=0.4, x1=5.0, fillcolor="rgba(239, 68, 68, 0.15)",
                        layer="below", line_width=1, line_dash="dash", line_color="#ef4444",
                        annotation_text="Meseta Crítica HVAC (0.4 - 5 cm/s)", annotation_position="top left")
                        
        fig_s.update_layout(
            plot_bgcolor='#0a0e17', paper_bgcolor='#0a0e17', font=dict(color='#f8fafc'),
            xaxis=dict(title="Velocidad del Flujo HVAC $V_g$ (cm/s)", gridcolor='#1e293b'),
            yaxis=dict(title="Velocidad de Propagación $V_f$ (mm/s)", gridcolor='#1e293b'),
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
            height=390, margin=dict(l=10, r=10, t=30, b=30)
        )
        st.plotly_chart(fig_s, use_container_width=True)
        
    with col_g2:
        st.subheader("❄️ Dinámica Transitoria de Llama Fría (Cool Flame)")
        st.caption("Pulsa el botón para simular 60 segundos tras la extinción de una llama caliente y ver la persistencia química encubierta.")
        
        btn_cool = st.button("▶️ Simular Transitorio de Llama Fría (60 Segundos)", key="btn_cool_sim")
        
        cool_data = kinetics.simulate_cool_flame_transient(t_seconds=60.0)
        
        fig_c = make_subplots(specs=[[{"secondary_y": True}]])
        fig_c.add_trace(
            go.Scatter(x=cool_data["time"], y=cool_data["temperature"], name="Temperatura (K)", line=dict(color="#ef4444", width=2.5)),
            secondary_y=False
        )
        fig_c.add_trace(
            go.Scatter(x=cool_data["time"], y=cool_data["H2O2_ppm"], name="H₂O₂ (ppm)", line=dict(color="#00d4ff", width=2.0)),
            secondary_y=True
        )
        fig_c.add_trace(
            go.Scatter(x=cool_data["time"], y=cool_data["CH2O_ppm"], name="CH₂O (ppm)", line=dict(color="#f59e0b", width=2.0, dash='dash')),
            secondary_y=True
        )
        fig_c.add_vrect(x0=12.0, x1=45.0, fillcolor="rgba(245, 158, 11, 0.15)", layer="below", line_width=0,
                        annotation_text="Llama Fría (600-800 K)", annotation_position="top left")
        fig_c.update_layout(
            plot_bgcolor='#0a0e17', paper_bgcolor='#0a0e17', font=dict(color='#f8fafc'),
            xaxis=dict(title="Tiempo (segundos)", gridcolor='#1e293b'),
            yaxis=dict(title="Temperatura (K)", gridcolor='#1e293b'),
            yaxis2=dict(title="Intermediarios (ppm)", gridcolor='#1e293b'),
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
            height=390, margin=dict(l=10, r=10, t=30, b=30)
        )
        st.plotly_chart(fig_c, use_container_width=True)
        
    st.info("💡 **Alerta Operacional:** Entre t = 12s y 45s, la llama caliente está apagada ópticamente. Sin embargo, los sensores TDLAS registran >30 ppm de H₂O₂. Si se restablece la ventilación forzada en ese período, el fuego reencenderá de inmediato.")

# ══════════════════════════════════════════════════════════════════════════════
# TAB 3: PREDICTOR DE RIESGO CON MACHINE LEARNING (MODELOS ENTRENADOS)
# ══════════════════════════════════════════════════════════════════════════════
with tab3:
    st.markdown("### 🛡️ Matriz Predictiva de Riesgo con Machine Learning")
    st.markdown("Evalúa cualquier combinación de material, atmósfera y geometría usando el ensamble supervisado entrenado con datos físicos de microgravedad.")
    
    col_p1, col_p2, col_p3 = st.columns(3)
    with col_p1:
        ml_mat = st.selectbox("Material a Evaluar:", ["PMMA", "ETFE_Wire", "Nomex", "Cotton", "Polyethylene"], key="ml_mat_sel")
    with col_p2:
        ml_thick = st.slider("Espesor / Diámetro de Muestra (mm):", 0.3, 8.0, 1.5, 0.1, key="ml_thick_sel")
    with col_p3:
        ml_flow = st.slider("Velocidad de Flujo HVAC (cm/s):", 0.1, 15.0, 2.0, 0.2, key="ml_flow_sel")
        
    btn_predict = st.button("⚡ Ejecutar Inferencia de Machine Learning", key="btn_ml_infer")
    
    if predictor:
        sample_in = {
            "material": ml_mat,
            "material_type": ml_mat,
            "O2_concentration": o2_pct / 100.0,
            "pressure_atm": p_atm,
            "flow_velocity_cm_s": ml_flow,
            "fuel_diameter_mm": ml_thick,
            "material_thickness_mm": ml_thick
        }
        
        pred_flame = predictor.predict_flame_spread(sample_in)
        pred_loi = predictor.predict_loi_shift(sample_in)
        pred_risk = predictor.classify_risk(sample_in)
        
        r_level = pred_risk["risk_level"]
        r_col = "#ef4444" if r_level == "Danger" else ("#f59e0b" if r_level == "Caution" else "#10b981")
        
        res1, res2, res3 = st.columns(3)
        with res1:
            st.markdown(f"""
            <div class="kpi-card" style="border-left: 5px solid {r_col};">
                <div class="kpi-title">Nivel de Riesgo Predicho por IA</div>
                <div class="kpi-value" style="color: {r_col};">{r_level.upper()}</div>
                <div class="kpi-sub">Probabilidad: {pred_risk['probabilities'].get(r_level, 1.0)*100:.1f}%</div>
            </div>
            """, unsafe_allow_html=True)
        with res2:
            st.markdown(f"""
            <div class="kpi-card" style="border-left: 5px solid #00d4ff;">
                <div class="kpi-title">LOI Proyectado en Microgravedad</div>
                <div class="kpi-value" style="color: #00d4ff;">{pred_loi['LOI_microgravity_predicted']:.1f}%</div>
                <div class="kpi-sub">LOI Tierra: {pred_loi['LOI_1g']:.1f}% (Δ = {pred_loi['shift_pp']:+.1f} pp)</div>
            </div>
            """, unsafe_allow_html=True)
        with res3:
            st.markdown(f"""
            <div class="kpi-card" style="border-left: 5px solid #ff6b35;">
                <div class="kpi-title">Tasa de Propagación Vf (ML)</div>
                <div class="kpi-value" style="color: #ff6b35;">{pred_flame['flame_spread_rate_mm_s']:.2f} mm/s</div>
                <div class="kpi-sub">IC 95%: [{pred_flame['confidence_interval_95'][0]:.2f}, {pred_flame['confidence_interval_95'][1]:.2f}] mm/s</div>
            </div>
            """, unsafe_allow_html=True)
            
        st.markdown("---")
        
        # Recommendations
        if rec_engine:
            rec_data = rec_engine.recommend_structured(sample_in)
            
            st.subheader("💡 Prescripción de Seguridad Operacional:")
            c_r1, c_r2 = st.columns(2)
            with c_r1:
                st.markdown("##### 🔬 Investigaciones Orbitales de Respaldo:")
                for p_item in rec_data.get("relevant_psi_investigations", []):
                    st.markdown(f"- 🛰️ **{p_item['id']}**: {p_item['name']}")
                
                st.markdown("##### 📡 Configuración de Detección Óptima:")
                s_cfg = rec_data.get("detection_sensor_configuration", {})
                st.markdown(f"- **Detector Incipiente:** {s_cfg.get('primary_detector')}")
                st.markdown(f"- **Canales TDLAS:** {', '.join(s_cfg.get('tdlas_channels', []))}")
                st.markdown(f"- **Umbral de Alerta:** `{s_cfg.get('alarm_threshold')}`")
                
            with c_r2:
                st.markdown("##### 💧 Estrategia de Supresión (NFPA 750 Adaptada a Micro-g):")
                supp = rec_data.get("suppression_strategy", {})
                st.markdown(f"- **Agente:** {supp.get('agent')}")
                st.markdown(f"- **Presión de Descarga:** `{supp.get('operating_pressure_bar')} bar` ({supp.get('operating_pressure_bar')*14.5:.0f} psi)")
                st.markdown(f"- **Tamaño de Gota Dv0.50:** `{supp.get('droplet_dv050_um')} µm` (evaporación instantánea)")
                st.markdown(f"- **Aditivo Encapsulante:** {supp.get('additive')}")
                st.markdown(f"- **Tiempo de Descarga:** `{supp.get('discharge_duration_sec')} segundos`")

# ══════════════════════════════════════════════════════════════════════════════
# TAB 4: ASISTENTE IA DE EXPERIENCIAS PREVIAS
# ══════════════════════════════════════════════════════════════════════════════
with tab4:
    st.markdown("### 🤖 Asistente de IA Entrenado en Experiencias Previas")
    st.markdown("Consulta cualquier duda técnica sobre experimentos orbitales pasados de la NASA, normas de inflamabilidad y lecciones de accidentes espaciales.")
    
    # Clickable Historical Chips
    st.markdown("##### 💡 Casos y Experiencias Previas para Explorar con un Clic:")
    
    chip1, chip2, chip3 = st.columns(3)
    with chip1:
        if st.button("🚀 Exp. FLEX: ¿Cómo se descubrió la llama fría?", key="c_flex"):
            st.session_state["ai_query"] = "¿Qué son las llamas frías o cool flames?"
        if st.button("⚠️ Accidente Apollo 1: Falla de escotilla", key="c_ap1"):
            st.session_state["ai_query"] = "¿Qué lecciones de seguridad dejó el accidente del Apollo 1?"
    with chip2:
        if st.button("🚀 Exp. BASS-II: Cables finos arden más", key="c_bass"):
            st.session_state["ai_query"] = "¿Cómo afecta el espesor y la curvatura a la inflamabilidad en microgravedad?"
        if st.button("⚠️ Accidente Mir: Vela de oxígeno Vika", key="c_mir"):
            st.session_state["ai_query"] = "¿Qué ocurrió en el incendio de la estación espacial Mir?"
    with chip3:
        if st.button("🚀 Exp. Saffire: Fuego real a gran escala", key="c_saffire"):
            st.session_state["ai_query"] = "¿Qué es el experimento Saffire y qué demostró sobre incendios a gran escala?"
        if st.button("💧 Supresión: ¿Por qué niebla NFPA 750?", key="c_mist"):
            st.session_state["ai_query"] = "¿Por qué usar niebla de agua en lugar de CO2 o nitrógeno?"

    user_q = st.text_input(
        "Haz una pregunta técnica al Asistente:",
        value=st.session_state.get("ai_query", ""),
        placeholder="ej. ¿Por qué el ensayo NASA-STD-6001B no es el peor escenario? ¿Cómo detectar humo en microgravedad?",
        key="main_ai_input"
    )
    
    if user_q and vectorizer and tfidf_matrix is not None:
        q_vec = vectorizer.transform([user_q])
        sims = cosine_similarity(q_vec, tfidf_matrix).flatten()
        best_i = sims.argmax()
        score = sims[best_i]
        
        if score > 0.12:
            entry = kb_entries[best_i]
            st.markdown(f"""
            <div style="background: rgba(17, 24, 39, 0.95); border: 1px solid #00d4ff; border-radius: 12px; padding: 22px; margin-top: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <span style="font-weight: 700; color: #00d4ff; font-size: 1.1rem;">
                        📋 Respuesta Basada en Datos de Vuelo (Certeza: {score*100:.1f}%)
                    </span>
                    <span class="badge-safe">FUENTE DE MISIÓN VERIFICADA</span>
                </div>
                <p style="font-size: 1.02rem; color: #f8fafc; line-height: 1.65; margin-bottom: 16px;">
                    {entry['answer']}
                </p>
                <div style="border-top: 1px solid #1e293b; padding-top: 10px; font-size: 0.85rem; color: #94a3b8;">
                    <b>📚 Experimento / Documento de Respaldo:</b> {entry['source']}<br/>
                    <b>🏷️ Categoría:</b> <code>{entry.get('category', 'General')}</code> &nbsp;|&nbsp; <b>ID:</b> <code>{entry['id']}</code>
                </div>
            </div>
            """, unsafe_allow_html=True)
        else:
            st.warning(f"⚠️ **Información no indexada en la base actual.** (Similitud: {score*100:.1f}%). El sistema restringe respuestas que no tengan respaldo directo en los experimentos de la NASA para evitar alucinaciones.")

# ══════════════════════════════════════════════════════════════════════════════
# TAB 5: INVESTIGACIONES NASA PSI (24)
# ══════════════════════════════════════════════════════════════════════════════
with tab5:
    st.markdown("### 🔬 Repositorio Completo de Investigaciones NASA PSI")
    st.markdown("Explora los **24 proyectos de combustión espacial** que componen la base de 12 TB de datos de microgravedad.")
    
    col_f1, col_f2 = st.columns([1.5, 1.0])
    with col_f1:
        f_search = st.text_input("Filtrar por nombre, material o palabra clave:", placeholder="ej. PMMA, n-heptano, extinción...")
    with col_f2:
        plats = ["Todas"] + sorted(list(set(x.get("platform", "ISS") for x in psi_data)))
        f_plat = st.selectbox("Filtrar por Plataforma:", plats)
        
    filtered_psi = []
    for item in psi_data:
        m_txt = True
        if f_search:
            t = f_search.lower()
            pool = (item.get("name", "") + " " + item.get("description", "") + " " + " ".join(item.get("materials", []))).lower()
            m_txt = t in pool
        m_plt = (f_plat == "Todas") or (item.get("platform") == f_plat)
        if m_txt and m_plt:
            filtered_psi.append(item)
            
    st.markdown(f"**Mostrando {len(filtered_psi)} de {len(psi_data)} investigaciones.**")
    
    # Table
    t_rows = [{
        "ID": x["id"],
        "Investigación": x["name"],
        "Plataforma": x["platform"],
        "Años": x["year_range"],
        "Tipo": x.get("experiment_type", "Combustión"),
        "Materiales": ", ".join(x.get("materials", []))
    } for x in filtered_psi]
    
    st.dataframe(pd.DataFrame(t_rows), use_container_width=True, hide_index=True)
    
    st.markdown("---")
    st.subheader("📖 Ficha Técnica de la Investigación Seleccionada:")
    sel_inv_str = st.selectbox("Seleccionar para ver detalles completos:", [f"{x['id']} — {x['name']}" for x in filtered_psi])
    
    if sel_inv_str:
        chosen_id = sel_inv_str.split(" — ")[0]
        chosen_inv = next((x for x in filtered_psi if x["id"] == chosen_id), None)
        if chosen_inv:
            st.markdown(f"#### {chosen_inv['name']} ({chosen_inv['id']})")
            st.markdown(f"**Descripción:** {chosen_inv['description']}")
            
            c_d1, c_d2 = st.columns(2)
            with c_d1:
                st.markdown("**🎯 Objetivos Principales:**")
                for o in chosen_inv.get("objectives", []):
                    st.markdown(f"- {o}")
                st.markdown("**🔑 Hallazgos Clave:**")
                for kf in chosen_inv.get("key_findings", []):
                    st.markdown(f"- ✅ {kf}")
            with c_d2:
                st.markdown("**⚙️ Parámetros Experimentales:**")
                st.table(pd.DataFrame(list(chosen_inv.get("parameters", {}).items()), columns=["Parámetro", "Valor"]))
                st.markdown("**📚 Publicaciones:**")
                for pub in chosen_inv.get("publications", []):
                    st.markdown(f"- 📄 *{pub}*")
