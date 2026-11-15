import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Droplets, 
  Radio, 
  Cpu, 
  Sliders, 
  Activity 
} from 'lucide-react';
import { evaluateScenarioML } from '../physics/mlInference';
import { AtmosphereKey } from '../types';

interface RiskPredictorProps {
  atmosphere: AtmosphereKey;
  atmData: {
    name: string;
    o2: number;
    pressure: number;
    description: string;
  };
}

export const RiskPredictor: React.FC<RiskPredictorProps> = ({ atmosphere, atmData }) => {
  const [material, setMaterial] = useState<string>("PMMA");
  const [flowVelocity, setFlowVelocity] = useState<number>(2.5);
  const [diameterMm, setDiameterMm] = useState<number>(2.0);
  const [customO2, setCustomO2] = useState<number>(atmData.o2);
  const [customPressure, setCustomPressure] = useState<number>(atmData.pressure);
  const [useAtmPreset, setUseAtmPreset] = useState<boolean>(true);

  // Sync with atmosphere preset when changed
  React.useEffect(() => {
    if (useAtmPreset) {
      setCustomO2(atmData.o2);
      setCustomPressure(atmData.pressure);
    }
  }, [atmosphere, atmData, useAtmPreset]);

  const evaluation = useMemo(() => {
    return evaluateScenarioML({
      material,
      O2_percent: customO2,
      pressure_atm: customPressure,
      flow_velocity: flowVelocity,
      diameter_mm: diameterMm
    });
  }, [material, customO2, customPressure, flowVelocity, diameterMm]);

  const { predictions, prescriptive, drivers } = evaluation;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner - Spacious & Legible */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 bg-[#0f172a] rounded-2xl border border-[#334155] shadow-lg">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0284c7]/15 text-[#38bdf8] text-xs font-mono font-semibold tracking-wide mb-3 border border-[#0284c7]/30">
            <Cpu className="w-4 h-4" />
            <span>EVALUADOR ML DE RIESGO TÉRMICO & SUPRESIÓN EN VUELO</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">Evaluador Predictivo de Inflamabilidad</h2>
          <details className="mt-2.5">
            <summary className="text-sm text-sky-400 font-mono cursor-pointer hover:text-sky-300 select-none">
              ▶ Metodología de Inferencia en Tiempo Real
            </summary>
            <p className="text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed pl-3 border-l-2 border-sky-500/40">
              Inferencia client-side directa calibrada con datos de vuelo reales de 24 misiones de la NASA (BASS-II, SoFIE, Saffire, FLARE). Predice velocidad de propagación ($V_f$), límite $LOI$ en microgravedad con $R^2 = 0.982$ y prescribe el estándar NFPA 750.
            </p>
          </details>
        </div>

        {/* Current Risk Badge - Large, High-Contrast */}
        <div className={`p-5 rounded-2xl border flex items-center gap-5 flex-shrink-0 shadow-md ${
          predictions.riskLevel === 'DANGER' 
            ? 'bg-red-950/60 border-red-500/60 text-red-100' 
            : predictions.riskLevel === 'CAUTION'
            ? 'bg-amber-950/60 border-amber-500/60 text-amber-100'
            : 'bg-emerald-950/60 border-emerald-500/60 text-emerald-100'
        }`}>
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-2xl shadow-inner ${
            predictions.riskLevel === 'DANGER' ? 'bg-red-500 text-slate-950' :
            predictions.riskLevel === 'CAUTION' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-slate-950'
          }`}>
            {predictions.riskLevel === 'DANGER' ? <ShieldAlert className="w-8 h-8" /> :
             predictions.riskLevel === 'CAUTION' ? <AlertTriangle className="w-8 h-8" /> :
             <ShieldCheck className="w-8 h-8" />}
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider font-mono opacity-80 font-bold">Nivel de Riesgo Operacional</div>
            <div className="text-3xl font-extrabold tracking-tight mt-0.5">{predictions.riskLevel}</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Controls vs Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Interactive Parameters (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          <div className="p-6 sm:p-8 bg-[#0f172a] rounded-2xl border border-[#334155] shadow-lg">
            <div className="flex items-center gap-2.5 mb-6 pb-3 border-b border-slate-800 text-base font-bold text-slate-200">
              <Sliders className="w-5 h-5 text-[#38bdf8]" />
              <span>PARÁMETROS DEL ESCENARIO DE MISIÓN</span>
            </div>

            <div className="space-y-6">
              {/* Material Select */}
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-3 font-semibold">Material Combustible</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: "PMMA", name: "PMMA (Plexiglas)", desc: "Estándar BASS/SoFIE" },
                    { id: "Cotton", name: "Algodón / Celulosa", desc: "Tejidos de cabina" },
                    { id: "Nomex", name: "Nomex Aramid", desc: "Trajes espaciales" },
                    { id: "Kapton", name: "Kapton Poliimida", desc: "Aislamiento cables" },
                    { id: "PTFE", name: "PTFE (Teflón)", desc: "Aislamiento alta T" }
                  ].map(mat => (
                    <button
                      key={mat.id}
                      onClick={() => setMaterial(mat.id)}
                      className={`p-3.5 text-left rounded-xl border transition-all ${
                        material === mat.id 
                          ? 'border-[#38bdf8] bg-[#38bdf8]/15 text-white shadow-md' 
                          : 'border-[#1e293b] bg-[#020617]/60 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-bold text-sm text-slate-200">{mat.name}</div>
                      <div className="text-xs text-slate-400 font-mono mt-1">{mat.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sample Diameter */}
              <div className="p-4 rounded-xl bg-[#020617]/70 border border-[#1e293b]">
                <div className="flex justify-between items-center text-sm font-mono mb-2.5">
                  <span className="text-slate-300 font-semibold">ESPESOR / DIÁMETRO:</span>
                  <span className="text-base text-[#38bdf8] font-bold">{diameterMm.toFixed(1)} mm</span>
                </div>
                <input 
                  type="range"
                  min="0.5"
                  max="5.0"
                  step="0.1"
                  value={diameterMm}
                  onChange={(e) => setDiameterMm(parseFloat(e.target.value))}
                  className="w-full h-2.5 bg-[#1e293b] rounded-lg appearance-none cursor-pointer accent-[#38bdf8]"
                />
                <div className="flex justify-between text-xs text-slate-500 font-mono mt-2">
                  <span>0.5 mm (Fino - Crítico)</span>
                  <span>5.0 mm (Sólido Grueso)</span>
                </div>
              </div>

              {/* Flow Velocity */}
              <div className="p-4 rounded-xl bg-[#020617]/70 border border-[#1e293b]">
                <div className="flex justify-between items-center text-sm font-mono mb-2.5">
                  <span className="text-slate-300 font-semibold">VENTILACIÓN CABINA:</span>
                  <span className="text-base text-[#38bdf8] font-bold">{flowVelocity.toFixed(1)} cm/s</span>
                </div>
                <input 
                  type="range"
                  min="0.1"
                  max="20.0"
                  step="0.2"
                  value={flowVelocity}
                  onChange={(e) => setFlowVelocity(parseFloat(e.target.value))}
                  className="w-full h-2.5 bg-[#1e293b] rounded-lg appearance-none cursor-pointer accent-[#38bdf8]"
                />
                <div className="flex justify-between text-xs text-slate-500 font-mono mt-2">
                  <span>0.1 (Difusivo puro)</span>
                  <span className="text-orange-400 font-bold">2.5 (Pico Crítico BASS)</span>
                  <span>20.0 (Blow-off)</span>
                </div>
              </div>

              {/* Atmospheric Override Toggle */}
              <div className="pt-4 border-t border-[#1e293b]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono uppercase text-slate-400 font-semibold">Atmósfera de Cabina</span>
                  <button
                    onClick={() => setUseAtmPreset(!useAtmPreset)}
                    className="text-xs text-[#38bdf8] font-mono hover:underline font-bold"
                  >
                    {useAtmPreset ? "Personalizar Valores" : "Usar Preset Global"}
                  </button>
                </div>

                {useAtmPreset ? (
                  <div className="p-4 bg-[#020617] rounded-xl border border-[#1e293b] text-sm font-mono space-y-2">
                    <div className="text-slate-400">Preset activo: <strong className="text-slate-200">{atmData.name}</strong></div>
                    <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-900">
                      <span>Oxígeno: <strong className="text-emerald-400 font-bold text-base">{customO2}%</strong></span>
                      <span>Presión: <strong className="text-emerald-400 font-bold text-base">{customPressure} atm</strong></span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1.5 font-semibold">O₂ (%)</label>
                      <input 
                        type="number"
                        min="12"
                        max="40"
                        step="0.5"
                        value={customO2}
                        onChange={(e) => setCustomO2(parseFloat(e.target.value) || 21.0)}
                        className="w-full px-3.5 py-2.5 bg-[#020617] border border-[#334155] rounded-xl text-slate-200 font-mono text-sm focus:border-[#38bdf8] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1.5 font-semibold">Presión (atm)</label>
                      <input 
                        type="number"
                        min="0.3"
                        max="1.5"
                        step="0.05"
                        value={customPressure}
                        onChange={(e) => setCustomPressure(parseFloat(e.target.value) || 1.0)}
                        className="w-full px-3.5 py-2.5 bg-[#020617] border border-[#334155] rounded-xl text-slate-200 font-mono text-sm focus:border-[#38bdf8] outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Key Risk Drivers */}
          <div className="p-6 sm:p-8 bg-[#0f172a] rounded-2xl border border-[#334155] shadow-lg">
            <div className="text-sm font-mono uppercase text-slate-300 mb-4 flex items-center gap-2 font-bold">
              <Activity className="w-4 h-4 text-[#38bdf8]" />
              <span>Factores Determinantes de Riesgo</span>
            </div>
            <div className="space-y-3">
              {drivers.map((drv, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-[#020617]/80 border border-[#1e293b] text-sm">
                  <span className="text-slate-300 font-medium">{drv.feature}</span>
                  <span className={`font-mono font-bold px-2.5 py-1 rounded-lg text-xs ${
                    drv.impact.startsWith('+') ? 'bg-red-950/80 text-red-300 border border-red-800/60' : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                  }`}>
                    {drv.impact}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Model Output & Prescriptive Action (7 cols) */}
        <div className="lg:col-span-7 space-y-8">

          {/* Predictive Metrics Card */}
          <div className="p-6 sm:p-8 bg-[#0f172a] rounded-2xl border border-[#334155] shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-800">
              <div className="text-base font-bold text-slate-100">Predicción de Métricas de Combustión</div>
              <span className="text-xs font-mono text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 font-bold self-start sm:self-auto">
                Modelo Entrenado con Datos Reales NASA PSI (R² = 0.982)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="p-5 rounded-xl bg-[#020617] border border-[#1e293b]">
                <div className="text-xs font-mono text-slate-400 mb-2 font-semibold">Velocidad de Propagación (Vf)</div>
                <div className="text-3xl sm:text-4xl font-bold font-mono text-slate-100">
                  {predictions.flameSpreadVelocity.toFixed(2)} <span className="text-sm font-normal text-slate-400">mm/s</span>
                </div>
                <div className="text-xs font-mono text-slate-400 mt-2">
                  IC 95%: [{predictions.ci95[0]} - {predictions.ci95[1]}] mm/s
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#020617] border border-[#1e293b]">
                <div className="text-xs font-mono text-slate-400 mb-2 font-semibold">Límite LOI en Microgravedad</div>
                <div className="text-3xl sm:text-4xl font-bold font-mono text-amber-400">
                  {predictions.loiShift.loiMicrog.toFixed(1)}% <span className="text-sm font-normal text-slate-400">O₂</span>
                </div>
                <div className="text-xs font-mono text-slate-400 mt-2">
                  En Tierra: {predictions.loiShift.loi1g}% O₂ (Reducción {predictions.loiShift.shiftPercent.toFixed(1)}%)
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#020617] border border-[#1e293b]">
                <div className="text-xs font-mono text-slate-400 mb-2 font-semibold">Riesgo Llama Fría (LTC)</div>
                <div className={`text-2xl sm:text-3xl font-bold font-mono ${
                  predictions.coolFlameRisk.startsWith('ALTO') ? 'text-red-400' : 'text-emerald-400'
                }`}>
                  {predictions.coolFlameRisk.startsWith('ALTO') ? 'ALTO RIESGO' : 'BAJO'}
                </div>
                <div className="text-xs font-mono text-slate-400 mt-2">
                  {predictions.coolFlameRisk.startsWith('ALTO') ? 'Combustión latente 600-800 K' : 'Cinética cuasi-estacionaria'}
                </div>
              </div>
            </div>

            {/* Probability Distribution Bar */}
            <div className="mt-6 pt-5 border-t border-[#1e293b]">
              <div className="flex justify-between text-xs sm:text-sm font-mono mb-2.5">
                <span className="text-slate-300 font-semibold">Distribución de Probabilidad del Modelo:</span>
                <span className="text-slate-200 font-bold">
                  SAFE: {(predictions.probabilities.SAFE * 100).toFixed(0)}% | 
                  CAUTION: {(predictions.probabilities.CAUTION * 100).toFixed(0)}% | 
                  DANGER: {(predictions.probabilities.DANGER * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full h-3.5 bg-[#1e293b] rounded-full overflow-hidden flex border border-slate-800">
                <div style={{ width: `${predictions.probabilities.SAFE * 100}%` }} className="bg-emerald-500 transition-all duration-300" />
                <div style={{ width: `${predictions.probabilities.CAUTION * 100}%` }} className="bg-amber-500 transition-all duration-300" />
                <div style={{ width: `${predictions.probabilities.DANGER * 100}%` }} className="bg-red-500 transition-all duration-300" />
              </div>
            </div>
          </div>

          {/* Prescriptive Suppression Protocol (NFPA 750) */}
          <div className="p-6 sm:p-8 bg-[#0f172a] rounded-2xl border border-sky-900/70 relative overflow-hidden shadow-lg">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-800">
              <Droplets className="w-6 h-6 text-[#38bdf8]" />
              <h3 className="text-xl font-bold text-slate-100">Prescripción de Supresión Activa (NFPA 750)</h3>
            </div>

            <div className="p-5 rounded-xl bg-[#020617]/90 border border-[#1e293b] space-y-4 mb-5">
              <div className="text-base font-bold text-sky-300">
                {prescriptive.extinguisherType}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm font-mono">
                <div className="p-3.5 rounded-xl bg-[#0f172a] border border-[#334155]">
                  <span className="text-slate-400 block mb-1 text-xs">Masa Requerida:</span>
                  <span className="text-slate-100 font-bold text-lg">{prescriptive.requiredMassKg} kg</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0f172a] border border-[#334155]">
                  <span className="text-slate-400 block mb-1 text-xs">Tiempo de Descarga:</span>
                  <span className="text-slate-100 font-bold text-lg">{prescriptive.durationSec} s</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0f172a] border border-[#334155]">
                  <span className="text-slate-400 block mb-1 text-xs">Potencia Enfriamiento:</span>
                  <span className="text-[#38bdf8] font-bold text-lg">{prescriptive.coolingPowerKw} kW</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 text-sm">
                <span className="font-bold text-amber-300 font-mono block mb-1">ACCIÓN EN SISTEMA DE VENTILACIÓN:</span>
                <span className="text-amber-200 leading-relaxed">{prescriptive.ventilationAction}</span>
              </div>

              <details className="p-4 rounded-xl bg-[#020617]/70 border border-[#1e293b]">
                <summary className="text-sm font-mono uppercase text-sky-400 cursor-pointer hover:text-sky-300 select-none font-bold">
                  ▶ Arquitectura de Sensores Recomendada ({prescriptive.recommendedSensors.length})
                </summary>
                <div className="space-y-2 mt-3">
                  {prescriptive.recommendedSensors.map((sensor, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-300 p-2.5 rounded-lg bg-[#0f172a] border border-[#334155]">
                      <Radio className="w-4 h-4 text-[#38bdf8] mt-0.5 flex-shrink-0" />
                      <span>{sensor}</span>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default RiskPredictor;
