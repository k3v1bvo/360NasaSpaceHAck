-- =============================================================================
-- FLAME IN FREEFALL — ESQUEMA DE BASE DE DATOS SUPABASE (POSTGRESQL)
-- NASA Space Apps Challenge 2026
-- =============================================================================

-- 1. Tabla de Simulaciones Físicas de Misión
CREATE TABLE IF NOT EXISTS public.simulations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  mission_id TEXT DEFAULT 'NASA-PSI-EXP-01' NOT NULL,
  material TEXT NOT NULL,
  diameter_mm NUMERIC NOT NULL,
  flow_velocity_cm_s NUMERIC NOT NULL,
  atmosphere TEXT NOT NULL,
  o2_percent NUMERIC NOT NULL,
  pressure_atm NUMERIC NOT NULL,
  flame_spread_rate_vf NUMERIC NOT NULL,
  regime TEXT NOT NULL,
  cool_flame_detected BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Comentario descriptivo
COMMENT ON TABLE public.simulations IS 'Registro de simulaciones de velocidad de propagación de llama y dinámica transitoria LTC en microgravedad.';

-- 2. Tabla de Evaluaciones de Riesgo y Protocolos de Supresión NFPA 750
CREATE TABLE IF NOT EXISTS public.risk_evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  evaluated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  material TEXT NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('SAFE', 'CAUTION', 'DANGER')),
  prob_safe NUMERIC NOT NULL,
  prob_caution NUMERIC NOT NULL,
  prob_danger NUMERIC NOT NULL,
  loi_microg NUMERIC NOT NULL,
  loi_shift NUMERIC NOT NULL,
  required_water_mist_liters NUMERIC NOT NULL,
  cooling_power_kw NUMERIC,
  operator_notes TEXT
);

COMMENT ON TABLE public.risk_evaluations IS 'Auditorías de inflamabilidad de materiales en atmósferas de cabina y prescripciones de extinción.';

-- 3. Tabla de Logs de Consultas del Asistente IA
CREATE TABLE IF NOT EXISTS public.assistant_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  logged_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  query_text TEXT NOT NULL,
  case_matched_id TEXT,
  category TEXT,
  citation_used TEXT
);

COMMENT ON TABLE public.assistant_logs IS 'Auditoría de consultas formuladas por el profesional y casos aeroespaciales consultados.';

-- -----------------------------------------------------------------------------
-- POLÍTICAS DE SEGURIDAD A NIVEL DE FILA (Row Level Security - RLS)
-- -----------------------------------------------------------------------------
ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_logs ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública a datos de simulación
CREATE POLICY "Lectura pública de simulaciones"
ON public.simulations FOR SELECT
USING (true);

-- Permitir inserción anónima controlada (consola de telemetría de vuelo)
CREATE POLICY "Inserción pública de simulaciones"
ON public.simulations FOR INSERT
WITH CHECK (true);

CREATE POLICY "Lectura pública de evaluaciones"
ON public.risk_evaluations FOR SELECT
USING (true);

CREATE POLICY "Inserción pública de evaluaciones"
ON public.risk_evaluations FOR INSERT
WITH CHECK (true);

CREATE POLICY "Lectura e inserción pública de logs de asistente"
ON public.assistant_logs FOR ALL
USING (true);
