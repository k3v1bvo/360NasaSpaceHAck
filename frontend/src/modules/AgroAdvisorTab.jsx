import React, { useState } from 'react';
import { Sprout, Droplets, Compass, CheckCircle2 } from 'lucide-react';

export default function AgroAdvisorTab({ onOpenReportModal }) {
  const [suelo, setSuelo] = useState('franco');
  const [agua, setAgua] = useState('escasa');

  return (
    <div className="space-y-4 p-4 text-white">
      <div className="flex items-center justify-between border-b border-emerald-900/50 pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-emerald-600/20 p-2 text-emerald-500">
            <Sprout className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-emerald-400">Rotación Agrícola Resiliente</h2>
            <p className="text-xs text-neutral-400">NASA SMAP / Evapotranspiración • Suelos Valle Cocha</p>
          </div>
        </div>
      </div>

      {/* Selector de Recomendación */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3 space-y-3">
        <span className="text-xs font-semibold text-neutral-300">Asistente de Rotación de Cultivos</span>
        
        <div>
          <label className="text-[11px] text-neutral-400">Tipo de suelo en tu parcela:</label>
          <select 
            value={suelo} 
            onChange={(e) => setSuelo(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 p-2 text-xs text-neutral-200 outline-none focus:border-emerald-500"
          >
            <option value="franco">Franco arcilloso (Valle Bajo / Quillacollo)</option>
            <option value="arenoso">Arenoso / Aluvial (Cerca de ríos y torrenteras)</option>
            <option value="pedregoso">Pedregoso / Ladera (Faldas del Tunari)</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] text-neutral-400">Disponibilidad de agua de riego:</label>
          <select 
            value={agua} 
            onChange={(e) => setAgua(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 p-2 text-xs text-neutral-200 outline-none focus:border-emerald-500"
          >
            <option value="escasa">Escasa / Secano (Solo lluvias temporales)</option>
            <option value="moderada">Moderada (Turno de acequia semanal)</option>
            <option value="abundante">Buena (Pozo profundo / canal continuo)</option>
          </select>
        </div>
      </div>

      {/* Tarjeta de Recomendación */}
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>Rotación Óptima Recomendada</span>
        </div>
        <p className="mt-1.5 text-xs text-neutral-200">
          <strong>Temporada 1:</strong> Maíz criollo resistente a estrés hídrico.<br/>
          <strong>Temporada 2 (Rotación):</strong> Tarwi / Haba (Fijador natural de nitrógeno y bajo consumo de agua).
        </p>
        <div className="mt-2 flex items-center justify-between text-[11px] text-emerald-400/90 font-medium">
          <span>Ahorro Hídrico estimado: <strong>~32%</strong></span>
          <span>Humedad SMAP: <strong>Baja (18%)</strong></span>
        </div>
      </div>

      {/* Botón Destacado: Reporte Ciudadano */}
      <div className="pt-2">
        <button
          onClick={onOpenReportModal}
          className="w-full rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-orange-600 py-3 text-xs font-bold text-white shadow-lg transition hover:opacity-90 flex items-center justify-center gap-2"
        >
          <Compass className="h-4 w-4" />
          <span>¡Reportar Incendio o Torrentera (Alerta Vecinal)!</span>
        </button>
      </div>

      <div className="rounded-lg bg-neutral-900/40 p-2 text-center text-[10px] text-neutral-500">
        Módulo desarrollado por: <strong className="text-neutral-300">Integrante 4</strong> (Reto NASA Field Shift + Reportes FEXCO)
      </div>
    </div>
  );
}
