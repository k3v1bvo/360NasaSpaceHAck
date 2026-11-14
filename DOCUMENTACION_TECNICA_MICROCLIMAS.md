# 🛰️ DOCUMENTACIÓN TÉCNICA Y GUÍA DE ENTREGA
## Reto: *Be An Earth System Trend Detective!* — Microclimas Urbanos con IA
**Proyecto:** GEO-COCHABAMBA 360  
**Equipo:** NASA Space Apps Cochabamba 2026 (Sede FEXCO)  
**Rama Oficial:** `feature/modulo-microclimas`  
**Archivo Principal:** `frontend/src/modules/MicroclimateTab.jsx`  
**Dataset Local:** `data/gamc/distritos_cochabamba.geojson`  

---

## 1. Resumen Ejecutivo del Módulo

Este módulo resuelve el reto bi-factorial planteado por la **NASA** (detección de tendencias en sistemas terrestres) y el **Gobierno Autónomo Municipal de Cochabamba (GAMC)** (mitigación de islas de calor urbanas y resiliencia territorial).

Cochabamba presenta una marcada heterogeneidad microclimática derivada de la **Cota 2750 m s.n.m.** del Parque Nacional Tunari al norte y la rápida densificación sin arbolado de la **Zona Sur (Distritos 8, 9, 14)**:
* **Parque Tunari (D13 - Cota > 2750m):** LST promedio de **20.4 °C**, NDVI **0.58**, sensación biometeorológica confortable (PET 21.8 °C).
* **Zona Sur / Asfalto (D8, D9 K'ara K'ara - Cota < 2750m):** LST superficial superior a **37.8 °C - 43.5 °C**, NDVI crítico de **0.07**, generando una **anomalía térmica urbana de +17.4 °C** respecto a la montaña.
* **Efecto Amortiguador Laguna Alalay (D6):** La recarga hídrica reduce hasta en **-1.8 °C** la temperatura en los distritos circundantes.

---

## 2. Fuentes de Datos Oficiales Integradas

### Satelitales (NASA Earthdata)
1. **LST (Land Surface Temperature):**
   - Sensores: MODIS (MYD11A1 / MOD11A1) y Landsat 8/9 TIRS (Thermal Infrared Sensor - Banda 10 a 30m).
   - Cobertura espacial: Bounding Box Cochabamba `[-66.35, -17.50, -66.05, -17.25]`.
   - Calibración: Emisividad de superficie derivada de la fracción vegetal (FVC).
2. **NDVI (Normalized Difference Vegetation Index):**
   - Sensor: Landsat OLI / Sentinel-2 MSI.
   - Fórmula: $\text{NDVI} = \frac{\text{NIR} - \text{Red}}{\text{NIR} + \text{Red}}$.
3. **DEM Topográfico:**
   - Misión: NASA Shuttle Radar Topography Mission (SRTM 30m).
   - Uso: Determinación de la franja altitudinal de la Cota 2750 m s.n.m. y pendientes de escorrentía.

### Municipales (GAMC - Cochabamba)
1. **Límites de los 14 Distritos Municipales:** Polígonos vectoriales con atributos de población, superficie, densidad y zonificación.
2. **Límite Cota 2750 del Tunari:** Línea biofísica de protección ambiental del GAMC.

---

## 3. Innovación en IA: Motor Científico SciML
A diferencia de los modelos estadísticos simples, se incorpora un motor de **Aprendizaje Automático Científico (Scientific Machine Learning)**:

1. **Local-FNO 3D (Fourier Neural Operator Localizado):**
   - Resuelve el campo de vientos $(u, v, w)$ y temperatura del aire $(\theta)$ a escala urbana en menos de 10 segundos, frente a horas de Dinámica de Fluidos Computacional (CFD).
   - Aplica parches con solapamiento del 20% para evitar discontinuidades de borde.
2. **Restricción PINN (dpPINN):**
   - Aplica conservación física de masa y momento RANS: $\nabla \cdot \vec{V} = 0$.
   - Conmuta a modo PINN si la meteorología supera los récords históricos de Cochabamba (condición OOD).
3. **Confort Biometeorológico (PET y UTCI):**
   - Modela la Temperatura Media Radiante ($T_{mrt}$) y el balance energético humano MEMI ($M + W + R + C + E_{sk} + Q_{res} = S$).
4. **Detector de la Paradoja del Penalizador de Albedo:**
   - Identifica cuándo una política municipal de aplicar recubrimientos reflectantes (techos blancos) sin arbolado perjudica al peatón al rebotar la radiación a la acera, elevando el PET por encima de 40 °C.
5. **Índice Sintético HVR (Heat Vulnerability Risk):**
   $$\text{HVR}_i = \left(\frac{\text{PET}_i - \text{PET}_{min}}{\text{PET}_{max} - \text{PET}_{min}}\right) \times \left(\frac{\text{Población}_i}{\text{Área}_i}\right) \times (1 - \text{NDVI}_i) \times \beta_{\text{Cota2750}}$$

---

## 4. Estructura de Archivos del Módulo

```
C:\Users\josem\OneDrive\Desktop\Nasa Hackathon\
├── data/
│   └── gamc/
│       ├── distritos_cochabamba.geojson      # GeoJSON oficial 14 distritos con métricas
│       └── cota_2750_tunari.geojson          # Línea Cota 2750 Parque Tunari
├── frontend/
│   ├── src/
│   │   ├── modules/
│   │   │   └── MicroclimateTab.jsx           # Componente React principal para el dashboard
│   │   ├── App.jsx                           # Contenedor con las 4 pestañas del equipo
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── src/
│   ├── models/
│   │   ├── local_fno.py                      # Operador Neuronal de Fourier 3D
│   │   ├── pinns_solver.py                   # Solver PINN con balanceo dpPINN
│   │   ├── thermal_indices.py                # Calculador PET/UTCI y Albedo Penalty
│   │   └── sdf_encoder.py                    # Codificador de Distancia Signada 3D
│   ├── gis/
│   │   ├── nasa_ingest.py                    # Cliente NASA Earthdata (LST, NDVI, DEM)
│   │   ├── spatial_join.py                   # Cruce espacial de distritos y rásteres
│   │   └── risk_index.py                     # Calculador de índice HVR
│   └── api/
│       ├── routes.py                         # Endpoints FastAPI
│       └── schemas.py                        # Esquemas Pydantic v2
├── tests/
│   └── test_microclimas.py                   # Suite de pruebas unitarias (5/5 PASSED)
└── main.py                                   # Servidor FastAPI en http://127.0.0.1:8000
```

---

## 5. Instrucciones para Subir a la Rama de Git cuando Kevin te invite

Cuando tu compañero Kevin te añada como colaborador al repositorio `https://github.com/k3v1bvo/360NasaSpaceHAck.git`:

### Paso 1: Clonar o conectar el repositorio
```bash
# Opción A: Si clonas en una carpeta nueva
git clone https://github.com/k3v1bvo/360NasaSpaceHAck.git
cd 360NasaSpaceHAck
git checkout feature/modulo-microclimas

# Luego copias a esa carpeta:
# - data/gamc/distritos_cochabamba.geojson  -> data/gamc/
# - data/gamc/cota_2750_tunari.geojson      -> data/gamc/
# - frontend/src/modules/MicroclimateTab.jsx -> frontend/src/modules/
```

### Paso 2: Probar el frontend
```bash
cd frontend
npm install
npm run dev
```
Abre `http://localhost:5173` y verifica que la pestaña `Microclimas Urbanos (IA)` cargue con todos los controles.

### Paso 3: Guardar y subir a GitHub
```bash
git add frontend/src/modules/MicroclimateTab.jsx data/gamc/distritos_cochabamba.geojson data/gamc/cota_2750_tunari.geojson
git commit -m "feat(microclimas): implementación completa de MicroclimateTab con LST, NDVI, PET y contraste Tunari-Sur"
git push origin feature/modulo-microclimas
```

### Paso 4: Crear el Pull Request
Entra a GitHub y solicita a Kevin el merge hacia `main`. ¡Listo para ganar en la FEXCO!
