import React from 'react'
import { 
  ShieldCheck, 
  Droplet, 
  Wind, 
  CloudFog, 
  PowerOff, 
  Flame, 
  Sparkles,
  ZapOff,
  AlertOctagon
} from 'lucide-react'
import { sound } from '../utils/audioEffects'

export default function SuppressionControls({ 
  params, 
  setParams, 
  onTriggerExtinguish 
}) {
  const { airflow, activeExtinguisher, pressure, isIgnited } = params

  const handleEclssCutoff = () => {
    sound.playClick()
    setParams(prev => ({ ...prev, airflow: 0 }))
  }

  const handleDepressurize = () => {
    sound.playExtinguish()
    onTriggerExtinguish('depressurize')
  }

  return (
    <div className="rounded-2xl p-5 glass-panel border border-cyan-500/20 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/10 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold font-mono tracking-tight text-white uppercase">
            SUITE DE SUPRESIÓN Y CONTRAMEDIDAS ESPACIALES
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          PROTOCOLO NASA FLIGHT RULE 12-4
        </span>
      </div>

      {/* Grid of Action Countermeasures */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        {/* CO2 Extinguisher */}
        <button
          onClick={() => {
            sound.playExtinguish()
            onTriggerExtinguish('co2')
          }}
          disabled={!isIgnited}
          className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition-all ${
            activeExtinguisher === 'co2'
              ? 'bg-cyan-500/30 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
              : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-cyan-500/40 hover:bg-slate-800/60 active:scale-95 disabled:opacity-50'
          }`}
        >
          <div className="p-2 rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">
            <CloudFog className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold">Inyección CO₂</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Sofocación de Oxígeno</div>
          </div>
        </button>

        {/* Fine Water Mist */}
        <button
          onClick={() => {
            sound.playExtinguish()
            onTriggerExtinguish('mist')
          }}
          disabled={!isIgnited}
          className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition-all ${
            activeExtinguisher === 'mist'
              ? 'bg-blue-500/30 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]'
              : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-blue-500/40 hover:bg-slate-800/60 active:scale-95 disabled:opacity-50'
          }`}
        >
          <div className="p-2 rounded-lg bg-blue-950/60 text-blue-400 border border-blue-800/40">
            <Droplet className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold">Niebla de Agua</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Enfriamiento Evaporativo</div>
          </div>
        </button>

        {/* Novec 1230 Clean Agent */}
        <button
          onClick={() => {
            sound.playExtinguish()
            onTriggerExtinguish('novec')
          }}
          disabled={!isIgnited}
          className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition-all ${
            activeExtinguisher === 'novec'
              ? 'bg-emerald-500/30 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-emerald-500/40 hover:bg-slate-800/60 active:scale-95 disabled:opacity-50'
          }`}
        >
          <div className="p-2 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold">Novec 1230</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Captura de Radicales</div>
          </div>
        </button>

        {/* ECLSS Cutoff */}
        <button
          onClick={handleEclssCutoff}
          disabled={airflow === 0}
          className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition-all ${
            airflow === 0
              ? 'bg-slate-900 border-slate-800 text-slate-500'
              : 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-900/40 active:scale-95'
          }`}
        >
          <div className="p-2 rounded-lg bg-amber-950/80 text-amber-400 border border-amber-800/40">
            <ZapOff className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold">Corte ECLSS</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Paro de Ventilación</div>
          </div>
        </button>
      </div>

      {/* Emergency Hard Vacuum Depressurization */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 rounded-xl bg-red-950/20 border border-red-500/30 gap-3">
        <div className="flex items-center gap-2.5 text-xs font-mono text-red-200">
          <AlertOctagon className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span>
            <strong>VENTEO TOTAL DE EMERGENCIA:</strong> Despresuriza la cabina a 0 kPa en 12s para asfixiar cualquier combustión no contenible.
          </span>
        </div>
        <button
          onClick={handleDepressurize}
          className="px-4 py-2 text-xs font-mono font-bold rounded-lg bg-red-600 hover:bg-red-500 text-white whitespace-nowrap shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all active:scale-95"
        >
          VENTEAR AL VACÍO
        </button>
      </div>
    </div>
  )
}
