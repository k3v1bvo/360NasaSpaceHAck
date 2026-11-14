"""
Página 3: Flame Simulator — Simulador Físico-Cinético Interactivo
Flame in Freefall — NASA Space Apps Challenge 2026
"""

import os
import sys
import streamlit as st
import numpy as np
import plotly.graph_objects as go
from plotly.subplots import make_subplots

# Add project root to sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from simulation.flame_kinetics import MicrogravityFlameKinetics

# Custom CSS
css_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "style.css")
if os.path.exists(css_path):
    with open(css_path, "r", encoding="utf-8") as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

st.title("🔥 Simulador Dinámico de Llama en Microgravedad")
st.markdown("Experimenta con la física de combustión difusiva, el efecto de curvatura en cables delgados y la transición a **Llamas Frías (Cool Flames)**.")

# Sidebar / Top Parameters
col_ctrl1, col_ctrl2, col_ctrl3, col_ctrl4 = st.columns(4)

with col_ctrl1:
    atm_mode = st.selectbox(
        "Atmósfera de Misión:",
        ["ISS_Standard", "Artemis_Exploration", "Lunar_Surface"],
        format_func=lambda x: {
            "ISS_Standard": "ISS (14.7 psi, 21% O2)",
            "Artemis_Exploration": "Artemis Gateway (10.2 psi, 34% O2)",
            "Lunar_Surface": "Lunar Habitat (8.2 psi, 32% O2)"
        }[x]
    )

with col_ctrl2:
    mat_choice = st.selectbox(
        "Material del Combustible:",
        ["PMMA", "ETFE_Wire", "Nomex"]
    )

with col_ctrl3:
    diam_input = st.slider("Diámetro del Cilindro / Cable (mm):", min_value=0.5, max_value=8.0, value=2.0, step=0.5)

with col_ctrl4:
    flow_input = st.slider("Velocidad de Flujo HVAC (cm/s):", min_value=0.1, max_value=15.0, value=2.5, step=0.2)

kinetics = MicrogravityFlameKinetics(atmosphere=atm_mode)

# Calculate current operating point
current_vf = kinetics.calculate_flame_spread(V_g=flow_input, d_fuel=diam_input, material=mat_choice)

# Display live metrics
m1, m2, m3, m4 = st.columns(4)
with m1:
    st.metric("Tasa de Propagación $V_f$", f"{current_vf:.2f} mm/s", f"{'Alto Riesgo' if current_vf > 2.0 else 'Moderado'}")
with m2:
    p_val = kinetics.current_atm["P_atm"]
    st.metric("Presión de Cabina", f"{p_val:.2f} atm", f"{p_val*14.7:.1f} psia")
with m3:
    o2_val = kinetics.current_atm["O2"] * 100
    st.metric("Fracción de Oxígeno", f"{o2_val:.1f}%", f"{'Hiperóxico' if o2_val > 25 else 'Normóxico'}")
with m4:
    regime = "Meseta Crítica HVAC" if 0.4 <= flow_input <= 5.0 else ("Asfixia Difusiva" if flow_input < 0.4 else "Disipación Convectiva")
    st.metric("Régimen de Transporte", regime)

st.markdown("---")

# Chart 1: Flame Spread Curves
st.subheader("📈 Curva No Monótona de Propagación ($V_f$ vs $V_g$) y Efecto de Curvatura")

v_g_arr = np.linspace(0.01, 15.0, 200)
diameters = [0.5, 1.0, 2.0, 5.0]
colors = ["#ef4444", "#f59e0b", "#00d4ff", "#10b981"]

fig_spread = go.Figure()

for d, c in zip(diameters, colors):
    v_f_vals = [kinetics.calculate_flame_spread(v, d, material=mat_choice) for v in v_g_arr]
    fig_spread.add_trace(go.Scatter(
        x=v_g_arr,
        y=v_f_vals,
        mode='lines',
        name=f"d = {d} mm {'(Seleccionado)' if d == diam_input else ''}",
        line=dict(color=c, width=3 if d == diam_input else 1.8)
    ))

# Highlight current operating point
fig_spread.add_trace(go.Scatter(
    x=[flow_input],
    y=[current_vf],
    mode='markers',
    name='Punto de Operación Actual',
    marker=dict(color='#ffffff', size=14, symbol='star', line=dict(color='#ef4444', width=2))
))

# Critical HVAC plateau shading
fig_spread.add_vrect(
    x0=0.4, x1=5.0,
    fillcolor="rgba(239, 68, 68, 0.12)",
    layer="below", line_width=1, line_dash="dash", line_color="#ef4444",
    annotation_text="Meseta Crítica HVAC (0.4 - 5 cm/s)", annotation_position="top left"
)

fig_spread.update_layout(
    plot_bgcolor='#0a0e17',
    paper_bgcolor='#0a0e17',
    font=dict(color='#f8fafc'),
    xaxis=dict(title="Velocidad de Flujo Opuesto Forzado $V_g$ (cm/s)", gridcolor='#1e293b'),
    yaxis=dict(title="Velocidad de Propagación de Llama $V_f$ (mm/s)", gridcolor='#1e293b'),
    legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
    height=420
)
st.plotly_chart(fig_spread, use_container_width=True)

st.markdown("---")

# Chart 2: Cool Flame Transient Simulation
st.subheader("❄️ Simulación Dinámica de Llamas Frías (Cool Flames: 600–800 K)")
st.markdown("Observa cómo tras la extinción radiativa aparente de la llama caliente, la reacción entra en un régimen metaestable de **química de baja temperatura (LTC)** con acumulación de peróxidos.")

if st.button("▶️ Ejecutar Simulación Transitoria de Llama Fría (60 Segundos)"):
    cool_data = kinetics.simulate_cool_flame_transient(t_seconds=60.0)
    
    fig_cool = make_subplots(specs=[[{"secondary_y": True}]])
    
    # Temperature trace
    fig_cool.add_trace(
        go.Scatter(
            x=cool_data["time"],
            y=cool_data["temperature"],
            name="Temperatura de Reacción (K)",
            line=dict(color="#ef4444", width=2.5)
        ),
        secondary_y=False
    )
    
    # H2O2 trace
    fig_cool.add_trace(
        go.Scatter(
            x=cool_data["time"],
            y=cool_data["H2O2_ppm"],
            name="H₂O₂ (ppm)",
            line=dict(color="#00d4ff", width=2.0)
        ),
        secondary_y=True
    )
    
    # CH2O trace
    fig_cool.add_trace(
        go.Scatter(
            x=cool_data["time"],
            y=cool_data["CH2O_ppm"],
            name="CH₂O Formaldehído (ppm)",
            line=dict(color="#f59e0b", width=2.0, dash='dash')
        ),
        secondary_y=True
    )
    
    # Shading cool flame regime
    fig_cool.add_vrect(
        x0=12.0, x1=45.0,
        fillcolor="rgba(245, 158, 11, 0.15)",
        layer="below", line_width=0,
        annotation_text="Régimen de Llama Fría Activa (600 - 800 K)", annotation_position="top left"
    )
    
    fig_cool.update_layout(
        plot_bgcolor='#0a0e17',
        paper_bgcolor='#0a0e17',
        font=dict(color='#f8fafc'),
        xaxis=dict(title="Tiempo desde la Ignición (segundos)", gridcolor='#1e293b'),
        yaxis=dict(title="Temperatura (K)", gridcolor='#1e293b'),
        yaxis2=dict(title="Concentración de Especies (ppm)", gridcolor='#1e293b'),
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
        height=450
    )
    
    st.plotly_chart(fig_cool, use_container_width=True)
    
    st.warning("⚠️ **ALERTA DE SEGURIDAD OPERACIONAL:** Durante el intervalo t = 12s a 45s, los detectores ópticos convencionales de humo NO ven luz ni llama. Sin embargo, los sensores TDLAS registran >30 ppm de H₂O₂. Si la tripulación restablece la ventilación, el fuego reencenderá instantáneamente.")
