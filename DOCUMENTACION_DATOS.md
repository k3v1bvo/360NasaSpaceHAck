# 🛰️ DOCUMENTACIÓN TÉCNICA DE FUENTES DE DATOS (NASA & GAMC)
**Proyecto:** *GEO-COCHABAMBA 360 / NASA TREND DETECTIVE*  
**Hackathon:** NASA Space Apps Challenge Cochabamba 2026 (Sede FEXCO)  
**Entidad Colaboradora:** Gobierno Autónomo Municipal de Cochabamba (GAMC)  
**Líder de Proyecto:** Kevin (`k3v1bvo`) — Team Stevens  
**Despliegue de Producción:** [https://nasa-trend-detective.vercel.app](https://nasa-trend-detective.vercel.app)  

---

## 1. Declaración Oficial de Fuentes de Datos Abiertas

Este documento certifica el cumplimiento riguroso de la evaluación técnica de la Hackathon: **Documentación técnica exhaustiva de fuentes satelitales NASA y datasets oficiales del GAMC**. Todos los datos utilizados son públicos, reproducibles, auditables y georreferenciados en el marco geodésico oficial.

---

## 2. Fuentes de Datos de la NASA (National Aeronautics and Space Administration)

### A. Serie Temporal de Clima y Radiación Superficial (NASA POWER Project)
* **Producto:** NASA Prediction Of Worldwide Energy Resources (POWER) Climatology API v2.
* **Cobertura Temporal:** 1 de enero de 2000 al 31 de diciembre de 2025 (**25 años continuos / 9,131 registros diarios**).
* **Parámetros Extraídos:**
  * `T2M`: Temperatura del aire a 2 metros (°C).
  * `T2M_MAX` / `T2M_MIN`: Temperaturas extremas diurnas y nocturnas (°C).
  * `ALLSKY_SFC_SW_DWN`: Irradiancia solar descendente en superficie ($MJ/m^2/día$).
  * `RH2M`: Humedad relativa a 2 metros (%).
  * `WS2M`: Velocidad del viento a 2 metros ($m/s$).
* **Resolución Espacial:** $0.5^\circ \times 0.5^\circ$ (~50 km), downscaled con elevación SRTM a nivel distrital y de manzana.
* **Acceso Oficial:** [https://power.larc.nasa.gov/api/](https://power.larc.nasa.gov/api/)

### B. Temperatura Superficial y Vegetación (NASA LP DAAC / MODIS & VIIRS)
* **Colecciones Satelitales:**
  1. **MOD11A2 / MYD11A2 (Terra/Aqua MODIS LST):** Temperatura superficial del suelo diurna y nocturna a 1,000 m.
  2. **VNP21A2 (Suomi-NPP VIIRS LST):** Temperatura superficial con resolución de 750 m.
  3. **MOD13Q1 / MYD13Q1 (NDVI):** Índice de Vegetación de Diferencia Normalizada a 250 m (composiciones de 16 días).
* **Zona de Estudio:** Cuenca del Valle de Cochabamba (Bounding Box: `[-66.35, -17.50]` a `[-66.05, -17.25]`).
* **Hallazgo Clave:** Contraste térmico de **+17.4 °C** entre la Zona Sur desprovista de arbolado (D9, D8, D15: $37.8^\circ\text{C} - 43.5^\circ\text{C}$ LST) y las laderas protegidas del Parque Nacional Tunari (D13: $20.4^\circ\text{C}$ LST).
* **Acceso Oficial:** [https://search.earthdata.nasa.gov](https://search.earthdata.nasa.gov)

### C. Aerosoles y Calidad del Aire (NASA MODIS Aqua AOD)
* **Producto:** MODIS/Aqua Aerosol Optical Depth (AOD a 550 nm) Collection 6.1 (MYD04_L2 / MYD08_M3).
* **Serie Histórica:** 2002 a 2024 sobre el Valle de Cochabamba.
* **Tendencia Científica Detectada (OLS):** Pendiente positiva de **+0.042 / década** ($R^2 = 0.412$, $p = 0.0008 < 0.05$), demostrando el incremento multianual de acumulación de partículas en suspensión atrapadas por la topografía de herradura del valle.
* **Acceso Oficial:** [https://ladsweb.modaps.eosdis.nasa.gov/](https://ladsweb.modaps.eosdis.nasa.gov/)

### D. Focos de Calor e Incendios Forestales (NASA FIRMS)
* **Producto:** NASA FIRMS (Fire Information for Resource Management System).
* **Sensores Armonizados:** MODIS 1 km (MCD14DL) y VIIRS 375 m (VNP14IMGTDL + VJ114IMGTDL).
* **Serie Analizada:** 353 focos de calor históricos en el Parque Nacional Tunari (2020–2026).
* **Patrón Estacional Validado:** El **79.8% de los incendios forestales** se concentran en los meses de **Agosto y Septiembre** (desecación de biomasa, vientos secos de ladera y humedad $<15\%$).
* **Acceso Oficial:** [https://firms.modaps.eosdis.nasa.gov](https://firms.modaps.eosdis.nasa.gov)

### E. Modelo Digital de Elevación (NASA SRTM & NASADEM)
* **Producto:** Shuttle Radar Topography Mission (SRTM v3) y NASADEM Global DEM (30 m).
* **Uso:** Delimitación altimétrica de la Cota 2750 m s.n.m., gradiente de temperatura adiabático seco (-6.5 °C / 1,000 m) y pendientes de escorrentía en torrenteras.
* **Acceso Oficial:** [https://earthdata.nasa.gov/sensors/srtm](https://earthdata.nasa.gov/sensors/srtm)

---

## 3. Servicios WMS Oficiales del GAMC (Gobierno Autónomo Municipal de Cochabamba)

El proyecto consume en vivo los servicios de mapas web del GAMC mediante el protocolo estándar **OGC WMS 1.0.0 / 1.1.1 / 1.3.0** en el sistema de coordenadas de proyección **`EPSG:3857`** (WGS 84 / Pseudo-Mercator):

* **Endpoint Oficial GAMC:** `https://serviciosgamc.cochabamba.bo/api/gs/wms`
* **Capas WMS y UUIDs Oficiales:**

| Capa Territorial | UUID GAMC / Nombre de Capa | Operaciones Exigidas | Utilidad en el Proyecto |
| :--- | :--- | :--- | :--- |
| **Límite Distritos** | `7eb13092-bf0e-493b-aae6-03c43eedda2c` | `GetMap`, `GetLegendGraphic`, `GetFeatureInfo` | Zonificación de los 15 Distritos Municipales oficiales de Cochabamba. |
| **Población por Manzanas** | `194a02a0-a73a-48c1-a260-82847c5c905d` | `GetMap`, `GetLegendGraphic`, `GetFeatureInfo` | Densidad demográfica a nivel predial para priorizar áreas críticas de arborización. |
| **Áreas Verdes** | `47360ddc-e35f-4ece-a995-59e90eb79cc6` | `GetMap`, `GetLegendGraphic`, `GetFeatureInfo` | Auditoría de cobertura vegetal urbana y déficit de espacio público verde ($<2\,m^2/\text{hab}$ en Zona Sur). |
| **Cota 2750 Tunari** | `297cefa4-0832-42bb-a98e-2cbea989fd9d` | `GetMap`, `GetLegendGraphic`, `GetFeatureInfo` | Línea legal de protección ambiental y barrera de inversión térmica del Parque Tunari. |

* **Consultas de Información Predial:** Soporte simultáneo de `GetFeatureInfo` en `SRS=EPSG:3857` con visualización en tarjeta contextual (nombre de manzana, población censal, distrito y código catastral).

---

## 4. Datasets Locales Descargables del Portal GAMC

### A. Red MÓNICA — Ground-Truth de Calidad del Aire y Clima
* **Descripción:** Registros continuos oficiales de las dos estaciones físicas de monitoreo de calidad del aire del GAMC.
* **Volumen de Datos:** **125,865 registros horarios y diarios**.
* **Estaciones Físicas:**
  1. **Estación SEMAPA (Zona Norte):** 71,154 mediciones continuas. $PM_{10}$ promedio de $49.3\,\mu g/m^3$.
  2. **Estación Kanata (Zona Sur):** 54,711 mediciones continuas. $PM_{10}$ promedio de $67.1\,\mu g/m^3$.
* **Hallazgo Físico Validado:** La estación Kanata registra un **+36% mayor nivel de polución y partículas** que SEMAPA, confirmando la piscina de estancamiento por inversión térmica nocturna en la Zona Sur.
* **Uso en el Modelo:** Esta serie ground-truth sirvió para calibrar y evaluar los **13 Sensores Virtuales de IA** en los distritos sin estaciones físicas.

### B. Rutas y Troncales de Transporte Público
* **Dataset:** Archivo vectorial GeoJSON con **730 trazas de líneas de micros, trufis y corredores troncales**.
* **Uso en el Modelo:** Variable predictora de calor antropogénico y emisión lineal de contaminantes en las avenidas Blanco Galindo, Petrolera, 6 de Agosto y Circunvalación.

### C. Catálogo de los 15 Distritos Municipales de Cochabamba
* Cobertura completa de la división político-administrativa de Cercado:
  * **Distritos 1 al 12:** Zona urbana consolidada, centro histórico y anillo de circunvalación.
  * **Distrito 13:** Parque Nacional Tunari y laderas sobre la Cota 2750.
  * **Distrito 14:** Sebastián Pagador Sur y Serranías de San Miguel.
  * **Distrito 15:** K'ara K'ara / Ch'ampa Rancho (Distrito de reciente delimitación y máxima vulnerabilidad térmica).

---

## 5. Arquitectura del Modelo de IA: Sensores Virtuales Calibrados

```
  ┌────────────────────────────┐       ┌────────────────────────────┐
  │   NASA POWER (2000-2025)   │       │   RED MÓNICA FÍSICA GAMC   │
  │    9,131 Días Climáticos   │       │  125,865 Registros Continuos│
  │ (T2M, Rad. Solar, Humedad) │       │   (SEMAPA Norte / Kanata)  │
  └─────────────┬──────────────┘       └─────────────┬──────────────┘
                │                                    │
                └─────────────────┬──────────────────┘
                                  ▼
                   ┌───────────────────────────────┐
                   │    XGBoost 3.2.0 Regressor    │
                   │    Calibración Ground-Truth   │
                   │ R² = 0.9457  |  RMSE = 0.55°C │
                   │ MAE = 0.44°C |  p = 0.0000    │
                   └──────────────┬────────────────┘
                                  │
         ┌────────────────────────┴────────────────────────┐
         ▼                                                 ▼
┌──────────────────────────────┐          ┌──────────────────────────────┐
│  2 ESTACIONES FÍSICAS MÓNICA │          │  13 SENSORES VIRTUALES IA    │
│  (SEMAPA Norte & Kanata Sur) │          │  (Distritos D1-D5, D7, D8,   │
│   Lectura física real        │          │   D10-D15 en tiempo real)    │
└──────────────────────────────┘          └──────────────────────────────┘
```

* **Métricas de Validación en Test (1,460 muestras):**
  * Coeficiente de Determinación ($R^2$): **0.9457** (excelente ajuste lineal y no lineal).
  * Raíz del Error Cuadrático Medio ($\text{RMSE}$): **$0.5496^\circ\text{C}$**.
  * Error Absoluto Medio ($\text{MAE}$): **$0.4362^\circ\text{C}$**.
  * Significancia Estadística ($p\text{-value}$): **$0.0000 < 0.05$**.

---

## 6. Matriz de Trazabilidad Cruzada: Retos vs Datos

| Módulo del Sistema | Desafío Global NASA | Reto Local GAMC | Fuente Satelital NASA | Fuente Oficial GAMC |
| :--- | :--- | :--- | :--- | :--- |
| **1. Microclimas e Islas de Calor** | *Be An Earth System Trend Detective!* | *Módulo 01: Microclimas Urbanos con IA* | NASA POWER (25 años) + MODIS/VIIRS LST/NDVI | WMS GAMC (4 capas) + Red MÓNICA (125k reg.) + Líneas Transporte |
| **2. Incendios Tunari e Inversión** | *Harmonization of MODIS & VIIRS* | *Módulo 05: Visualizador Satelital Distrital* | NASA FIRMS (MODIS/VIIRS) + MODIS Aqua AOD | WMS Cota 2750 + Red MÓNICA Kanata/SEMAPA |
| **3. Planificación Territorial GAMC** | *Earth System Trend Detective* | *Gestión Distrital y Resiliencia Urbana* | NASADEM 30m + LST Multi-temporal | WMS Población Manzanas + Áreas Verdes |
