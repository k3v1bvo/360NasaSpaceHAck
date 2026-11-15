import React from 'react'
import { 
  Flame, 
  Orbit, 
  Volume2, 
  VolumeX, 
  Info, 
  Award, 
  ExternalLink, 
  Sparkles
} from 'lucide-react'
import { sound } from '../utils/audioEffects'

export default function Navbar({ 
  muted, 
  onToggleMute, 
  onOpenInfoModal,
  onOpenRubricModal 
}) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-500/15 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: NASA & Project Branding */}
        <div className="flex items-center gap-3.5">
          {/* Glowing Animated Icon */}
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600/30 to-blue-700/20 border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Orbit className="w-5 h-5 text-cyan-300 animate-spin-slow" />
            <Flame className="w-3.5 h-3.5 text-amber-400 absolute" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-base tracking-wider text-white">
                NASA IGNIS-0G
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 uppercase">
                CHALLENGE #10
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 tracking-tight flex items-center gap-1.5">
              <span>Combustion in Microgravity AI Dashboard</span>
              <span className="text-slate-600">·</span>
              <span className="text-cyan-400 font-semibold hidden sm:inline">ISS CIR Chamber</span>
            </div>
          </div>
        </div>

        {/* Center: Live Station Status Telemetry Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-cyan-500/20 text-xs font-mono text-slate-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span>ESTACIÓN ESPACIAL INTERNACIONAL: <strong>CIR RACK ONLINE</strong></span>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-2">
          {/* NASA Rubric Button */}
          <button
            onClick={() => {
              sound.playClick()
              onOpenRubricModal()
            }}
            className="px-3 py-1.5 text-xs font-mono font-bold rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.2)] active:scale-95"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Rúbrica Jurado (5/5)</span>
          </button>

          {/* Mute Button */}
          <button
            onClick={() => {
              onToggleMute()
              sound.playClick()
            }}
            title={muted ? 'Activar Sonidos de Cabina' : 'Silenciar Sonidos'}
            className={`p-2 rounded-xl border transition-all ${
              muted
                ? 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                : 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
            }`}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Info Modal Button */}
          <button
            onClick={() => {
              sound.playClick()
              onOpenInfoModal()
            }}
            className="px-3 py-1.5 text-xs font-mono rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
          >
            <Info className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Guía Científica</span>
          </button>

          {/* NASA Link */}
          <a
            href="https://www.spaceappschallenge.org"
            target="_blank"
            rel="noreferrer"
            className="hidden lg:flex items-center gap-1 px-3 py-1.5 text-xs font-mono rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 transition-all"
          >
            <span>NASA Space Apps</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </header>
  )
}
