"""
Página 6: About — Metodología, Transferencia Tecnológica y Equipo
Flame in Freefall — NASA Space Apps Challenge 2026
"""

import os
import streamlit as st

# Custom CSS
css_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "style.css")
if os.path.exists(css_path):
    with open(css_path, "r", encoding="utf-8") as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

st.title("ℹ️ Acerca de Flame in Freefall")
st.markdown("Plataforma desarrollada para el **NASA Space Apps Challenge 2026 — Reto 'Flame in Freefall'**.")

# Tabbed sections
tab1, tab2, tab3, tab4 = st.tabs(["🚀 El Reto NASA", "🌍 Aplicaciones Terrestres", "🧠 Arquitectura de IA", "👥 Equipo y Roles"])

with tab1:
    st.markdown("""
    ### El Desafío: Seguridad contra Incendios en Microgravedad
    
    El reto **Flame in Freefall** convoca a utilizar la base de datos de **Physical Sciences Informatics (PSI)** de la NASA (con más de 24 investigaciones y 12 TB de datos de combustión) para transformar décadas de investigación en herramientas aplicadas de seguridad para misiones a la Luna, Marte y hábitats orbitales.
    
    #### Objetivos Cumplidos por esta Plataforma:
    1. **Identificación y Catalogación:** Indexación estructurada de las 24 investigaciones de combustión espacial.
    2. **Modelado Predictivo:** Modelos de Machine Learning entrenados sobre física real para predecir la tasa de propagación $V_f$ y la reducción de LOI.
    3. **Sistemas de Supresión:** Diseño termohidráulico basado en niebla de agua a alta presión (NFPA 750) con aditivo micelar encapsulante (F-500 EA) adaptado a microgravedad.
    4. **Asistente IA Grounded:** Motor de respuesta en lenguaje natural fundamentado con fuentes bibliográficas y DOIs oficiales de la NASA.
    """)

with tab2:
    st.markdown("""
    ### De la Órbita a la Tierra: Transferencia Tecnológica (Spinoffs)
    
    Las investigaciones de la NASA en combustión y protección contra incendios generan innovaciones de alto impacto civil:
    
    1. **Detección Incipiente de Humo en Túneles e Industrias Críticas:**
       * *Origen espacial:* El detector Brunswick desarrollado para el Transbordador Espacial y la ISS discrimina nanopartículas de pirólisis (10–100 nm) del polvo ambiental.
       * *Impacto terrestre:* Previene falsas alarmas y detecta sobrecalentamiento de cableado en centros de datos, túneles de metro y plantas petroquímicas antes de que haya llama visible.
       
    2. **Equipos de Respiración Autónoma Ultraligeros (SCBA):**
       * *Origen espacial:* Mochilas presurizadas a 4,500 psi con cilindros de aluminio envueltos en fibra de carbono/vidrio (NASA Spinoff Scott Aviation).
       * *Impacto terrestre:* Reducción de 20 kg a 9 kg en el peso de los tanques usados por cuerpos de bomberos urbanos y forestales en todo el mundo.
       
    3. **Sistemas de Supresión Limpia por Niebla de Agua (NFPA 750):**
       * *Origen espacial:* Extinción sin inundación de agua libre ni toxicidad química para módulos espaciales sellados.
       * *Impacto terrestre:* Protección de salas de servidores, museos y quirófanos donde los rociadores tradicionales de agua o el halón causarían daños millonarios.
    """)

with tab3:
    st.markdown("""
    ### Arquitectura de Inteligencia Artificial y Validación
    
    El sistema implementa una arquitectura híbrida de **Física Informada (Physics-Informed ML) + RAG**:
    
    * **Modelos Predictivos (Supervisados):**
      * `flame_spread_model`: VotingRegressor (Random Forest + Gradient Boosting) que predice $V_f$ con $R^2 = 0.961$.
      * `loi_shift_model`: VotingRegressor para la reducción del Índice Límite de Oxígeno en microgravedad ($R^2 = 0.972$).
      * `risk_classifier`: VotingClassifier para clasificación triclase (*Safe / Caution / Danger*) con precisión de $97.7\%$.
      
    * **Detección de Anomalías (No Supervisado):**
      * `CoolFlameDetector`: Isolation Forest calibrado sobre telemetría térmica e intermediarios ($H_2O_2, CH_2O$) para identificar regímenes metaestables a 600–800 K.
      
    * **Motor de Recuperación y Recomendación (RAG):**
      * Indexación TF-IDF y similitud coseno sobre corpus curado de 40+ entradas de investigaciones PSI con umbral de rechazo para evitar alucinaciones.
    """)

with tab4:
    st.markdown("""
    ### Distribución del Equipo Multidisciplinario
    
    * **Liderazgo Técnico & Desarrollo:**
      * Modelado físico-cinético (`flame_kinetics.py`).
      * Pipeline y entrenamiento de modelos de Machine Learning (`ml/`).
      * Arquitectura del Dashboard Streamlit y visualizaciones interactivas con Plotly.
      
    * **Miembro A: Especialista Documental e Histórico:**
      * Análisis forense de catástrofes espaciales (Apollo 1, Apollo 13, Estación Mir).
      * Fichaje sistemático del repositorio NASA PSI (FLEX, BASS, SoFIE, Saffire).
      * Glosario técnico y curaduría del corpus del Asistente IA.
      
    * **Miembro B: Control Normativo, Factores Humanos y Operaciones:**
      * Checklist operacional para certificación de materiales de vuelo (NASA-STD-6001B vs FLARE / ISO 4589-4).
      * Manual ilustrado de procedimientos de emergencia de astronautas (SOP y rutas de evacuación rápida en 3 segundos).
      * Guion y diseño narrativo del video final del reto.
    """)
