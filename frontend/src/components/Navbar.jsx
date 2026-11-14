import React from 'react';
import { Globe, Radio, BellRing, Sparkles, Satellite } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, offlineMode, setOfflineMode, onOpenReport }) {
  const tabs = [
    { id: 'global_nasa', label: '🌍 Explorador Global', badge: 'Planetary' },
    { id: 'microclimas', label: '📍 Piloto Cochabamba', badge: 'Microclimas' },
    { id: 'incendios', label: '🔥 Incendios Tunari', badge: 'Fuego & Humo' },
  ];

  return (
    <header 
      className="flex h-16 w-full items-center justify-between border-b border-neutral-800 bg-neutral-950/95 px-4 backdrop-blur-md"
      style={{ height: '64px', minHeight: '64px', display: 'flex', alignItems: 'center' }}
    >
      {/* Logos & Titulo Oficial del Reto NASA */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-500 font-black text-white shadow-lg shadow-blue-900/40">
          <Satellite className="h-6 w-6 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-black tracking-wide text-white sm:text-base">
              NASA <span className="text-cyan-400">TREND DETECTIVE</span>
            </h1>
            <span className="rounded bg-blue-950 px-2 py-0.5 text-[9px] font-bold text-blue-300 border border-blue-800/80 uppercase tracking-wider">
              Earth System Science
            </span>
            <span className="hidden lg:inline text-[10px] text-neutral-400 font-mono">
              Space Apps 2026 • Team Stevens
            </span>
          </div>
          <p className="text-[10px] text-neutral-400">
            Detección Planetaria de Tendencias Satelitales & Sensado Virtual de Microclimas
          </p>
        </div>
      </div>

      {/* Tabs Principales: Global Explorer | Caso Piloto Cochabamba | Causa Incendios */}
      <nav className="hidden md:flex items-center gap-1 rounded-xl border border-neutral-800 bg-neutral-900/90 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Acciones Rápidas & Telemetría */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOfflineMode(!offlineMode)}
          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
            offlineMode
              ? 'border-emerald-500/50 bg-emerald-950/60 text-emerald-400'
              : 'border-neutral-800 bg-neutral-900 text-neutral-400'
          }`}
          title="Modo Respaldo Local sin Internet"
        >
          <Radio className={`h-3.5 w-3.5 ${offlineMode ? 'animate-pulse text-emerald-400' : ''}`} />
          <span className="hidden sm:inline">{offlineMode ? 'Caché Local' : 'NASA Live Stream'}</span>
        </button>

        <button
          onClick={onOpenReport}
          className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-md hover:bg-red-500 transition"
        >
          <BellRing className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Alerta Temprana</span>
        </button>
      </div>
    </header>
  );
}
