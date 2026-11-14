# 🚀 GUÍA Y PLAN MAESTRO — NASA SPACE APPS COCHABAMBA 2026
**Proyecto:** *GEO-COCHABAMBA 360: Plataforma de Resiliencia Territorial y Alerta Temprana*  
**Sede:** Feria Exposición de Cochabamba (FEXCO) • Cochabamba, Bolivia  
**Repositorio Oficial en GitHub:** [https://github.com/k3v1bvo/360NasaSpaceHAck.git](https://github.com/k3v1bvo/360NasaSpaceHAck.git)  
**Líder Técnico & Coordinador:** Kevin (`k3v1bvo`)  

---

> [!IMPORTANT]
> ### 📌 REGLA DE ORO DEL EQUIPO: UNIÓN DE PROYECTOS SIN CONFLICTOS
> **Cada integrante es responsable de 1 módulo específico** que responde a un reto oficial de la NASA y a un reto local del GAMC.  
> Las ramas en GitHub **ya están creadas y subidas**. Cada compañero trabaja en su rama y en su archivo asignado. Al finalizar, Kevin une todo en `main` para la presentación en la FEXCO.

---

## 1. Ramas de Git Oficiales en GitHub

El repositorio ya tiene las 4 ramas listas para que cada uno trabaje en paralelo:

| Integrante | Rol / Módulo Asignado | Rama en GitHub | Archivo Principal a Editar |
| :--- | :--- | :--- | :--- |
| **Kevin** | **Líder & Focos de Calor / Tunari** | `feature/kevin-incendios-tunari` | `src/modules/FireMonitorTab.jsx` |
| **Integrante 2** | **Microclimas & Islas de Calor** | `feature/modulo-microclimas` | `src/modules/MicroclimateTab.jsx` |
| **Integrante 3** | **Torrenteras, DEM & Inundaciones** | `feature/modulo-torrenteras` | `src/modules/FloodRiskTab.jsx` |
| **Integrante 4** | **Agrotech, Alerta Vecinal & Pitch** | `feature/modulo-agrotech-reportes` | `src/modules/AgroAdvisorTab.jsx` + `CitizenReportModal.jsx` |
| **Producción** | **Rama Final para el Jurado** | `main` | Integración general (Solo Kevin) |

---

## 2. Instrucciones de Inicio Rápido para los 4 Integrantes

### Paso 1: Clonar el Repositorio
Abre tu terminal (o Git Bash) y corre:
```bash
git clone https://github.com/k3v1bvo/360NasaSpaceHAck.git
cd 360NasaSpaceHAck
```

### Paso 2: Cambiarte a TU rama asignada
* **Si eres Kevin:**
  ```bash
  git checkout feature/kevin-incendios-tunari
  ```
* **Si eres Integrante 2 (Microclimas):**
  ```bash
  git checkout feature/modulo-microclimas
  ```
* **Si eres Integrante 3 (Torrenteras):**
  ```bash
  git checkout feature/modulo-torrenteras
  ```
* **Si eres Integrante 4 (Agrotech / Pitch):**
  ```bash
  git checkout feature/modulo-agrotech-reportes
  ```

### Paso 3: Probar el proyecto en local
```bash
cd frontend
npm install
npm run dev
```
Abre en tu navegador `http://localhost:5173` y verás el mapa de Cochabamba interactivo con las 4 pestañas listas.

---

## 3. Plan Detallado por Integrante (Qué debe hacer cada uno)

```
                            ┌──────────────────────────────────────────────┐
                            │    DASHBOARD CENTRAL: GEO-COCHABAMBA 360     │
                            │             (React + Leaflet)                │
                            └──────────────────────┬───────────────────────┘
                                                   │
             ┌─────────────────────┬───────────────┴───────────────┬─────────────────────┐
             ▼                     ▼                               ▼                     ▼
     ┌───────────────┐     ┌───────────────┐               ┌───────────────┐     ┌───────────────┐
     │  INTEGRANTE 1 │     │  INTEGRANTE 2 │               │  INTEGRANTE 3 │     │  INTEGRANTE 4 │
     │     KEVIN     │     │  MICROCLIMAS  │               │  TORRENTERAS  │     │   AGROTECH    │
     │   Incendios   │     │    URBANOS    │               │E INUNDACIONES │     │  Y REPORTES   │
     │    Tunari     │     │  LST + NDVI   │               │ SAR/DEM + 60p │     │  CIUDADANOS   │
     └───────────────┘     └───────────────┘               └───────────────┘     └───────────────┘
```

---

### 👤 INTEGRANTE 1: KEVIN (Líder Técnico & Focos de Calor Tunari)
* **Desafíos:** NASA *Harmonization of MODIS and VIIRS Hot Spots* + GAMC *Incendios Tunari*.
* **Rama:** `feature/kevin-incendios-tunari`
* **Archivos que le corresponden:**
  * `frontend/src/modules/FireMonitorTab.jsx`
  * `data/nasa/firms_focos_tunari.geojson`

#### 🎯 Tus Tareas Concretas:
1. **Consumo de NASA FIRMS API:**
   - Obtener el API Key gratuita en [NASA FIRMS](https://firms.modaps.eosdis.nasa.gov/api/).
   - Bounding Box oficial de Cochabamba y Parque Tunari: `[-66.35, -17.50, -66.05, -17.25]`.
   - Guardar una copia histórica en `data/nasa/focos_tunari_ejemplo.geojson` como respaldo por si falla el internet en la FEXCO.
2. **Armonización de Sensores (El núcleo del reto NASA):**
   - Comparar puntos de **MODIS** (resolución 1 km) vs **VIIRS** (resolución 375 m).
   - Eliminar detecciones duplicadas en la misma ventana de tiempo/espacio.
   - Clasificar según **FRP (Fire Radiative Power)**:
     * *Bajo:* < 20 MW (humo leve o quema controlada).
     * *Medio:* 20 - 50 MW (foco en propagación).
     * *Crítico:* > 50 MW (incendio forestal activo en cota alta del Tunari).
3. **Frontend:**
   - Terminar de afinar `FireMonitorTab.jsx` con filtros por fecha (últimas 24h, 48h, semana crítica).
   - Añadir estadísticas de hectáreas potenciales afectadas.
4. **Coordinación:**
   - Guiar a tus compañeros, resolver dudas de Git y aprobar los Pull Requests a `main`.

---

### 👤 INTEGRANTE 2: Especialista en Microclimas Urbanos & Visor Satelital
* **Desafíos:** NASA *Be An Earth System Trend Detective!* + GAMC *Microclimas Urbanos con IA*.
* **Rama:** `feature/modulo-microclimas`
* **Archivos que le corresponden:**
  * `frontend/src/modules/MicroclimateTab.jsx`
  * `data/gamc/distritos_cochabamba.geojson`

#### 🎯 Tus Tareas Concretas:
1. **Datos Municipales (GAMC):**
   - Conseguir o cargar los límites de los **Distritos Municipales 1 al 14 de Cochabamba** en formato GeoJSON en `data/gamc/distritos_cochabamba.geojson`.
2. **Datos Satelitales (NASA Earthdata):**
   - Series de **LST (Land Surface Temperature)** = Temperatura superficial de suelo (MODIS/VIIRS).
   - Series de **NDVI** = Índice de Cobertura Vegetal.
3. **El Análisis de Contraste que exige la Alcaldía:**
   - Contrastar zonas con asfalto/cemento masivo (ej. Av. 6 de Agosto / Circunvalación / Zona Sur) con zonas verdes (faldas del Parque Tunari / Laguna Alalay / Parque Metropolitano).
   - Demostrar cómo la falta de árboles aumenta la temperatura hasta en **+10 °C o +12 °C** en la zona sur (efecto "Isla de Calor").
4. **Frontend:**
   - En `MicroclimateTab.jsx`, crear la lista o selector de distritos donde al hacer clic en un distrito se muestren sus métricas (temperatura media, % vegetación, diagnóstico).
   - Añadir un gráfico de barras comparativo (con `recharts` o barras simples de Tailwind).

---

### 👤 INTEGRANTE 3: Especialista en Torrenteras, Inundaciones & DEM
* **Desafíos:** NASA *Dancing with the SARs* + GAMC *Prevención en Torrenteras y Colectores*.
* **Rama:** `feature/modulo-torrenteras`
* **Archivos que le corresponden:**
  * `frontend/src/modules/FloodRiskTab.jsx`
  * `data/gamc/60_puntos_inundacion.geojson`
  * `data/gamc/colectores_torrenteras.geojson`

#### 🎯 Tus Tareas Concretas:
1. **Los 60 Puntos Históricos de la Alcaldía (Ground-Truth):**
   - Cargar los **60 puntos históricos de inundación/deslizamiento** entregados por el GAMC en `data/gamc/60_puntos_inundacion.geojson`.
   - Estos puntos son la prueba de que el modelo está validado contra la realidad de Cochabamba.
2. **Datos de Relieve y Torrenteras:**
   - Trazar las torrenteras clave que bajan de la cordillera (Taquiña, Pintumayu, Logruste, etc.) y la red de colectores pluviales.
   - Cruzar con la pendiente (NASA SRTM/DEM): el agua escurre veloz en la ladera alta y se embalsa/anega en las zonas planas de la ciudad.
3. **Algoritmo de Riesgo:**
   - Clasificar los puntos:
     * *Riesgo Extremo:* Torrentera activa + historial de mazamorra + colector tapado.
     * *Riesgo Alto:* Depresión topográfica + lluvia SENAMHI > 40 mm.
     * *Riesgo Moderado:* Zona con pendiente suave y drenaje secundario.
4. **Frontend:**
   - En `FloodRiskTab.jsx`, permitir filtrar por nivel de riesgo (Extremo, Alto, Medio).
   - Mostrar ficha técnica de cada torrentera al seleccionarla.

---

### 👤 INTEGRANTE 4: Especialista Agrotech, Alerta Ciudadana & Pitch FEXCO
* **Desafíos:** NASA *Field Shift: Adapting Farms* + GAMC *Rotación de Cultivos & Ciudadanía*.
* **Rama:** `feature/modulo-agrotech-reportes`
* **Archivos que le corresponden:**
  * `frontend/src/modules/AgroAdvisorTab.jsx`
  * `frontend/src/modules/CitizenReportModal.jsx`
  * `DOCUMENTACION_DATOS.md` y Presentación de Diapositivas

#### 🎯 Tus Tareas Concretas:
1. **Asistente de Rotación de Cultivos (Agrotech):**
   - Diseñar la herramienta interactiva en `AgroAdvisorTab.jsx` donde el agricultor elige su zona (Valle Bajo, Central, Ladera) y tipo de suelo.
   - Cruzar con datos de humedad de suelo de la NASA (SMAP) para recomendar rotaciones óptimas de bajo consumo hídrico (ej. maíz -> tarwi/haba para fijar nitrógeno y ahorrar 30% de agua).
2. **Módulo "Alerta Ciudadana Vecinal" (Impacto Visual WOW):**
   - Afinar el modal `CitizenReportModal.jsx`: formulario flotante para que cualquier vecino o brigadista reporte humo en el Tunari o torrentera tapada, capturando su ubicación GPS.
   - Al enviar el reporte, se crea un pin de alerta en el mapa en tiempo real.
3. **Liderar los Entregables Clave de Evaluación:**
   - **Documentación Técnica:** Citar todas las fuentes NASA (FIRMS, Earthdata, DEM, SMAP) y GAMC (Shapefiles, 60 puntos, SENAMHI).
   - **Video Pitch (2 a 3 minutos):** Redactar el guion de 150 segundos y grabar el video demostrando el software funcionando.
   - **Diapositivas:** Preparar las 6 diapositivas para defender el proyecto ante los jueces en el stand de la FEXCO.

---

## 4. Protocolo de Integración en Git (Para no pisarse código)

Cuando termines tu parte o quieras que Kevin revise tus avances:

1. **Guarda tus cambios y haz commit:**
   ```bash
   git add .
   git commit -m "feat(modulo): avance de mi funcionalidad"
   ```
2. **Sube tus cambios a TU rama:**
   * Kevin: `git push origin feature/kevin-incendios-tunari`
   * Int. 2: `git push origin feature/modulo-microclimas`
   * Int. 3: `git push origin feature/modulo-torrenteras`
   * Int. 4: `git push origin feature/modulo-agrotech-reportes`
3. **Crear Pull Request en GitHub:**
   - Entra a [https://github.com/k3v1bvo/360NasaSpaceHAck](https://github.com/k3v1bvo/360NasaSpaceHAck)
   - Verás un botón verde: **"Compare & pull request"**.
   - Selecciona como destino la rama `main` y pide a Kevin que lo revise.
4. **Kevin hace el Merge:**
   - Kevin revisa que el código no rompa nada y aprueba el merge a `main`.

---

## 5. Checklist de los 5 Entregables Oficiales de la Hackathon

| # | Entregable Oficial | Estado | Quién lo lidera |
| :---: | :--- | :---: | :--- |
| **1** | **Repositorio GitHub Público** con instrucciones | ✅ Creado | Kevin |
| **2** | **Prototipo Funcional Demostrable** (Web con mapa y capas) | 🔄 En progreso | Todo el equipo |
| **3** | **Documentación Técnica de Fuentes de Datos** | ⏳ Pendiente | Integrante 4 + Kevin |
| **4** | **Video Pitch de 2 a 3 minutos** (YouTube / Drive público) | ⏳ Pendiente | Integrante 4 |
| **5** | **Presentación Final para el Jurado en la FEXCO** | ⏳ Pendiente | Todo el equipo |
