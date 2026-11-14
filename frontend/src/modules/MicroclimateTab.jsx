import React from 'react';
import { SunMedium, Trees, Layers, TrendingUp } from 'lucide-react';

export default function MicroclimateTab() {
  const distritosDemo = [
    { id: 10, nombre: "Distrito 10 (Centro Urbano)", lst: "34.8 °C", ndvi: "0.12", islaCalor: "Severa" },
    { id: 5, nombre: "Distrito 5 (Zona Sur - Av. 6 de Agosto)", lst: "36.2 °C", ndvi: "0.08", islaCalor: "Crítica" },
    { id: 1, nombre: "Distrito 1 (Norte / Faldas Tunari)", lst: "24.5 °C", ndvi: "0.58", islaCalor: "Baja (Zona Fresca)" },
    { id: 6, nombre: "Distrito 6 (Laguna Alalay)", lst: "28.1 °C", ndvi: "0.39", islaCalor: "Moderada" },
  ];

  return (
    <div className="space-y-4 p-4 text-white">
      <div className="flex items-center justify-between border-b border-amber-900/50 pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-amber-600/20 p-2 text-amber-500">
            <SunMedium className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-amber-400">Microclimas e Islas de Calor</h2>
            <p className="text-xs text-neutral-400">NASA Earthdata (LST/NDVI) • Distritos GAMC</p>
          </div>
        </div>
      </div>

      {/* Explicación del contraste socioambiental */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-3 text-xs text-amber-200/90 leading-relaxed">
        <strong>Contraste detectado:</strong> Hay hasta <strong>11.7 °C de diferencia</strong> entre el asfalto de la Av. 6 de Agosto / Circunvalación frente al dosel vegetal del Tunari.
      </div>

      {/* Lista de Distritos */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-neutral-300">Análisis por Distrito Municipal (GAMC)</span>
        <div className="space-y-2">
          {distritosDemo.map((dist) => (
            <div key={dist.id} className="rounded-lg border border-neutral-800 bg-neutral-950 p-2.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-neutral-200">{dist.nombre}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  dist.islaCalor.includes('Crítica') ? 'bg-red-950 text-red-400 border border-red-800/50' :
                  dist.islaCalor.includes('Baja') ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50' :
                  'bg-amber-950 text-amber-400 border border-amber-800/50'
                }`}>
                  {dist.islaCalor}
                </span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-neutral-400">
                <div className="flex items-center gap-1">
                  <SunMedium className="h-3.5 w-3.5 text-amber-500" />
                  <span>Temp (LST): <strong>{dist.lst}</strong></span>
                </div>
                <div className="flex items-center gap-1">
                  <Trees className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Veg (NDVI): <strong>{dist.ndvi}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-neutral-900/40 p-2 text-center text-[10px] text-neutral-500">
        Módulo desarrollado por: <strong className="text-neutral-300">Integrante 2</strong> (Reto NASA Earth Trend + GAMC Microclimas)
      </div>
    </div>
  );
}
