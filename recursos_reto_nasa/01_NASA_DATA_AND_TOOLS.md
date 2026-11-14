# 🌐 01 — Portales de Datos y Herramientas Oficiales de la NASA

Recursos directos enlazados en la pestaña oficial de NASA Space Apps:

---

### 1. NASA Giovanni
* **Enlace Oficial:** [https://giovanni.gsfc.nasa.gov/](https://giovanni.gsfc.nasa.gov/)
* **Descripción de la NASA:** *"Herramienta versátil que provee menús de numerosas variables de datos de ciencias de la Tierra y permite la generación directa de series temporales y descarga de los datos procesados."*
* **Uso para Cochabamba:**
  - Extraer series temporales (2000 - 2025) de **MODIS LST Day/Night** (MOD11A1 / MYD11A1) para el Bounding Box de Cochabamba: `[-66.35, -17.50, -66.05, -17.25]`.
  - Generar promedios mensuales para descomponer el ciclo estacional y detectar la anomalía térmica en la Zona Sur.
  - Extraer precipitación GPM (Global Precipitation Measurement) para correlacionar con eventos de enfriamiento en el Tunari.

---

### 2. NASA AppEEARS (Application for Extracting and Exploring Analysis Ready Samples)
* **Enlace Oficial:** [https://appeears.earthdatacloud.nasa.gov/](https://appeears.earthdatacloud.nasa.gov/)
* **Descripción de la NASA:** *"Ofrece una forma simple y eficiente de acceder y transformar datos geoespaciales de una variedad de archivos federales. Incluye generación de series temporales."*
* **Uso para Cochabamba:**
  - Subir el archivo GeoJSON `data/gamc/distritos_cochabamba.geojson` directamente a AppEEARS para extraer automáticamente series temporales de NDVI y LST para cada uno de los 14 distritos.
  - Descargar muestras listas para análisis (Analysis-Ready Data) de MODIS, VIIRS, Landsat y ECOSTRESS sin necesidad de recortar imágenes masivas manualmente.

---

### 3. NASA Hydrology Time Series (GES DISC)
* **Enlace Oficial:** [https://disc.gsfc.nasa.gov/information/tools?title=Hydrology%20Time%20Series](https://disc.gsfc.nasa.gov/information/tools?title=Hydrology%20Time%20Series)
* **Descripción de la NASA:** *"Permite la generación de series de tiempo con datos hidrológicos."*
* **Uso para Cochabamba:**
  - Evaluar la pérdida histórica de humedad en las microcuencas del Parque Tunari y la desecación estacional de la Laguna Alalay (Distrito 6).
  - Correlacionar el balance hídrico con el estrés térmico en áreas periurbanas.

---

### 4. NOAA Climate Data Online (CDO)
* **Enlace Oficial:** [https://www.ncei.noaa.gov/cdo-web/](https://www.ncei.noaa.gov/cdo-web/)
* **Descripción de la NASA:** *"CDO brinda acceso gratuito al archivo de datos meteorológicos y climáticos históricos globales de NCDC, además de información histórica de estaciones. Incluye herramienta de mapeo."*
* **Uso para Cochabamba:**
  - Contrastar las mediciones satelitales con las estaciones meteorológicas terrestres del Aeropuerto Jorge Wilstermann (Cochabamba - Estación WMO 85223).
  - Validar si la temperatura del aire medida en superficie concuerda con la tendencia predicha por el modelo.

---

### 5. NASA Earthdata Search
* **Enlace:** [https://search.earthdata.nasa.gov/](https://search.earthdata.nasa.gov/)
* **Colecciones recomendadas para el reto:**
  - **MOD11A2 / MYD11A2:** LST promedio de 8 días a 1 km de resolución.
  - **MOD13Q1 / MYD13Q1:** Índices de vegetación NDVI y EVI cada 16 días a 250 m.
  - **ECOSTRESS:** LST a alta resolución espacial (70 m) y evapotranspiración (ideal para cañones urbanos de Cochabamba).
  - **SRTM V3 (NASADEM):** Modelo Digital de Elevación a 30 metros para delimitar la Cota 2750.
