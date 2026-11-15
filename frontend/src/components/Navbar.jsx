import React from 'react';
import { Radio, BellRing, Satellite, Compass } from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  offlineMode, 
  setOfflineMode, 
  onOpenReport,
  isTourOpen,
  setIsTourOpen
}) {
  const tabs = [
    { id: 'microclimas', label: '📍 1. Piloto Cochabamba (15 Distritos)', short: '📍 1. Cocha (15 Dist.)' },
    { id: 'incendios', label: '🔥 2. Incendios Tunari (Impacto AOD)', short: '🔥 2. Incendios' },
    { id: 'global_nasa', label: '🌍 3. Reto Global NASA (Trend Detective)', short: '🌍 3. Global NASA' },
  ];

  return (
    <header className="w-full border-b border-neutral-800 bg-neutral-950/95 backdrop-blur-md z-30 shrink-0">
      {/* 1. Fila Principal del Header */}
      <div className="flex h-14 sm:h-16 w-full items-center justify-between px-3 sm:px-4">
        {/* Logos & Titulo Oficial del Reto NASA */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-500 font-black text-white shadow-lg shadow-blue-900/40 shrink-0">
            <Satellite className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-xs font-black tracking-wide text-white sm:text-base whitespace-nowrap">
                NASA <span className="text-cyan-400">TREND DETECTIVE</span>
              </h1>
              <span className="hidden xs:inline rounded bg-blue-950 px-1.5 py-0.5 text-[8px] sm:text-[9px] font-bold text-blue-300 border border-blue-800/80 uppercase tracking-wider">
                Earth Science
              </span>
              <span className="hidden xl:inline text-[10px] text-neutral-400 font-mono">
                Space Apps 2026 • Team Stevens
              </span>
            </div>
            <p className="hidden sm:block text-[10px] text-neutral-400 truncate max-w-xs md:max-w-md">
              Detección Planetaria & Sensado Virtual de Microclimas
            </p>
          </div>
        </div>

        {/* Tabs Principales Oficiales del Reto en Desktop (md+) */}
        <nav className="hidden md:flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900/90 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span className="hidden xl:inline">{tab.label}</span>
              <span className="xl:hidden">{tab.short}</span>
            </button>
          ))}
        </nav>

        {/* Acciones Rápidas & Guía del Sistema */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Botón Guía del Sistema / Presentación */}
          <button
            onClick={() => setIsTourOpen(!isTourOpen)}
            className={`flex items-center gap-1 sm:gap-1.5 rounded-lg border px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-bold transition shadow-sm ${
              isTourOpen
                ? 'border-cyan-500/80 bg-cyan-950/80 text-cyan-300 ring-1 ring-cyan-400/50'
                : 'border-neutral-700 bg-neutral-900 text-neutral-300 hover:text-white hover:border-neutral-600'
            }`}
            title="Abrir u ocultar la Guía de Flujo del Reto"
          >
            <Compass className={`h-3.5 w-3.5 ${isTourOpen ? 'animate-spin text-cyan-400' : 'text-cyan-400'}`} />
            <span className="hidden sm:inline">Guía del Reto</span>
            <span className="sm:hidden">Guía</span>
          </button>

          <button
            onClick={() => setOfflineMode(!offlineMode)}
            className={`flex items-center gap-1 sm:gap-1.5 rounded-lg border px-2 sm:px-2.5 py-1 text-xs font-medium transition ${
              offlineMode
                ? 'border-emerald-500/50 bg-emerald-950/60 text-emerald-400'
                : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
            }`}
            title="Modo Respaldo Local sin Internet"
          >
            <Radio className={`h-3.5 w-3.5 ${offlineMode ? 'animate-pulse text-emerald-400' : ''}`} />
            <span className="hidden sm:inline">{offlineMode ? 'Caché Local' : 'NASA Stream'}</span>
          </button>

          <button
            onClick={onOpenReport}
            className="flex items-center gap-1 sm:gap-1.5 rounded-lg bg-red-600 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-bold text-white shadow-md hover:bg-red-500 transition"
          >
            <BellRing className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Alerta Temprana</span>
          </button>
        </div>
      </div>

      {/* 2. Barra de Navegación Móvil (< md) */}
      <nav className="flex md:hidden border-t border-neutral-900 bg-[#090b10] px-2 py-1.5 gap-1.5 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1 shrink-0 rounded-lg px-3 py-1 text-xs font-semibold transition ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow'
                : 'bg-neutral-900/80 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
