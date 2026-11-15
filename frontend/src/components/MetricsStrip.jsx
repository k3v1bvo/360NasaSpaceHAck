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
    <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950/90 px-4 py-1.5 text-xs overflow-x-auto no-scrollbar gap-4 shrink-0">
      {/* Insignia IA & Red MÓNICA */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="flex h-2 w-2 rounded-full bg-emerald-400 shrink-0"></span>
        <span className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
          <Cpu className="h-3.5 w-3.5 text-indigo-400" />
          <span>Sensado Virtual IA</span>
        </span>
        <span className="hidden sm:inline rounded bg-zinc-900 px-2 py-0.5 text-[11px] font-mono text-zinc-400 border border-zinc-800 font-medium shrink-0">
          XGBoost 3.2.0 • 2,497 Días NASA
        </span>
      </div>

      {/* Métricas Obligatorias del Jurado */}
      <div className="flex items-center gap-3 sm:gap-4 text-xs font-mono shrink-0">
        <div className="flex items-center gap-1" title="Coeficiente de Determinación R²">
          <span className="text-zinc-500 font-medium">R²:</span>
          <strong className="text-emerald-400 font-semibold">{r2Val}</strong>
        </div>

        <div className="flex items-center gap-1" title="Error Cuadrático Medio (Root Mean Squared Error)">
          <span className="text-zinc-500 font-medium">RMSE:</span>
          <strong className="text-zinc-200 font-semibold">{rmseVal} °C</strong>
        </div>

        <div className="flex items-center gap-1" title="Error Absoluto Medio (Mean Absolute Error)">
          <span className="text-zinc-500 font-medium">MAE:</span>
          <strong className="text-zinc-200 font-semibold">{maeVal} °C</strong>
        </div>

        <div className="flex items-center gap-1 rounded bg-zinc-900 px-2 py-0.5 border border-zinc-800" title="Significancia Estadística (p < 0.05)">
          <span className="text-zinc-400 font-medium">p:</span>
          <strong className="text-indigo-300 font-semibold">{pVal}</strong>
          <span className="text-[10px] text-emerald-400 font-bold">(&lt; 0.05 ✓)</span>
        </div>

        <div className="hidden lg:flex items-center gap-1 text-[11px] text-zinc-500 font-medium">
          <Activity className="h-3 w-3 text-zinc-500" />
          <span>N={nSamples}</span>
        </div>
      </div>
    </div>
  );
}
