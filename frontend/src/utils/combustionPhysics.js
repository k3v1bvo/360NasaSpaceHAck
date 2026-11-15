// Physical simulation constants and calculations for Microgravity Combustion
// Based on NASA Glenn Research Center, BASS, FLEX, ACME, and CIR experiments

export const FUEL_PROPERTIES = {
  heptane_droplet: {
    id: 'heptane_droplet',
    name: 'Gota de n-Heptano (NASA FLEX)',
    category: 'Droplet Combustion',
    description: 'Combustión clásica de gotas líquidas suspendidas en fibra de sílice. Modelo d² de evaporación esférica.',
    baseTemp: 1320, // °C
    baseRadius: 28, // mm visual radius
    burnRateConstant: 0.85, // mm²/s (K)
    sootTendency: 0.35,
    flameColor: 'blue_sphere',
    hazardRating: 'Medium',
    defaultO2Limit: 13.5, // %
    materialsRisk: 'Salpicadura de micro-gotas si hay turbulencia súbita',
    coolFlameCapable: true,
  },
  pmma_solid: {
    id: 'pmma_solid',
    name: 'Polímero PMMA / Plexiglás (NASA BASS)',
    category: 'Solid Fuel Surface Flame',
    description: 'Polimetilmetacrilato utilizado en ventanas y paneles presurizados de módulos espaciales. Pirólisis superficial.',
    baseTemp: 1480,
    baseRadius: 36,
    burnRateConstant: 0.65,
    sootTendency: 0.60,
    flameColor: 'blue_yellow_rim',
    hazardRating: 'High',
    defaultO2Limit: 14.8,
    materialsRisk: 'Goteo de polímero fundido flotante en gravedad cero',
    coolFlameCapable: false,
  },
  polyethylene_wire: {
    id: 'polyethylene_wire',
    name: 'Cableado Eléctrico (Aislamiento PE)',
    category: 'Electrical Harness Fire',
    description: 'Aislamiento de arnés eléctrico espacial sobre conductor de cobre. Propagación lenta pero altamente tóxica.',
    baseTemp: 1250,
    baseRadius: 24,
    burnRateConstant: 0.45,
    sootTendency: 0.75,
    flameColor: 'orange_smolder',
    hazardRating: 'Critical',
    defaultO2Limit: 15.0,
    materialsRisk: 'Ignición en cascada de bahías aviónicas y gas CO denso',
    coolFlameCapable: true,
  },
  nomex_fabric: {
    id: 'nomex_fabric',
    name: 'Tejido Nomex / Kevlar (Traje EVA)',
    category: 'Flame-Resistant Textile',
    description: 'Material aeroespacial ignífugo de trajes espaciales. Autoextinguible en O₂ terrestre, pero arde en atmósferas enriquecidas.',
    baseTemp: 1100,
    baseRadius: 20,
    burnRateConstant: 0.25,
    sootTendency: 0.20,
    flameColor: 'faint_blue',
    hazardRating: 'Low-Medium',
    defaultO2Limit: 26.5, // Burns only above 26% O2
    materialsRisk: 'Carbonización superficial protectora; falla catastrófica con O₂ > 30%',
    coolFlameCapable: false,
  },
  li_ion_battery: {
    id: 'li_ion_battery',
    name: 'Celda Li-Ion 18650 (Fuga Térmica)',
    category: 'Energy Storage Thermal Runaway',
    description: 'Batería de herramientas y trajes de astronautas. Descomposición exotérmica con chorro direccional de gas tóxico (HF).',
    baseTemp: 1750,
    baseRadius: 48,
    burnRateConstant: 1.40,
    sootTendency: 0.90,
    flameColor: 'violent_jet',
    hazardRating: 'Extreme',
    defaultO2Limit: 10.0, // Can self-sustain with internal oxidizers!
    materialsRisk: 'Eyección de partículas a 1200°C y gas fluoruro de hidrógeno (HF)',
    coolFlameCapable: false,
  },
  candle_wax: {
    id: 'candle_wax',
    name: 'Núcleo de Cera de Parafina (STS Shuttle)',
    category: 'Historic Flight Demonstration',
    description: 'Experimento histórico en el transbordador espacial y la estación Mir. Llama esférica casi invisible.',
    baseTemp: 980,
    baseRadius: 18,
    burnRateConstant: 0.30,
    sootTendency: 0.15,
    flameColor: 'pure_blue_dome',
    hazardRating: 'Low',
    defaultO2Limit: 14.0,
    materialsRisk: 'Acumulación invisible de monóxido de carbono por falta de penacho',
    coolFlameCapable: true,
  },
}

export const NASA_SCENARIOS = [
  {
    id: 'iss_flex_nominal',
    name: 'ISS Destiny Lab - Gota Quiescente (FLEX Nominal)',
    description: 'Condición científica estándar en el CIR (Combustion Integrated Rack). Cero gravedad pura, sin corrientes forzadas.',
    gravity: 0,
    oxygen: 21,
    airflow: 0,
    pressure: 101.3,
    fuelId: 'heptane_droplet',
    activeExtinguisher: null,
    expectedRegime: 'Esfera azul perfecta, enfriamiento radiativo estable.',
  },
  {
    id: 'iss_eclss_draft',
    name: 'Fuga de Aire Forzado ECLSS en Módulo ISS',
    description: 'La ventilación de soporte vital (6 cm/s) empuja oxígeno fresco hacia un foco de cableado aviónico.',
    gravity: 0,
    oxygen: 21,
    airflow: 7.5,
    pressure: 101.3,
    fuelId: 'polyethylene_wire',
    activeExtinguisher: null,
    expectedRegime: 'Ruptura de simetría esférica, penacho advectivo peligroso.',
  },
  {
    id: 'apollo1_flashover',
    name: 'Tragedia Apolo 1 - Atmósfera Hiperóxica 100% O₂',
    description: 'Simulación del ambiente de prueba en plataforma de 1967. O₂ puro con sobrepresión. Riesgo extremo de ignición fulminante.',
    gravity: 1.0,
    oxygen: 100,
    airflow: 5,
    pressure: 115.0,
    fuelId: 'pmma_solid',
    activeExtinguisher: null,
    expectedRegime: 'Flashover instantáneo, llamarada voraz fuera de control.',
  },
  {
    id: 'orion_exploration',
    name: 'Nave Orion / Lunar Gateway (Atmósfera de Exploración)',
    description: 'Atmósfera diseñada para evitar descompresión rápida en caminatas lunares: 34% O₂ a presión reducida de 56 kPa.',
    gravity: 0,
    oxygen: 34,
    airflow: 2.0,
    pressure: 56.0,
    fuelId: 'nomex_fabric',
    activeExtinguisher: null,
    expectedRegime: 'Presión baja reduce densidad, pero O₂ elevado acelera combustión.',
  },
  {
    id: 'moon_artemis_base',
    name: 'Base Lunar Artemis (Gravedad Parcial 1/6 g)',
    description: 'Gravedad lunar (0.166 g). La convección boyante es débil pero no nula; llama ovoide semiesférica.',
    gravity: 0.166,
    oxygen: 21,
    airflow: 1.0,
    pressure: 95.0,
    fuelId: 'pmma_solid',
    activeExtinguisher: null,
    expectedRegime: 'Convección mixta. Comportamiento transicional entre Tierra y Espacio.',
  },
  {
    id: 'battery_runaway_emergency',
    name: 'Emergencia de Fuga Térmica Li-Ion en Microgravedad',
    description: 'Falla interna de batería en esclusa Quest de la ISS. Reacción química exotérmica autoalimentada.',
    gravity: 0,
    oxygen: 21,
    airflow: 12.0,
    pressure: 101.3,
    fuelId: 'li_ion_battery',
    activeExtinguisher: null,
    expectedRegime: 'Chorro de alta temperatura con eyección de microesferas incandescentes.',
  },
]

/**
 * Calculates real-time telemetry, dimensionless numbers, and safety status
 */
export function calculateCombustionState(params) {
  const {
    gravity, // 0 to 2 g
    oxygen, // 10 to 100 %
    airflow, // 0 to 50 cm/s
    pressure, // 0 to 120 kPa
    fuelId,
    activeExtinguisher, // null, 'co2', 'mist', 'novec', 'depressurize'
    isIgnited = true,
  } = params

  const fuel = FUEL_PROPERTIES[fuelId] || FUEL_PROPERTIES.heptane_droplet

  if (!isIgnited || pressure < 15 || (activeExtinguisher === 'depressurize')) {
    return {
      status: 'EXTINGUISHED',
      level: 'NOMINAL',
      levelColor: 'emerald',
      flameTempC: 22,
      flameRadiusMm: 0,
      radiantFluxKw: 0,
      coPpm: 12,
      co2Ppm: 450,
      sootFraction: 0,
      grashofNumber: 0,
      pecletNumber: 0,
      isCoolFlame: false,
      flameActive: false,
      alerts: [
        {
          type: 'info',
          title: pressure < 15 ? 'CÁMARA AL VACÍO' : 'SIN IGNICIÓN ACTIVA',
          msg: pressure < 15 
            ? 'La despresurización total (< 15 kPa) ha eliminado la presencia de oxidante comburente.' 
            : 'El sistema se encuentra en estado inerte y seguro.',
        },
      ],
    }
  }

  // Extinguisher suppression factors
  let suppressionFactor = 1.0
  let isQuenched = false
  if (activeExtinguisher === 'co2') {
    suppressionFactor = 0.35
  } else if (activeExtinguisher === 'mist') {
    suppressionFactor = 0.20
  } else if (activeExtinguisher === 'novec') {
    suppressionFactor = 0.05
    isQuenched = true
  }

  // Check if oxygen is below the fuel's extinction limit
  const effectiveO2 = oxygen * (pressure / 101.3) * suppressionFactor
  if (effectiveO2 < fuel.defaultO2Limit && fuel.id !== 'li_ion_battery') {
    isQuenched = true
  }

  // Dimensionless numbers
  // Grashof Number Gr = g * beta * (Tf - T_inf) * L^3 / nu^2
  // For microgravity, Gr ~ 0
  const deltaT = Math.max(10, fuel.baseTemp - 25)
  const grashofNumber = (gravity * 9.81 * (1 / 300) * deltaT * 0.001) / (1.5e-5 * 1.5e-5) * 1e-4

  // Peclet Number Pe = v_draft * L / alpha
  const pecletNumber = (airflow * 0.01 * (fuel.baseRadius * 0.001)) / 2.2e-5

  // Flame elongation ratio due to buoyancy and draft
  // In 0g with no draft: spherical (aspect ratio ~ 1.0)
  // In 1g: teardrop (aspect ratio ~ 2.5 - 3.8)
  const elongationBuoyancy = 1.0 + gravity * 1.85
  const elongationDraft = 1.0 + (airflow / 15) * 1.4
  const flameAspectRatio = Math.max(1.0, elongationBuoyancy * (1 + (airflow / 30)))

  // Temperature calculations
  let flameTempC = fuel.baseTemp * (0.65 + (oxygen / 100) * 0.45) * (pressure / 101.3) ** 0.15
  flameTempC *= suppressionFactor

  // Microgravity flames are cooler because of absence of buoyant compression and high radiative loss
  if (gravity < 0.05) {
    flameTempC *= 0.88
  }

  // Flame radius (in 0g, radius is larger than 1g because boundary layer is thick and diffusion-limited)
  let flameRadiusMm = fuel.baseRadius * (gravity < 0.05 ? 1.4 : 1.0) * (oxygen / 21) ** 0.35
  flameRadiusMm *= suppressionFactor

  // Radiative Heat Flux (kW/m²) - Stefan Boltzmann approx
  const T_kelvin = flameTempC + 273.15
  const radiantFluxKw = Math.max(0.1, (5.67e-8 * (T_kelvin ** 4) * (0.15 + fuel.sootTendency * 0.35) * 1e-3).toFixed(2))

  // Toxic Gases
  const coPpm = Math.round(
    15 + (fuel.sootTendency * 120 + (1 - oxygen / 100) * 80) * (flameTempC / 1000) * (pressure / 101.3)
  )
  const co2Ppm = Math.round(450 + (oxygen / 21) * 850 * (flameRadiusMm / 20))
  const sootFraction = Math.min(1.0, ((fuel.sootTendency * (gravity > 0.3 ? 1.5 : 0.4) * (oxygen / 21)) / 1.5)).toFixed(3)

  // Cool Flame check: in 0g with heptane or candle at low O2, a quasi-steady cool flame can persist at 400-600°C!
  const isCoolFlame = fuel.coolFlameCapable && gravity < 0.05 && oxygen < 16 && !isQuenched

  if (isCoolFlame) {
    flameTempC = 460
    flameRadiusMm = fuel.baseRadius * 1.6
  }

  // Safety level classification
  let level = 'NOMINAL'
  let levelColor = 'emerald'
  const alerts = []

  if (isQuenched) {
    level = 'NOMINAL'
    levelColor = 'emerald'
    alerts.push({
      type: 'success',
      title: 'LLAMA EXTINGUIDA / CONFINADA',
      msg: 'La concentración oxidante ha caído por debajo del Límite de Inflamabilidad Crítica (NASA STD-6001).',
    })
  } else if (oxygen > 35 || fuel.id === 'li_ion_battery' || flameTempC > 1650) {
    level = 'CRITICAL'
    levelColor = 'red'
    if (oxygen > 35) {
      alerts.push({
        type: 'danger',
        title: '¡PELIGRO DE FLASHOVER HIPERÓXICO!',
        msg: `Concentración de O₂ (${oxygen}%) en umbral catastrófico. La velocidad de propagación de llama excede la capacidad de evacuación de calor del mamparo.`,
      })
    }
    if (fuel.id === 'li_ion_battery') {
      alerts.push({
        type: 'danger',
        title: 'FUGA TÉRMICA AUTOALIMENTADA',
        msg: 'La descomposición del electrolito libera oxígeno interno y fluoruro de hidrógeno (HF). El agente limpio Novec 1230 o niebla fina es requerido.',
      })
    }
    if (airflow > 15) {
      alerts.push({
        type: 'danger',
        title: 'PROPAGACIÓN CONVECTIVA ACELERADA',
        msg: `Flujo de aire (${airflow} cm/s) alimenta y arrastra rescoldos incandescentes por los ductos de ventilación ECLSS.`,
      })
    }
  } else if (flameTempC > 1300 || airflow > 8 || gravity > 0.8) {
    level = 'WARNING'
    levelColor = 'amber'
    alerts.push({
      type: 'warning',
      title: 'CONDICIÓN TÉRMICA ELEVADA',
      msg: 'Flujo radiante en aumento. Riesgo de pirólisis secundaria en componentes adyacentes de la cabina.',
    })
    if (gravity < 0.05 && airflow < 2) {
      alerts.push({
        type: 'warning',
        title: 'PELIGRO STEALTH: DETECTORES CIEGOS',
        msg: 'En microgravedad pura sin ventilación, el humo no sube. Los detectores de techo no son activados a pesar de la combustión activa.',
      })
    }
  } else {
    level = 'CAUTION'
    levelColor = 'cyan'
    alerts.push({
      type: 'info',
      title: 'COMBUSTIÓN ESTABLE DIFUSIVA',
      msg: 'Régimen de llama esférica laminar dominado por difusión molecular. Producción de CO₂ constante en capullo circundante.',
    })
  }

  return {
    status: isQuenched ? 'EXTINGUISHED' : 'BURNING',
    level,
    levelColor,
    flameTempC: Math.round(flameTempC),
    flameRadiusMm: Math.round(flameRadiusMm),
    radiantFluxKw,
    coPpm,
    co2Ppm,
    sootFraction,
    grashofNumber: grashofNumber.toExponential(2),
    pecletNumber: pecletNumber.toFixed(2),
    flameAspectRatio: flameAspectRatio.toFixed(2),
    isCoolFlame,
    flameActive: !isQuenched,
    alerts,
    fuel,
  }
}
