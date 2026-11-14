# 🛰️ DOCUMENTACIÓN TÉCNICA DE FUENTES DE DATOS (NASA & GAMC)
**Proyecto:** *GEO-COCHABAMBA 360*  
**Hackathon:** NASA Space Apps Challenge Cochabamba 2026  
**Entidad Colaboradora:** Gobierno Autónomo Municipal de Cochabamba (GAMC)  
**Líder de Proyecto:** Kevin (`k3v1bvo`)  

---

## 1. Declaración Oficial de Fuentes de Datos Abiertas

Este documento certifica el cumplimiento del **Criterio de Evaluación #4** de la Hackathon: *Documentación técnica de las fuentes de datos usadas (NASA + GAMC)*. Todas las fuentes utilizadas son públicas, de código abierto y verificables.

---

## 2. Fuentes de Datos de la NASA (National Aeronautics and Space Administration)

### A. Focos de Calor e Incendios Forestales
* **Producto:** NASA FIRMS (Fire Information for Resource Management System).
* **Sensores Utilizados:**
  1. **MODIS Collection 6.1 (MCD14DL):** Satélites Terra y Aqua. Resolución espacial de 1 km. Bandas térmicas 4 µm y 11 µm.
  2. **VIIRS C2 (VNP14IMGTDL y VJ114IMGTDL):** Satélites Suomi-NPP y NOAA-20. Resolución espacial de 375 m. Bandas I4 e I5.
* **Parámetros Extraídos:** Latitud, Longitud, Fecha de adquisición, Hora UTC, Confianza (%), Potencia Radiativa de Fuego (FRP en Megawatts).
* **Acceso / URL Oficial:** [https://firms.modaps.eosdis.nasa.gov](https://firms.modaps.eosdis.nasa.gov)

### B. Microclimas e Islas de Calor Urbano
* **Producto:** NASA Earthdata / LP DAAC (Land Processes Distributed Active Archive Center).
* **Colecciones Satelitales:**
  1. **MOD11A2 / VNP21A2 (Land Surface Temperature - LST):** Temperatura superficial del suelo a escala diurna y nocturna.
  2. **MOD13Q1 / VNP13A1 (NDVI - Normalized Difference Vegetation Index):** Cobertura vegetal y salud de la masa arbórea.
* **Zona de Estudio:** Valles de Cochabamba (Bounding Box: `[-66.35, -17.50]` a `[-66.05, -17.25]`).
* **Acceso / URL Oficial:** [https://search.earthdata.nasa.gov](https://search.earthdata.nasa.gov)

### C. Relieve y Modelado de Riesgo de Inundación
* **Producto:** NASA SRTM (Shuttle Radar Topography Mission) y NASADEM Global Digital Elevation Model (30m).
* **Misión de Radar Vinculada:** NISAR / Copernicus Sentinel-1 (Radar de Apertura Sintética - SAR para detección de humedad y anegamiento superficial).
* **Parámetros Extraídos:** Elevación (DEM), cálculo de pendientes, líneas de flujo y depresiones hidrológicas.
* **Acceso / URL Oficial:** [https://earthdata.nasa.gov/learn/find-data/near-real-time/nasadem](https://earthdata.nasa.gov/learn/find-data/near-real-time/nasadem)

### D. Agrotecnología y Humedad del Suelo
* **Producto:** NASA SMAP (Soil Moisture Active Passive) L3/L4 Radiometer Global Daily 9 km.
* **Parámetros Extraídos:** Porcentaje volumétrico de humedad en los primeros 5 cm de suelo agrícola y evapotranspiración relativa.
* **Acceso / URL Oficial:** [https://smap.jpl.nasa.gov](https://smap.jpl.nasa.gov)

---

## 3. Fuentes de Datos del GAMC y Entidades Locales de Bolivia

### A. Gobierno Autónomo Municipal de Cochabamba (GAMC)
* **Cartografía de Distritos:** Shapefiles oficiales de los 14 Distritos Municipales de la provincia Cercado, convertidos al estándar GeoJSON (EPSG:4326).
* **60 Puntos Históricos de Inundación y Mazamorra (Ground-Truth):** Catálogo georreferenciado de eventos críticos de desborde en torrenteras (Taquiña, Pintumayu, Logruste, Pampa San Miguel, Zona Sur).
* **Red de Drenaje y Colectores Pluviales:** Trazado de colectores maestros, canales a cielo abierto y sumideros críticos de la ciudad.
* **Cartografía del Parque Nacional Tunari (PNT):** Límite oficial de la Cota 2750 msnm que delimita el área protegida respecto a la mancha urbana metropolitana.

### B. Servicio Nacional de Meteorología e Hidrología (SENAMHI Bolivia)
* **Estaciones Meteorológicas de Referencia:** Estación Sarco (Cercado) y Estación Aeropuerto Jorge Wilstermann.
* **Parámetros Utilizados:** Precipitación acumulada en 24 horas (mm), humedad relativa (%) y dirección/velocidad del viento durante la época seca.

---

## 4. Tabla de Trazabilidad Cruzada: Retos vs Datos

| Módulo del Proyecto | Desafío Global NASA | Reto Local GAMC | Fuente NASA | Fuente Local |
| :--- | :--- | :--- | :--- | :--- |
| **1. Incendios Tunari** | *Harmonization of MODIS & VIIRS* | *Focos de Calor (Tunari)* | NASA FIRMS (MODIS + VIIRS) | Polígono PNT (Cota 2750) |
| **2. Microclimas** | *Be An Earth System Trend Detective!* | *Microclimas Urbanos con IA* | NASA Earthdata (LST + NDVI) | Shapefiles Distritos GAMC |
| **3. Torrenteras** | *Dancing with the SARs* | *Prevención en Torrenteras* | NASA DEM (SRTM) + SAR | 60 Puntos Históricos GAMC |
| **4. Agrotech** | *Field Shift: Adapting Farms* | *Rotación Cultivos & Agua* | NASA SMAP (Humedad Suelo) | Registro Suelos y SENAMHI |
| **5. Alertas Vecinales** | N/A (Innovación Comunitaria) | *Transparencia Ciudadana* | Mapas Base Abiertos | Georreferenciación GPS |
