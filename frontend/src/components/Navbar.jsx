import React from 'react';
import { Globe, Radio, BellRing, Shield } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, offlineMode, setOfflineMode, onOpenReport }) {
  const tabs = [
    { id: 'microclimas', label: '🌡️ Detective de Tendencias IA', badge: 'GAMC 01/05 & NASA' },
    { id: 'incendios', label: '🔥 Incendios Tunari (Kevin)', badge: 'Motor AOD & GAMC 03' },
    { id: 'global_nasa', label: '🌍 Global NASA Mode', badge: 'English Stream' },
  ];

  return (
    <header 
      className="flex h-16 w-full items-center justify-between border-b border-neutral-800 bg-neutral-950/90 px-4 backdrop-blur-md"
      style={{ height: '64px', minHeight: '64px', display: 'flex', alignItems: 'center' }}
    >
      {/* Logos & Titulo */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-500 font-black text-white shadow-lg">
          <Globe className="h-6 w-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-black tracking-wide text-white sm:text-base">
              GEO-COCHABAMBA <span className="text-blue-500">360</span>
            </h1>
            <span className="rounded bg-blue-900/60 px-1.5 py-0.5 text-[9px] font-bold text-blue-300">
              NASA + GAMC FEXCO
            </span>
          </div>
          <p className="text-[10px] text-neutral-400">
            Plataforma Unificada de Resiliencia Climática & Alerta Temprana
          </p>
        </div>
      </div>

      {/* Tabs Principales de los 4 Retos */}
      <nav className="hidden md:flex items-center gap-1 rounded-xl border border-neutral-800 bg-neutral-900/90 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Acciones Rápidas & Modo Offline */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOfflineMode(!offlineMode)}
          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
            offlineMode
              ? 'border-emerald-500/50 bg-emerald-950/60 text-emerald-400'
              : 'border-neutral-800 bg-neutral-900 text-neutral-400'
          }`}
          title="Modo FEXCO Hackathon-Proof (Caché local sin internet)"
        >
          <Radio className={`h-3.5 w-3.5 ${offlineMode ? 'animate-pulse text-emerald-400' : ''}`} />
          <span>{offlineMode ? 'Modo Local FEXCO' : 'Online'}</span>
        </button>

        <button
          onClick={onOpenReport}
          className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-md hover:bg-red-500 transition"
        >
          <BellRing className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Alerta Vecinal</span>
        </button>
      </div>
    </header>
  );
}
