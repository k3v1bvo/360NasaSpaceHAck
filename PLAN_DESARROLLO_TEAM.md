# 🚀 GUÍA OFICIAL PARA EL EQUIPO — NASA SPACE APPS COCHABAMBA 2026
**Proyecto Unificado:** *GEO-COCHABAMBA 360: Plataforma de Resiliencia Territorial y Alerta Temprana*  
**Sede:** Feria Exposición de Cochabamba (FEXCO) • Cochabamba, Bolivia  
**Líder de Proyecto / Integrador:** Kevin  

---

> [!IMPORTANT]
> ### 📌 REGLA DE ORO DEL EQUIPO
> **Cada integrante desarrolla un módulo/reto independiente** con sus fuentes de datos (NASA + GAMC).  
> **Para que la unión final sea automática y sin dolores de cabeza**, todos usamos **el mismo stack tecnológico, la misma estructura de carpetas y el mismo formato de datos (GeoJSON estándar)**.  
> Nadie instala librerías raras ni cambia la estructura sin consultar a Kevin.

---

## 1. Stack Tecnológico Fijo y Obligatorio (Para Todos)

Para asegurar que los 4 módulos se ensamblen en un solo dashboard sin errores de compatibilidad:

| Componente | Tecnología Fija | Versión / Detalle |
| :--- | :--- | :--- |
| **Entorno de ejecución** | **Node.js** | v18.x o v20.x LTS |
| **Frontend Base** | **React + Vite** | JavaScript / JSX rápido y modular |
| **Estilos & UI** | **Tailwind CSS** | Clases utilitarias estándar, diseño oscuro moderno tipo NASA |
| **Iconografía** | **Lucide React** | `lucide-react` para iconos limpios (fuego, agua, clima, alertas) |
| **Motor de Mapas** | **Leaflet / React-Leaflet** | Ultra liviano, compatible con todos los navegadores, sin costos ni tokens |
| **Backend & Procesamiento**| **Python 3.10+ / FastAPI** | Para procesar shapefiles, GeoTIFFs y consumir APIs de NASA |
| **Formato de Intercambio** | **GeoJSON (RFC 7946)** | Coordenadas obligatorias: `[longitud, latitud]` en sistema WGS84 (EPSG:4326) |
| **Coordenadas de Cochabamba**| **Bounding Box Oficial** | Latitud: `-17.50` a `-17.25` / Longitud: `-66.35` a `-66.05` |

---

## 2. Asignación de Retos por Integrante (Qué debe hacer cada uno)

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

### 👤 INTEGRANTE 1: KEVIN (Líder Técnico & Módulo Focos de Calor / Incendios Tunari)
* **Desafío NASA Vinculado:** *Harmonization of MODIS and VIIRS Hot Spots*
* **Desafío Local GAMC:** *Monitoreo de Focos de Calor e Incendios Forestales (Tunari)*
* **Rama de Git:** `feature/modulo-incendios`

#### 🎯 Tus Tareas Concretas:
1. **Infraestructura Base:** Crear el repositorio en GitHub, inicializar React con Tailwind y configurar el componente de mapa principal (`MapViewer.jsx`) centrado en Cochabamba (`[-17.3895, -66.1568]`).
2. **Consumo de NASA FIRMS:** 
   - Conectar con la API de NASA FIRMS (MODIS y VIIRS) usando el bounding box de Cochabamba / Parque Tunari.
   - Guardar una copia histórica en `data/nasa/firms_tunari_historico.json` (por seguridad si se corta internet).
3. **Armonización de Sensores:** 
   - Filtrar y unificar los puntos de MODIS (1km) y VIIRS (375m).
   - Clasificar los focos por severidad (FRP / Fire Radiative Power: Bajo, Medio, Crítico).
4. **Entregable en Frontend:** Crear el componente `src/modules/FireMonitorTab.jsx` con:
   - Capa de círculos de calor sobre el Parque Tunari.
   - Filtro por fecha (últimas 24h, 48h, históricos).
   - Tarjeta con estadísticas: Total de focos detectados, zona crítica actual.
5. **Integración:** Revisar y aprobar los Pull Requests de los otros 3 compañeros.

---

### 👤 INTEGRANTE 2: Especialista en Microclimas Urbanos & Visor Satelital
* **Desafío NASA Vinculado:** *Be An Earth System Trend Detective!*
* **Desafío Local GAMC:** *Microclimas Urbanos con IA + Visualizador de Datos Satelitales*
* **Rama de Git:** `feature/modulo-microclimas`

#### 🎯 Tus Tareas Concretas:
1. **Datos del GAMC (Distritos):** Cargar los shapefiles municipales de los distritos de Cochabamba (Distritos 1 al 14) y convertirlos a `distritos_cochabamba.geojson`.
2. **Datos NASA Earthdata:** 
   - Obtener series de **LST (Land Surface Temperature)** = Temperatura del suelo.
   - Obtener series de **NDVI** = Índice de Cobertura Vegetal.
3. **Análisis de Disparidades Socioambientales (El contraste que pide la Alcaldía):**
   - Calcular el promedio de temperatura y cobertura vegetal por distrito.
   - Contrastar distritos con alta impermeabilización/asfalto (ej. Av. 6 de Agosto / Circunvalación) frente a zonas con alta cobertura verde (faldas del Tunari, Parque Metropolitano, Laguna Alalay).
4. **Entregable en Frontend:** Crear el componente `src/modules/MicroclimateTab.jsx` con:
   - Capa de polígonos de los distritos coloreados en degradé térmico (rojo = isla de calor, verde = zona templada/arbolada).
   - Al hacer clic en un distrito, abrir un popup o panel lateral con sus datos: Nombre del distrito, temperatura promedio, % cobertura vegetal.
   - Gráfico de barras o líneas simple (con `recharts`) mostrando la comparación entre distritos.

---

### 👤 INTEGRANTE 3: Especialista en Riesgos, Inundaciones & Torrenteras
* **Desafío NASA Vinculado:** *Dancing with the SARs*
* **Desafío Local GAMC:** *Prevención de Riesgos, Inundaciones y Deslizamientos en Torrenteras*
* **Rama de Git:** `feature/modulo-torrenteras`

#### 🎯 Tus Tareas Concretas:
1. **Ground-Truth del GAMC (60 Puntos Históricos):**
   - Cargar los **60 puntos históricos de eventos de inundación/deslizamiento** provistos por el GAMC en un archivo `60_puntos_inundacion.geojson`.
2. **Datos de Elevación y Torrenteras:**
   - Ubicar las torrenteras principales que bajan del Tunari (Taquiña, Pintumayu, Logruste, etc.) y la red de colectores pluviales del municipio.
   - Incorporar la pendiente/relieve (datos NASA DEM / SRTM) para identificar zonas bajas donde se acumula el agua.
3. **Modelo de Vulnerabilidad:**
   - Crear un algoritmo sencillo de categorización de riesgo:
     * **Riesgo Alto:** Baja pendiente + Proximidad a torrentera desbordada + Histórico de anegamiento.
     * **Riesgo Medio:** Zona de colector con capacidad comprometida.
4. **Entregable en Frontend:** Crear el componente `src/modules/FloodRiskTab.jsx` con:
   - Capa de marcadores de los 60 puntos históricos con icono de advertencia.
   - Capa de líneas/trazados de las principales torrenteras y red de colectores.
   - Filtro de severidad: Ver zonas de riesgo extremo durante lluvias intensas (cruzado con telemetría de lluvia SENAMHI).

---

### 👤 INTEGRANTE 4: Especialista Agrotech, Alerta Ciudadana & Pitch FEXCO
* **Desafío NASA Vinculado:** *Field Shift: Adapting Farms with NASA Data*
* **Desafío Local GAMC:** *Rotación de Cultivos Resilientes y Gestión Hídrica Local*
* **Rama de Git:** `feature/modulo-agrotech`

#### 🎯 Tus Tareas Concretas:
1. **Herramienta de Recomendación Agrícola (Valle Central/Bajo):**
   - Crear un calculador/asistente donde un agricultor seleccione su tipo de suelo y disponibilidad de agua.
   - Cruzar con datos de humedad de suelo de la NASA (SMAP) o evapotranspiración para sugerir cultivos tradicionales resilientes (maíz, haba, hortalizas) que optimicen el ahorro de agua.
2. **Módulo Extra "Alerta Ciudadana en Tiempo Real" (Valor Agregado):**
   - Crear un modal flotante: *"Reportar Emergencia Vecinal"* con campos sencillos:
     * Tipo: Incendio / Torrentera tapada / Anegamiento de calle.
     * Ubicación: Tomar ubicación GPS del navegador o marcar un punto en el mapa.
     * Descripción y foto de referencia.
   - Al guardar, el reporte aparece inmediatamente como un pin interactivo en el mapa.
3. **Liderar los Entregables de Comunicación (Clave para ganar la FEXCO):**
   - **Documentación Técnica:** Listar formalmente las fuentes de datos NASA (FIRMS, Earthdata, DEM, SMAP) y GAMC (Shapefiles, 60 puntos, Colectores).
   - **Video Pitch (2 a 3 minutos):** Redactar el guion, coordinar la grabación de la pantalla del prototipo y subirlo a YouTube/Drive.
   - **Diapositivas:** Preparar las 6 diapositivas de impacto para defender ante el jurado en el stand de la FEXCO.

---

## 3. Contrato de Datos: Formato Estándar para Todos

Para que los módulos de los 4 integrantes se puedan montar sobre el mismo mapa sin tocar el código de los demás, **todos los datos deben ser GeoJSON válidos**:

```json
{
  "type": "FeatureCollection",
  "name": "Capa_Ejemplo",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-66.1568, -17.3895]
      },
      "properties": {
        "modulo": "incendios | microclimas | torrenteras | agrotech",
        "titulo": "Nombre del Punto / Distrito / Torrentera",
        "nivel_alerta": "Bajo | Medio | Alto | Critico",
        "valor_metrica": "38.5 °C / 120 mm / FRP 45",
        "fuente": "NASA FIRMS / GAMC Catastro",
        "detalles": "Texto descriptivo que se muestra en el popup al hacer clic"
      }
    }
  ]
}
```

---

## 4. Estructura de Carpetas del Proyecto

```text
nasa-spaceapps-cochabamba/
├── README.md                           <-- Instrucciones de instalación
├── PLAN_DESARROLLO_TEAM.md             <-- Esta guía
├── data/                               <-- Carpeta donde se guardan los GeoJSON locales
│   ├── gamc/
│   │   ├── distritos_cochabamba.geojson     (Integrante 2)
│   │   ├── 60_puntos_inundacion.geojson     (Integrante 3)
│   │   └── colectores_torrenteras.geojson   (Integrante 3)
│   └── nasa/
│       ├── firms_focos_tunari.geojson       (Kevin)
│       └── lst_ndvi_distritos.json          (Integrante 2)
└── frontend/                           <-- Aplicación React + Vite
    ├── package.json
    ├── src/
    │   ├── App.jsx                     <-- Dashboard maestro con tabs de navegación
    │   ├── components/
    │   │   ├── MapViewer.jsx           <-- Mapa central compartido
    │   │   ├── Navbar.jsx              <-- Barra superior con logos NASA + GAMC
    │   │   └── LayerControl.jsx        <-- Switch para encender/apagar capas
    │   └── modules/
    │       ├── FireMonitorTab.jsx      <-- Módulo 1 (Kevin)
    │       ├── MicroclimateTab.jsx     <-- Módulo 2 (Integrante 2)
    │       ├── FloodRiskTab.jsx        <-- Módulo 3 (Integrante 3)
    │       ├── AgroAdvisorTab.jsx      <-- Módulo 4 (Integrante 4)
    │       └── CitizenReportModal.jsx  <-- Módulo 4 (Integrante 4)
```

---

## 5. Protocolo de Trabajo en Git (Para no pisarse código)

1. **Paso 1:** Kevin crea el repo en GitHub con la base funcionando y lo comparte con los 3 integrantes.
2. **Paso 2:** Cada compañero clona el repo:
   ```bash
   git clone <url-del-repositorio>
   cd nasa-spaceapps-cochabamba/frontend
   npm install
   ```
3. **Paso 3:** Cada uno crea su rama antes de escribir una sola línea de código:
   - Integrante 2: `git checkout -b feature/modulo-microclimas`
   - Integrante 3: `git checkout -b feature/modulo-torrenteras`
   - Integrante 4: `git checkout -b feature/modulo-agrotech`
4. **Paso 4:** Cada quien solo toca su archivo dentro de `src/modules/` y sus datos en `data/`. **¡Nadie modifica `MapViewer.jsx` ni `App.jsx` directamente!**
5. **Paso 5:** Hacen commit, push a su rama y crean un Pull Request (PR) en GitHub para que Kevin lo revise e integre en `main`.

---

## 6. Los 5 Entregables Oficiales que Califica el Jurado

| # | Entregable Exigido | Responsable | Criterio de Éxito |
| :---: | :--- | :---: | :--- |
| **1** | **Repositorio Abierto en GitHub** | Kevin | Código ordenado con README claro de cómo instalarlo. |
| **2** | **Prototipo Funcional Demostrable** | Todo el equipo | Web fluida con mapa interactivo y capas activables en vivo. |
| **3** | **Documentación Técnica de Datos** | Integrante 4 + Kevin | Tabla con enlaces a Earthdata, FIRMS, DEM, Shapefiles GAMC y SENAMHI. |
| **4** | **Video Pitch de 2 a 3 minutos** | Integrante 4 | Video grabado con buena voz explicando el problema de Cocha, la solución y la demo. |
| **5** | **Presentación Final FEXCO** | Todo el equipo | Diapositivas listas para proyectar ante los jueces en la feria. |

---

## 7. Consejos Clave para Ganar en la FEXCO

> [!TIP]
> 1. **Modo Offline Activado:** El internet en la FEXCO suele saturarse o fallar cuando hay mucha gente conectada. Guarden todos los datos procesados en la carpeta `data/` para que la web funcione perfectamente sin conexión a internet durante la demostración al jurado.
> 2. **Impacto Local:** Recuerden siempre mencionar nombres reales de Cochabamba: el *Parque Nacional Tunari*, la *Torrentera Taquiña*, la *Laguna Alalay*, la *Av. 6 de Agosto* y los distritos de la zona sur. El jurado de la Alcaldía ama ver soluciones aplicadas a su realidad.
> 3. **Botón de Reporte Vecinal:** El módulo de reporte ciudadano con GPS es el gancho visual que demuestra que el proyecto no se queda en ciencia teórica, sino que sirve a los cochabambinos en el día a día.
