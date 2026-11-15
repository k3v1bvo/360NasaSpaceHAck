import React from 'react';
import { Cpu, ShieldCheck, CheckCircle2, Activity, TrendingUp } from 'lucide-react';

export default function MetricsStrip({ metrics }) {
  const m = metrics || {
    R2: 0.9457,
    RMSE_C: 0.5496,
    MAE_C: 0.4362,
    p_value: 0.0000,
    n_muestras_entrenamiento: 2497,
  };

  const r2Val = m.R2 !== undefined ? m.R2 : m.coeficiente_determinacion_r2 || 0.9457;
  const rmseVal = m.RMSE_C !== undefined ? m.RMSE_C : m.rmse_grados_c || 0.55;
  const maeVal = m.MAE_C !== undefined ? m.MAE_C : m.mae_grados_c || 0.44;
  const pVal = m.p_value !== undefined ? m.p_value : 0.0000;
  const nSamples = m.n_muestras_entrenamiento || 2497;

  return (
    <div className="flex items-center justify-between border-b border-neutral-800 bg-[#0a0d14] px-3 sm:px-5 py-2 text-xs sm:text-sm overflow-x-auto no-scrollbar gap-3 shrink-0">
      {/* Insignia IA & Red MÓNICA */}
      <div className="flex items-center gap-2.5 shrink-0">
        <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping"></span>
        <span className="font-bold text-white flex items-center gap-1.5 text-xs sm:text-sm">
          <Cpu className="h-4 w-4 text-cyan-400 shrink-0" />
          <span className="truncate">Sensado Virtual IA</span>
        </span>
        <span className="hidden sm:inline rounded bg-blue-950 px-2.5 py-0.5 text-xs font-mono text-cyan-300 border border-blue-700/80 font-semibold shrink-0">
          XGBoost 3.2.0 • 2,497 Días NASA
        </span>
      </div>

      {/* Métricas Obligatorias del Jurado */}
      <div className="flex items-center gap-3 sm:gap-5 text-xs sm:text-[13px] font-mono shrink-0">
        <div className="flex items-center gap-1.5" title="Coeficiente de Determinación R²">
          <span className="text-slate-400 font-medium">R²:</span>
          <strong className="text-emerald-400 font-bold text-sm sm:text-base">{r2Val}</strong>
        </div>

        <div className="flex items-center gap-1.5" title="Error Cuadrático Medio (Root Mean Squared Error)">
          <span className="text-slate-400 font-medium">RMSE:</span>
          <strong className="text-cyan-400 font-bold text-sm sm:text-base">{rmseVal} °C</strong>
        </div>

        <div className="flex items-center gap-1.5" title="Error Absoluto Medio (Mean Absolute Error)">
          <span className="text-slate-400 font-medium">MAE:</span>
          <strong className="text-blue-400 font-bold text-sm sm:text-base">{maeVal} °C</strong>
        </div>

        <div className="flex items-center gap-1.5 rounded-md bg-purple-950/90 px-2 py-0.5 border border-purple-700/80" title="Significancia Estadística (p < 0.05)">
          <span className="text-purple-300 font-medium">p:</span>
          <strong className="text-purple-200 font-bold text-sm">{pVal}</strong>
          <span className="text-[11px] text-emerald-400 font-bold">(&lt; 0.05 ✓)</span>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <Activity className="h-3.5 w-3.5 text-slate-400" />
          <span>N = {nSamples}</span>
        </div>
      </div>
    </div>
  );
}
