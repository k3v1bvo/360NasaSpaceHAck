export interface SpaceMaterial {
  name: string;
  category: string;
  LOI_1g: number;
  alpha: number;
  k_burn: number;
  rad_sens: number;
  thermal_k: number;
  pyrolysis_C: number;
  heat_combustion_MJ_kg: number;
  base_shift: number;
}

export interface AtmospherePreset {
  name: string;
  P_atm: number;
  psia: number;
  O2_percent: number;
  description: string;
}

export type MaterialKey = 'PMMA' | 'Cotton' | 'Nomex' | 'Kapton' | 'PTFE' | 'ETFE_Wire' | 'Polyethylene';
export type AtmosphereKey = 'ISS_Standard' | 'Artemis_Gateway' | 'Lunar_Habitat';

export type RiskLevel = 'SAFE' | 'CAUTION' | 'DANGER';

export interface CoolFlameData {
  times: number[];
  temperatures: number[];
  h2o2_ppm: number[];
  ch2o_ppm: number[];
  co_ppm: number[];
  phases: string[];
}

export interface WaterMistData {
  operatingPressure_bar: number;
  pressure_psi: number;
  droplet_dv050_um: number;
  droplet_dv099_um: number;
  flowRate_g_s: string;
  waterVolume_L: string;
  steamProduced_L: string;
  additive: string;
  surfaceTension_mN_m: number;
  eclssCompliant: boolean;
}

export interface LOIResult {
  loi1g: number;
  loiMicrog: number;
  shift: number;
  flammableInCabin: boolean;
}

export interface RiskDriver {
  feature: string;
  impact: string;
}

export interface ScenarioEvaluation {
  predictions: {
    riskLevel: RiskLevel;
    probabilities: {
      SAFE: number;
      CAUTION: number;
      DANGER: number;
    };
    flameSpreadVelocity: number;
    ci95: [number, number];
    loiShift: {
      loiMicrog: number;
      loi1g: number;
      shiftPercent: number;
    };
    coolFlameRisk: string;
  };
  prescriptive: {
    extinguisherType: string;
    requiredMassKg: string;
    durationSec: number;
    coolingPowerKw: string;
    ventilationAction: string;
    recommendedSensors: string[];
  };
  drivers: RiskDriver[];
}

export interface FlightExperience {
  id: string;
  question: string;
  category: string;
  mission: string;
  answer: string;
  citation: string;
}

export interface PSIInvestigation {
  id: string;
  name: string;
  platform: string;
  year_range: string;
  description: string;
  objectives: string[];
  materials: string[];
  parameters: Record<string, string>;
  key_findings: string[];
  publications: string[];
  doi?: string;
  category: string;
}
