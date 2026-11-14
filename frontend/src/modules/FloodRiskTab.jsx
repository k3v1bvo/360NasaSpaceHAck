import React from 'react';
import { CloudRain, AlertOctagon, Waves, MapPin } from 'lucide-react';

export default function FloodRiskTab({ torrenterasData, onSelectPunto }) {
  return (
    <div className="space-y-4 p-4 text-white">
      <div className="flex items-center justify-between border-b border-blue-900/50 pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-blue-600/20 p-2 text-blue-500">
            <Waves className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-blue-400">Torrenteras & Inundaciones</h2>
            <p className="text-xs text-neutral-400">NASA DEM / SAR • 60 Puntos GAMC & SENAMHI</p>
          </div>
        </div>
      </div>

      {/* Ground Truth GAMC */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-950/20 p-3">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
          <AlertOctagon className="h-4 w-4 text-blue-400" />
          <span>Validación Histórica (GAMC Ground Truth)</span>
        </div>
        <p className="mt-1 text-[11px] text-neutral-300">
          Modelo calibrado con los <strong>60 eventos históricos de anegamiento y desborde</strong> registrados en torrenteras críticas de la cuenca Taquiña, Pintumayu y zona sur.
        </p>
      </div>

      {/* Lista de Puntos Críticos */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-neutral-300">Puntos de Monitoreo Activo</span>
        <div className="space-y-2">
          {torrenterasData && torrenterasData.map((pt, idx) => (
            <div
              key={idx}
              onClick={() => onSelectPunto && onSelectPunto(pt)}
              className="cursor-pointer rounded-lg border border-neutral-800 bg-neutral-950 p-2.5 transition hover:border-blue-500/50 hover:bg-neutral-900"
            >
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-neutral-200">{pt.properties?.torrentera}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  pt.properties?.nivel_riesgo === 'Extremo' ? 'bg-red-950 text-red-400 border border-red-800/50' :
                  pt.properties?.nivel_riesgo === 'Alto' ? 'bg-amber-950 text-amber-400 border border-amber-800/50' :
                  'bg-blue-950 text-blue-400 border border-blue-800/50'
                }`}>
                  Riesgo {pt.properties?.nivel_riesgo}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-neutral-400">{pt.properties?.tipo_evento}</p>
              <div className="mt-1.5 flex items-center justify-between text-[10px] text-neutral-500">
                <span>Colector: {pt.properties?.estado_colector}</span>
                <span>Frecuencia: {pt.properties?.frecuencia}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-neutral-900/40 p-2 text-center text-[10px] text-neutral-500">
        Módulo desarrollado por: <strong className="text-neutral-300">Integrante 3</strong> (Reto NASA SAR + GAMC Torrenteras)
      </div>
    </div>
  );
}
