import React from 'react';
import { Activity, Flame, ShieldAlert, Cpu, Database, Compass, Radio } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, atmosphere, setAtmosphere }) {
  const tabs = [
    { id: 'dashboard', label: 'Centro de Mando', icon: Activity },
    { id: 'simulator', label: 'Simulador de Flamas', icon: Flame },
    { id: 'predictor', label: 'Predictor de Riesgo ML', icon: ShieldAlert },
    { id: 'assistant', label: 'Asistente IA Entrenado', icon: Cpu },
    { id: 'psi', label: 'Investigaciones PSI (24)', icon: Database }
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          
          {/* Logo & Platform Info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-400/30 flex items-center justify-center text-sky-400">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold tracking-wider text-slate-100 text-lg">FLAME IN FREEFALL</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-ping"></span>
                  OPERACIONAL
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono">Consola de Seguridad Térmica y Predicción en Microgravedad</div>
            </div>
          </div>

          {/* Atmosphere Environment Selector */}
          <div className="hidden lg:flex items-center space-x-3 bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5">
            <Radio className="w-4 h-4 text-sky-400" />
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Atmósfera:</span>
            <select
              value={atmosphere}
              onChange={(e) => setAtmosphere(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-sky-300 font-mono focus:border-sky-500"
            >
              <option value="ISS_Standard">ISS Standard (14.7 psia · 21% O2)</option>
              <option value="Artemis_Gateway">Artemis Gateway (10.2 psia · 34% O2)</option>
              <option value="Lunar_Habitat">Lunar Surface (8.2 psia · 32% O2)</option>
            </select>
          </div>
        </div>

        {/* Big, Clear Navigation Bar Buttons */}
        <nav className="flex space-x-1 sm:space-x-2 border-t border-slate-850 pt-2 pb-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 whitespace-nowrap ${
                  isActive
                    ? 'bg-sky-500/15 text-sky-300 border border-sky-400/50 shadow-sm shadow-sky-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

      </div>
    </header>
  );
}
