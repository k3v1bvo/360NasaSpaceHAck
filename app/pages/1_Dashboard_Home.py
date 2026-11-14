"""
Página 1: Dashboard Home — Resumen Ejecutivo y KPIs
Flame in Freefall — NASA Space Apps Challenge 2026
"""

import os
import json
import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go

# Custom CSS
css_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "style.css")
if os.path.exists(css_path):
    with open(css_path, "r", encoding="utf-8") as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

st.title("📊 Resumen Ejecutivo y Plataforma NASA PSI")
st.markdown("Panorámica general del repositorio de ciencias físicas de la NASA, cronología orbital e impacto en hábitats espaciales.")

# Load PSI data
psi_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "psi_investigations.json")
if os.path.exists(psi_path):
    with open(psi_path, "r", encoding="utf-8") as f:
        psi_data = json.load(f)
else:
    psi_data = []

# Load Materials data
mat_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "materials_flammability.json")
if os.path.exists(mat_path):
    with open(mat_path, "r", encoding="utf-8") as f:
        mat_data = json.load(f)
else:
    mat_data = []

# Row 1: KPI metric cards
c1, c2, c3, c4 = st.columns(4)
with c1:
    st.metric("Total Investigaciones PSI", len(psi_data), "Combustión Micro-g")
with c2:
    platforms = set(item.get("platform", "ISS") for item in psi_data)
    st.metric("Plataformas Espaciales", len(platforms), "ISS, Cygnus, Shuttle, Sounding")
with c3:
    st.metric("Materiales Caracterizados", len(mat_data), "Polímeros & Fibras")
with c4:
    st.metric("Ahorro de Riesgo LOI", "-3.5 pp", "Desfase Tierra vs Órbita")

st.markdown("---")

# Row 2: Interactive Timeline of NASA Combustion Investigations
st.subheader("🛰️ Cronología de Misiones de Combustión en Microgravedad")

timeline_events = [
    {"Misión": "DCE (Droplet Combustion Exp.)", "Año": 1997, "Plataforma": "Space Shuttle", "Hito": "Primeras observaciones de llamas esféricas cuasi-estacionarias"},
    {"Misión": "SAME (Smoke Aerosol Measurement)", "Año": 2007, "Plataforma": "ISS (Destiny)", "Hito": "Descubrimiento de la aglomeración browniana masiva de humo en micro-g"},
    {"Misión": "FLEX (Flame Extinguishment Exp.)", "Año": 2009, "Plataforma": "ISS (CIR)", "Hito": "Descubrimiento de Llamas Frías (Cool Flames) post-extinción radiativa"},
    {"Misión": "BASS (Burning & Suppression of Solids)", "Año": 2012, "Plataforma": "ISS (MSG)", "Hito": "Comportamiento no monótono de propagación contra flujo lento"},
    {"Misión": "BASS-II", "Año": 2014, "Plataforma": "ISS (MSG)", "Hito": "Efectos de curvatura en barras y cables cilíndricos delgados de PMMA/ETFE"},
    {"Misión": "Saffire-I (Spacecraft Fire Safety)", "Año": 2016, "Plataforma": "Cygnus Cargo", "Hito": "Primer incendio a gran escala (0.4 m x 1.0 m) en nave espacial no tripulada"},
    {"Misión": "ACME (Advanced Combustion Microgravity)", "Año": 2017, "Plataforma": "ISS (CIR)", "Hito": "5 experimentos simultáneos de llamas gaseosas sin hollín"},
    {"Misión": "FLARE (JAXA / NASA Project)", "Año": 2019, "Plataforma": "ISS (Kibo SCEM)", "Hito": "Nueva norma internacional ISO 4589-4 para predecir LOI orbital"},
    {"Misión": "SoFIE (Solid Fuel Ignition & Extinction)", "Año": 2022, "Plataforma": "ISS (CIR)", "Hito": "Ensayos multifactoriales con probetas cilíndricas y mallas espaciales"}
]

df_timeline = pd.DataFrame(timeline_events)

fig_time = px.scatter(
    df_timeline,
    x="Año",
    y="Plataforma",
    text="Misión",
    color="Plataforma",
    hover_data=["Hito"],
    title="Línea de Tiempo de Investigaciones Clave en NASA PSI",
    color_discrete_sequence=["#00d4ff", "#ff6b35", "#10b981", "#f59e0b"]
)
fig_time.update_traces(textposition='top center', marker=dict(size=14, line=dict(width=2, color='#ffffff')))
fig_time.update_layout(
    plot_bgcolor='#0a0e17',
    paper_bgcolor='#0a0e17',
    font=dict(color='#f8fafc'),
    xaxis=dict(gridcolor='#1e293b', dtick=2),
    yaxis=dict(gridcolor='#1e293b'),
    showlegend=False,
    height=340
)
st.plotly_chart(fig_time, use_container_width=True)

# Row 3: LOI Shift Comparison
st.subheader("⚠️ Paradoja de Inflamabilidad: LOI en Tierra (1-g) vs LOI en Microgravedad")
st.markdown("En microgravedad con flujo de ventilación forzada ultra-lento ($0.4\\text{ a }5\\text{ cm/s}$), el **Índice Límite de Oxígeno disminuye**, lo que significa que los materiales **arden a concentraciones de oxígeno más bajas** que en la Tierra.")

if mat_data:
    df_mat = pd.DataFrame(mat_data)
    
    fig_loi = go.Figure()
    fig_loi.add_trace(go.Bar(
        x=df_mat["material"],
        y=df_mat["LOI_1g"],
        name="LOI Terrestre 1-g (NASA-STD-6001B)",
        marker_color="#10b981"
    ))
    fig_loi.add_trace(go.Bar(
        x=df_mat["material"],
        y=df_mat["LOI_microg_estimated"],
        name="LOI Microgravedad Estimado (FLARE / BASS)",
        marker_color="#ef4444"
    ))
    
    # Add ambient reference lines
    fig_loi.add_hline(y=21.0, line_dash="dash", line_color="#00d4ff", annotation_text="Atmósfera Estándar ISS (21% O2)")
    fig_loi.add_hline(y=34.0, line_dash="dot", line_color="#f59e0b", annotation_text="Atmósfera Artemis Gateway (34% O2)")
    
    fig_loi.update_layout(
        barmode='group',
        plot_bgcolor='#0a0e17',
        paper_bgcolor='#0a0e17',
        font=dict(color='#f8fafc'),
        xaxis=dict(gridcolor='#1e293b', tickangle=-25),
        yaxis=dict(title="Índice Límite de Oxígeno (%)", gridcolor='#1e293b'),
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
        height=420
    )
    st.plotly_chart(fig_loi, use_container_width=True)

# Row 4: Key Insights Callout
st.markdown("### 💡 Tres Lecciones Cruciales de los Datos de la NASA")
col_a, col_b, col_c = st.columns(3)

with col_a:
    st.markdown("""
    <div style="background: #111827; border: 1px solid #1e293b; border-radius: 10px; padding: 16px;">
        <h4 style="color: #ff6b35; margin-top: 0;">1. El Estándar 1-g Falla</h4>
        <p style="font-size: 0.88rem; color: #cbd5e1; line-height: 1.5;">
            El ensayo NASA-STD-6001B Test 1 en 1-g induce enfriamiento convectivo por flotabilidad que no existe en órbita. Materiales clasificados como auto-extinguibles en tierra pueden arder indefinidamente en cabinas espaciales.
        </p>
    </div>
    """, unsafe_allow_html=True)

with col_b:
    st.markdown("""
    <div style="background: #111827; border: 1px solid #1e293b; border-radius: 10px; padding: 16px;">
        <h4 style="color: #f59e0b; margin-top: 0;">2. Peligro de Llamas Frías</h4>
        <p style="font-size: 0.88rem; color: #cbd5e1; line-height: 1.5;">
            Los experimentos FLEX y CFI demostraron que tras apagarse la llama brillante, la reacción continúa entre 600 K y 800 K emitiendo $H_2O_2$ y formaldehído, listos para reencender si se reactiva la ventilación.
        </p>
    </div>
    """, unsafe_allow_html=True)

with col_c:
    st.markdown("""
    <div style="background: #111827; border: 1px solid #1e293b; border-radius: 10px; padding: 16px;">
        <h4 style="color: #00d4ff; margin-top: 0;">3. Niebla Fina: La Solución</h4>
        <p style="font-size: 0.88rem; color: #cbd5e1; line-height: 1.5;">
            La supresión por micro-niebla de agua (NFPA 750, 35 bar, gotas de 35 µm con aditivo F-500) sofoca por calor latente (2257 kJ/kg) y expansión localizada sin sobrepresurizar ni asfixiar a los astronautas con $CO_2$.
        </p>
    </div>
    """, unsafe_allow_html=True)
