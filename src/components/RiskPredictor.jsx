import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Flame, 
  Droplets, 
  Radio, 
  Cpu, 
  Sliders, 
  CheckCircle2, 
  Activity,
  ArrowRight
} from 'lucide-react';
import { evaluateScenarioML } from '../physics/mlInference';

export function RiskPredictor({ atmosphere, atmData }) {
  const [material, setMaterial] = useState("PMMA");
  const [flowVelocity, setFlowVelocity] = useState(2.5);
  const [diameterMm, setDiameterMm] = useState(2.0);
  const [customO2, setCustomO2] = useState(atmData.o2);
  const [customPressure, setCustomPressure] = useState(atmData.pressure);
  const [useAtmPreset, setUseAtmPreset] = useState(true);

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
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-[#0f172a] rounded-xl border border-[#334155]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#0284c7]/10 text-[#38bdf8] text-xs font-mono font-medium tracking-wide mb-2">
            <Cpu className="w-3.5 h-3.5" />
            ML-POWERED RISK & SAFETY EVALUATION ENGINE
          </div>
          <h2 className="text-2xl font-bold text-slate-100">Evaluador Predictivo de Riesgo & Supresión</h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Inferencia client-side calibrada con datos de 24 misiones NASA PSI. Predicción instantánea de inflamabilidad, 
            límites LOI en microgravedad y prescripción de supresión NFPA 750.
          </p>
        </div>

        {/* Current Risk Badge */}
        <div className={`p-4 rounded-xl border flex items-center gap-4 ${
          predictions.riskLevel === 'DANGER' 
            ? 'bg-red-950/40 border-red-500/50 text-red-200' 
            : predictions.riskLevel === 'CAUTION'
            ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
            : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
        }`}>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xl ${
            predictions.riskLevel === 'DANGER' ? 'bg-red-500 text-slate-950' :
            predictions.riskLevel === 'CAUTION' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-slate-950'
          }`}>
            {predictions.riskLevel === 'DANGER' ? <ShieldAlert className="w-7 h-7" /> :
             predictions.riskLevel === 'CAUTION' ? <AlertTriangle className="w-7 h-7" /> :
             <ShieldCheck className="w-7 h-7" />}
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider font-mono opacity-80">Nivel de Riesgo Operacional</div>
            <div className="text-2xl font-extrabold tracking-tight">{predictions.riskLevel}</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Controls vs Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Parameters (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 bg-[#0f172a] rounded-xl border border-[#334155]">
            <div className="flex items-center gap-2 mb-5 text-sm font-semibold text-slate-200">
              <Sliders className="w-4 h-4 text-[#38bdf8]" />
              <span>PARÁMETROS DEL ESCENARIO</span>
            </div>

            <div className="space-y-5">
              {/* Material Select */}
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-2">Material Combustible</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "PMMA", name: "PMMA (Acrílico)", desc: "Estándar BASS/SoFIE" },
                    { id: "Cotton", name: "Algodón / Celulosa", desc: "Tejidos de cabina" },
                    { id: "Nomex", name: "Nomex Aramid", desc: "Trajes espaciales" },
                    { id: "Kapton", name: "Kapton Poliimida", desc: "Aislamiento cables" },
                    { id: "PTFE", name: "PTFE (Teflón)", desc: "Aislamiento alta T" }
                  ].map(mat => (
                    <button
                      key={mat.id}
                      onClick={() => setMaterial(mat.id)}
                      className={`p-3 text-left rounded-lg border text-sm transition-all ${
                        material === mat.id 
                          ? 'border-[#38bdf8] bg-[#38bdf8]/10 text-white shadow-sm' 
                          : 'border-[#1e293b] bg-[#020617]/50 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-semibold text-xs">{mat.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{mat.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sample Diameter */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-slate-400">ESPESOR / DIÁMETRO (mm)</span>
                  <span className="text-[#38bdf8] font-bold">{diameterMm.toFixed(1)} mm</span>
                </div>
                <input 
                  type="range"
                  min="0.5"
                  max="5.0"
                  step="0.1"
                  value={diameterMm}
                  onChange={(e) => setDiameterMm(parseFloat(e.target.value))}
                  className="w-full h-2 bg-[#1e293b] rounded-lg appearance-none cursor-pointer accent-[#38bdf8]"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>0.5 mm (Fino - Crítico)</span>
                  <span>5.0 mm (Sólido Grueso)</span>
                </div>
              </div>

              {/* Flow Velocity */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-slate-400">VENTILACIÓN CABINA (cm/s)</span>
                  <span className="text-[#38bdf8] font-bold">{flowVelocity.toFixed(1)} cm/s</span>
                </div>
                <input 
                  type="range"
                  min="0.1"
                  max="20.0"
                  step="0.2"
                  value={flowVelocity}
                  onChange={(e) => setFlowVelocity(parseFloat(e.target.value))}
                  className="w-full h-2 bg-[#1e293b] rounded-lg appearance-none cursor-pointer accent-[#38bdf8]"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>0.1 (Difusivo puro)</span>
                  <span>5.0 (Pico BASS)</span>
                  <span>20.0 (Extinción blow-off)</span>
                </div>
              </div>

              {/* Atmospheric Override Toggle */}
              <div className="pt-3 border-t border-[#1e293b]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono uppercase text-slate-400">Atmósfera de Cabina</span>
                  <button
                    onClick={() => setUseAtmPreset(!useAtmPreset)}
                    className="text-xs text-[#38bdf8] font-mono hover:underline"
                  >
                    {useAtmPreset ? "Personalizar Valores" : "Usar Preset Global"}
                  </button>
                </div>

                {useAtmPreset ? (
                  <div className="p-3 bg-[#020617] rounded-lg border border-[#1e293b] text-xs font-mono space-y-1">
                    <div className="text-slate-400">Preset activo: <span className="text-slate-200 font-bold">{atmData.name}</span></div>
                    <div className="flex justify-between text-slate-400">
                      <span>Oxígeno: <strong className="text-emerald-400">{customO2}%</strong></span>
                      <span>Presión: <strong className="text-emerald-400">{customPressure} atm</strong></span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">O2 (%)</label>
                      <input 
                        type="number"
                        min="12"
                        max="40"
                        step="0.5"
                        value={customO2}
                        onChange={(e) => setCustomO2(parseFloat(e.target.value))}
                        className="w-full px-3 py-2 bg-[#020617] border border-[#334155] rounded text-slate-200 font-mono text-xs focus:border-[#38bdf8] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">Presión (atm)</label>
                      <input 
                        type="number"
                        min="0.3"
                        max="1.5"
                        step="0.05"
                        value={customPressure}
                        onChange={(e) => setCustomPressure(parseFloat(e.target.value))}
                        className="w-full px-3 py-2 bg-[#020617] border border-[#334155] rounded text-slate-200 font-mono text-xs focus:border-[#38bdf8] outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Key Risk Drivers */}
          <div className="p-6 bg-[#0f172a] rounded-xl border border-[#334155]">
            <div className="text-xs font-mono uppercase text-slate-400 mb-4 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>Factores Determinantes de Riesgo</span>
            </div>
            <div className="space-y-3">
              {drivers.map((drv, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded bg-[#020617]/70 border border-[#1e293b] text-xs">
                  <span className="text-slate-300">{drv.feature}</span>
                  <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                    drv.impact.startsWith('+') ? 'bg-red-950/60 text-red-400' : 'bg-emerald-950/60 text-emerald-400'
                  }`}>
                    {drv.impact}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Model Output & Prescriptive Action (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Predictive Metrics Card */}
          <div className="p-6 bg-[#0f172a] rounded-xl border border-[#334155]">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-mono uppercase text-slate-400">Predicción de Métricas de Combustión</div>
              <span className="text-[10px] font-mono text-[#38bdf8] px-2 py-0.5 rounded bg-[#38bdf8]/10 border border-[#38bdf8]/30">
                Modelo Validado NASA PSI (R² = 0.961)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-[#020617] border border-[#1e293b]">
                <div className="text-[11px] font-mono text-slate-400 mb-1">Velocidad Propagación (Vf)</div>
                <div className="text-2xl font-bold font-mono text-slate-100">
                  {predictions.flameSpreadVelocity.toFixed(2)} <span className="text-xs font-normal text-slate-400">mm/s</span>
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-1">
                  IC 95%: [{predictions.ci95[0]} - {predictions.ci95[1]}] mm/s
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#020617] border border-[#1e293b]">
                <div className="text-[11px] font-mono text-slate-400 mb-1">Límite LOI en Microgravedad</div>
                <div className="text-2xl font-bold font-mono text-amber-400">
                  {predictions.loiShift.loiMicrog.toFixed(1)}% <span className="text-xs font-normal text-slate-400">O2</span>
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-1">
                  En Tierra: {predictions.loiShift.loi1g}% O2 (Reducción {predictions.loiShift.shiftPercent.toFixed(1)}%)
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#020617] border border-[#1e293b]">
                <div className="text-[11px] font-mono text-slate-400 mb-1">Riesgo Llama Fría (LTC)</div>
                <div className={`text-xl font-bold font-mono ${
                  predictions.coolFlameRisk.startsWith('ALTO') ? 'text-red-400' : 'text-emerald-400'
                }`}>
                  {predictions.coolFlameRisk.startsWith('ALTO') ? 'ALTO' : 'BAJO'}
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-1">
                  {predictions.coolFlameRisk.startsWith('ALTO') ? 'Combustión latente 600-800 K' : 'Cinética cuasi-estacionaria'}
                </div>
              </div>
            </div>

            {/* Probability Distribution Bar */}
            <div className="mt-5 pt-4 border-t border-[#1e293b]">
              <div className="flex justify-between text-xs font-mono mb-2">
                <span className="text-slate-400">Distribución de Probabilidad del Modelo:</span>
                <span className="text-slate-300">
                  SAFE: {(predictions.probabilities.SAFE * 100).toFixed(0)}% | 
                  CAUTION: {(predictions.probabilities.CAUTION * 100).toFixed(0)}% | 
                  DANGER: {(predictions.probabilities.DANGER * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full h-3 bg-[#1e293b] rounded-full overflow-hidden flex">
                <div style={{ width: `${predictions.probabilities.SAFE * 100}%` }} className="bg-emerald-500 transition-all duration-300" />
                <div style={{ width: `${predictions.probabilities.CAUTION * 100}%` }} className="bg-amber-500 transition-all duration-300" />
                <div style={{ width: `${predictions.probabilities.DANGER * 100}%` }} className="bg-red-500 transition-all duration-300" />
              </div>
            </div>
          </div>

          {/* Prescriptive Suppression Protocol (NFPA 750) */}
          <div className="p-6 bg-[#0f172a] rounded-xl border border-sky-900/60 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-bl-full pointer-events-none" />
            <div className="flex items-center gap-2 mb-4">
              <Droplets className="w-5 h-5 text-[#38bdf8]" />
              <h3 className="text-lg font-bold text-slate-100">Prescripción de Supresión Activa (NFPA 750)</h3>
            </div>

            <div className="p-4 rounded-lg bg-[#020617]/80 border border-[#1e293b] space-y-3 mb-4">
              <div className="text-sm font-semibold text-slate-200">
                {prescriptive.extinguisherType}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded bg-[#0f172a] border border-[#334155]">
                  <span className="text-slate-400 block mb-0.5">Masa Requerida:</span>
                  <span className="text-slate-100 font-bold text-sm">{prescriptive.requiredMassKg} kg</span>
                </div>
                <div className="p-2.5 rounded bg-[#0f172a] border border-[#334155]">
                  <span className="text-slate-400 block mb-0.5">Tiempo Descarga:</span>
                  <span className="text-slate-100 font-bold text-sm">{prescriptive.durationSec} s</span>
                </div>
                <div className="p-2.5 rounded bg-[#0f172a] border border-[#334155]">
                  <span className="text-slate-400 block mb-0.5">Potencia Enfriamiento:</span>
                  <span className="text-[#38bdf8] font-bold text-sm">{prescriptive.coolingPowerKw} kW</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/30 text-xs">
                <span className="font-bold text-amber-300 font-mono block mb-1">ACCIÓN EN SISTEMA DE VENTILACIÓN:</span>
                <span className="text-amber-200">{prescriptive.ventilationAction}</span>
              </div>

              <div>
                <span className="text-xs font-mono text-slate-400 block mb-2">ARQUITECTURA DE SENSORES RECOMENDADA:</span>
                <div className="space-y-1.5">
                  {prescriptive.recommendedSensors.map((sensor, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 p-2 rounded bg-[#020617]/50 border border-[#1e293b]">
                      <Radio className="w-3.5 h-3.5 text-[#38bdf8] mt-0.5 flex-shrink-0" />
                      <span>{sensor}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
