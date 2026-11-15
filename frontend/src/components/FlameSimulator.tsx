import React, { useState, useEffect } from 'react';
import { Flame, Play, RefreshCw, AlertTriangle, Gauge, Eye, EyeOff, ShieldAlert, Thermometer, Wind, CheckCircle2, Info } from 'lucide-react';
import { calculateFlameSpread, simulateCoolFlame, MATERIALS, ATMOSPHERES } from '../physics/flameKinetics';
import { MaterialKey, AtmosphereKey } from '../types';
import { FlameSpreadChart } from './charts/FlameSpreadChart';
import { ThermalFlameViewer } from './charts/ThermalFlameViewer';
import { SafetyEnvelopeMap } from './charts/SafetyEnvelopeMap';

interface FlameSimulatorProps {
  atmosphere: AtmosphereKey;
}

export const FlameSimulator: React.FC<FlameSimulatorProps> = ({ atmosphere }) => {
  const currentAtm = ATMOSPHERES[atmosphere] || ATMOSPHERES.ISS_Standard;

  const [material, setMaterial] = useState<MaterialKey>('PMMA');
  const [diameter, setDiameter] = useState<number>(2.0);
  const [flowVelocity, setFlowVelocity] = useState<number>(2.5);
  const [isSimulatingCool, setIsSimulatingCool] = useState<boolean>(false);
  const [coolSimStep, setCoolSimStep] = useState<number>(0);

  const vf = calculateFlameSpread(flowVelocity, diameter, material, currentAtm.P_atm, currentAtm.O2_percent / 100.0);
  const coolData = simulateCoolFlame(60, 60);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isSimulatingCool) {
      interval = setInterval(() => {
        setCoolSimStep((prev) => {
          if (prev >= coolData.times.length - 1) {
            setIsSimulatingCool(false);
            return prev;
          }
          return prev + 1;
        });
      }, 100);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isSimulatingCool, coolData.times.length]);

  const currentTime = coolData.times[coolSimStep];
  const currentTemp = coolData.temperatures[coolSimStep];
  const currentH2O2 = coolData.h2o2_ppm[coolSimStep];
  const currentCO = coolData.co_ppm[coolSimStep];

  // Dynamic phase classification for cool flame trajectory
  let phaseInfo = {
    title: "Fase 1: Combustión Caliente Visible (Hot Flame)",
    color: "text-rose-400",
    bg: "bg-rose-950/30 border-rose-500/40",
    opticalVisible: true,
    crewAction: "Alerta máxima. Cortar ventilación forzada HVAC inmediatamente para inducir enfriamiento por radiación.",
    sensorStatus: "Detectores fotoeléctricos y cámaras ópticas: LLAMA VISIBLE DETECTADA"
  };

  if (currentTime >= 12.0 && currentTime < 16.0) {
    phaseInfo = {
      title: "Fase 2: Extinción Óptica Aparente (Ceguera Sensorial)",
      color: "text-amber-400",
      bg: "bg-amber-950/30 border-amber-500/40",
      opticalVisible: false,
      crewAction: "¡ALERTA DE SEGURIDAD! NO restablecer la ventilación ni asumir extinción. La llama visible desapareció pero la química sigue activa.",
      sensorStatus: "Detectores fotoeléctricos de cabina: CERO HUMO / FALSA ALARMA DE APAGADO"
    };
  } else if (currentTime >= 16.0 && currentTime < 45.0) {
    phaseInfo = {
      title: "Fase 3: Meseta Oculta de Llama Fría (Química LTC: 600–800 K)",
      color: "text-sky-400",
      bg: "bg-sky-950/30 border-sky-500/40",
      opticalVisible: false,
      crewAction: "Mantener confinamiento. Aplicar niebla de agua NFPA 750 (35 bar) para colapsar la meseta térmica sin dispersar gases.",
      sensorStatus: "Cámaras ópticas: INVISIBLE | Sensores químicos: H₂O₂ y CO EN AUMENTO CONTINUO"
    };
  } else if (currentTime >= 45.0) {
    phaseInfo = {
      title: "Fase 4: Disipación Térmica Latente (Enfriamiento Seguro)",
      color: "text-emerald-400",
      bg: "bg-emerald-950/30 border-emerald-500/40",
      opticalVisible: false,
      crewAction: "Temperatura bajo 350 K. Seguro ventilar únicamente tras confirmar H₂O₂ < 1 ppm por sensores ECLSS.",
      sensorStatus: "Temperatura aproximándose a ambiente de cabina (298 K). Riesgo de reinicio minimizado."
    };
  }

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ── Parameter Control Bar ─────────────────────────────────── */}
      <div className="card-aerospace p-6 sm:p-8 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
          <h3 className="text-xl font-bold text-slate-100 flex items-center space-x-2.5">
            <Flame className="w-5 h-5 text-sky-400" />
            <span>Parámetros Físicos de Combustión</span>
          </h3>
          <span className="text-sm font-mono text-slate-300 font-semibold px-3 py-1 bg-slate-900 rounded-lg border border-slate-700">
            Atmósfera: <strong className="text-sky-300">{currentAtm.name}</strong> ({currentAtm.O2_percent}% O₂)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div>
            <label className="text-xs font-mono uppercase text-slate-400 block mb-2.5 font-semibold">Material Combustible</label>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value as MaterialKey)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 font-medium focus:border-sky-500 outline-none"
            >
              {(Object.keys(MATERIALS) as (keyof typeof MATERIALS)[]).map((k) => (
                <option key={k} value={k}>{MATERIALS[k].name}</option>
              ))}
            </select>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex justify-between items-center text-sm font-semibold text-slate-300 mb-2">
              <span>Diámetro de Combustible:</span>
              <span className="font-mono text-sky-400 font-bold text-base">{diameter.toFixed(1)} mm</span>
            </div>
            <input
              type="range" min="0.5" max="6.0" step="0.5" value={diameter}
              onChange={(e) => setDiameter(parseFloat(e.target.value))}
              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex justify-between items-center text-sm font-semibold text-slate-300 mb-2">
              <span>Flujo Opuesto HVAC:</span>
              <span className="font-mono text-sky-400 font-bold text-base">{flowVelocity.toFixed(1)} cm/s</span>
            </div>
            <input
              type="range" min="0.0" max="12.0" step="0.2" value={flowVelocity}
              onChange={(e) => setFlowVelocity(parseFloat(e.target.value))}
              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
          </div>
        </div>

        {/* Real-time KPI Telemetry */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-6 border-t border-slate-800">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-xs text-slate-400 uppercase font-semibold font-mono">Tasa de Propagación (Vf)</div>
            <div className="text-3xl sm:text-4xl font-mono font-bold text-sky-400 mt-1.5">
              {vf.toFixed(2)} <span className="text-sm font-normal text-slate-400">mm/s</span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-xs text-slate-400 uppercase font-semibold font-mono">Régimen Convectivo</div>
            <div className="text-base font-bold text-slate-200 mt-2">
              {flowVelocity < 0.4 ? 'Quiescente (Difusión Pura)' : flowVelocity <= 5.0 ? 'Ventilación Crítica HVAC' : 'Flujo Forzado Rápido'}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-xs text-slate-400 uppercase font-semibold font-mono">Efecto de Curvatura</div>
            <div className="text-base font-bold text-slate-200 mt-2">
              {diameter <= 1.0 ? 'Crítico (Acelerado 4x)' : 'Normal'}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-xs text-slate-400 uppercase font-semibold font-mono">Pérdida Radiativa</div>
            <div className="text-base font-bold text-slate-200 mt-2">
              {flowVelocity < 0.5 ? 'Extinción por Soot Shell' : 'Estable'}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Physics Visualizers Grid: Interactive Dual-Column On Large Displays ──────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
        {/* ── Chart 1: Interactive Flame-Spread Curve ──────────────── */}
        <FlameSpreadChart
          flowVelocity={flowVelocity}
          diameter={diameter}
          material={material}
          currentAtm={currentAtm}
          vf={vf}
          onSelectVelocity={setFlowVelocity}
        />

        {/* ── Chart 2: Thermal Flame Viewer (Layers + Radial T(r)) ── */}
        <ThermalFlameViewer
          flowVelocity={flowVelocity}
          diameter={diameter}
          material={material}
        />
      </div>

      {/* ── Chart 3: Safety Envelope Phase Diagram ───────────────── */}
      <SafetyEnvelopeMap
        currentAtm={currentAtm}
        flowVelocity={flowVelocity}
        material={material}
      />

      {/* ── Cool Flame LTC Simulation Section: Comprehensive & Clear ── */}
      <div className="card-aerospace p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="font-mono text-xs uppercase px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold">
                Fenómeno Descubierto en la ISS · Experimento FLEX
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center space-x-2.5 mt-2">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
              <span>Simulación Transitoria de Llama Fría (Cinética LTC: 60 Segundos)</span>
            </h3>
            <p className="text-sm text-slate-400 mt-1.5 leading-relaxed max-w-4xl">
              ¿Para qué sirve? Modela la trampa sensorial más peligrosa del espacio: cuando un fuego parece apagarse ante las cámaras y detectores de humo, pero continúa ardiendo invisiblemente a baja temperatura (600–800 K) consumiendo combustible y emitiendo peróxidos tóxicos.
            </p>
          </div>
          <div className="flex space-x-3 flex-shrink-0">
            <button
              onClick={() => { setCoolSimStep(0); setIsSimulatingCool(true); }}
              disabled={isSimulatingCool}
              className="btn-primary py-3.5 px-6 text-sm font-semibold flex items-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>{isSimulatingCool ? 'Simulando Transitorio...' : 'Iniciar Simulación (60s)'}</span>
            </button>
            <button
              onClick={() => { setIsSimulatingCool(false); setCoolSimStep(0); }}
              aria-label="Reiniciar simulación"
              className="btn-secondary py-3.5 px-4"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4-Phase Chronological Progress Bar with Visual Milestones */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-2">
            <span>Fase 1: Fuego Caliente (0–12s)</span>
            <span>Fase 2: Extinción Óptica (12–16s)</span>
            <span>Fase 3: Llama Fría LTC (16–45s)</span>
            <span>Fase 4: Enfriamiento (45–60s)</span>
          </div>

          {/* Interactive Progress Bar */}
          <div className="relative w-full h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            {/* Zone Backgrounds */}
            <div className="absolute inset-0 flex">
              <div className="w-[20%] bg-rose-500/20 border-r border-rose-500/30" title="Hot Flame" />
              <div className="w-[7%] bg-amber-500/20 border-r border-amber-500/30" title="Optical Extinction" />
              <div className="w-[48%] bg-sky-500/20 border-r border-sky-500/30" title="Cool Flame Plateau" />
              <div className="w-[25%] bg-emerald-500/20" title="Dissipation" />
            </div>

            {/* Current scrubber fill */}
            <div
              className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-sky-400 transition-all duration-100 relative z-10"
              style={{ width: `${(coolSimStep / (coolData.times.length - 1)) * 100}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] font-mono text-slate-500 mt-1.5">
            <span>0.0 s</span>
            <span>12.0 s (Extinción Óptica)</span>
            <span>45.0 s (Fin Meseta LTC)</span>
            <span>60.0 s</span>
          </div>
        </div>

        {/* Dynamic Telemetry Gauges in Real-Time */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 p-5 rounded-2xl bg-slate-950/80 border border-slate-800 mb-6 font-mono">
          <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400 font-semibold flex items-center justify-between">
              <span>Tiempo de Vuelo</span>
              <span className="text-[10px] text-sky-400">CRONÓMETRO</span>
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-slate-100 mt-1">
              {currentTime.toFixed(1)} <span className="text-sm font-normal text-slate-400">s</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Paso {coolSimStep} de 60</div>
          </div>

          <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400 font-semibold flex items-center justify-between">
              <span>Temperatura Gas</span>
              <Thermometer className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-rose-400 mt-1">
              {currentTemp} <span className="text-sm font-normal text-slate-400">K</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {currentTemp > 1000 ? "Llama convencional" : currentTemp >= 600 ? "Meseta LTC Oculta" : "Enfriamiento residual"}
            </div>
          </div>

          <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400 font-semibold flex items-center justify-between">
              <span>Peróxido H₂O₂</span>
              <span className="text-[10px] text-amber-400 font-bold">RADICAL LTC</span>
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-sky-400 mt-1">
              {currentH2O2.toFixed(1)} <span className="text-sm font-normal text-slate-400">ppm</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {currentH2O2 > 10 ? "⚠️ Toxicidad y Re-ignición" : "Nivel normal"}
            </div>
          </div>

          <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400 font-semibold flex items-center justify-between">
              <span>Monóxido CO</span>
              <span className="text-[10px] text-rose-400 font-bold">ASFIXIANTE</span>
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-amber-400 mt-1">
              {currentCO.toFixed(1)} <span className="text-sm font-normal text-slate-400">ppm</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Combustión incompleta</div>
          </div>
        </div>

        {/* Dynamic Operational Phase Banner */}
        <div className={`p-5 rounded-2xl border mb-6 ${phaseInfo.bg}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            <div className="flex items-center space-x-2.5">
              {phaseInfo.opticalVisible ? (
                <Eye className="w-5 h-5 text-rose-400 animate-pulse" />
              ) : (
                <EyeOff className="w-5 h-5 text-amber-400" />
              )}
              <h4 className={`text-base sm:text-lg font-bold font-mono ${phaseInfo.color}`}>
                {phaseInfo.title}
              </h4>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-slate-950/70 text-slate-200 border border-slate-800">
              {phaseInfo.opticalVisible ? 'VISIBILIDAD: ALTA' : 'VISIBILIDAD: INVISIBLE AL OJO HUMANO'}
            </span>
          </div>

          <div className="space-y-1.5 text-xs sm:text-sm mt-3 font-sans">
            <div className="text-slate-200">
              <strong className="text-slate-100 font-mono">Estado de Sensores: </strong>
              <span className="text-slate-300">{phaseInfo.sensorStatus}</span>
            </div>
            <div className="text-slate-200">
              <strong className="text-amber-300 font-mono">Directriz Operacional de Tripulación: </strong>
              <span className="text-amber-100/90">{phaseInfo.crewAction}</span>
            </div>
          </div>
        </div>

        {/* Deep Breakdown: What the 60 Seconds Calculate (Clear Explanations) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 leading-relaxed">
            <div className="flex items-center space-x-2 text-rose-400 font-bold font-mono uppercase mb-2">
              <Flame className="w-4 h-4" />
              <span>1. Segundos 0 a 12s</span>
            </div>
            <p className="text-slate-300">
              <strong>Extinción por Hollín:</strong> En microgravedad no hay convección boyante que aleje el humo. Las partículas de hollín forman una envoltura concéntrica que radia calor tan intensamente hacia el frío espacial que la temperatura cae bruscamente de 1,650 K a 740 K. La llama amarilla se extingue.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 leading-relaxed">
            <div className="flex items-center space-x-2 text-sky-400 font-bold font-mono uppercase mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span>2. Segundos 12 a 45s</span>
            </div>
            <p className="text-slate-300">
              <strong>La Meseta de Llama Fría:</strong> La reacción no ha muerto. A 600–800 K se activa la química de baja temperatura (LTC): moléculas de hidrocarburo reaccionan con O₂ formando radicales hidroperóxidos ($RO_2 \to QOOH$) y peróxido de hidrógeno ($H_2O_2$) sin emitir luz visible.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 leading-relaxed">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold font-mono uppercase mb-2">
              <ShieldAlert className="w-4 h-4" />
              <span>3. Segundos 45 a 60s</span>
            </div>
            <p className="text-slate-300">
              <strong>El Riesgo de Flashover:</strong> Si en este periodo alguien reenciende el aire acondicionado o abre un compartimento, la masa acumulada de $H_2O_2$ y vapores a 700 K explota en una <em>segunda ignición caliente</em> violenta. Por eso el protocolo exige mantener HVAC cortado hasta t &gt; 60s.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};

export default FlameSimulator;
