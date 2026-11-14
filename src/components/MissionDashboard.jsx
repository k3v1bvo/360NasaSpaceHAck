import React from 'react';
import { Activity, Database, AlertTriangle, Cpu, TrendingDown, Clock, ShieldCheck, Flame } from 'lucide-react';
import { MATERIALS, ATMOSPHERES } from '../physics/flameKinetics';

export default function MissionDashboard({ atmosphere }) {
  const currentAtm = ATMOSPHERES[atmosphere] || ATMOSPHERES.ISS_Standard;

  const kpis = [
    { title: "Investigaciones Indexadas", value: "24", sub: "Combustión en Microgravedad", icon: Database, color: "text-sky-400" },
    { title: "Volumen de Datos PSI", value: "12 TB", sub: "Telemetría, Video y Sensores", icon: Activity, color: "text-amber-400" },
    { title: "Caída Promedio de LOI", value: "-3.5 pp", sub: "Mayor riesgo que en Tierra", icon: TrendingDown, color: "text-orange-400" },
    { title: "Modelos Predictivos IA", value: "3 Activos", sub: "R² = 0.961 · Precisión = 97.7%", icon: Cpu, color: "text-emerald-400" }
  ];

  const materialList = Object.keys(MATERIALS).map(key => {
    const mat = MATERIALS[key];
    const loiOrbital = (mat.LOI_1g + mat.base_shift).toFixed(1);
    const isFlammable = currentAtm.O2_percent >= loiOrbital;
    return { ...mat, key, loiOrbital, isFlammable };
  });

  return (
    <div className="space-y-6">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="card-aerospace p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{kpi.title}</span>
                <Icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <div className="my-3">
                <div className={`text-3xl font-mono font-bold ${kpi.color}`}>{kpi.value}</div>
                <div className="text-xs text-slate-400 mt-1">{kpi.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: LOI Comparison & Mission Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: LOI Bar Comparison Table / Visualization */}
        <div className="lg:col-span-7 card-aerospace p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <span>Paradoja de Inflamabilidad: LOI Tierra vs Microgravedad</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Límite de Oxígeno (LOI). En órbita con flujo forzado lento (0.4–5 cm/s), los materiales arden con menos oxígeno.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-750 text-sky-300">
                O₂ Actual: {currentAtm.O2_percent}%
              </span>
            </div>
          </div>

          <div className="space-y-4 mt-6">
            {materialList.map((m) => {
              const maxLoi = 35;
              const pct1g = Math.min((m.LOI_1g / maxLoi) * 100, 100);
              const pctMicrog = Math.min((m.loiOrbital / maxLoi) * 100, 100);

              return (
                <div key={m.key} className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="font-semibold text-slate-200 text-sm">{m.name}</span>
                      <span className="text-xs text-slate-400 ml-2">({m.category})</span>
                    </div>
                    <div>
                      {m.isFlammable ? (
                        <span className="badge-clean-danger">Inflamable en Cabina</span>
                      ) : (
                        <span className="badge-clean-safe">Auto-Extinguible</span>
                      )}
                    </div>
                  </div>

                  {/* Dual Bar Comparison */}
                  <div className="space-y-1.5 font-mono text-xs">
                    <div>
                      <div className="flex justify-between text-slate-400 mb-0.5">
                        <span>Tierra 1-g (NASA-STD-6001B): {m.LOI_1g}%</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${pct1g}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 mb-0.5">
                        <span>Microgravedad (FLARE / BASS): {m.loiOrbital}% (Δ {m.base_shift} pp)</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                        <div className="bg-orange-500 h-full rounded-full transition-all" style={{ width: `${pctMicrog}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Historical Lessons & Aerothermal Dynamics */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="card-aerospace p-6">
            <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2 mb-3">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>Cronología de Misiones Orbitales</span>
            </h3>
            <div className="space-y-3.5 text-xs">
              <div className="border-l-2 border-sky-500 pl-3">
                <span className="font-mono text-sky-400 font-bold">1997 · STS-83 (Columbia)</span>
                <p className="text-slate-300 mt-0.5">DCE observa la primera llama esférica y extinción radiativa pura.</p>
              </div>
              <div className="border-l-2 border-sky-500 pl-3">
                <span className="font-mono text-sky-400 font-bold">2009 · ISS (CIR)</span>
                <p className="text-slate-300 mt-0.5">FLEX descubre las Llamas Frías (química LTC a 600–800 K sin luz visible).</p>
              </div>
              <div className="border-l-2 border-sky-500 pl-3">
                <span className="font-mono text-sky-400 font-bold">2014 · ISS (MSG)</span>
                <p className="text-slate-300 mt-0.5">BASS-II demuestra que cables delgados (&lt; 1 mm) arden hasta 4x más rápido.</p>
              </div>
              <div className="border-l-2 border-sky-500 pl-3">
                <span className="font-mono text-sky-400 font-bold">2016 · Cygnus Cargo</span>
                <p className="text-slate-300 mt-0.5">Saffire ejecuta el primer incendio a escala de 1 metro en nave espacial real.</p>
              </div>
              <div className="border-l-2 border-sky-500 pl-3">
                <span className="font-mono text-sky-400 font-bold">2022 · ISS (Kibo SCEM)</span>
                <p className="text-slate-300 mt-0.5">FLARE consolida la norma ISO 4589-4 para predecir el LOI orbital.</p>
              </div>
            </div>
          </div>

          <div className="card-aerospace p-6 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/40">
            <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Solución de Supresión Recomendada</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              La supresión mediante <b>Micro-Niebla de Agua a Alta Presión (NFPA 750, 35 bar, gotas de 35 µm con aditivo encapsulante F-500 EA)</b> absorbe 2,257 kJ/kg por calor latente instantáneo, sofocando el fuego sin sobrepresurizar la cabina ni generar asfixia por CO₂ en la tripulación.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

