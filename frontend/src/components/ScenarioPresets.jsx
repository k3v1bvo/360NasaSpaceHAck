import React from 'react'
import { Rocket, Bookmark, ShieldAlert, CheckCircle2, ChevronRight } from 'lucide-react'
import { NASA_SCENARIOS } from '../utils/combustionPhysics'
import { sound } from '../utils/audioEffects'

export default function ScenarioPresets({ currentScenarioId, onSelectScenario }) {
  return (
    <div className="rounded-2xl p-5 glass-panel border border-cyan-500/20 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/10 pb-3">
        <div className="flex items-center gap-2">
          <Rocket className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold font-mono tracking-tight text-white uppercase">
            ESCENARIOS HISTÓRICOS & EXPERIMENTOS NASA
          </h3>
        </div>
        <span className="text-[11px] font-mono text-cyan-400">
          6 CASOS DE ESTUDIO
        </span>
      </div>

      {/* Grid of Scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {NASA_SCENARIOS.map((sc) => {
          const isCurrent = currentScenarioId === sc.id
          return (
            <button
              key={sc.id}
              onClick={() => {
                sound.playClick()
                onSelectScenario(sc)
              }}
              className={`p-4 rounded-xl text-left font-mono transition-all border flex flex-col justify-between ${
                isCurrent
                  ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/50'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-cyan-500/40 hover:bg-slate-850'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[10px] text-cyan-400 font-bold mb-1">
                  <span>{sc.gravity === 0 ? '0g MICROGRAVEDAD' : `${sc.gravity}g GRAVEDAD`}</span>
                  <span>{sc.oxygen}% O₂</span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1.5 leading-snug">
                  {sc.name}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {sc.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-mono">
                  {sc.pressure} kPa · {sc.airflow} cm/s
                </span>
                <span className="text-cyan-400 flex items-center gap-1 font-bold group-hover:translate-x-1 transition-transform">
                  Cargar <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
