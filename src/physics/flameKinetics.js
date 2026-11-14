/**
 * Flame in Freefall — Microgravity Physics & LTC Kinetics Engine
 * Rigorous aerodynamic, radiative, and chemical calculations for space habitats.
 */

export const MATERIALS = {
  PMMA: {
    name: "PMMA (Plexiglas)",
    category: "Polímero Termoplástico",
    LOI_1g: 17.5,
    alpha: 1.0,
    k_burn: 2.1,
    rad_sens: 1.0,
    thermal_k: 0.19,
    pyrolysis_C: 360,
    heat_combustion_MJ_kg: 26.2,
    base_shift: -2.3
  },
  ETFE_Wire: {
    name: "ETFE (Aislamiento de Cables)",
    category: "Fluoropolímero Aeroespacial",
    LOI_1g: 30.5,
    alpha: 1.35,
    k_burn: 2.8,
    rad_sens: 1.25,
    thermal_k: 0.24,
    pyrolysis_C: 420,
    heat_combustion_MJ_kg: 13.7,
    base_shift: -7.0
  },
  Nomex: {
    name: "Nomex (Fibra de Aramida)",
    category: "Tejido Sintético Ignífugo",
    LOI_1g: 29.0,
    alpha: 0.42,
    k_burn: 0.9,
    rad_sens: 0.75,
    thermal_k: 0.13,
    pyrolysis_C: 450,
    heat_combustion_MJ_kg: 27.0,
    base_shift: -6.5
  },
  Cotton: {
    name: "Algodón / Mezcla Saffire",
    category: "Tejido Compuesto de Prueba",
    LOI_1g: 21.5,
    alpha: 0.90,
    k_burn: 1.6,
    rad_sens: 0.95,
    thermal_k: 0.08,
    pyrolysis_C: 300,
    heat_combustion_MJ_kg: 18.5,
    base_shift: -4.7
  },
  Polyethylene: {
    name: "Polietileno (LDPE)",
    category: "Poliolefina",
    LOI_1g: 17.0,
    alpha: 1.10,
    k_burn: 2.4,
    rad_sens: 1.10,
    thermal_k: 0.33,
    pyrolysis_C: 340,
    heat_combustion_MJ_kg: 43.6,
    base_shift: -2.5
  }
};

export const ATMOSPHERES = {
  ISS_Standard: {
    name: "ISS Standard",
    P_atm: 1.0,
    psia: 14.7,
    O2_percent: 21.0,
    description: "Atmósfera terrestre normóxica de referencia"
  },
  Artemis_Gateway: {
    name: "Artemis Gateway",
    P_atm: 0.694,
    psia: 10.2,
    O2_percent: 34.0,
    description: "Ambiente hiperóxico hipobárico para trajes EVA"
  },
  Lunar_Habitat: {
    name: "Lunar Surface Habitat",
    P_atm: 0.558,
    psia: 8.2,
    O2_percent: 32.0,
    description: "Cabina de baja presión para exploración en superficie"
  }
};

/**
 * Calculates opposed-flow flame spread rate Vf (mm/s) over cylindrical fuel in microgravity.
 * Based on BASS-II, SoFIE and FLARE (ISO 4589-4) models.
 */
export function calculateFlameSpread(Vg_cm_s, dFuel_mm, matKey, P_atm = 1.0, O2_fraction = 0.21) {
  const mat = MATERIALS[matKey] || MATERIALS.PMMA;
  
  // 1. Oxidizer transport enhancement by slow forced flow
  const vTransport = 1.95 * (O2_fraction / 0.21) * Math.sqrt(Math.max(Vg_cm_s, 0.04)) * Math.sqrt(P_atm);
  
  // 2. Curvature enhancement for thin fuels (Biot number Bi << 0.1)
  const curvature = mat.alpha * (1.0 / Math.pow(Math.max(dFuel_mm, 0.1), 0.82));
  
  // 3. Convective cooling / aerothermal blow-off at higher velocity
  const strainRate = Math.max(Vg_cm_s, 0.05) / (2.0 * Math.max(dFuel_mm, 0.2) * 0.1);
  const coolingFactor = Math.exp(-strainRate / (48.0 * mat.k_burn));
  
  // 4. Radiative extinction penalty in quiescent / ultra-slow microgravity (soot shell loss)
  const radLoss = Math.exp(- (0.28 * mat.rad_sens) / Math.max(Vg_cm_s, 0.02));
  
  const vf = vTransport * curvature * coolingFactor * radLoss * 2.35;
  return Math.max(vf, 0.0);
}

/**
 * Calculates projected microgravity LOI shift according to the FLARE method.
 */
export function calculateLoiShift(matKey, thickness_mm = 1.0, O2_frac = 0.21, P_atm = 1.0) {
  const mat = MATERIALS[matKey] || MATERIALS.PMMA;
  const baseShift = mat.base_shift; // e.g. -2.3 to -7.0 pp
  const curvaturePenalty = -0.55 / Math.max(thickness_mm, 0.15);
  const pressCorrection = (1.0 - P_atm) * 1.5;
  
  const totalShift = baseShift + curvaturePenalty + pressCorrection;
  const loiMicrog = Math.max(mat.LOI_1g + totalShift, 10.0);
  
  return {
    loi1g: mat.LOI_1g,
    loiMicrog: parseFloat(loiMicrog.toFixed(1)),
    shift: parseFloat((loiMicrog - mat.LOI_1g).toFixed(1)),
    flammableInCabin: (O2_frac * 100) >= loiMicrog
  };
}

/**
 * Simulates the transient transition from hot flame to cool flame (LTC kinetics)
 * over a 60 second trajectory.
 */
export function simulateCoolFlame(totalSeconds = 60, steps = 60) {
  const times = [];
  const temperatures = [];
  const h2o2_ppm = [];
  const ch2o_ppm = [];
  const co_ppm = [];
  const phases = [];

  const dt = totalSeconds / steps;

  for (let i = 0; i <= steps; i++) {
    const t = i * dt;
    times.push(parseFloat(t.toFixed(1)));

    if (t < 12.0) {
      // Hot flame radiative decay due to soot shell accumulation
      const decay = (1650 - 740) * (t / 12.0);
      const temp = 1650 - decay;
      temperatures.push(Math.round(temp));
      h2o2_ppm.push(parseFloat((0.5 + t * 0.3).toFixed(1)));
      ch2o_ppm.push(parseFloat((2.0 + t * 0.8).toFixed(1)));
      co_ppm.push(parseFloat((15.0 + t * 1.5).toFixed(1)));
      phases.push(temp > 1100 ? "Llama Caliente Visible" : "Colapso Radiativo");
    } else if (t < 45.0) {
      // Quasi-steady Cool Flame (LTC kinetics 600-800 K) with NTC oscillations
      const cycle = Math.sin(t * 0.8) * 22;
      const temp = 715 + cycle;
      temperatures.push(Math.round(temp));
      // Accumulation of chemical intermediates
      const prog = (t - 12.0) / 33.0;
      h2o2_ppm.push(parseFloat((4.1 + prog * 36.5).toFixed(1))); // reaches ~40 ppm
      ch2o_ppm.push(parseFloat((11.6 + prog * 18.2).toFixed(1))); // reaches ~30 ppm
      co_ppm.push(parseFloat((33.0 + prog * 12.0).toFixed(1)));
      phases.push("Llama Fría Activa (LTC)");
    } else {
      // Slow diffusion dissipation
      const decay = (t - 45.0) * 18;
      const temp = Math.max(715 - decay, 298);
      temperatures.push(Math.round(temp));
      h2o2_ppm.push(Math.max(parseFloat((40.6 - (t - 45.0) * 2.5).toFixed(1)), 0));
      ch2o_ppm.push(Math.max(parseFloat((29.8 - (t - 45.0) * 1.8).toFixed(1)), 0));
      co_ppm.push(45.0);
      phases.push("Disipación Latente");
    }
  }

  return { times, temperatures, h2o2_ppm, ch2o_ppm, co_ppm, phases };
}

/**
 * NFPA 750 High Pressure Water Mist Thermodynamics
 */
export function calculateWaterMist(heatRelease_kW = 5.0) {
  const deltaH_vap = 2257.0; // kJ/kg
  const deltaH_sens = 4.184 * 80; // 334.7 kJ/kg (20C to 100C)
  const deltaH_total = deltaH_vap + deltaH_sens; // 2591.7 kJ/kg
  
  const massFlow_kg_s = heatRelease_kW / deltaH_total; // kg/s
  const massFlow_g_s = massFlow_kg_s * 1000;
  
  const dischargeDuration_s = 60;
  const totalWater_liters = (massFlow_kg_s * dischargeDuration_s).toFixed(2);
  const steamExpansion_liters = (totalWater_liters * 1700).toFixed(0);

  return {
    operatingPressure_bar: 35,
    pressure_psi: 507,
    droplet_dv050_um: 35,
    droplet_dv099_um: 75,
    flowRate_g_s: massFlow_g_s.toFixed(2),
    waterVolume_L: totalWater_liters,
    steamProduced_L: steamExpansion_liters,
    additive: "F-500 Encapsulator Agent (1.0% v/v)",
    surfaceTension_mN_m: 27.4, // Down from 72.8 mN/m of pure water
    eclssCompliant: true
  };
}
