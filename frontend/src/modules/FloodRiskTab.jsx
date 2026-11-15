import React, { useState } from 'react';
import { Waves, AlertOctagon, ShieldAlert, Filter, MapPin, BellRing, ArrowRight, ExternalLink, Radar } from 'lucide-react';
import floodPointsData from '../../../data/gamc/60_puntos_inundacion.geojson';

export default function FloodRiskTab({ onSelectPunto, selectedPoint, onOpenReportModal }) {
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
      {/* Header Oficial del Reto GAMC Torrenteras */}
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
          UGR Cochabamba
        </span>
      </div>

      {/* Ground Truth Badge */}
      <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-3 space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
          <ShieldAlert className="h-4 w-4 text-blue-400" />
          <span>Validación Oficial Ground-Truth ({allPoints.length} Puntos)</span>
        </div>
        <p className="text-[11px] text-neutral-300 leading-snug">
          Modelo espacial calibrado contra los <strong>60 puntos históricos de anegamiento y aluvión</strong> registrados por el GAMC (Cuencas Taquiña, Pintumayu, Logruste, Tamborada y Colectores Zona Sur).
        </p>
      </div>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-2.5">
          <span className="text-[10px] text-neutral-400">Puntos de Riesgo Extremo</span>
          <p className="text-xl font-black text-red-500">{countExtremo}</p>
          <span className="text-[9px] text-neutral-500">Aluvión / Mazamorra</span>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-2.5">
          <span className="text-[10px] text-neutral-400">Umbral Alerta SENAMHI</span>
          <p className="text-xl font-black text-blue-400">&gt; 35 mm</p>
          <span className="text-[9px] text-neutral-500">Precipitación 24 horas</span>
        </div>
      </div>

      {/* Dinámica Cuenca-Ciudad */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-3 text-[11px] text-neutral-300 space-y-1.5">
        <div className="flex items-center justify-between font-bold text-cyan-400 text-xs">
          <span>⚡ Tiempo de Concentración Hidrológica</span>
          <span className="font-mono text-[10px] text-neutral-400">&lt; 45 min</span>
        </div>
        <p className="leading-snug text-neutral-400">
          Las precipitaciones en la Cota 2750 del Tunari descienden por pendientes mayores al 35% arrastrando sedimentos directamente a las zonas urbanas de Tiquipaya, Taquiña y Av. Beijing.
        </p>
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
            const isSelected = selectedPoint?.id === p.id;
            return (
              <div
                key={p.id}
                onClick={() => onSelectPunto && onSelectPunto(pt)}
                className={`cursor-pointer rounded-xl border p-2.5 transition ${
                  isSelected 
                    ? 'border-cyan-400 bg-cyan-950/40 shadow-lg shadow-cyan-950/50' 
                    : 'border-neutral-800 bg-neutral-950 hover:border-blue-500/60 hover:bg-neutral-900'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className={`${isSelected ? 'text-cyan-300 font-extrabold' : 'text-neutral-200'}`}>
                    {p.torrentera_zona}
                  </span>
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

      {/* Botón de Alerta Vecinal */}
      {onOpenReportModal && (
        <button
          onClick={onOpenReportModal}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 py-2.5 text-xs font-bold text-white shadow-lg hover:opacity-90 transition"
        >
          <BellRing className="h-4 w-4" />
          <span>¡Reportar Colapso de Torrentera o Inundación!</span>
        </button>
      )}

      {/* Recursos Oficiales del Reto: CSA SAR & SWOT */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-950/20 p-3 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
          <div className="flex items-center gap-1.5">
            <Radar className="h-4 w-4 text-cyan-400" />
            <span>Misiones Radar SAR & Altimetría (CSA / NASA)</span>
          </div>
          <span className="text-[10px] font-mono bg-cyan-900/50 text-cyan-200 px-1.5 py-0.5 rounded border border-cyan-700/50">
            Reto Oficial
          </span>
        </div>
        <p className="text-[11px] text-neutral-300 leading-snug">
          Para evaluar zonas anegadas bajo nubosidad densa durante temporales de lluvia, se integran las metodologías radar de la Agencia Espacial Canadiense (CSA) y NASA:
        </p>
        <div className="grid grid-cols-1 gap-1.5 pt-1">
          <a
            href="https://www.asc-csa.gc.ca/eng/satellites/swot/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900/80 px-2.5 py-1.5 text-[11px] hover:border-cyan-400/60 hover:bg-neutral-800 transition group"
          >
            <span className="text-neutral-200 group-hover:text-cyan-300 transition">🌊 Misión SWOT Altimetría (NASA / CSA / CNES)</span>
            <ExternalLink className="h-3 w-3 text-neutral-400 group-hover:text-cyan-300" />
          </a>
          <a
            href="https://donnees-data.asc-csa.gc.ca/en/dataset/rcm"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900/80 px-2.5 py-1.5 text-[11px] hover:border-cyan-400/60 hover:bg-neutral-800 transition group"
          >
            <span className="text-neutral-200 group-hover:text-cyan-300 transition">📡 Datos Radarsat Constellation (RCM SAR C-Band)</span>
            <ExternalLink className="h-3 w-3 text-neutral-400 group-hover:text-cyan-300" />
          </a>
          <a
            href="https://github.com/asc-csa/Synthetic_Aperture_Radar_Tutorial"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900/80 px-2.5 py-1.5 text-[11px] hover:border-cyan-400/60 hover:bg-neutral-800 transition group"
          >
            <span className="text-neutral-200 group-hover:text-cyan-300 transition">💻 Tutorial SAR en Python (CSA Open Source)</span>
            <ExternalLink className="h-3 w-3 text-neutral-400 group-hover:text-cyan-300" />
          </a>
        </div>
      </div>

      <div className="rounded-lg bg-neutral-900/60 border border-neutral-800/60 p-2.5 text-center text-[10px] text-neutral-400">
        Plataforma calibrada con NASA SRTM DEM 30m y 60 Puntos Oficiales de la Unidad de Gestión de Riesgos (UGR) del GAMC.
      </div>
    </div>
  );
}
