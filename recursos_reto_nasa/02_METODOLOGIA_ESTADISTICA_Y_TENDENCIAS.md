# 📊 02 — Metodología Estadística y Detección de Tendencias Científicas

La NASA enfatiza en este reto:
> *"Change is always occurring... Your challenge is to determine what is changing, where it is changing, how much it is changing, and if these changes are what scientists call 'significant'."*

A continuación se detallan las referencias científicas y metodológicas sugeridas oficialmente en el portal del reto:

---

### 1. Paper Científico de Referencia de la NASA
* **Título:** *Time-Series Analysis of Remotely-Sensed SeaWiFS Chlorophyll in River-Influenced Coastal Regions*
* **Enlace Oficial:** [https://ntrs.nasa.gov/api/citations/20090042747/downloads/20090042747.pdf](https://ntrs.nasa.gov/api/citations/20090042747/downloads/20090042747.pdf)
* **Aporte clave para nuestro proyecto:**
  - Demuestra cómo remover el ciclo anual estacional (verano-invierno) para evitar falsos positivos de tendencia.
  - Explica la técnica de **Descomposición de Series Temporales (STL)**:
    $$Y(t) = T(t) + S(t) + R(t)$$
    Donde $T(t)$ es la tendencia real de largo plazo, $S(t)$ es el ciclo estacional y $R(t)$ es el residuo estocástico (ruido).

---

### 2. Guía de Métodos Estadísticos para Detección de Tendencias
* **Artículo Oficial Citado:** [Statistical test methods to detect trends in time series data](https://medium.com/@snp.kriss/statistical-test-methods-to-detect-trends-in-time-series-data-b361a0ec530b)
* **Métodos principales aplicados:**
  1. **Regresión Lineal Simple (Ordinary Least Squares - OLS):**
     $$y = m \cdot x + b$$
     La pendiente $m$ indica la tasa de cambio anual (°C/año o ΔNDVI/año).
  2. **Prueba No Paramétrica de Mann-Kendall:**
     - Ideal para datos climáticos y satelitales porque no asume una distribución normal y es robusta ante valores atípicos (outliers).
     - Evalúa la hipótesis nula $H_0$ (no hay tendencia monótona) vs $H_1$ (existe tendencia monótona creciente o decreciente).
  3. **Pendiente de Sen (Sen's Slope Estimator):**
     - Calcula la mediana de las pendientes de todos los pares de puntos en la serie temporal.

---

### 3. Guía de Significancia Estadística (p-value e Intervalos de Confianza)
* **Guía Oficial Citada:** [A Comprehensive Guide to Statistical Significance](https://www.statsig.com/perspectives/a-comprehensive-guide-to-statistical-significance)
* **Regla de Decisión:**
  - Un cambio en la temperatura de un distrito se considera **estadísticamente significativo** si:
    $$p\text{-value} < 0.05 \quad (\text{Nivel de confianza} \ge 95\%)$$
  - Si $p \ge 0.05$, la variación observada se clasifica como fluctuación meteorológica estacional o ruido natural, evitando alarmismos infundados en las políticas municipales del GAMC.
