# 📄 DOCUMENTACIÓN TÉCNICA: ARMONIZACIÓN DE FOCOS DE CALOR MODIS & VIIRS EN EL PARQUE NACIONAL TUNARI
**Desafío Global NASA:** *Harmonization of MODIS and VIIRS Hot Spots*  
**Desafío Local GAMC:** *Monitoreo de Focos de Calor e Incendios Forestales (Tunari)*  
**Sede:** Feria Exposición de Cochabamba (FEXCO 2026) • Cochabamba, Bolivia  
**Autor / Líder Técnico:** Kevin (`k3v1bvo`)  

---

## 1. Resumen Ejecutivo y Contexto Local

El **Parque Nacional Tunari (PNT)** es el pulmón ambiental y el principal regulador hídrico del área metropolitana de Cochabamba (Cercado, Sacaba, Quillacollo, Tiquipaya, Colcapirhua y Vinto). Cada año, durante la estación seca (julio a noviembre), la cuenca sufre graves incendios forestales que destruyen masa vegetal, empobrecen el suelo y generan densas capas de smog que afectan la salud de más de un millón de habitantes.

Este proyecto resuelve el reto técnico y científico exigido tanto por la **NASA** como por el **Gobierno Autónomo Municipal de Cochabamba (GAMC)**: **crear un sistema automatizado que armonice los datos de los sensores satelitales MODIS y VIIRS**, permitiendo detectar incendios incipientes, analizar patrones históricos y predecir épocas críticas con precisión espacial.

---

## 2. El Problema Científico: La Disparidad entre MODIS y VIIRS

Durante años, la comunidad científica monitoreó los incendios con el sensor **MODIS** (a bordo de los satélites Terra y Aqua de la NASA). Desde 2012, entró en operación el sensor **VIIRS** (a bordo de Suomi-NPP y NOAA-20/21).

Sin embargo, estos sensores presentan marcadas diferencias:

| Característica | Sensor MODIS (Terra / Aqua) | Sensor VIIRS (Suomi-NPP / NOAA-20) |
| :--- | :--- | :--- |
| **Resolución Espacial en Nadir** | **1,000 metros (1 km)** | **375 metros** (I-Bands de alta resolución) |
| **Área del píxel en superficie** | $1.0\text{ km}^2$ | $\approx 0.14\text{ km}^2$ (¡7 veces más pequeño!) |
| **Canales Térmicos de Detección** | Banda 21/22 ($4\,\mu\text{m}$) y Banda 31 ($11\,\mu\text{m}$) | Banda I4 ($3.75\,\mu\text{m}$) y Banda I5 ($11.5\,\mu\text{m}$) |
| **Sensibilidad a fuegos pequeños** | Detecta incendios medianos a grandes | Detecta fuegos incipientes de hasta $0.01\text{ ha}$ en quebradas |
| **Archivo Histórico** | Más de 24 años (desde 2000 a la fecha) | ~14 años (desde 2012 a la fecha) |

### ⚠️ El sesgo estadístico que resolvemos:
Si un municipio compara la cantidad bruta de píxeles detectados por año, parecería que a partir de 2012 los incendios aumentaron un **280%**, cuando en realidad se trata de la mayor resolución del sensor VIIRS, que fragmenta un solo incendio en múltiples puntos calientes.

---

## 3. Algoritmo de Armonización Diseñado por Kevin

Para unificar ambos registros en una sola métrica física coherente, implementamos el siguiente flujo algorítmico:

```
    [NASA FIRMS Feed MODIS (1km)]       [NASA FIRMS Feed VIIRS (375m)]
                  │                                   │
                  └─────────────────┬─────────────────┘
                                    │
                                    ▼
                 ┌─────────────────────────────────────┐
                 │ 1. Filtro Espacial Cochabamba       │
                 │    Lat: [-17.65, -17.05]            │
                 │    Lon: [-66.55, -65.85]            │
                 └──────────────────┬──────────────────┘
                                    │
                                    ▼
                 ┌─────────────────────────────────────┐
                 │ 2. Fusión Espaciotemporal (Clustering)│
                 │    Radio: d <= 1.2 km                │
                 │    Ventana temporal: Mismo día (Dt) │
                 └──────────────────┬──────────────────┘
                                    │
                                    ▼
                 ┌─────────────────────────────────────┐
                 │ 3. Centroide Ponderado por FRP      │
                 │    Lat_c = Sum(Lat_i * FRP_i) / FRP │
                 │    Lon_c = Sum(Lon_i * FRP_i) / FRP │
                 └──────────────────┬──────────────────┘
                                    │
                                    ▼
                 ┌─────────────────────────────────────┐
                 │ 4. Cruce con Polígono P.N. Tunari   │
                 │    Ray-Casting en Cota 2750         │
                 └──────────────────┬──────────────────┘
                                    │
                                    ▼
                 ┌─────────────────────────────────────┐
                 │ 5. Clasificación de Severidad (MW)  │
                 │    Moderado / Alto / Crítico        │
                 └─────────────────────────────────────┘
```

### Ecuación de Potencia Radiativa Integrada (FRP):
En lugar de contar puntos dispersos, se calcula la energía real emitida por el fuego:
$$\text{FRP}_{\text{cluster}} = \sum_{i \in \text{Cluster}} \text{FRP}_{i}\quad [\text{Megawatts (MW)}]$$

---

## 4. Resultados Clave para la Alcaldía de Cochabamba (GAMC)

### 📅 A. Determinación de Épocas Críticas
A partir de la serie histórica armonizada 2020-2025:
* **Periodo Crítico Anual:** **Julio a Noviembre**.
* **Meses de Máxima Gravedad:** **Agosto y Septiembre**, coincidiendo con la humedad relativa más baja del año (< 20%) y vientos del noreste que empujan el fuego hacia la ladera alta del Tunari.
* **Meses Seguros:** Diciembre a Abril (estación de lluvias en el valle).

### 📍 B. Puntos Críticos y Focos Recurrentes en el Tunari
1. **Cuenca Taquiña / Tirani (Cota 2750):** Zona de máxima vulnerabilidad por colindancia con viviendas urbanas.
2. **Tiquipaya Norte:** Laderas con pendiente mayor a 35° que aceleran la propagación del fuego.
3. **Andrada y Parque Metropolitano Este:** Zonas de pastizal seco con alta carga de combustible inflamable.
4. **Liriuni / Quillacollo:** Zona de recarga acuífera con riesgo de pérdida de cobertura de kewiñas nativas.

---

## 5. Fuentes de Datos Abiertas Oficiales

| Recurso | Proveedor Oficial | Enlace / Identificador |
| :--- | :--- | :--- |
| **NASA FIRMS (NRT & Archive)** | NASA EOSDIS | [https://firms.modaps.eosdis.nasa.gov](https://firms.modaps.eosdis.nasa.gov) |
| **MODIS Collection 6.1 (MCD14DL)** | NASA Terra / Aqua | [https://earthdata.nasa.gov](https://earthdata.nasa.gov) |
| **VIIRS S-NPP & NOAA-20 (VNP14IMGTDL)** | NASA / NOAA | [https://firms.modaps.eosdis.nasa.gov/active_fire/](https://firms.modaps.eosdis.nasa.gov/active_fire/) |
| **Cartografía Parque Nacional Tunari** | SERNAP / GAMC | Datos abiertos del límite Cota 2750 |
| **Telemetría Pluvial & Vientos** | SENAMHI Bolivia | Registros de estaciones meteorológicas Sarco y Aeropuerto |

---

## 6. Scripts y Entregables en el Repositorio

* 🐍 **Pipeline en Python:** `scripts/build_harmonized_firms_pipeline.py` (descarga, clúster y cálculo de métricas).
* 🗺️ **Dataset GeoJSON Armonizado:** `data/nasa/firms_tunari_harmonized.geojson`.
* 🛡️ **Polígono del Tunari:** `data/gamc/parque_nacional_tunari.geojson`.
* 📊 **Métricas de Anomalías:** `data/nasa/metricas_anomalias_tunari.json`.
* 💻 **Módulo Interactivo en React:** `frontend/src/modules/FireMonitorTab.jsx`.
