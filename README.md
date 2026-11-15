# 🛰️ NASA IGNIS-0G // Microgravity Combustion & Spacecraft Fire Safety Simulator
### *NASA Space Apps Challenge 2026 — Desafío Oficial #10: Combustion in Microgravity AI Dashboard*

![NASA ISS CIR](https://img.shields.io/badge/NASA-Space_Apps_Challenge_2026-0B3D91?style=for-the-badge&logo=nasa)
![React 19](https://img.shields.io/badge/React-19.0.0-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite 6](https://img.shields.io/badge/Vite-6.1.0-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E)
![TailwindCSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

> **Reto Oficial NASA:** [*Combustion in Microgravity AI Dashboard*](https://www.spaceappschallenge.org)  
> **Objetivo:** Desarrollar un panel interactivo con inteligencia artificial que resuma e interprete investigaciones de combustión en microgravedad para mejorar la seguridad contra incendios en naves espaciales.

---

## 🎯 Descripción del Proyecto

En el entorno cerrado de una nave espacial (la Estación Espacial Internacional, el módulo lunar Artemis o la nave Orion hacia Marte), un incendio es una de las emergencias más catastróficas imaginables. La ausencia de gravedad altera radicalmente la física del fuego al anular el empuje boyante ($Gr \to 0$), transformando la llama en una **esfera azul dominada por difusión molecular**.

**NASA IGNIS-0G** es un simulador físico interactivo y centro de comando de telemetría que permite a ingenieros aeroespaciales y tripulantes predecir el comportamiento del fuego, simular corrientes de ventilación forzada y evaluar contramedidas de supresión en tiempo real.

---

## 🔬 Principios Físicos de Combustión Espacial

| Parámetro | En la Tierra ($1.0\ g$) | En Microgravedad ($0.0\ g$ - ISS CIR) |
| :--- | :--- | :--- |
| **Mecanismo de Transporte** | Convección Natural Boyante dominante ($Gr \gg 1$) | Difusión Molecular Isotrópica pura ($Gr \approx 0$) |
| **Morfología de la Llama** | Lágrima alargada convectiva | Esfera simétrica azul chemiluminiscente |
| **Color y Emisión** | Amarillo/Naranja brillante (incandescencia de hollín) | Azul/Cian pálido (radicales excitados $CH^*$ y $C_2^*$) |
| **Comportamiento del Humo** | Ascenso vertical rápido hacia el techo | Estancamiento esférico; ceguera en detectores de techo |
| **Régimen de Llama Fría** | Raras veces observado a 1 atm | Fenómeno cuasi-estacionario a $400-500^\circ\text{C}$ (*FLEX*) |

---

## ⚙️ Características Principales

1. **Cámara de Combustión Interactiva en Tiempo Real (`CombustionChamber.jsx`)**
   - Renderizado físico por partículas acelerado en Canvas 2D/GPU.
   - Transición dinámica y continua entre esfera azul de microgravedad ($0g$) y llama boyante elongada ($1g$ / $2g$).
   - Reacción a vectores de ventilación forzada ECLSS y tiro de cabina.
   - Sonda criométrica interactiva con lectura de isotermas e isolíneas térmicas.

2. **6 Materiales Combustibles Espaciales Calibrados**
   - **Gota de n-Heptano (NASA FLEX):** Evaporación $d^2$ y formación de llamas frías.
   - **Polímero PMMA / Plexiglás (NASA BASS):** Pirólisis superficial para mamparos y ventanas presurizadas.
   - **Aislamiento PE de Cableado Eléctrico:** Cortocircuito y propagación por arneses aviónicos.
   - **Tejido Nomex / Kevlar de Traje EVA:** Comportamiento ignífugo y quema acelerada con $O_2 > 28\%$.
   - **Celda Li-Ion 18650 en Fuga Térmica:** Chorro de alta velocidad y emisión de fluoruro de hidrógeno ($HF$).
   - **Cera de Parafina:** Experimento de llama histórica en STS Shuttle y estación Mir.

3. **Matriz de Alerta y Seguridad HUD (`HazardAlertHUD.jsx`)**
   - Cálculo dinámico de probabilidad de **Flashover** en función de $O_2\%$, temperatura y flujo radiante.
   - Alerta de **Peligro Stealth**: Ceguera de detectores fotoeléctricos por falta de tiro natural.
   - Detección de **Llamas Frías Cuasi-estacionarias** a $400^\circ\text{C}$.
   - Código de Alerta Master con sirena sonora espacial y protocolos de evacuación.

4. **Suite de Supresión y Contramedidas Espaciales (`SuppressionControls.jsx`)**
   - 🧯 Inyección de $CO_2$ a presión.
   - 💧 Niebla fina de agua (*NASA Fine Water Mist Fog Nozzle*).
   - 🧪 Agente limpio Novec 1230 (capturador de radicales libres).
   - 🌀 Paro de emergencia de ventilación ECLSS.
   - 🚀 Venteo total de cabina al vacío espacial ($0\ \text{kPa}$).

5. **Asistente IA y Repositorio de Investigaciones NASA (`AIResearchAssistant.jsx`)**
   - Síntesis científica continua de números adimensionales ($Gr$, $Pe$, $Le$).
   - Biblioteca de papers de misiones de vuelo (**NASA BASS**, **FLEX**, **SoFIE**, **NASA-STD-6001B**).
   - Motor de consultas científicas interactivo.

---

## 🛠️ Instalación y Desarrollo Local

```bash
# 1. Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>
cd microgravedd

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo Vite
npm run dev

# 4. Compilar para producción
npm run build
```

---

## 🚀 Despliegue en Vercel

El proyecto está configurado con `vercel.json` nativo para Vite:

```bash
# Con la CLI de Vercel instalada:
vercel deploy --prod
```

O conectando el repositorio directamente desde el panel de [Vercel](https://vercel.com/new).

---

## 📜 Créditos y Referencias Científicas

* **NASA Glenn Research Center (GRC)** — *Combustion Integrated Rack (CIR)* a bordo de la Estación Espacial Internacional.
* **NASA BASS** (*Burning and Suppression of Solids*).
* **NASA FLEX** (*Flame Extinguishment Experiment*).
* **NASA-STD-6001B** — *Flammability, Odor, Offgassing, and Compatibility Requirements and Test Procedures for Materials in Environments that Support Combustion*.
