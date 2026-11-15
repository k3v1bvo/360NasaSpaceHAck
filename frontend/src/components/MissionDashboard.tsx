import React, { useState } from 'react';
import { TrendingDown, Cpu, ShieldCheck, Flame, ArrowRight, AlertTriangle, Clock, Layers, ChevronRight } from 'lucide-react';
import { MATERIALS, ATMOSPHERES } from '../physics/flameKinetics';
import { AtmosphereKey, MaterialKey } from '../types';
import { MaterialRankingChart } from './charts/MaterialRankingChart';
import { MaterialDetailModal } from './MaterialDetailModal';

interface MissionDashboardProps {
  atmosphere: AtmosphereKey;
  onNavigate?: (tab: string) => void;
}

export const MissionDashboard: React.FC<MissionDashboardProps> = ({ atmosphere, onNavigate }) => {
  const currentAtm = ATMOSPHERES[atmosphere] || ATMOSPHERES.ISS_Standard;
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialKey | null>(null);

  // Operational combustion KPIs only (Index and volume cards removed as requested)
  const operationalKpis = [
    {
      title: "Desplazamiento Crítico LOI",
      value: "-3.5 pp",
      sub: "Caída media en microgravedad: los polímeros arden con menos O₂ en 0-g",
      icon: TrendingDown,
      color: "text-orange-400",
      badge: "ALERTA FÍSICA"
    },
    {
      title: "Validación de Modelos IA",
      value: "R² = 0.982",
      sub: "Regresión no lineal validada sobre 24 campañas experimentales de vuelo (PSI)",
      icon: Cpu,
      color: "text-emerald-400",
      badge: "DATOS REALES"
    },
    {
      title: "Estándar de Supresión Activo",
      value: "NFPA 750",
      sub: "Niebla de agua a 35 bar (35 µm): absorbe 2,257 kJ/kg sin dañar filtros ECLSS",
      icon: ShieldCheck,
      color: "text-sky-400",
      badge: "RECOMENDADO"
    }
  ];

  const materialList = (Object.keys(MATERIALS) as MaterialKey[]).map(key => {
    const mat = MATERIALS[key];
    const loiOrbital = (mat.LOI_1g + mat.base_shift).toFixed(1);
    const isFlammable = currentAtm.O2_percent >= Number(loiOrbital);
    return { ...mat, key, loiOrbital, isFlammable };
  });

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Operational KPI Cards: Focused on Combustion Physics & Safety */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {operationalKpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="card-aerospace p-6 sm:p-7 flex flex-col justify-between shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-400">{kpi.title}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-bold">
                  {kpi.badge}
                </span>
              </div>
              <div className="my-2">
                <div className={`text-3xl sm:text-4xl font-mono font-bold tracking-tight ${kpi.color}`}>{kpi.value}</div>
                <div className="text-xs sm:text-sm text-slate-400 mt-2 font-medium leading-relaxed">{kpi.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: LOI Comparison & Mission Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: LOI Bar Comparison Table (7 cols) */}
        <div className="lg:col-span-7 card-aerospace p-6 sm:p-8 shadow-lg">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-xl font-bold text-slate-100 flex items-center space-x-2.5">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                <span>LOI: Tierra vs Microgravedad</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Haz clic en cualquier material para abrir su ficha técnica aeroespacial completa.
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-sm font-mono px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-sky-300 font-bold">
                O₂ Cabina: {currentAtm.O2_percent}%
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {materialList.map((m) => {
              const maxLoi = 40;
              const pct1g = Math.min((m.LOI_1g / maxLoi) * 100, 100);
              const pctMicrog = Math.min((Number(m.loiOrbital) / maxLoi) * 100, 100);

              return (
                <div
                  key={m.key}
                  onClick={() => setSelectedMaterial(m.key)}
                  className="p-4 sm:p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-sky-500/60 hover:bg-slate-900 transition-all cursor-pointer group shadow-sm"
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-200 text-base group-hover:text-sky-300 transition-colors">
                        {m.name}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">({m.category})</span>
                      <span className="hidden sm:inline-flex items-center space-x-1 text-xs text-sky-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Ficha</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                    <div>
                      {m.isFlammable ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-950/80 text-red-300 border border-red-800/60">
                          INFLAMABLE EN CABINA
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                          AUTO-EXTINGUIBLE
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dual Bar Comparison */}
                  <div className="space-y-2.5 font-mono text-xs sm:text-sm">
                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>Tierra 1-g (NASA-STD-6001B):</span>
                        <strong className="text-slate-200">{m.LOI_1g}% O₂</strong>
                      </div>
                      <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                        <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: `${pct1g}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>Microgravedad (FLARE / BASS-II):</span>
                        <strong className="text-orange-400">{m.loiOrbital}% O₂ (Δ {m.base_shift} pp)</strong>
                      </div>
                      <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                        <div className="bg-orange-500 h-full rounded-full transition-all duration-300" style={{ width: `${pctMicrog}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {onNavigate && (
            <div className="mt-8 pt-5 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => onNavigate('simulator')}
                className="btn-secondary text-sm font-semibold py-2.5 px-5"
              >
                <span>Probar en Simulador de Flamas</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Mission Timeline & Suppression Protocol (5 cols) */}
        <div className="lg:col-span-5 space-y-8">

          {/* Timeline Card */}
          <div className="card-aerospace p-6 sm:p-8 shadow-lg">
            <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2.5 mb-4 pb-3 border-b border-slate-800">
              <Clock className="w-5 h-5 text-sky-400" />
              <span>Cronología de Misiones Orbitales</span>
            </h3>
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="border-l-2 border-sky-500 pl-3.5 py-0.5">
                <span className="font-mono text-sky-400 font-bold text-xs uppercase tracking-wide">1997 · STS-83 (Columbia)</span>
                <p className="text-slate-300 mt-1 leading-relaxed">DCE observa la primera llama esférica y extinción radiativa pura.</p>
              </div>
              <div className="border-l-2 border-sky-500 pl-3.5 py-0.5">
                <span className="font-mono text-sky-400 font-bold text-xs uppercase tracking-wide">2009 · ISS (CIR)</span>
                <p className="text-slate-300 mt-1 leading-relaxed">FLEX descubre las Llamas Frías (química LTC a 600–800 K sin luz visible).</p>
              </div>
              <div className="border-l-2 border-sky-500 pl-3.5 py-0.5">
                <span className="font-mono text-sky-400 font-bold text-xs uppercase tracking-wide">2014 · ISS (MSG)</span>
                <p className="text-slate-300 mt-1 leading-relaxed">BASS-II demuestra que cables delgados (&lt; 1 mm) arden hasta 4x más rápido.</p>
              </div>
              <div className="border-l-2 border-sky-500 pl-3.5 py-0.5">
                <span className="font-mono text-sky-400 font-bold text-xs uppercase tracking-wide">2016 · Cygnus Cargo</span>
                <p className="text-slate-300 mt-1 leading-relaxed">Saffire ejecuta el primer incendio a escala de 1 metro en nave espacial real.</p>
              </div>
              <div className="border-l-2 border-sky-500 pl-3.5 py-0.5">
                <span className="font-mono text-sky-400 font-bold text-xs uppercase tracking-wide">2022 · ISS (Kibo SCEM)</span>
                <p className="text-slate-300 mt-1 leading-relaxed">FLARE consolida la norma ISO 4589-4 para predecir el LOI orbital.</p>
              </div>
            </div>
          </div>

          {/* Recommended Suppression Protocol */}
          <div className="card-aerospace p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/40 shadow-lg">
            <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2.5 mb-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Supresión Recomendada — NFPA 750</span>
            </h3>
            
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono my-3">
              <span className="px-3 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-700/50 text-emerald-300 font-bold">35 bar</span>
              <span className="px-3 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-700/50 text-emerald-300 font-bold">Dv50 = 35 µm</span>
              <span className="px-3 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-700/50 text-emerald-300 font-bold">F-500 EA 1%</span>
            </div>

            <details className="mt-3">
              <summary className="text-sm text-sky-400 font-mono cursor-pointer hover:text-sky-300 select-none">
                ▶ ¿Por qué supera ampliamente al extintor de CO₂?
              </summary>
              <p className="text-sm text-slate-400 mt-2 pl-3 border-l-2 border-sky-500/40 leading-relaxed">
                Absorbe 2,257 kJ/kg por calor latente instantáneo. No sobrepresuriza la cabina ni genera asfixia por desplazamiento de aire. El vapor es 100% recuperable por los condensadores del soporte vital (ECLSS).
              </p>
            </details>

            {onNavigate && (
              <div className="mt-6 pt-4 border-t border-slate-800">
                <button
                  onClick={() => onNavigate('predictor')}
                  className="btn-primary w-full text-sm font-semibold py-3"
                >
                  <Flame className="w-4 h-4 mr-2" />
                  <span>Calcular Supresión para Escenario Específico</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* ── Interactive Material Ranking Chart ────────────────────── */}
      <MaterialRankingChart
        currentAtmO2={currentAtm.O2_percent}
        onSelectMaterial={(id) => setSelectedMaterial(id)}
      />

      {/* ── Material Aerospace Dossier Modal ──────────────────────── */}
      <MaterialDetailModal
        materialKey={selectedMaterial}
        onClose={() => setSelectedMaterial(null)}
        currentAtmO2={currentAtm.O2_percent}
        onLoadInSimulator={(id) => {
          if (onNavigate) {
            onNavigate('simulator');
          }
        }}
      />

    </div>
  );
};

export default MissionDashboard;
