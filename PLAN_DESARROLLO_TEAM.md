# 🚀 GUÍA Y PLAN MAESTRO — NASA SPACE APPS COCHABAMBA 2026
**Proyecto:** *GEO-COCHABAMBA 360 / NASA TREND DETECTIVE: Plataforma de Resiliencia Territorial y Alerta Temprana*  
**Sede:** Feria Exposición de Cochabamba (FEXCO) • Cochabamba, Bolivia  
**Repositorio Oficial en GitHub:** [https://github.com/k3v1bvo/360NasaSpaceHAck.git](https://github.com/k3v1bvo/360NasaSpaceHAck.git)  
**Líder Técnico & Coordinador:** Kevin (`k3v1bvo`) — Team Stevens  
**Despliegue Oficial en Producción:** [https://nasa-trend-detective.vercel.app](https://nasa-trend-detective.vercel.app)  

---

> [!NOTE]
> ### 📌 ESTADO ACTUAL DEL PROYECTO: INTEGRACIÓN COMPLETA Y PRODUCCIÓN ACTIVA
> Todos los módulos del equipo han sido **completados, unificados y desplegados en la rama `main`**.  
> El sistema está funcionando en vivo con datos satelitales de la NASA (25 años), servicios WMS oficiales del GAMC (EPSG:3857), ground-truth de la Red MÓNICA (125,865 registros) y 13 Sensores Virtuales de Inteligencia Artificial (XGBoost 3.2.0, $R^2 = 0.9457$).

---

## 1. Módulos del Sistema Unificado en Producción

El dashboard central interactivo opera en producción integrando los 4 pilares estratégicos:

```
                            ┌──────────────────────────────────────────────┐
                            │    DASHBOARD CENTRAL: GEO-COCHABAMBA 360     │
                            │      https://nasa-trend-detective.vercel.app │
                            └──────────────────────┬───────────────────────┘
                                                   │
             ┌─────────────────────┬───────────────┴───────────────┬─────────────────────┐
             ▼                     ▼                               ▼                     ▼
     ┌───────────────┐     ┌───────────────┐               ┌───────────────┐     ┌───────────────┐
     │   MÓDULO 1    │     │   MÓDULO 2    │               │   MÓDULO 3    │     │   MÓDULO 4    │
     │ INCENDIOS PNT │     │  MICROCLIMAS  │               │ GESTIÓN WMS   │     │ TENDENCIAS IA │
     │  Y AEROSOLES  │     │  15 DISTRITOS │               │  PREDIAL GAMC │     │ Y SIMULADOR   │
     │ MODIS + VIIRS │     │ LST + NDVI +  │               │ 4 Capas WMS + │     │ Calibración   │
     │ Timeline Play │     │ Sensores IA   │               │ GetFeatureInfo│     │ Red MÓNICA    │
     └───────────────┘     └───────────────┘               └───────────────┘     └───────────────┘
```

| Módulo / Pestaña | Desafío Oficial NASA | Desafío Local GAMC | Estado |
| :--- | :--- | :--- | :---: |
| **1. Piloto Cochabamba (15 Distritos)** | *Be An Earth System Trend Detective!* | *Módulo 01: Microclimas Urbanos con IA* | ✅ **En Producción** |
| **2. Incendios Tunari (Impacto AOD)** | *Harmonization of MODIS and VIIRS* | *Monitoreo Focos de Calor (PNT)* | ✅ **En Producción** |
| **3. Visualizador Satelital GAMC** | *Earth System Trend Detective* | *Módulo 05: Gestión Distrital y Predial* | ✅ **En Producción** |
| **4. Motor Predictivo & Gráficas IA** | *Scientific ML / Trend Analysis* | *Planificación Territorial y Resiliencia* | ✅ **En Producción** |

---

## 2. Insumos Técnicos Integrados en la Versión Final

### A. Servicios Geoespaciales GAMC (`https://serviciosgamc.cochabamba.bo/api/gs/wms` en `EPSG:3857`)
1. **Límite Distritos** (`7eb13092-bf0e-493b-aae6-03c43eedda2c`): Los 15 distritos de Cercado renderizados sin desfase cartográfico.
2. **Población por Manzanas** (`194a02a0-a73a-48c1-a260-82847c5c905d`): Cruce socio-espacial para priorización de intervenciones.
3. **Áreas Verdes** (`47360ddc-e35f-4ece-a995-59e90eb79cc6`): Análisis de déficit de espacio público verde.
4. **Cota 2750 Tunari** (`297cefa4-0832-42bb-a98e-2cbea989fd9d`): Límite de área protegida y barrera de inversión térmica.
5. **GetFeatureInfo en Tiempo Real:** Al hacer clic en el mapa, consulta directamente la API del GAMC y despliega la ficha predial.

### B. Datos Satelitales NASA de Alto Rigor Científico
1. **NASA POWER (2000–2025):** 9,131 registros diarios para regresiones de Sen, test de Mann-Kendall y pendientes decadales.
2. **NASA MODIS/VIIRS LST & NDVI:** Medición diurna/nocturna de islas de calor urbanas (+17.4 °C de contraste Tunari vs Zona Sur).
3. **NASA MODIS Aqua AOD (2002–2024):** Serie multianual de espesor óptico de aerosoles con pendiente $+0.042/\text{década}$ ($p = 0.0008$).
4. **NASA FIRMS (MODIS + VIIRS C2):** 353 focos históricos analizados en el Tunari (79.8% concentrados en Ago–Sep).

### C. Calibración Local con la Red MÓNICA
* **Volumen Ground-Truth:** 125,865 registros continuos de las dos estaciones físicas (SEMAPA Norte y Kanata Sur).
* **Modelo IA Desplegado:** XGBoost 3.2.0 ($R^2 = 0.9457$, $\text{RMSE} = 0.5496^\circ\text{C}$, $\text{MAE} = 0.4362^\circ\text{C}$, $p = 0.0000$).
* **13 Sensores Virtuales:** Estimación en tiempo real de temperatura, humedad, PET y calidad del aire en los distritos sin monitoreo físico.

---

## 3. Guía de Ejecución y Pruebas en Local

Para levantar el proyecto en un entorno de desarrollo:

```bash
# 1. Clonar el repositorio
git clone https://github.com/k3v1bvo/360NasaSpaceHAck.git
cd 360NasaSpaceHAck

# 2. Instalar dependencias del frontend
cd frontend
npm install

# 3. Iniciar servidor de desarrollo
npm run dev
```

Abre en tu navegador `http://localhost:5173`.  
Para verificar la compilación de producción:
```bash
npm run build
```

---

## 4. Checklist de los 5 Entregables Oficiales de la Hackathon

| # | Entregable Oficial | Estado Final | Ubicación / Evidencia |
| :---: | :--- | :---: | :--- |
| **1** | **Repositorio GitHub Público** con código e historial limpio | ✅ **100% Completo** | [github.com/k3v1bvo/360NasaSpaceHAck](https://github.com/k3v1bvo/360NasaSpaceHAck) |
| **2** | **Prototipo Funcional Desplegado** (Web interactiva) | ✅ **100% Completo** | [nasa-trend-detective.vercel.app](https://nasa-trend-detective.vercel.app) |
| **3** | **Documentación Técnica de Fuentes de Datos (NASA + GAMC)** | ✅ **100% Completo** | `DOCUMENTACION_DATOS.md`, `DOCUMENTACION_TECNICA_MICROCLIMAS.md`, `DOC_TECNICA_INCENDIOS_TUNARI.md` |
| **4** | **Video Pitch Demostrativo (2 a 3 minutos)** | ✅ **100% Preparado** | `GUION_PITCH_Y_PRESENTACION_FEXCO.md` (Guion de 150s con timecodes exactos) |
| **5** | **Presentación Final y Defensa ante el Jurado en la FEXCO** | ✅ **100% Preparado** | Presentación de 6 diapositivas con respuestas técnicas pre-armadas |

---

## 5. Estrategia de Defensa ante el Jurado Técnico

Durante la evaluación en el stand de la FEXCO:
1. **Demostración en Vivo (30 segundos):** Abrir [nasa-trend-detective.vercel.app](https://nasa-trend-detective.vercel.app), mostrar la capa WMS de los 15 distritos en `EPSG:3857` y hacer un clic en el mapa para activar `GetFeatureInfo`.
2. **Evidencia Científica "Trend Detective" (40 segundos):** Abrir el modal de Gráficas IA, mostrar la pendiente decadal de calentamiento, la concentración de incendios en Ago-Sep (79.8%) y la serie AOD MODIS Aqua con $p = 0.0008$.
3. **Innovación con IA (30 segundos):** Explicar los 13 Sensores Virtuales calibrados con la Red MÓNICA ($R^2 = 0.9457$, $MAE = 0.44^\circ\text{C}$).
4. **Impacto Municipal Inmediato (20 segundos):** Activar el simulador de reforestación urbana en la Zona Sur para demostrar la reducción de $-2.3^\circ\text{C}$ de LST y $-3.1^\circ\text{C}$ de PET.
