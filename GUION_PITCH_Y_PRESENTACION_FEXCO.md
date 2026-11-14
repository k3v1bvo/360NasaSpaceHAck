# 🏆 GUION MAESTRO DE PITCH (2:30 MIN) & MATRIZ DE CALIFICACIÓN OFICIAL
### NASA Space Apps Challenge 2026 • Sede FEXCO Cochabamba
**Proyecto:** *NASA TREND DETECTIVE: Planetary Earth System Climate Anomaly & Regional AI Microclimate Sensing*  
**Reto Oficial:** [*Be An Earth System Trend Detective! (Microclimas Urbanos con IA)*](https://www.spaceappschallenge.org/2026/challenges/earth-system-trend-detective/?tab=resources)  
**Equipo:** Stevens • **Líder:** Kevin (`k3v1bvo`)

---

## ⏱️ PARTE 1: GUION OFICIAL POR DIAPOSITIVA (2 MINUTOS 30 SEGUNDOS EXACTOS)
*Regla de oro: Cero relleno, cero frases trilladas. Lenguaje directo, técnico y convincente.*

```
[00:00 - 00:10] Lámina 1: Portada
[00:10 - 00:40] Lámina 2: Relevancia (El Problema Municipal)
[00:40 - 01:20] Lámina 3: Creatividad (Sensores Virtuales e Incendios)
[01:20 - 02:00] Lámina 4: Validez (Modelo Matemático y Datos Oficiales)
[02:00 - 02:30] Lámina 5: Impacto (Uso Operativo para la Alcaldía)
```

---

### 🟢 LÁMINA 1: PORTADA & PRESENTACIÓN (10 Segundos)

* **Texto en la Diapositiva:**  
  **STEVENS** — Sensado Virtual Ambiental y Análisis de Tendencias en los 15 Distritos de Cochabamba.  
  *Reto Oficial NASA:* Be An Earth System Trend Detective!  
* **Acción en Pantalla:**  
  Proyectar la diapositiva o la web abierta en la vista mundial `[🌍 Planeta Tierra (Global)]` con las métricas en la barra superior.
* **🎙️ Lo que Dices (10 seg):**  
  > *"Buenos días, señores del jurado. Somos el equipo Stevens. Desarrollamos un sistema de monitoreo satelital y predicción microclimática para los 15 distritos de Cochabamba dentro del desafío oficial de la NASA: Be An Earth System Trend Detective!"*

---

### 🟢 LÁMINA 2: RELEVANCIA — EL PROBLEMA MUNICIPAL (30 Segundos)

* **Texto en la Diapositiva:**  
  * **15 Distritos Municipales** en Cochabamba con realidades térmicas dispares.  
  * **Solo 2 Estaciones Físicas de Monitoreo:** Red MÓNICA (Av. 6 de Agosto en el centro y Av. Circunvalación en el norte).  
  * **13 Distritos a Ciegas:** Sin sensores en tierra para medir islas de calor ni penetración de humo.  
  * **Pregunta NASA:** ¿Cómo detectar tendencias opuestas dentro de un mismo valle?
* **Acción en Pantalla:**  
  Hacer clic en `[📍 Piloto Cochabamba]`. La cámara vuela a zoom 12. Mostrar los polígonos de los distritos y señalar los 2 puntos cian de las estaciones físicas.
* **🎙️ Lo que Dices (30 seg):**  
  > *"Actualmente la Alcaldía cuenta con 15 distritos, pero solo tiene 2 estaciones físicas de la Red MÓNICA: una en la 6 de Agosto y otra en la Circunvalación. Los otros 13 distritos no tienen sensores en tierra para medir cómo les afectan las islas de calor o el humo de los incendios del Tunari.*  
  > *La NASA exige demostrar tendencias opuestas en un mismo sistema: mientras el norte boscoso se mantiene estable, el sur urbanizado se sobrecalienta aceleradamente sin que la Alcaldía pueda medirlo a nivel de calle."*

---

### 🟢 LÁMINA 3: CREATIVIDAD — SENSORES VIRTUALES Y SIMULADOR (40 Segundos)

* **Texto en la Diapositiva:**  
  * **Calibración Satélite-Suelo:** Registros reales Red MÓNICA calibran series satelitales de la NASA.  
  * **13 Sensores Virtuales IA:** Cobertura inmediata para los 13 distritos desprovistos.  
  * **Nexo Térmico Físico:** Integración de focos de calor (MODIS/VIIRS) y plumas de aerosoles AOD en el Tunari.  
  * **Simulador de Mitigación Urbana:** Cálculo del confort térmico humano (PET) y alerta de la Paradoja de Albedo.
* **Acción en Pantalla:**  
  Mostrar los 13 círculos violetas en el mapa. Abrir el sub-panel `Simulador` y mover levemente el slider de Reforestación y Albedo para que el jurado vea cómo baja la temperatura en tiempo real.
* **🎙️ Lo que Dices (40 seg):**  
  > *"Para resolver esta carencia sin comprar equipo costoso, usamos los registros de las 2 estaciones de la Red MÓNICA para calibrar datos satelitales de la NASA y desplegar 13 estaciones virtuales con IA, una por cada distrito sin cobertura.*  
  > *Además, integramos los focos de calor de MODIS y VIIRS en el Tunari para medir cuánto sube la temperatura y la contaminación en la ciudad cuando hay quemas.*  
  > *E incluimos un simulador interactivo donde el técnico municipal calcula cuántos grados de confort humano (PET) se recuperan si se reforesta un distrito o si se interviene la Laguna Alalay, advirtiendo sobre la Paradoja de Albedo si solo se pintan techos sin plantar árboles."*

---

### 🟢 LÁMINA 4: VALIDEZ — MODELO MATEMÁTICO Y DATOS OFICIALES (40 Segundos)

* **Texto en la Diapositiva:**  
  * **Capas GAMC (WMS):** Límite de 14 Distritos, Cota 2750 Parque Tunari, Periurbanos.  
  * **Variables NASA:** Temperatura superficial (`LST`), Vegetación (`NDVI`), Aerosoles (`AOD`), Temp. aire (`T2M`).  
  * **Modelo XGBoost 3.2.0:**  
    $$R^2 = 0.9457 \quad|\quad \text{RMSE} = 0.55\ ^\circ\text{C} \quad|\quad \text{MAE} = 0.44\ ^\circ\text{C}$$  
  * **Significancia Estadística:** Regresión lineal y Mann-Kendall con **$p = 0.0000 < 0.05$** (Nivel de confianza $\ge 99.9\%$).
* **Acción en Pantalla:**  
  Señalar con el cursor la **Barra Superior de Métricas** donde se lee $R^2 = 0.9457$, $\text{RMSE} = 0.55\ ^\circ\text{C}$ y $p < 0.05$. Mostrar la línea verde discontinua de la Cota 2750 en el mapa.
* **🎙️ Lo que Dices (40 seg):**  
  > *"El modelo se entrenó con Machine Learning usando XGBoost, cruzando 2,497 días reales de telemetría de NASA POWER con las estaciones locales bajo cuatro variables: LST, NDVI, AOD y temperatura del aire.*  
  > *Alcanzamos un coeficiente de determinación $R^2$ de 0.95, un error cuadrático medio de apenas 0.55 grados y un error absoluto de 0.44 grados.*  
  > *Aplicamos pruebas de significancia estadística con $p < 0.05$ y descomposición estacional STL, demostrando matemáticamente que el centro y el sur sufren una isla de calor real de hasta +17.4 grados respecto a la Cota 2750 del Tunari, descartando que sea ruido estacional."*

---

### 🟢 LÁMINA 5: IMPACTO — USO OPERATIVO PARA LA ALCALDÍA (30 Segundos)

* **Texto en la Diapositiva:**  
  * **Ahorro Municipal:** Cobertura en los 15 distritos sin comprar hardware adicional.  
  * **Toma de Decisiones:** Priorización de arbolado urbano y alerta de humo por OTB.  
  * **Arquitectura Offline-First:** 100% funcional en centros de mando ante cortes de internet.  
  * **Modo Internacional:** Explorador Global conectando NASA POWER en cualquier coordenada del planeta.
* **Acción en Pantalla:**  
  Hacer clic en `[🌍 Planeta Tierra (Global)]` para mostrar la vista planetaria y el botón de alerta temprana.
* **🎙️ Lo que Dices (30 seg):**  
  > *"Instalar 13 estaciones físicas nuevas le costaría a la Alcaldía cientos de miles de dólares en compra, calibración y mantenimiento continuo. Con esta herramienta web, la Alcaldía ya tiene lectura estimada en los 15 distritos hoy mismo para decidir dónde arborizar primero y qué zonas alertar cuando el humo del Tunari baja a la ciudad.*  
  > *Funciona bajo arquitectura Offline-First para emergencias y cuenta con un Explorador Planetario que permite a la NASA auditar cualquier coordenada en el mundo. La ciencia espacial al servicio de la vida en Cochabamba. ¡Muchas gracias!"*

---

# 📊 PARTE 2: MATRIZ DE CALIFICACIÓN OFICIAL (LOS 5 CRITERIOS DEL JURADO)

A continuación tienes exactamente cómo el jurado va a calificar cada aspecto y cómo defender el puntaje perfecto:

| Criterio Oficial | Ponderación | Qué Evalúa el Jurado | Cómo lo Cumple Nuestro Proyecto (Defensa Imbatible) | Puntaje Esperado |
| :--- | :---: | :--- | :--- | :---: |
| **1. Impacto (Impact)** | **25%** | ¿Resuelve un problema real? ¿Es aplicable y útil para la comunidad o municipio? | Resuelve la ceguera de datos de 13 distritos sin requerir presupuesto de hardware. Permite a la Alcaldía planificar arbolado y alertar a Defensa Civil ante incendios. | **25 / 25** |
| **2. Creatividad (Creativity)** | **20%** | ¿Es una solución original o es otro mapa más? ¿Cómo innova con los datos? | En vez de mostrar puntos estáticos de fuego, creamos **Sensores Virtuales con IA**, vinculamos el humo del Tunari con la retención térmica urbana e implementamos un simulador de confort humano (PET). | **20 / 20** |
| **3. Validez Científica (Validity)** | **25%** | ¿Los datos son reales? ¿El modelo matemático es sólido? ¿Hay métricas rigurosas? | Entrenado con 2,497 días de NASA POWER API + Red MÓNICA. Reporta $R^2 = 0.95$, $\text{RMSE} = 0.55\ ^\circ\text{C}$, $\text{MAE} = 0.44\ ^\circ\text{C}$, prueba $p < 0.05$ y descomposición STL (paper SeaWiFS). | **25 / 25** |
| **4. Relevancia (Relevance)** | **15%** | ¿Responde a las preguntas de la NASA y del GAMC? ¿Usa las variables exigidas? | Responde las 4 preguntas de la NASA (*¿Qué cambia? ¿Dónde? ¿Cuánto? ¿Es significativo?*) y usa las 5 variables clave: LST, NDVI, AOD, T2M y focos MODIS/VIIRS. | **15 / 15** |
| **5. Presentación (Presentation)** | **15%** | ¿El pitch es claro, sin titubeos, medido en tiempo y con demo en vivo? | Pitch cronometrado en 2:30 min exactos, sin relleno, con navegación fluida en Leaflet, diseño oscuro profesional y cero errores en consola. | **15 / 15** |
| **TOTAL** | **100%** | **Evaluación Global de Ganador** | **Proyecto Completo, Interactivo y Científicamente Respaldado** | **100 / 100** |

---

# 🛡️ PARTE 3: PREGUNTAS TRAMPA DEL JURADO Y CÓMO RESPONDERLAS (Q&A)

Si el jurado técnico de Ciencia de Datos o la mesa de la NASA te hace preguntas difíciles, responde exactamente con estos argumentos:

#### ❓ Pregunta 1: *"¿Cómo pueden entrenar un modelo confiable si solo tienen 2 estaciones físicas en tierra?"*
* **Tu Respuesta:**  
  > *"Excelente pregunta. No entrenamos con 2 datos puntuales, sino con la **serie temporal histórica diaria de 2,497 días continuos** descargados de NASA POWER y calibrados con el histórico de las dos estaciones físicas (Av. 6 de Agosto y Circunvalación). Usamos validación temporal `TimeSeriesSplit`, lo que evita la fuga de datos y nos permite predecir la temperatura del aire a partir de la temperatura superficial LST, el NDVI y la elevación topográfica con un $R^2$ de 0.95."*

#### ❓ Pregunta 2: *"¿Por qué usaron XGBoost en lugar de una Red Neuronal Profunda (Deep Learning)?"*
* **Tu Respuesta:**  
  > *"Porque la literatura científica en geociencias y ciencia de datos demuestra que para datos tabulares geoclimáticos con relaciones no lineales, **XGBoost (Gradient Boosted Trees)** supera sistemáticamente a las redes neuronales densas, evita el sobreajuste con muestras de mediana escala y permite extraer la **importancia de variables** (LST 69%, NDVI 19%, AOD 10%). Además, nos permite una inferencia instantánea de 0.05 segundos en el navegador sin requerir servidores GPU pesados."*

#### ❓ Pregunta 3: *"¿Qué significa exactamente que su p-value sea menor a 0.05?"*
* **Tu Respuesta:**  
  > *"Significa que evaluamos la hipótesis nula ($H_0$: no hay tendencia, la variación es solo ruido estacional de verano/invierno). Al obtener un valor de $p = 0.0000 < 0.05$, rechazamos $H_0$ con más del 99.9% de nivel de confianza. La divergencia térmica de +17.4 °C entre el Tunari y la Zona Sur es una tendencia física real y sostenida provocada por la pérdida de cobertura vegetal y el asfalto."*

#### ❓ Pregunta 4: *"¿Qué pasa si la Alcaldía se queda sin internet en una emergencia o catástrofe?"*
* **Tu Respuesta:**  
  > *"El sistema fue concebido con arquitectura **Offline-First**. Todos los polígonos distritales, la Cota 2750 y las matrices de predicción de los 15 distritos están empaquetados localmente en JSON estáticos y cacheados. Si se corta la red en Cochabamba, el tablero sigue corriendo al 100% en los centros de mando de la Alcaldía y Bomberos."*

#### ❓ Pregunta 5: *"¿Cómo se conecta el módulo de incendios con los microclimas de la ciudad?"*
* **Tu Respuesta:**  
  > *"Cochabamba es una cuenca intramontana cerrada propensa a la **inversión térmica**. Cuando el Parque Tunari se quema, los vientos del norte arrastran columnas de aerosoles (AOD > 0.6) hacia la ciudad. Esas partículas microscópicas en suspensión forman una capa que absorbe y re-irradia calor hacia la superficie, impidiendo el enfriamiento nocturno y aumentando la retención térmica en los distritos con menos árboles."*
