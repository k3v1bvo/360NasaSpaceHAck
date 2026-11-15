# 🛰️ NASA TREND DETECTIVE (NASA Space Apps Challenge 2026)
### *Planetary Earth System Climate Anomaly & Regional AI Microclimate Sensing*

> **Reto Oficial NASA:** [*Be An Earth System Trend Detective!*](https://www.spaceappschallenge.org/2026/challenges/earth-system-trend-detective/?tab=resources)  
> **Equipo:** Stevens • **Líder:** Kevin (`k3v1bvo`)  
> **Sede:** FEXCO (Feria Exposición de Cochabamba, Bolivia)  
> **Repositorio Oficial:** [https://github.com/k3v1bvo/360NasaSpaceHAck.git](https://github.com/k3v1bvo/360NasaSpaceHAck.git)  
> **Despliegue Activo en Producción:** [https://nasa-trend-detective.vercel.app](https://nasa-trend-detective.vercel.app)  
> **Rama Principal:** `main`

---

## 🎯 El Desafío Científico de la NASA

El sistema ambiental interconectado de la Tierra se encuentra en constante cambio. Este proyecto responde rigurosamente a las **4 preguntas científicas obligatorias de la NASA**:

1. **¿Qué está cambiando?** (*What is changing?*)  
   $\rightarrow$ Temperatura de Superficie Terrestre (LST), Temperatura de Aire a 2m (T2M), Cobertura Vegetal (NDVI/EVI), Espesor Óptico de Aerosoles (AOD por incendios y quemas) y Confort Térmico Humano (PET/UTCI).
2. **¿Dónde está cambiando?** (*Where is it changing?*)  
   $\rightarrow$ A escala planetaria en 7 puntos críticos mundiales (Amazonía, California, Mediterráneo, Sahel, Ártico, Gran Barrera) y a escala regional en los **15 Distritos del Municipio de Cochabamba y la Cordillera del Tunari**.
3. **¿Cuánto está cambiando?** (*How much is it changing?*)  
   $\rightarrow$ Pendientes decadales cuantificadas ($+0.78\ ^\circ\text{C}/\text{década}$ en Distrito 9 Itocta y $+0.74\ ^\circ\text{C}/\text{década}$ en Distrito 15 K'ara K'ara vs $-0.18\ ^\circ\text{C}/\text{década}$ en la reserva forestal de la Cota 2750 del Parque Tunari; generando una **brecha térmica intraurbana extrema de $+17.4\ ^\circ\text{C}$**).
4. **¿Es un cambio estadísticamente significativo?** (*Is it statistically significant?*)  
   $\rightarrow$ Validado mediante la **Prueba No Paramétrica de Mann-Kendall**, **Estimador de Pendiente de Sen** y **Regresión OLS** con un nivel de confianza $\ge 99.9\%$ ($p < 0.05$, $p = 0.0008$ en AOD de MODIS Aqua), aislando el ciclo estacional con **Descomposición STL** siguiendo la metodología de series de tiempo de la NASA (SeaWiFS time-series).

---

## 🏛️ Arquitectura del Sistema: Los 3 Pilares

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NASA TREND DETECTIVE                            │
│           (Planetary Earth System Science & Regional Pilot)            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
       ┌────────────────────────────┼────────────────────────────┐
       ▼                            ▼                            ▼
┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────────────┐
│  1. EXPLORADOR GLOBAL  │  │  2. CASO PILOTO LOCAL  │  │  3. CAUSA TÉRMICA:     │
│     PLANETARIO         │  │     15 DISTRITOS COCHA │  │     INCENDIOS TUNARI   │
├────────────────────────┤  ├────────────────────────┤  ├────────────────────────┤
│• 7 Hotspots mundiales  │  │• 15 Distritos Oficiales│  │• Motor NASA FIRMS      │
│• NASA POWER API Stream │  │• 2 Estaciones MÓNICA   │  │• MODIS + VIIRS Armoniz.│
│• Portales oficiales:   │  │• 13 Sensores IA XGBoost│  │• 4 Capas WMS GAMC 3857 │
│  Giovanni, AppEEARS,   │  │• Cota 2750 P.N. Tunari │  │• Plumas AOD MODIS Aqua │
│  GES DISC, NOAA CDO    │  │• Confort Humano (PET)  │  │• Alerta Inversión 24h  │
│• Consulta libre Lat/Lon│  │• R² = 0.9457, p < 0.05 │  │• Corredores Predicción │
└────────────────────────┘  └────────────────────────┘  └────────────────────────┘
```

---

## 🤖 Modelo de Inteligencia Artificial & Ground-Truth (Red MÓNICA + NASA POWER)

- **Algoritmo de Inferencia:** XGBoost Regressor 3.2.0 calibrado con validación cruzada temporal (`TimeSeriesSplit` de 5 folds) para garantizar ausencia total de fuga de datos.
- **Muestras de Entrenamiento:** **2,497 días continuos** descargados de la API de NASA POWER (2020–2026) cruzados con los 125,865 registros físicos de la Red MÓNICA GAMC.
- **Métricas Científicas Verificadas:**
  - $R^2$ (Coeficiente de Determinación): **0.9457 (~0.95)**
  - $\text{RMSE}$ (Error Cuadrático Medio): **0.5496 °C**
  - $\text{MAE}$ (Error Absoluto Medio): **0.4362 °C**
  - Significancia Estadística: **$p = 0.0000 < 0.05$**
- **Importancia de Factores Biofísicos (Valores SHAP):**
  - Temperatura Superficial NASA (LST): **68.9%**
  - Índice de Vegetación MODIS/Sentinel (NDVI): **18.6%**
  - Aerosoles / Humo de Quemas (AOD): **9.8%**
  - Altitud / Topografía Cota 2750 (msnm): **2.7%**

---

## 🏛️ Integración Geoespacial con el GAMC (Gobierno Autónomo Municipal de Cochabamba)

1. **Servicios WMS Oficiales en `EPSG:3857` (`serviciosgamc.cochabamba.bo/api/gs/wms`):**
   - `Límite Distritos` (UUID: `7eb13092-bf0e-493b-aae6-03c43eedda2c`)
   - `Población por Manzanas` (UUID: `194a02a0-a73a-48c1-a260-82847c5c905d`)
   - `Áreas Verdes` (UUID: `47360ddc-e35f-4ece-a995-59e90eb79cc6`)
   - `Cota 2750 Parque Tunari` (UUID: `297cefa4-0832-42bb-a98e-2cbea989fd9d`)
2. **Consultas `GetFeatureInfo` Simultáneas (`Promise.all`):**
   - Con un solo clic sobre cualquier predio del mapa, el sistema interroga en paralelo los 4 servicios de GeoServer y consolida en < 300 ms la población de la manzana, metros cuadrados de área verde y franja de protección forestal.
3. **Corredores de Transporte Urbano:**
   - Pre-cacheo optimizado en `/data/transporte_troncales.geojson` (319 KB, 730 tramos de microbuses, trufis y líneas troncales) para cruzar emisiones vehiculares con islas de calor.

---

## ⏱️ Herramientas Operativas y de Decisión Municipal

1. **Línea de Tiempo Satelital Multitemporal con Reproductor Automático:**
   - Controles organizados en 2 filas dedicadas (Años 2020–2026 y Meses con hitos estacionales).
   - Animación en vivo: al pulsar `Play`, el mapa evoluciona térmicamente distrito a distrito y proyecta los focos satelitales en la ladera del Tunari.
2. **Motor Predictivo Multidecadal (2026–2050):**
   - Proyecciones de calentamiento no paramétricas (Theil-Sen + XGBoost) distrito a distrito para planificación urbana.
3. **Alerta Temprana de Inversión Térmica en 24 Horas:**
   - Detecta condiciones de viento calmo ($< 1.5\text{ m/s}$) y AOD satelital ($> 0.45$) para advertir sobre trampas de smog bajo la Cota 2750 antes de las 07:00 AM.
4. **Simulador de Mitigación Urbana (PET):**
   - Sliders de reforestación (+10% a +50%) y pavimentos reflectivos, calculando la reducción del estrés térmico y alertando sobre la Paradoja de Albedo.

---

## 💻 Instalación y Ejecución Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/k3v1bvo/360NasaSpaceHAck.git
cd 360NasaSpaceHAck

# 2. Instalar dependencias del frontend
cd frontend
npm install

# 3. Iniciar el servidor de desarrollo
npm run dev
```

Abre en tu navegador: `http://localhost:5173` o visita la versión desplegada en producción:  
👉 **[https://nasa-trend-detective.vercel.app](https://nasa-trend-detective.vercel.app)**
