# 🔥 Flame in Freefall — NASA Space Apps Challenge 2026
## AI-Powered Microgravity Fire Safety Dashboard & PSI Data Platform

[![NASA PSI](https://img.shields.io/badge/NASA-PSI%20Data%20Repository-blue.svg)](https://science.nasa.gov/physical-sciences-informatics-psi/)
[![Streamlit](https://img.shields.io/badge/Streamlit-Dashboard-red.svg)](https://streamlit.io/)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-brightgreen.svg)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-lightgrey.svg)](LICENSE)

---

## 📌 Visión General del Proyecto

**Flame in Freefall** es una plataforma interactiva de Inteligencia Artificial que consume datos de **24 investigaciones de ciencia de la combustión (~12 TB)** del repositorio **NASA Physical Sciences Informatics (PSI)** para transformar décadas de investigación espacial en herramientas prácticas de predicción, detección incipiente y supresión de incendios en hábitats orbitales, lunares y marcianos.

### Paradojas Físicas Resueltas
1. **Ausencia de Flotabilidad ($g \to 0$):** El aire caliente no asciende; la combustión es puramente difusiva con llamas esféricas azuladas y formación de capas concéntricas de hollín (*soot shells*).
2. **Falla de NASA-STD-6001B Test 1:** En tierra, la convección boyante enfría la base de llama. En microgravedad con flujos ultralentos del HVAC ($0.4\text{--}5\text{ cm/s}$), el Índice Límite de Oxígeno (LOI) cae de 3 a 5 puntos porcentuales, permitiendo que materiales aprobados ardan de forma autosostenida.
3. **Llamas Frías (Cool Flames, 600–800 K):** Tras la extinción radiativa visible, reacciones cinéticas a baja temperatura (LTC) siguen vivas emitiendo $H_2O_2$ y formaldehído, con riesgo de reencendido súbito si se reactiva la ventilación.
4. **Falsas Alarmas Ópticas:** La coagulación browniana transforma el humo en aglomerados que saturan los detectores fotoeléctricos, requiriendo detección por movilidad submicrométrica (10–100 nm, principio Brunswick).

---

## 🚀 Inicio Rápido: Cómo Probar el Sistema

### 1. Requisitos Previos
El entorno requiere Python 3.10 o superior con los paquetes científicos estándar:
```bash
pip install -r app/requirements.txt
```

### 2. Ejecutar la Suite de Pruebas Automáticas
Para verificar que el motor físico, los modelos de ML, los datos y la estructura del dashboard están al 100%:
```bash
python run_test.py
```
*Salida esperada:* `🎉 SUCCESS: ALL 5/5 TESTS PASSED!`

### 3. Lanzar el Dashboard Interactivo de Misión
Ejecuta el siguiente comando en la raíz del proyecto:
```bash
streamlit run app/app.py
```
Abre tu navegador en `http://localhost:8501`.

---

## 🧭 Módulos del Dashboard

El panel de control cuenta con 6 secciones especializadas accesibles desde la barra lateral:

| Página | Descripción | Funcionalidad Clave |
|---|---|---|
| **📊 1. Dashboard Home** | Visión ejecutiva y KPIs | Línea de tiempo interactiva de experimentos NASA (1997–2024), gráfico comparativo de caída de LOI Tierra vs Órbita. |
| **🔬 2. PSI Explorer** | Explorador de las 24 investigaciones NASA PSI | Filtros por plataforma (ISS, Cygnus, Shuttle), tipo de experimento, buscador de texto completo, parámetros y enlaces DOI oficiales. |
| **🔥 3. Flame Simulator** | Simulador dinámico de física de combustión | Curvas interactivas $V_f$ vs $V_g$, efecto de curvatura en cables delgados y simulación transitoria de Llamas Frías ($H_2O_2, CH_2O, T$). |
| **🤖 4. AI Assistant** | Asistente de consultas fundamentado (RAG) | Responde preguntas técnicas citando explícitamente reportes de la NASA (FLEX, BASS, SoFIE, Saffire, FLARE) sin alucinaciones. |
| **🛡️ 5. Risk Matrix** | Clasificador predictivo con Machine Learning | Ingresa parámetros de cabina y obtén en tiempo real la tasa $V_f$, el LOI orbital, el nivel de riesgo (*Safe/Caution/Danger*) y recomendaciones de supresión. |
| **ℹ️ 6. About** | Metodología y transferencia civil | Spinoffs para bomberos (tanques ultraligeros de 4,500 psi, detectores incipientes, niebla NFPA 750) y roles del equipo. |

---

## 🧠 Modelos de Machine Learning Entrenados

Los modelos se encuentran entrenados y serializados en `ml/models/`:

1. **`flame_spread_model` (VotingRegressor: Random Forest + Gradient Boosting):**
   * *Métrica:* $R^2 = 0.9611$, $\text{RMSE} = 0.675\text{ mm/s}$.
   * *Entradas:* Concentración de $O_2$, presión de cabina, velocidad de ventilación, diámetro del combustible, tipo de material.
2. **`loi_shift_model` (VotingRegressor: FLARE ISO 4589-4 correlation):**
   * *Métrica:* $R^2 = 0.9723$, $\text{RMSE} = 1.001\text{ pp}$.
   * *Predice:* Reducción efectiva del LOI en microgravedad.
3. **`risk_classifier` (VotingClassifier):**
   * *Métrica:* Precisión $= 97.68\%$, $F_1 = 0.9767$.
   * *Clasifica:* Nivel de riesgo triclase (*Safe / Caution / Danger*).
4. **`cool_flame_detector` (Isolation Forest):**
   * *Detección:* Anomalías en telemetría térmica y firmas de intermediarios cinéticos ($H_2O_2$).

Para re-entrenar todos los modelos desde cero:
```bash
python ml/train_all.py
```

---

## 📂 Estructura del Repositorio

```
├── app/
│   ├── app.py                      # Punto de entrada principal Streamlit
│   ├── style.css                   # Tema aeroespacial oscuro personalizado
│   ├── requirements.txt            # Dependencias del dashboard
│   ├── pages/
│   │   ├── 1_Dashboard_Home.py     # KPIs, timeline y mapa de calor
│   │   ├── 2_PSI_Explorer.py       # Base de 24 investigaciones PSI
│   │   ├── 3_Flame_Simulator.py    # Simulador dinámico Plotly
│   │   ├── 4_AI_Assistant.py       # Asistente RAG con fuentes NASA
│   │   ├── 5_Risk_Matrix.py        # Evaluador de riesgo en vivo con ML
│   │   └── 6_About.py              # Transferencia terrestre y equipo
│   └── data/
│       ├── psi_investigations.json # Catálogo completo de 24 proyectos PSI
│       ├── knowledge_base.json     # Corpus de 43 entradas Q&A con fuentes
│       └── materials_flammability.json # Catálogo de 8 materiales espaciales
├── ml/
│   ├── flame_predictor.py          # Ensamble de regresión y clasificación
│   ├── cool_flame_detector.py      # Detector de anomalías Isolation Forest
│   ├── recommendation_engine.py    # Motor de recomendaciones de seguridad
│   ├── data_generator.py           # Generador de datos sintéticos con física
│   ├── train_all.py                # Pipeline de entrenamiento automático
│   └── models/                     # Modelos entrenados y métricas JSON
├── simulation/
│   ├── flame_kinetics.py           # Motor de física y cinética LTC
│   └── outputs/                    # Gráficos de alta resolución generados
├── PLAN_DE_IMPLEMENTACION_FLAME_IN_FREEFALL.md # Especificación técnica maestra
├── run_test.py                     # Suite de verificación del sistema
└── README.md                       # Documentación general
```

---

## 👥 Equipo y Atribución
Desarrollado para el **NASA Space Apps Challenge 2026**.  
*Fuentes de Datos:* NASA Physical Sciences Informatics (PSI), NASA Technical Reports Server (NTRS), NASA Glenn Research Center (GRC), JAXA Kibo FLARE Project.
