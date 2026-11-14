import React, { useState } from 'react';
import { Waves, AlertOctagon, ShieldAlert, Filter, MapPin } from 'lucide-react';
import floodPointsData from '../../../data/gamc/60_puntos_inundacion.geojson';

export default function FloodRiskTab({ onSelectPunto }) {
  const [filterRiesgo, setFilterRiesgo] = useState('ALL');
  const allPoints = floodPointsData?.features || [];

  const filteredPoints = allPoints.filter((pt) => {
    if (filterRiesgo !== 'ALL' && pt.properties.nivel_riesgo !== filterRiesgo) return false;
    return true;
  });

  const countExtremo = allPoints.filter(p => p.properties.nivel_riesgo === 'Extremo').length;
  const countAlto = allPoints.filter(p => p.properties.nivel_riesgo === 'Alto').length;

  return (
    <div className="space-y-4 p-4 text-white">
      {/* Header del Reto 2.2 GAMC */}
      <div className="flex items-center justify-between border-b border-blue-900/50 pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-blue-600/20 p-2 text-blue-500 shadow-inner">
            <Waves className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-black tracking-wide text-blue-400">
              TORRENTERAS & INUNDACIONES
            </h2>
            <p className="text-[11px] text-neutral-400">
              NASA SAR / DEM • 60 Puntos Ground-Truth GAMC
            </p>
          </div>
        </div>
        <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300">
          Reto 2.2 GAMC
        </span>
      </div>

      {/* Ground Truth Badge */}
      <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-3 space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
          <ShieldAlert className="h-4 w-4 text-blue-400" />
          <span>Validación Oficial Ground-Truth ({allPoints.length} Puntos)</span>
        </div>
        <p className="text-[11px] text-neutral-300 leading-snug">
          Modelo espacial calibrado contra los <strong>60 puntos históricos de anegamiento y mazamorra</strong> registrados por el GAMC (Cuencas Taquiña, Pintumayu, Logruste, Tamborada y Zona Sur).
        </p>
      </div>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-2.5">
          <span className="text-[10px] text-neutral-400">Puntos de Riesgo Extremo</span>
          <p className="text-xl font-black text-red-500">{countExtremo}</p>
          <span className="text-[9px] text-neutral-500">Mazamorra / Anegamiento</span>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-2.5">
          <span className="text-[10px] text-neutral-400">Umbral Alerta SENAMHI</span>
          <p className="text-xl font-black text-blue-400">&gt; 35 mm</p>
          <span className="text-[9px] text-neutral-500">Precipitación 24 horas</span>
        </div>
      </div>

      {/* Filtro por Nivel de Riesgo */}
      <div className="flex items-center gap-2">
        <select
          value={filterRiesgo}
          onChange={(e) => setFilterRiesgo(e.target.value)}
          className="w-full rounded-lg border border-neutral-800 bg-neutral-900 p-2 text-[11px] text-neutral-200 outline-none focus:border-blue-500"
        >
          <option value="ALL">Ver los 60 Puntos Históricos</option>
          <option value="Extremo">Solo Riesgo Extremo (Taquiña / Av. 6 de Agosto)</option>
          <option value="Alto">Solo Riesgo Alto</option>
          <option value="Medio">Solo Riesgo Medio</option>
        </select>
      </div>

      {/* Lista de Puntos Históricos */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-neutral-300">
          Puntos Críticos Monitoreados ({filteredPoints.length})
        </span>

        <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
          {filteredPoints.map((pt) => {
            const p = pt.properties;
            return (
              <div
                key={p.id}
                onClick={() => onSelectPunto && onSelectPunto(pt)}
                className="cursor-pointer rounded-xl border border-neutral-800 bg-neutral-950 p-2.5 transition hover:border-blue-500/60 hover:bg-neutral-900"
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-neutral-200">{p.torrentera_zona}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    p.nivel_riesgo === 'Extremo' ? 'bg-red-950 text-red-400 border border-red-800' :
                    p.nivel_riesgo === 'Alto' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    'bg-blue-950 text-blue-400 border border-blue-800'
                  }`}>
                    {p.nivel_riesgo}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-neutral-400">{p.tipo_evento}</p>
                <div className="mt-1.5 flex items-center justify-between border-t border-neutral-900 pt-1 text-[10px] text-neutral-500">
                  <span>Alerta: {p.senamhi_umbral_lluvia_mm} mm SENAMHI</span>
                  <span>{p.frecuencia_historica}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg bg-neutral-900/40 p-2 text-center text-[10px] text-neutral-500">
        Módulo desarrollado para: <strong className="text-neutral-300">Integrante 3</strong> (Reto NASA SAR + GAMC Torrenteras)
      </div>
    </div>
  );
}
