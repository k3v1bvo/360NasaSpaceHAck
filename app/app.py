"""
🔥 Flame in Freefall — AI-Powered Microgravity Fire Safety Dashboard
NASA Space Apps Challenge 2026
"""

import os
import sys
import json
import streamlit as st
import pandas as pd
import numpy as np

# Page configuration
st.set_page_config(
    page_title="Flame in Freefall — NASA PSI Fire Safety",
    page_icon="🔥",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Load custom CSS
css_path = os.path.join(os.path.dirname(__file__), "style.css")
if os.path.exists(css_path):
    with open(css_path, "r", encoding="utf-8") as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

# Sidebar NASA Branding
with st.sidebar:
    st.markdown("""
    <div style="text-align: center; padding: 10px 0 20px 0;">
        <span style="font-size: 2.2rem;">🔥</span>
        <h2 style="margin: 0; color: #00d4ff; font-family: 'JetBrains Mono', monospace; font-size: 1.3rem;">FLAME IN FREEFALL</h2>
        <p style="color: #94a3b8; font-size: 0.8rem; margin: 4px 0 0 0;">NASA Space Apps Challenge 2026</p>
        <div style="margin-top: 8px; display: inline-block; background: rgba(0, 212, 255, 0.15); border: 1px solid #00d4ff; padding: 2px 10px; border-radius: 12px; font-size: 0.75rem; color: #00d4ff; font-weight: 600;">
            NASA PSI DATA PLATFORM
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("---")
    st.markdown("### 🛰️ Entornos de Misión")
    env_choice = st.selectbox(
        "Atmósfera de Referencia:",
        ["ISS Standard (14.7 psia, 21% O2)", "Artemis Gateway (10.2 psia, 34% O2)", "Lunar Habitat (8.2 psia, 32% O2)"],
        index=0
    )
    st.session_state["selected_env"] = env_choice
    
    st.markdown("---")
    st.markdown("""
    <div style="font-size: 0.75rem; color: #64748b; line-height: 1.5;">
        <b>Fuente de Datos:</b><br/>
        NASA Physical Sciences Informatics (PSI)<br/>
        24 Investigaciones · 12 TB · Microgravedad<br/>
        <br/>
        <b>Estándares:</b><br/>
        NASA-STD-6001B · ISO 4589-4 (FLARE)<br/>
        NFPA 750 (Niebla de Alta Presión)
    </div>
    """, unsafe_allow_html=True)

# Main Hero Header
st.markdown("""
<div class="mission-header">
    <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
            <h1 style="margin: 0; font-size: 2.2rem; font-weight: 700; color: #f8fafc;">
                Flame in Freefall <span style="color: #00d4ff;">Mission Control</span>
            </h1>
            <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 1rem;">
                Plataforma de Inteligencia Artificial y Datos NASA PSI para la Seguridad contra Incendios en Microgravedad y Exploración Espacial
            </p>
        </div>
        <div style="text-align: right;">
            <span class="badge-safe">SISTEMA ACTIVO</span>
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; color: #94a3b8; margin-top: 6px;">
                PSI REPOSITORY v2026.1
            </div>
        </div>
    </div>
</div>
""", unsafe_allow_html=True)

# Top KPI Cards
c1, c2, c3, c4 = st.columns(4)

with c1:
    st.markdown("""
    <div class="kpi-card">
        <div class="kpi-title">Investigaciones PSI</div>
        <div class="kpi-value" style="color: #00d4ff;">24</div>
        <div class="kpi-sub">Ciencia de Combustión Orbital</div>
    </div>
    """, unsafe_allow_html=True)

with c2:
    st.markdown("""
    <div class="kpi-card">
        <div class="kpi-title">Volumen de Datos</div>
        <div class="kpi-value" style="color: #ff6b35;">12 TB</div>
        <div class="kpi-sub">Telemetría, Video e Imágenes</div>
    </div>
    """, unsafe_allow_html=True)

with c3:
    st.markdown("""
    <div class="kpi-card">
        <div class="kpi-title">Regímenes Físicos</div>
        <div class="kpi-value" style="color: #f59e0b;">LTC & Diff</div>
        <div class="kpi-sub">Llamas Frías + Soot Shells</div>
    </div>
    """, unsafe_allow_html=True)

with c4:
    st.markdown("""
    <div class="kpi-card">
        <div class="kpi-title">Modelos Predictivos IA</div>
        <div class="kpi-value" style="color: #10b981;">4 Activos</div>
        <div class="kpi-sub">RF, GBR, Isolation Forest, TF-IDF</div>
    </div>
    """, unsafe_allow_html=True)

# Quick Overview & Navigation Tabs
st.markdown("### 🧭 Guía de Módulos del Dashboard")

col_left, col_right = st.columns([1.2, 1.0])

with col_left:
    st.markdown("""
    Este dashboard integra décadas de experimentos en microgravedad de la NASA para resolver las 4 paradojas de la combustión en caída libre:
    
    1. **📊 1. Dashboard Home**: Visión general de misiones, KPIs, cronología de experimentos espaciales y mapa de calor de materiales.
    2. **🔬 2. PSI Explorer**: Explorador interactivo con filtros avanzados de las **24 investigaciones de combustión** del repositorio NASA PSI (BASS, SoFIE, Saffire, FLEX, ACME, SPICE, etc.).
    3. **🔥 3. Flame Simulator**: Simulador dinámico con Plotly de propagación de llama ($V_f$ vs $V_g$), efectos de curvatura en cables delgados y transición a **Llamas Frías (Cool Flames)** a 600–800 K.
    4. **🤖 4. AI Assistant**: Asistente de consultas en lenguaje natural fundamentado en datos de la NASA con **atribución rigurosa de fuentes**.
    5. **🛡️ 5. Risk Matrix**: Clasificador predictivo de inflamabilidad que compara $LOI_{\text{1-g}}$ con $LOI_{\mu g}$ proyectado y evalúa el cumplimiento para ISS, Artemis y Luna.
    6. **ℹ️ 6. About**: Metodología, aplicaciones terrestres (equipos de bomberos y detección incipiente) y documentación del equipo.
    """)

with col_right:
    st.markdown("""
    <div style="background: rgba(17, 24, 39, 0.7); border: 1px solid #1e293b; border-radius: 12px; padding: 20px;">
        <h4 style="margin-top: 0; color: #00d4ff;">🚨 ¿Por qué el fuego en microgravedad es diferente?</h4>
        <ul style="color: #cbd5e1; font-size: 0.9rem; padding-left: 20px; line-height: 1.6;">
            <li><b>Sin Convección Natural:</b> El aire caliente no sube ($Gr \to 0$). La llama esférica azul depende exclusivamente de la difusión molecular.</li>
            <li><b>Falso Sentido de Seguridad (NASA-STD-6001B):</b> En tierra, el flujo ascendente enfría la base de llama. En órbita con flujos ultralentos (0.4–5 cm/s del HVAC), materiales aprobados en tierra arden con LOI menor.</li>
            <li><b>Llamas Frías Invisibles (600–800 K):</b> Tras la extinción aparente de la llama caliente, la química LTC de peróxidos ($H_2O_2$) mantiene una combustión oculta con riesgo de reencendido súbito.</li>
            <li><b>Soot Shells Concéntricos:</b> El hollín queda atrapado entre el flujo de Stefan y la fuerza termoforética, aumentando pérdidas radiativas.</li>
        </ul>
    </div>
    """, unsafe_allow_html=True)

st.info("👈 Utiliza el menú lateral izquierdo para navegar por las diferentes secciones del sistema.")
