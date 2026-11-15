# 🛡️ FireLock — NASA Space Apps Challenge 2026
## AI-Powered Microgravity Fire Safety Console & PSI Flight Telemetry Platform

[![NASA PSI](https://img.shields.io/badge/NASA-PSI%20Data%20Repository%20(24%20Missions)-blue.svg)](https://science.nasa.gov/physical-sciences-informatics-psi/)
[![Version](https://img.shields.io/badge/Release-v4.2.0--stable-emerald.svg)](package.json)
[![React 19](https://img.shields.io/badge/React-19.3.1-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0.2%20(0%20errors)-3178c6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3.8%20(Fast%20HMR)-646cff.svg)](https://vitejs.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4.3.5-38bdf8.svg)](https://tailwindcss.com/)
[![Standard](https://img.shields.io/badge/Safety%20Standard-NFPA%20750%20%7C%20ISO%204589--4-orange.svg)](https://www.nfpa.org/)
[![License](https://img.shields.io/badge/License-MIT-lightgrey.svg)](LICENSE)

---

## 📌 Visión General del Proyecto

**FireLock** es una consola aeroespacial de seguridad térmica y supresión de incendios en microgravedad impulsada por Inteligencia Artificial y calibrada sobre **24 investigaciones experimentales de vuelo (~12 Terabytes de telemetría)** del repositorio oficial **NASA Physical Sciences Informatics (PSI)**.

La plataforma resuelve el vacío operacional que enfrentan los astronautas en misiones de exploración habitable (Estación Espacial Internacional, Estación Lunar Gateway, Misiones Artemis y Hábitats Marcianos), donde las leyes terrestres del fuego dejan de cumplirse debido a la ausencia casi total de flotabilidad gravitatoria ($g \approx 10^{-6}\text{ g}_0$).

```
  ┌────────────────────────────────────────────────────────────────────────────┐
  │                 PARADOJAS CRÍTICAS DEL FUEGO EN MICROGRAVEDAD              │
  ├────────────────────────────────────────────────────────────────────────────┤
  │ 1. Flotabilidad Nula: Llamas esféricas, azuladas y puramente difusivas.    │
  │ 2. Falla de NASA-STD-6001B: Desplazamiento del LOI (-3.5 pp de O₂) en 0-g. │
  │ 3. Trampa de Llamas Frías (LTC): Reacciones latentes a 600–800 K invisibles│
  │ 4. Falsas Alarmas Ópticas: Aglomeración de hollín por movimiento browniano│
  └────────────────────────────────────────────────────────────────────────────┘
```

> 📖 **Documentación Teórica Completa:** Para consultar la formulación físico-química exhaustiva, correlaciones empíricas y derivaciones de cada módulo, consulta el documento maestro:  
> **[DOCUMENTACION_CIENTIFICA_Y_MODULAR_FIRELOCK.md](file:///c:/Users/josem/OneDrive/Desktop/Nasa%20Internacional/DOCUMENTACION_CIENTIFICA_Y_MODULAR_FIRELOCK.md)**

---

## 🏷️ Versionado Oficial y Ciclo de Lanzamiento (Release Policy)

El proyecto sigue una política estricta de **Versionado Semántico (SemVer 2.0.0)** para garantizar estabilidad operativa, compatibilidad retroactiva y despliegues sin fricción:

### **Versión Actual: `v4.2.0-stable`**

* **`v4.x.x` (Major):** Arquitectura cliente unificada en React 19 + TypeScript con motor de inferencia física en tiempo real y asistente autónomo RAG sin latencia.
* **`v4.2.x` (Minor):** Rediseño ergonómico de alta densidad aeroespacial, visor en doble columna del simulador cinético, y nuevo HUD con selector dinámico de atmósfera de cabina (ISS Standard, Artemis Gateway e Hipobárica Lunar).
* **`v4.2.0` (Patch):** Optimización de escala para pantallas panorámicas y portátiles, eliminación de espacios muertos en el Centro de Mando y empaquetado autónomo de artefactos de producción (`dist/`).

---

## ⚡ Modos de Uso Directo Sin Necesidad de Reinstalar (Zero-Reinstall Quickstart)

Para usar y evaluar **FireLock** directamente cada vez que se actualice el código fuente sin tener que descargar o reinstalar dependencias repetidamente, dispones de **cuatro métodos inmediatos**:

### Opción 1: Ejecución Directa de Artefactos Pre-Compilados (Instantáneo · 0 Segundos)
El repositorio ya incluye los artefactos de producción compilados en `frontend/dist/`. Puedes servirlos al instante con cualquier servidor web estático sin instalar librerías:

```bash
# Opción 1.A: Usando npx (no instala nada localmente)
npx serve frontend/dist -l 3000

# Opción 1.B: Desde el script del monorepo
npm run preview
```
*Abre tu navegador en:* `http://localhost:3000`

---

### Opción 2: Contenedor Docker Inmutable (Aislamiento Total · 1 Comando)
Si prefieres no tocar tu entorno local de Node.js, utiliza la imagen Docker optimizada multicapa:

```bash
# Construir la imagen localmente (una sola vez)
docker build -t firelock .

# Iniciar la consola en segundo plano
docker run -d -p 3000:3000 --name firelock-console firelock
```
*Para actualizar en el futuro basta con:* `docker restart firelock-console`.

---

### Opción 3: Modo Desarrollo con Caché de Dependencias
Si ya clonaste el repositorio, las dependencias de Node se mantienen cacheadas. No necesitas reinstalar cada vez que hagas `git pull`:

```bash
# 1. Obtener los últimos cambios
git pull origin feature/flame-in-freefall-ai-dashboard

# 2. Iniciar directamente el servidor de desarrollo (Vite arranca en ~400 ms)
npm run dev
```

---

### Opción 4: Despliegue en la Nube (Vercel Production Ready)
El proyecto está configurado nativamente con `vercel.json` para despliegues *serverless* continuos:
```bash
# Despliegue directo en Vercel
npx vercel --prod
```

---

## 🧭 Justificación Científica y Estructura por Módulos

| Módulo | Fundamento Científico & Modelo Físico | Datos de Vuelo NASA / Norma | Utilidad para los Astronautas |
|---|---|---|---|
| **📊 Centro de Mando** (`MissionDashboard`) | Paradoja de NASA-STD-6001B. Caída del Índice Límite de Oxígeno ($\Delta\text{LOI} = -3.5\text{ pp}$). Correlación ISO 4589-4. | **JAXA/NASA FLARE**, **BASS-II**, ISO 4589-4, NASA-STD-6001B | Permite al astronauta auditar en tiempo real qué materiales son **inflamables o auto-extinguibles** según la atmósfera activa de la nave. |
| **🔥 Simulador de Flamas** (`FlameSimulator`) | Curva no-monótona de propagación ($V_f$ vs $V_g$). Aceleración $4\times$ por efecto de curvatura en cables delgados ($d < 1\text{ mm}$). Transitorio de Llama Fría LTC en 60s. | **FLEX-1/2 (ISS CIR)**, **BASS-II (ISS MSG)**, **SoFIE**, **Saffire I-VI** | Modela el peligro del flujo HVAC ($0.4\text{--}5\text{ cm/s}$) y advierte sobre la meseta oculta de **Llamas Frías (600–800 K)** tras apagados aparentes. |
| **🛡️ Predictor de Riesgo ML** (`RiskPredictor`) | Modelo de ensamble no lineal ($R^2 = 0.982$, $\text{RMSE} = 0.675\text{ mm/s}$) sobre 24 campañas de vuelo. Prescripción física **NFPA 750**. | **NASA PSI Database (24 Investigaciones)**, NFPA 750 Clase 1, FEANICS | Calcula la tasa de fuego $V_f$, nivel de riesgo (*Safe/Caution/Danger*) y prescribe **micro-niebla de agua a 35 bar ($35\ \mu\text{m}$)** en vez de $CO_2$. |
| **🤖 Asistente IA Autónomo** (`AIAssistant`) | RAG local en memoria con vectorización TF-IDF y similitud coseno. Cero latencia, 100% autónomo sin internet en espacio profundo. Citas obligatorias. | **43 Peritajes Forenses de Vuelo** (Apollo 1, Mir 1997, Saffire, FLEX, BASS) | Brinda asistencia y guías paso a paso de emergencia al astronauta citando reportes oficiales de la NASA sin alucinaciones. |
| **📚 Catálogo de Investigaciones** (`PSIRepository`) | Catálogo indexado de 24 experimentos de microgravedad (~12 TB) con metadatos reales, plataforma, tipo de combustible y DOIs oficiales. | **NASA Physical Sciences Informatics (PSI)** | Permite explorar la evidencia empírica de 30 años de ciencia de la combustión espacial de la NASA. |

---

## 🗂️ Estructura del Proyecto (Monorepo)

```
Nasa Internacional/
├── frontend/                               # Aplicación Web React 19 + TypeScript
│   ├── dist/                               # Artefactos pre-compilados listos para servir
│   ├── src/
│   │   ├── components/                     # Módulos de la Consola Aeroespacial
│   │   │   ├── Navbar.tsx                  # Cabecera ergonómica y selector HUD de atmósfera
│   │   │   ├── MissionDashboard.tsx        # Centro de Mando (4 KPIs, dual-bars, timeline)
│   │   │   ├── FlameSimulator.tsx          # Simulador cinético y transitorio LTC 60s
│   │   │   ├── RiskPredictor.tsx           # Predictor ML y prescripción NFPA 750
│   │   │   ├── AIAssistant.tsx             # Copiloto RAG local y biblioteca forense
│   │   │   ├── PSIRepository.tsx           # Explorador oficial de 24 misiones NASA PSI
│   │   │   └── charts/                     # Visualizadores SVG/Canvas de alta resolución
│   │   ├── physics/                        # Motores cinéticos y formulación matemática
│   │   │   ├── flameKinetics.ts            # Ecuaciones Olson & T'ien y curvas LTC
│   │   │   ├── mlInference.ts              # Inferencia ML calibrada con datos PSI (R²=0.982)
│   │   │   └── chatEngine.ts               # Motor RAG local TF-IDF de peritajes forenses
│   │   ├── data/                           # Bases de datos aeroespaciales en TypeScript
│   │   │   ├── flightExperiences.ts        # 43 casos forenses documentados de la NASA
│   │   │   └── psiInvestigations.ts        # 24 investigaciones oficiales con DOIs
│   │   └── App.tsx                         # Contenedor raíz responsive (max-w-[1536px])
│   ├── package.json                        # firelock v4.2.0
│   └── vite.config.ts                      # Configuración de compilador Vite
├── backend/                                # Pipelines de ciencia de datos y entrenamiento Python
│   └── ml/                                 # Scripts de generación sintética y validación
├── DOCUMENTACION_CIENTIFICA_Y_MODULAR_FIRELOCK.md # Documentación teórica maestra
├── Dockerfile                              # Despliegue inmutable zero-reinstall
├── vercel.json                             # Configuración cloud serverless
├── package.json                            # Scripts del monorepo
└── README.md                               # Este documento
```

---

## 👥 Equipo y Atribución Científica

* **Desarrollado para:** NASA Space Apps Challenge 2026.
* **Fuentes de Datos Oficiales:**
  * NASA Physical Sciences Informatics (PSI) Database.
  * NASA Technical Reports Server (NTRS).
  * NASA Glenn Research Center (GRC) Combustion Science Branch.
  * JAXA Kibo FLARE (Flammability Limits at Reduced-gravity Experiment).
  * National Fire Protection Association (NFPA 750 Standards Council).
