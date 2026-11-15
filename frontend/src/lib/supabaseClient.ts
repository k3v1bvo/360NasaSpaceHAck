import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://tu-proyecto.supabase.co'
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface SimulationRecord {
  mission_id?: string;
  material: string;
  diameter_mm: number;
  flow_velocity_cm_s: number;
  atmosphere: string;
  o2_percent: number;
  pressure_atm: number;
  flame_spread_rate_vf: number;
  regime: string;
  cool_flame_detected: boolean;
  metadata?: Record<string, unknown>;
}

export interface RiskEvaluationRecord {
  material: string;
  risk_level: 'SAFE' | 'CAUTION' | 'DANGER';
  prob_safe: number;
  prob_caution: number;
  prob_danger: number;
  loi_microg: number;
  loi_shift: number;
  required_water_mist_liters: number;
  cooling_power_kw?: number;
  operator_notes?: string;
}

/**
 * Guarda una simulación en Supabase si está disponible, o en LocalStorage como respaldo offline.
 */
export async function persistSimulation(record: SimulationRecord): Promise<{ success: boolean; storage: 'supabase' | 'local'; id?: string; error?: string }> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('simulations').insert([record]).select('id').single();
      if (!error && data) {
        return { success: true, storage: 'supabase', id: data.id };
      }
      console.warn('[Supabase Fallback] Error insertando en base de datos:', error?.message);
    } catch (err) {
      console.warn('[Supabase Fallback] Excepción de conexión:', err);
    }
  }

  // Respaldo local offline
  try {
    const key = 'flame_offline_simulations';
    const current = JSON.parse(localStorage.getItem(key) || '[]');
    const localId = `local-${Date.now()}`;
    current.unshift({ ...record, id: localId, saved_offline_at: new Date().toISOString() });
    // Mantener un historial máximo de 50 registros locales
    localStorage.setItem(key, JSON.stringify(current.slice(0, 50)));
    return { success: true, storage: 'local', id: localId };
  } catch (storageErr) {
    return { success: false, storage: 'local', error: String(storageErr) };
  }
}

/**
 * Guarda una evaluación de riesgo en Supabase o LocalStorage.
 */
export async function persistRiskEvaluation(record: RiskEvaluationRecord): Promise<{ success: boolean; storage: 'supabase' | 'local'; id?: string }> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('risk_evaluations').insert([record]).select('id').single();
      if (!error && data) {
        return { success: true, storage: 'supabase', id: data.id };
      }
    } catch (err) {
      console.warn('[Supabase Fallback] Error guardando evaluación:', err);
    }
  }

  const key = 'flame_offline_risk_evals';
  const current = JSON.parse(localStorage.getItem(key) || '[]');
  const localId = `eval-${Date.now()}`;
  current.unshift({ ...record, id: localId, saved_offline_at: new Date().toISOString() });
  localStorage.setItem(key, JSON.stringify(current.slice(0, 50)));
  return { success: true, storage: 'local', id: localId };
}
