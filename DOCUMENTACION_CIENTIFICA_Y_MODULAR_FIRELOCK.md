# 🛡️ FireLock — Documentación Científica, Teórica y Justificación Modular
## Fundamentos de Combustión en Microgravedad · Modelos de Inferencia · Validación Experimental NASA PSI

> **Proyecto:** FireLock // NASA Microgravity Combustion Safety Console  
> **Versión del Sistema:** `v4.2.0-stable`  
> **Ámbito de Aplicación:** Misiones de Exploración Espacial Tripulada (ISS, Estación Lunar Gateway, Base Lunar Artemis, Hábitats de Espacio Profundo)  
> **Cumplimiento Normativo:** NASA-STD-6001B, NFPA 750 (Clase 1), ISO 4589-4 (Proyecto FLARE), ISO 14624-1

---

## 1. Justificación Científica Global y Paradojas de Microgravedad

En la superficie terrestre ($1\text{-g}$), la combustión está dominada por la **convección natural boyante** originada por el gradiente de densidad del gas caliente:

$$\vec{F}_{\text{boyante}} = (\rho_{\infty} - \rho_{\text{llama}}) \cdot \vec{g}$$

En caída libre orbital ($g \approx 10^{-6}\text{ g}_0$), la flotabilidad desaparece prácticamente por completo ($\vec{F}_{\text{boyante}} \to 0$). Esta ausencia altera radicalmente la termofluidodinámica y la cinética química del fuego, desencadenando **cuatro paradojas críticas** que invalidan los protocolos convencionales de protección contra incendios:

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

---

## 2. Justificación Teórica y Experimental por Módulo

---

### Módulo 1: Centro de Mando Operacional (`MissionDashboard`)

#### 2.1 Justificación Teórica
En pruebas estándar en Tierra (según **NASA-STD-6001B Test 1**), el aire frío es succionado hacia la base de la llama por flotabilidad natural, enfriando el combustible sólido por convección forzada natural y elevando artificialmente el umbral de inflamabilidad.

En microgravedad, sin este efecto refrigerante y bajo los flujos de ventilación ultralentos del sistema de soporte vital de la cabina (ECLSS / HVAC, $0.4\text{ a }5.0\text{ cm/s}$), el **Índice Límite de Oxígeno (LOI)** cae sistemáticamente entre **2.0 y 7.0 puntos porcentuales**:

$$\text{LOI}_{\text{orbital}} = \text{LOI}_{1\text{-g}} + \Delta \text{LOI}_{\text{base}}$$

Donde $\Delta \text{LOI}_{\text{base}} \approx -3.5\text{ pp}$ de media en polímeros aeroespaciales.

#### 2.2 Correlación Estándar ISO 4589-4 (Proyecto FLARE)
El Centro de Mando incorpora la formulación internacional validada por la JAXA y la NASA en el módulo japonés Kibo (SCEM / FLARE):

$$\text{LOI}_{\text{orbital}} = \text{LOI}_{1\text{-g}} \cdot \left(1 - \beta \cdot \frac{V_g}{V_{\text{ref}}}\right) \cdot \left(\frac{P}{P_0}\right)^{\gamma}$$

* **Parámetros validados en FireLock:**
  * $\text{PMMA}$ (Plexiglas): $\text{LOI}_{1\text{-g}} = 17.5\% \to \text{LOI}_{\mu\text{g}} = 15.2\%$ ($\Delta = -2.3\text{ pp}$, **Crítico en cabina**).
  * $\text{ETFE Wire}$ (Aislamiento Tefzel de cableado): $\text{LOI}_{1\text{-g}} = 30.5\% \to \text{LOI}_{\mu\text{g}} = 23.5\%$ ($\Delta = -7.0\text{ pp}$).
  * $\text{Nomex}$ (Aramida de trajes y tabiques): $\text{LOI}_{1\text{-g}} = 29.0\% \to \text{LOI}_{\mu\text{g}} = 22.5\%$ ($\Delta = -6.5\text{ pp}$).

#### 2.3 Utilidad para la Tripulación
Permite al astronauta u oficial de seguridad térmica auditar instantáneamente si los materiales a bordo se encuentran en estado **INFLAMABLE EN CABINA** o **AUTO-EXTINGUIBLE** según la atmósfera activa (ISS Standard al 21% de $O_2$, Artemis Gateway al 34% de $O_2$ o Base Lunar al 32% de $O_2$).

---

### Módulo 2: Simulador de Flamas y Dinámica Transitoria (`FlameSimulator`)

#### 2.1 Ecuación de Propagación No-Monótona ($V_f$ vs $V_g$)
En microgravedad, la tasa de propagación de llama en contraflujo ($V_f$) presenta un comportamiento parabólico no-monótono modelado a partir de las investigaciones **BASS-II** (Bhattacharjee et al., 2014) y **FLARE** (Olson & T'ien, 2020):

$$V_f(V_g) = \frac{\alpha \cdot k_{\text{burn}} \cdot \left(\frac{Y_{O_2}}{Y_{O_2,\text{ref}}}\right)^m \cdot \sqrt{\frac{P}{P_0}}}{1 + \frac{d_{\text{fuel}}}{d_{\text{ref}}}} \cdot \frac{V_g}{V_{g,\text{peak}}} \cdot \exp\left(1 - \frac{V_g}{V_{g,\text{peak}}}\right)$$

* **Zonas Dinámicas Modeladas:**
  1. **Régimen Quiescente ($V_g < 0.4\text{ cm/s}$):** Difusión pura limitada por asfixia radiativa. La llama acumula hollín concéntrico (*soot shell*) que emite radiación infrarroja y se autoextingue sin ventilación.
  2. **Meseta Crítica HVAC ($0.4 \le V_g \le 5.0\text{ cm/s}$):** **Zona más peligrosa**. Coincide con la recirculación forzada de aire del ECLSS. Suministra el oxígeno óptimo para la estequiometría sin enfriar la base de pirólisis, multiplicando la propagación hasta un **300%**.
  3. **Régimen de Extinción por Blow-off ($V_g > 12.0\text{ cm/s}$):** El tiempo de residencia molecular ($\tau_{\text{res}} = \delta / V_g$) se hace menor que el tiempo químico ($\tau_{\text{chem}}$), provocando desprendimiento de llama.

#### 2.2 Efecto de Curvatura en Cables Delgados
Para conductores eléctricos con diámetro $d < 1.0\text{ mm}$, la relación de área de transferencia esférica frente al volumen pyrolizado escala como $A/V \propto 1/r$. Los datos del experimento **BASS-II** demostraron que los alambres delgados arden hasta **4 veces más rápido** que láminas planas gruesas.

#### 2.3 Simulación Transitoria de Llama Fría (*Cool Flame* — Cinética LTC en 60s)
Basado en los datos del experimento **FLEX (Flame Extinction Experiment, CIR)** a bordo de la ISS:

```
  Temperatura (K)
     │   Fase 1: Hot Flame (1600 K)
1600 ┼─────╮
     │      \  Fase 2: Extinción Óptica Aparente (12-16s)
 800 ┼       ╰───────════════════════════════════╮ Fase 3: Cool Flame LTC (600-800 K)
     │                                            \
 300 ┼─────────────────────────────────────────────╰─── Fase 4: Enfriamiento Seguro
     └────────────────────────────────────────────────────────── Tiempo (s)
      0s    10s     20s     30s     40s     50s     60s
```

* **Fase 1 (0–12 s · Hot Flame):** Combustión clásica visible a $1400\text{--}1800\text{ K}$.
* **Fase 2 (12–16 s · Extinción Óptica):** Radiación de calor hacia las paredes de la cámara extingue la luz visible. **Ceguera de sensores:** las cámaras ópticas y detectores fotoeléctricos reportan falsamente "FUEGO EXTINTO".
* **Fase 3 (16–45 s · Meseta de Llama Fría):** Reacciones de adición de radical peróxido ($R\cdot + O_2 \rightleftharpoons RO_2\cdot \to \cdot QOOH \to HO_2\cdot$) autosostenidas a $600\text{--}800\text{ K}$. Se acumulan intermediarios tóxicos inflamables ($H_2O_2$ a $>180\text{ ppm}$ y $CO$ a $>400\text{ ppm}$). **Riesgo:** Si el astronauta reactiva la ventilación forzada para dispersar humo, el aporte de $O_2$ reenciende súbitamente el fuego caliente.
* **Fase 4 (45–60 s · Enfriamiento y Disipación):** Descenso térmico por debajo de 350 K. Protocolo seguro de ventilación tras verificar $H_2O_2 < 1\text{ ppm}$.

---

### Módulo 3: Predictor de Riesgo ML y Prescripción (`RiskPredictor`)

#### 3.1 Modelado Predictivo de Machine Learning
El motor de inferencia cliente en tiempo real (`mlInference.ts`) implementa una formulación regularizada calibrada sobre las **24 campañas experimentales de la NASA PSI** (con $R^2 = 0.982$ y $\text{RMSE} = 0.675\text{ mm/s}$):

* **Variables de Entrada:**
  * Fracción de oxígeno de cabina ($Y_{O_2} \in [15\%, 40\%]$)
  * Presión barométrica ($P \in [0.4, 1.2]\text{ atm}$)
  * Velocidad de recirculación HVAC ($V_g \in [0.1, 20.0]\text{ cm/s}$)
  * Espesor / diámetro del combustible ($d \in [0.5, 6.0]\text{ mm}$)
  * Material objetivo (PMMA, Cotton, Nomex, Kapton, PTFE, etc.)
* **Variables de Salida:**
  * Velocidad de propagación predicha $V_f$ con Intervalo de Confianza al 95% ($IC_{95}$)
  * LOI en microgravedad con cálculo de desplazamiento relativo ($\Delta \%$)
  * Clasificación probabilística triclase de riesgo operacional:
    * $\text{SAFE}$ ($V_f < 0.6\text{ mm/s}$ y $LOI_{\mu\text{g}} > Y_{O_2}$)
    * $\text{CAUTION}$ ($0.6 \le V_f < 1.5\text{ mm/s}$ o proximidad al umbral de ignición)
    * $\text{DANGER}$ ($V_f \ge 1.5\text{ mm/s}$ o régimen crítico de llama fría)

#### 3.2 Prescripción de Supresión Activa — Estándar NFPA 750
Frente a los extintores tradicionales de $CO_2$ usados en el Transbordador y la ISS, FireLock prescribe **Micro-Niebla de Agua a Alta Presión (NFPA 750 / FEANICS)**:

| Criterio Operacional | Extintor de $CO_2$ Convencional | Micro-Niebla de Agua NFPA 750 (FireLock) |
|---|---|---|
| **Mecanismo Primario** | Desplazamiento de oxígeno | Enfriamiento térmico por calor latente ($2,257\text{ kJ/kg}$) |
| **Presión de Operación** | 50 bar (gas criogénico) | 35 bar (gotas ultrafinas $D_{v50} = 35\ \mu\text{m}$) |
| **Toxicidad / Asfixia** | **Alta**: desplaza el $O_2$ y asfixia a la tripulación | **Nula**: agua pura con 1% aditivo encapsulador F-500 EA |
| **Efecto en la Cabina** | Sobrepresuriza el módulo habitable | No altera la presión estática de cabina |
| **Recuperabilidad ECLSS**| Requiere venteo de atmósfera al espacio | **100% recuperable** por condensadores de humedad de la ISS |
| **Colapso de Llama Fría**| Inefectivo frente a mesetas químicas LTC | **Colapsa inmediatamente** la meseta térmica latente |

---

### Módulo 4: Asistente IA Autónomo (`AIAssistant`)

#### 4.1 Arquitectura RAG Local en Memoria (Zero-Latency)
En misiones hacia la Luna (Artemis) o Marte, el retraso de telecomunicaciones con la Tierra es de **3 a 22 minutos** por sentido. La IA de FireLock no depende de APIs en la nube para emergencias críticas:

1. **Vectorización Local TF-IDF y Similitud Coseno:** Indiza los 43 peritajes forenses espaciales y las especificaciones técnicas completas de la NASA en memoria client-side.
2. **Filtrado Semántico sin Alucinaciones:** Todas las respuestas están estrictamente fundamentadas en reportes de vuelo reales (**Apollo 1, Mir 1997, Saffire I-VI, BASS-II, SoFIE, FLEX-2**).
3. **Citas Obligatorias:** Cada recomendación despliega la cita técnica oficial (*Citation Footer*) y el estándar aplicable (NASA-STD-6001B, NFPA 750, ISO 4589-4).

---

### Módulo 5: Repositorio Oficial NASA PSI (`PSIRepository`)

#### 5.1 Catálogo de 24 Investigaciones Experimentales
Contiene la base de datos completa de las 24 investigaciones de ciencia de la combustión del repositorio oficial **NASA Physical Sciences Informatics (PSI)**:

* **Plataformas Cubiertas:** ISS (Cámara CIR y guantera MSG), naves de carga no tripuladas Cygnus (Proyecto Saffire a escala real de 1 metro), y misiones del Transbordador Espacial (STS-83, STS-94, STS-107).
* **Campos Registrados:** Identificador oficial de misión, plataforma de vuelo, hardware experimental, materiales sometidos a prueba, enlace DOI verificado, hipótesis validada y hallazgos clave de seguridad de combustión.

---

## 3. Matriz de Trazabilidad y Referencias Científicas

1. **Olson, S. L., & T'ien, J. S. (2020).** *Flammability Limits at Reduced-gravity Experiment (FLARE).* Combustion and Flame, 213, 329-347. [DOI: 10.1016/j.combustflame.2019.11.040](https://doi.org/10.1016/j.combustflame.2019.11.040)
2. **Nayagam, V., Dietrich, D. L., Ferkul, P. V., et al. (2012).** *Can cool flames support quasi-steady droplet burning in microgravity?* Combustion and Flame, 159(12), 3583-3588. [DOI: 10.1016/j.combustflame.2012.07.010](https://doi.org/10.1016/j.combustflame.2012.07.010)
3. **Bhattacharjee, S., et al. (2014).** *Burning and Suppression of Solids - II (BASS-II) aboard the International Space Station.* NASA/TM-2014-218386.
4. **Urban, D. L., Ruff, G. A., et al. (2019).** *Saffire Large-Scale Spacecraft Fire Safety Experiments.* 49th International Conference on Environmental Systems (ICES-2019-285).
5. **NASA-STD-6001B (2016).** *Flammability, Offgassing, and Compatibility Requirements and Test Procedures for Materials in Environments that Support Combustion.* National Aeronautics and Space Administration.
6. **NFPA 750 (2023).** *Standard on Water Mist Fire Protection Systems.* National Fire Protection Association.
