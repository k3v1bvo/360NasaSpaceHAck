import React, { useState } from 'react';
import { SunMedium, Trees, Layers, TrendingUp, AlertCircle } from 'lucide-react';
import distritosData from '../../../data/gamc/distritos_cochabamba.geojson';

export default function MicroclimateTab({ onSelectDistrito }) {
  const [selectedDistritoId, setSelectedDistritoId] = useState(null);
  const distritos = distritosData?.features || [];

  return (
    <div className="space-y-4 p-4 text-white">
      {/* Header del Reto 2.1 GAMC */}
      <div className="flex items-center justify-between border-b border-amber-900/50 pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-amber-600/20 p-2 text-amber-500 shadow-inner">
            <SunMedium className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-black tracking-wide text-amber-400">
              MICROCLIMAS & ISLAS DE CALOR
            </h2>
            <p className="text-[11px] text-neutral-400">
              NASA Earthdata (LST & NDVI) • 14 Distritos GAMC
            </p>
          </div>
        </div>
        <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
          Reto 2.1 GAMC
        </span>
      </div>

      {/* Tarjeta de Contraste Socioambiental (Requisito GAMC) */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 text-xs leading-relaxed space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-amber-300">
          <AlertCircle className="h-4 w-4" />
          <span>Contraste Socioambiental Detectado:</span>
        </div>
        <p className="text-neutral-300 text-[11px]">
          Existe una disparidad de hasta <strong className="text-red-400">+12.3 °C</strong> en la temperatura superficial (LST) entre las zonas densamente impermeabilizadas (<strong>Av. 6 de Agosto / Circunvalación - D5</strong>) y la masa vegetal de las <strong>faldas del Parque Tunari (D1)</strong>.
        </p>
      </div>

      {/* Lista Interactiva por Distrito Municipal */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-neutral-300">
          <span>Distritos Municipales Monitoreados ({distritos.length})</span>
          <span className="text-[10px] text-neutral-500">Haz clic para enfocar</span>
        </div>

        <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
          {distritos.map((dist) => {
            const p = dist.properties;
            const isSelected = selectedDistritoId === p.distrito;
            return (
              <div
                key={p.distrito}
                onClick={() => {
                  setSelectedDistritoId(p.distrito);
                  if (onSelectDistrito) onSelectDistrito(dist);
                }}
                className={`cursor-pointer rounded-xl border p-3 transition ${
                  isSelected
                    ? 'border-amber-500 bg-amber-950/40 shadow-lg'
                    : 'border-neutral-800 bg-neutral-950 hover:border-amber-600/50 hover:bg-neutral-900'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-neutral-100">{p.nombre}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    p.nivel_isla_calor.includes('Crítica') ? 'bg-red-950 text-red-400 border border-red-800' :
                    p.nivel_isla_calor.includes('Bajo') ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}>
                    {p.lst_temperatura_c} °C
                  </span>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-neutral-400">
                  <div className="flex items-center gap-1.5">
                    <SunMedium className="h-3.5 w-3.5 text-amber-500" />
                    <span>LST: <strong>{p.lst_temperatura_c} °C</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Trees className="h-3.5 w-3.5 text-emerald-500" />
                    <span>NDVI: <strong>{p.ndvi_vegetacion}</strong></span>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between border-t border-neutral-900 pt-1.5 text-[10px] text-neutral-500">
                  <span>Pob: ~{p.poblacion_estimada.toLocaleString()} hab.</span>
                  <span className="text-amber-400/90 font-medium">{p.contraste_zona_sur_c}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg bg-neutral-900/40 p-2 text-center text-[10px] text-neutral-500">
        Módulo desarrollado para: <strong className="text-neutral-300">Integrante 2</strong> (Reto NASA Trend Detective + GAMC Microclimas)
      </div>
    </div>
  );
}
