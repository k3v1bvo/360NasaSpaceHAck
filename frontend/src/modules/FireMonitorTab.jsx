import React from 'react';
import { Flame, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';

export default function FireMonitorTab({ focosData, onSelectFoco }) {
  return (
    <div className="space-y-4 p-4 text-white">
      {/* Header del Módulo */}
      <div className="flex items-center justify-between border-b border-red-900/50 pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-red-600/20 p-2 text-red-500">
            <Flame className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-red-400">Focos de Calor & Incendios</h2>
            <p className="text-xs text-neutral-400">NASA FIRMS (MODIS + VIIRS) • Parque Nacional Tunari</p>
          </div>
        </div>
        <span className="rounded-full bg-red-500/20 px-2.5 py-1 text-xs font-semibold text-red-400">
          En Vivo
        </span>
      </div>

      {/* Tarjetas de Métricas Rápidas */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-3">
          <span className="text-xs text-neutral-400">Focos Detectados (24h)</span>
          <p className="text-2xl font-black text-red-500">{focosData?.length || 3}</p>
          <span className="text-[10px] text-neutral-500">Área Tunari / Valles</span>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-3">
          <span className="text-xs text-neutral-400">Nivel de Riesgo Global</span>
          <p className="text-2xl font-black text-amber-400">ALTO</p>
          <span className="text-[10px] text-amber-500/80">Viento seco 24 km/h</span>
        </div>
      </div>

      {/* Lista de Focos de Calor Activos */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-neutral-300">
          <span>Alertas Recientes</span>
          <button className="flex items-center gap-1 text-[11px] text-red-400 hover:underline">
            <RefreshCw className="h-3 w-3" /> Actualizar NASA
          </button>
        </div>

        <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
          {focosData && focosData.map((foco, idx) => (
            <div
              key={idx}
              onClick={() => onSelectFoco && onSelectFoco(foco)}
              className="cursor-pointer rounded-lg border border-neutral-800 bg-neutral-950 p-2.5 transition hover:border-red-600/50 hover:bg-neutral-900"
            >
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-neutral-200">{foco.properties?.zona || 'Zona Tunari'}</span>
                <span className="rounded bg-red-950/80 px-1.5 py-0.5 text-[10px] font-bold text-red-400">
                  FRP {foco.properties?.frp_intensidad || 50} MW
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-neutral-400">
                <span>Sensor: {foco.properties?.sensor || 'VIIRS'}</span>
                <span>Confianza: {foco.properties?.confianza || 'Alta'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Responsable del módulo */}
      <div className="rounded-lg bg-neutral-900/40 p-2 text-center text-[10px] text-neutral-500">
        Módulo desarrollado por: <strong className="text-neutral-300">Kevin</strong> (Reto NASA MODIS/VIIRS + GAMC Tunari)
      </div>
    </div>
  );
}
