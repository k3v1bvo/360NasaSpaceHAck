import React, { useState, useRef, useEffect } from 'react';
import { Activity, Flame, ShieldAlert, Cpu, Database, DatabaseZap, ChevronDown, Check, Globe, Rocket, Moon, AlertTriangle } from 'lucide-react';
import { AtmosphereKey } from '../types';
import { isSupabaseConfigured } from '../lib/supabaseClient';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  atmosphere: AtmosphereKey;
  setAtmosphere: (atm: AtmosphereKey) => void;
}

interface AtmosphereOption {
  key: AtmosphereKey;
  name: string;
  shortName: string;
  o2: number;
  pressurePsia: number;
  pressureKpa: number;
  tag: string;
  tagColor: string;
  glowColor: string;
  borderColor: string;
  icon: typeof Globe;
  description: string;
}

const ATMOSPHERE_OPTIONS: AtmosphereOption[] = [
  {
    key: 'ISS_Standard',
    name: 'Estación Espacial (ISS Standard)',
    shortName: 'ISS Standard',
    o2: 21.0,
    pressurePsia: 14.7,
    pressureKpa: 101.3,
    tag: 'NORMÓXICA',
    tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    glowColor: 'shadow-sky-500/20',
    borderColor: 'border-sky-500/50',
    icon: Globe,
    description: 'Nivel del mar terrestre (101.3 kPa · 21% O₂). Atmósfera nominal de la Estación Espacial.'
  },
  {
    key: 'Artemis_Gateway',
    name: 'Nave Orion / Artemis Gateway',
    shortName: 'Artemis Gateway',
    o2: 34.0,
    pressurePsia: 8.2,
    pressureKpa: 56.5,
    tag: '⚠️ HIPERÓXICA',
    tagColor: 'bg-rose-500/25 text-rose-300 border-rose-500/50 animate-pulse',
    glowColor: 'shadow-rose-500/30',
    borderColor: 'border-rose-500/60',
    icon: Rocket,
    description: 'Baja presión enriquecida (56.5 kPa · 34% O₂). Alto riesgo de aceleración de llama.'
  },
  {
    key: 'Lunar_Habitat',
    name: 'Hábitat Lunar / EVA Prep',
    shortName: 'Base Lunar EVA',
    o2: 32.0,
    pressurePsia: 10.2,
    pressureKpa: 70.3,
    tag: 'EXPLORACIÓN',
    tagColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    glowColor: 'shadow-amber-500/20',
    borderColor: 'border-amber-500/50',
    icon: Moon,
    description: 'Protocolo descompresivo para trajes xEMU (70.3 kPa · 32% O₂). Superficie lunar.'
  }
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  atmosphere,
  setAtmosphere
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const tabs = [
    { id: 'dashboard', label: 'Centro de Mando', icon: Activity },
    { id: 'simulator', label: 'Simulador de Flamas', icon: Flame },
    { id: 'predictor', label: 'Predictor de Riesgo ML', icon: ShieldAlert },
    { id: 'assistant', label: 'Asistente IA Autónomo', icon: Cpu },
    { id: 'psi', label: 'Investigaciones PSI (24)', icon: Database }
  ];

  const currentOption = ATMOSPHERE_OPTIONS.find(opt => opt.key === atmosphere) || ATMOSPHERE_OPTIONS[0];
  const CurrentIcon = currentOption.icon;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="border-b border-slate-800/90 bg-slate-950/95 backdrop-blur-2xl sticky top-0 z-50 shadow-2xl shadow-black/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Header Row: Spacious 88px height */}
        <div className="flex items-center justify-between h-20 sm:h-22 gap-4 sm:gap-8">

          {/* Platform Identity */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500/20 to-sky-600/10 border border-sky-400/40 flex items-center justify-center text-sky-400 shadow-lg shadow-sky-500/15">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <span className="font-mono font-bold tracking-wider text-slate-100 text-lg sm:text-xl">
                  FIRELOCK
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-ping" />
                  OPERACIONAL
                </span>
                <span className="hidden lg:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                  DATOS REALES NASA PSI
                </span>
                {isSupabaseConfigured && (
                  <span className="hidden xl:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                    <DatabaseZap className="w-3.5 h-3.5 mr-1" />
                    CLOUD DB
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5 hidden sm:block">
                Consola Oficial de Seguridad de Combustión en Microgravedad // NASA Space Apps
              </div>
            </div>
          </div>

          {/* ── ATMOSPHERE SELECTOR HUD: Striking, Aerospace styled with live metrics ── */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`flex items-center space-x-3 sm:space-x-4 px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl bg-slate-900/90 border-2 transition-all duration-300 shadow-xl cursor-pointer ${currentOption.borderColor} ${currentOption.glowColor} hover:scale-[1.02]`}
              aria-expanded={dropdownOpen}
              aria-label="Selector de atmósfera de cabina"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-sky-400 shadow-inner shrink-0">
                <CurrentIcon className="w-5 h-5 text-sky-300" />
              </div>

              <div className="text-left font-mono">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold hidden sm:inline">
                    ATMÓSFERA ACTIVA
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${currentOption.tagColor}`}>
                    {currentOption.tag}
                  </span>
                </div>
                <div className="text-sm sm:text-base font-bold text-slate-100 flex items-center space-x-2">
                  <span>{currentOption.shortName}</span>
                  <span className="text-sky-400 font-mono text-xs sm:text-sm font-semibold">
                    ({currentOption.o2}% O₂ · {currentOption.pressurePsia} psia)
                  </span>
                </div>
              </div>

              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu Modal */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-slate-950 border-2 border-slate-700/80 shadow-2xl p-2 z-50 backdrop-blur-2xl animate-fade-in font-sans">
                <div className="px-3 py-2 text-xs font-mono text-slate-400 uppercase tracking-wider border-b border-slate-800 flex items-center justify-between">
                  <span>Seleccionar Ambiente de Misión</span>
                  <span className="text-sky-400 font-bold">NASA Presets</span>
                </div>

                <div className="space-y-1.5 mt-2">
                  {ATMOSPHERE_OPTIONS.map((opt) => {
                    const isSelected = opt.key === atmosphere;
                    const OptIcon = opt.icon;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => {
                          setAtmosphere(opt.key);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left p-3 rounded-xl transition-all flex items-start space-x-3 cursor-pointer ${isSelected
                            ? 'bg-sky-500/15 border-2 border-sky-400/60 shadow-lg shadow-sky-500/10'
                            : 'hover:bg-slate-900 border border-transparent'
                          }`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${isSelected ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40' : 'bg-slate-900 text-slate-400'
                          }`}>
                          <OptIcon className="w-5 h-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-slate-100 font-mono">{opt.name}</span>
                            {isSelected && <Check className="w-4 h-4 text-sky-400 shrink-0 ml-1" />}
                          </div>

                          <div className="flex items-center space-x-2 my-1 text-xs font-mono">
                            <span className="text-sky-300 font-bold">{opt.o2}% O₂</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-slate-300">{opt.pressurePsia} psia ({opt.pressureKpa} kPa)</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded border font-bold ${opt.tagColor}`}>
                              {opt.tag}
                            </span>
                          </div>

                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {opt.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800/80 px-3 py-1.5 text-[11px] text-slate-500 font-mono flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Cambiar la atmósfera recalcula en vivo el riesgo en todos los módulos.</span>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Navigation Tabs Bar: Comfortable, generous spacing between tabs (gap-3 to gap-5) */}
        <nav className="flex items-center gap-3 sm:gap-4 lg:gap-5 border-t border-slate-800/80 pt-3 pb-3.5 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-3 px-5 sm:px-6 py-3 rounded-2xl text-sm sm:text-base font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer select-none ${isActive
                    ? 'bg-gradient-to-r from-sky-500/25 to-sky-600/15 text-sky-200 border-2 border-sky-400/60 shadow-lg shadow-sky-500/20 scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border-2 border-transparent'
                  }`}
              >
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-sky-300' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

      </div>
    </header>
  );
};

export default Navbar;
