import React from 'react';
import { Radio, Satellite, Compass, TrendingUp, Award } from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  offlineMode, 
  setOfflineMode, 
  isTourOpen,
  setIsTourOpen,
  onOpenTemporalAnalytics,
  onOpenGamcExact,
  onOpenRubric
}) {
  const tabs = [
    { id: 'microclimas', label: '📍 1. Piloto Cochabamba (15 Distritos)', short: '📍 1. Cocha (15 Dist.)' },
    { id: 'incendios', label: '🔥 2. Incendios Tunari (Impacto AOD)', short: '🔥 2. Incendios' },
    { id: 'global_nasa', label: '🌍 3. Reto Global NASA (Trend Detective)', short: '🌍 3. Global NASA' },
  ];

  return (
    <header className="w-full border-b border-neutral-800 bg-neutral-950/95 backdrop-blur-md z-30 shrink-0">
      {/* 1. Fila Principal del Header */}
      <div className="flex h-14 sm:h-16 w-full items-center justify-between px-3 sm:px-5">
        {/* Logos & Titulo Oficial del Reto NASA */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-500 font-black text-white shadow-lg shadow-blue-900/40 shrink-0">
            <Satellite className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 sm:gap-2.5">
              <h1 className="text-sm font-black tracking-wide text-white sm:text-lg whitespace-nowrap">
                NASA <span className="text-cyan-400">TREND DETECTIVE</span>
              </h1>
              <span className="hidden xs:inline rounded-md bg-blue-950 px-2 py-0.5 text-[10px] sm:text-xs font-bold text-blue-300 border border-blue-700/80 uppercase tracking-wider">
                Earth Science
              </span>
              <span className="hidden xl:inline text-xs text-slate-300 font-mono font-semibold">
                Space Apps 2026 • Team Stevens
              </span>
            </div>
            <p className="hidden sm:block text-xs text-slate-300 font-medium truncate max-w-xs md:max-w-md">
              Detección Planetaria & Sensado Virtual de Microclimas
            </p>
          </div>
        </div>

        {/* Tabs Principales Oficiales del Reto en Desktop (md+) */}
        <nav className="hidden md:flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/90 p-1.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-3.5 py-2 text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-neutral-800/80'
              }`}
            >
              <span className="hidden xl:inline">{tab.label}</span>
              <span className="xl:hidden">{tab.short}</span>
            </button>
          ))}
        </nav>

        {/* Acciones Rápidas & Guía del Sistema */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Botón Visor WMS Exacto GAMC + Regresión NASA */}
          <button
            onClick={onOpenGamcExact}
            className="flex items-center gap-1.5 sm:gap-2 rounded-lg border border-indigo-500/60 bg-indigo-950/70 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-bold text-indigo-200 hover:text-white hover:border-indigo-400 hover:bg-indigo-900/80 transition shadow-sm"
            title="Abrir Visor Cartográfico GAMC WMS + Tendencia Superficial NASA en tiempo real"
          >
            <span>🏛️ WMS GAMC</span>
          </button>

          {/* Botón Rúbrica Oficial NASA */}
          <button
            onClick={onOpenRubric}
            className="flex items-center gap-1.5 sm:gap-2 rounded-lg border border-amber-500/60 bg-amber-950/70 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-bold text-amber-200 hover:text-white hover:border-amber-400 hover:bg-amber-900/80 transition shadow-sm"
            title="Ver Matriz de Cumplimiento de los 5 Criterios Oficiales de Evaluación NASA"
          >
            <Award className="h-4 w-4 text-amber-400" />
            <span className="hidden sm:inline">Rúbrica NASA</span>
            <span className="sm:hidden">Rúbrica</span>
          </button>

          {/* Botón Tendencias & Predicción IA */}
          <button
            onClick={onOpenTemporalAnalytics}
            className="flex items-center gap-1.5 sm:gap-2 rounded-lg border border-purple-500/60 bg-purple-950/70 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-bold text-purple-200 hover:text-white hover:border-purple-400 hover:bg-purple-900/80 transition shadow-sm"
            title="Ver Análisis Multitemporal, Ciclo Estacional y Predicción IA 2026"
          >
            <TrendingUp className="h-4 w-4 text-purple-400" />
            <span className="hidden sm:inline">Tendencias & IA</span>
            <span className="sm:hidden">Tendencias</span>
          </button>

          {/* Botón Guía del Sistema / Presentación */}
          <button
            onClick={() => setIsTourOpen(!isTourOpen)}
            className={`flex items-center gap-1.5 sm:gap-2 rounded-lg border px-3 sm:px-3.5 py-1.5 text-xs sm:text-sm font-bold transition shadow-sm ${
              isTourOpen
                ? 'border-cyan-500/80 bg-cyan-950/80 text-cyan-300 ring-1 ring-cyan-400/50'
                : 'border-neutral-700 bg-neutral-900 text-slate-200 hover:text-white hover:border-neutral-500'
            }`}
            title="Abrir u ocultar la Guía de Flujo del Reto"
          >
            <Compass className={`h-4 w-4 ${isTourOpen ? 'animate-spin text-cyan-400' : 'text-cyan-400'}`} />
            <span className="hidden sm:inline">Guía del Reto</span>
            <span className="sm:hidden">Guía</span>
          </button>

          <button
            onClick={() => setOfflineMode(!offlineMode)}
            className={`flex items-center gap-1.5 sm:gap-2 rounded-lg border px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold transition ${
              offlineMode
                ? 'border-emerald-500/60 bg-emerald-950/70 text-emerald-300'
                : 'border-neutral-800 bg-neutral-900 text-slate-300 hover:text-white'
            }`}
            title="Modo Respaldo Local sin Internet"
          >
            <Radio className={`h-4 w-4 ${offlineMode ? 'animate-pulse text-emerald-400' : ''}`} />
            <span className="hidden sm:inline">{offlineMode ? 'Caché Local' : 'NASA Stream'}</span>
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
