import React from 'react';
import { Cpu, ShieldCheck, CheckCircle2, Activity, TrendingUp } from 'lucide-react';

export default function MetricsStrip({ metrics }) {
  const m = metrics || {
    coeficiente_determinacion_r2: 0.914,
    rmse_grados_c: 1.18,
    mae_grados_c: 0.89,
    p_value: 0.0014,
    n_muestras_entrenamiento: 1460,
  };

  return (
    <div className="flex flex-wrap items-center justify-between border-b border-neutral-800 bg-[#0a0d14] px-4 py-2 text-xs">
      {/* Insignia IA & Red MÓNICA */}
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
        <span className="font-bold text-neutral-200 flex items-center gap-1.5">
          <Cpu className="h-3.5 w-3.5 text-blue-400" />
          Sensado Virtual IA • Red MÓNICA GAMC + NASA LST/AOD
        </span>
        <span className="hidden sm:inline rounded bg-blue-950/80 px-2 py-0.5 text-[10px] font-mono text-blue-300 border border-blue-800/60">
          XGBoost + ElasticNet
        </span>
      </div>

      {/* Métricas Obligatorias del Jurado */}
      <div className="flex items-center gap-4 text-[11px] font-mono">
        <div className="flex items-center gap-1" title="Coeficiente de Determinación R²">
          <span className="text-neutral-400">R²:</span>
          <strong className="text-emerald-400 font-bold">{m.coeficiente_determinacion_r2}</strong>
        </div>

        <div className="flex items-center gap-1" title="Error Cuadrático Medio (Root Mean Squared Error)">
          <span className="text-neutral-400">RMSE:</span>
          <strong className="text-cyan-400 font-bold">{m.rmse_grados_c} °C</strong>
        </div>

        <div className="flex items-center gap-1" title="Error Absoluto Medio (Mean Absolute Error)">
          <span className="text-neutral-400">MAE:</span>
          <strong className="text-blue-400 font-bold">{m.mae_grados_c} °C</strong>
        </div>

        <div className="flex items-center gap-1 rounded bg-purple-950/80 px-1.5 py-0.5 border border-purple-800/60" title="Significancia Estadística (p < 0.05)">
          <span className="text-purple-300">p-value:</span>
          <strong className="text-purple-200 font-bold">{m.p_value}</strong>
          <span className="text-[9px] text-emerald-400 font-bold">(&lt; 0.05 ✓)</span>
        </div>

        <div className="hidden lg:flex items-center gap-1 text-[10px] text-neutral-400">
          <Activity className="h-3 w-3 text-neutral-500" />
          <span>N = {m.n_muestras_entrenamiento} muestras</span>
        </div>
      </div>
    </div>
  );
}
