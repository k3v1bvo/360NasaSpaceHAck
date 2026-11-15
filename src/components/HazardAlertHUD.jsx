import React, { useEffect } from 'react'
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Flame, 
  Activity, 
  Skull, 
  Volume2, 
  VolumeX, 
  ArrowRightCircle,
  Radio,
  FileWarning,
  CheckCircle2
} from 'lucide-react'
import { sound } from '../utils/audioEffects'

export default function HazardAlertHUD({ 
  telemetry, 
  params, 
  onTriggerExtinguish 
}) {
  const { level, levelColor, alerts, flameTempC, radiantFluxKw, coPpm, isCoolFlame } = telemetry
  const { oxygen, gravity, airflow, pressure } = params

  // Trigger alarm sound if critical
  useEffect(() => {
    if (level === 'CRITICAL') {
      sound.startAlarm()
    } else {
      sound.stopAlarm()
    }
    return () => sound.stopAlarm()
  }, [level])

  // Hazard status badge styles
  const statusConfig = {
    NOMINAL: {
      label: 'SISTEMA NOMINAL // SEGURO',
      sub: 'Sin riesgo inminente de propagación ni flashover térmico',
      icon: ShieldCheck,
      cardClass: 'glass-panel border-emerald-500/30 text-emerald-400',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    },
    CAUTION: {
      label: 'PRECAUCIÓN // COMBUSTIÓN CONTROLADA',
      sub: 'Llama laminar en cámara. Monitoreo pasivo de capullo de CO₂',
      icon: Activity,
      cardClass: 'glass-panel border-cyan-500/30 text-cyan-400',
      badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      glow: 'shadow-[0_0_20px_rgba(6,182,212,0.15)]',
    },
    WARNING: {
      label: 'ADVERTENCIA TÉRMICA // ELEVADA',
      sub: 'Gradiente de temperatura y flujo radiativo en ascenso constante',
      icon: AlertTriangle,
      cardClass: 'glass-panel-warning border-amber-500/40 text-amber-300',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      glow: 'shadow-[0_0_25px_rgba(245,158,11,0.25)]',
    },
    CRITICAL: {
      label: '¡ALERTA CRÍTICA MASTER! // RIESGO FLASHOVER',
      sub: 'Propagación incontrolada o atmósfera hiperóxica fuera de estándar',
      icon: ShieldAlert,
      cardClass: 'glass-panel-alert border-red-500/60 text-red-300 animate-alert-border',
      badgeClass: 'bg-red-500/30 text-red-200 border-red-500/60 animate-pulse',
      glow: 'shadow-[0_0_35px_rgba(239,68,68,0.4)]',
    },
  }[level] || statusConfig.NOMINAL

  const StatusIcon = statusConfig.icon

  // Calculated risk indices
  const flashoverRisk = Math.min(100, Math.round(
    (oxygen > 21 ? (oxygen - 21) * 3.5 : 0) + 
    (flameTempC > 1200 ? (flameTempC - 1200) * 0.12 : 0) + 
    (airflow * 0.8)
  ))

  const stealthRisk = gravity < 0.05 && airflow < 2 ? 88 : 15

  return (
    <div className={`rounded-2xl p-5 backdrop-blur-xl transition-all duration-500 ${statusConfig.cardClass} ${statusConfig.glow} flex flex-col justify-between`}>
      {/* Header with Live Status */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${statusConfig.badgeClass}`}>
              <StatusIcon className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] tracking-widest font-mono uppercase text-slate-400">
                  MATRIZ DE RIESGO DE MISIÓN
                </span>
                <span className="inline-flex items-center px-1.5 py-0.2 text-[9px] font-mono rounded bg-slate-800 text-slate-300">
                  NASA STD-6001
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold font-mono tracking-tight text-white flex items-center gap-2">
                {statusConfig.label}
              </h3>
            </div>
          </div>

          <div className="hidden sm:flex flex-col items-end text-right font-mono">
            <span className="text-[10px] text-slate-400">STATUS PROTOCOLO</span>
            <span className={`text-xs font-bold ${level === 'CRITICAL' ? 'text-red-400 animate-ping' : 'text-slate-300'}`}>
              {level === 'CRITICAL' ? 'CÓDIGO ROJO CABINA' : 'VIGILANCIA ACTIVA'}
            </span>
          </div>
        </div>

        {/* Hazard Metrics Matrix (3 Bars) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
          {/* Flashover Risk */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex justify-between items-center text-xs font-mono mb-1.5">
              <span className="text-slate-400">Riesgo Flashover:</span>
              <span className={`font-bold ${flashoverRisk > 60 ? 'text-red-400' : flashoverRisk > 30 ? 'text-amber-300' : 'text-emerald-400'}`}>
                {flashoverRisk}%
              </span>
            </div>
            <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  flashoverRisk > 60 ? 'bg-red-500' : flashoverRisk > 30 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
                style={{ width: `${flashoverRisk}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-1 block">
              {flashoverRisk > 60 ? 'Umbral térmico crítico' : 'Dentro de tolerancia'}
            </span>
          </div>

          {/* Stealth Fire Risk (Detectors blinded by 0g) */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex justify-between items-center text-xs font-mono mb-1.5">
              <span className="text-slate-400">Peligro Fuego Oculto (0G):</span>
              <span className={`font-bold ${stealthRisk > 50 ? 'text-amber-400' : 'text-slate-300'}`}>
                {stealthRisk}%
              </span>
            </div>
            <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${stealthRisk > 50 ? 'bg-amber-400' : 'bg-cyan-400'}`}
                style={{ width: `${stealthRisk}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-1 block">
              {gravity < 0.05 ? 'Sin boyamiento: detectores de techo no ven humo' : 'Boyamiento presente: humo asciende'}
            </span>
          </div>

          {/* Toxic Asphyxiation / CO Index */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex justify-between items-center text-xs font-mono mb-1.5">
              <span className="text-slate-400">Generación CO Tóxico:</span>
              <span className={`font-bold ${coPpm > 100 ? 'text-red-400' : 'text-cyan-300'}`}>
                {coPpm} ppm
              </span>
            </div>
            <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${coPpm > 100 ? 'bg-red-500' : 'bg-cyan-400'}`}
                style={{ width: `${Math.min(100, (coPpm / 200) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-1 block">
              Límite tripulación: 50 ppm (NASA Flight Rule)
            </span>
          </div>
        </div>

        {/* Dynamic Warning Alerts List */}
        <div className="space-y-2 mt-3">
          {alerts && alerts.map((alt, idx) => (
            <div 
              key={idx}
              className={`p-3 rounded-xl font-mono text-xs border flex items-start gap-3 transition-all ${
                alt.type === 'danger'
                  ? 'bg-red-950/40 border-red-500/40 text-red-200'
                  : alt.type === 'warning'
                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                  : alt.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200'
              }`}
            >
              <div className="mt-0.5">
                {alt.type === 'danger' && <ShieldAlert className="w-4 h-4 text-red-400" />}
                {alt.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                {alt.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {alt.type === 'info' && <Radio className="w-4 h-4 text-cyan-400" />}
              </div>
              <div className="flex-1">
                <span className="font-bold uppercase tracking-wider block">{alt.title}</span>
                <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">{alt.msg}</p>
              </div>
            </div>
          ))}

          {isCoolFlame && (
            <div className="p-3 rounded-xl font-mono text-xs border bg-purple-950/40 border-purple-500/40 text-purple-200 flex items-start gap-3">
              <Flame className="w-4 h-4 text-purple-400 mt-0.5" />
              <div>
                <span className="font-bold uppercase tracking-wider">MODO LLAMA FRÍA QUASI-ESTACIONARIA DETECTADO</span>
                <p className="text-slate-300 text-[11px] mt-0.5">
                  Fenómeno descubierto por la NASA (experimento FLEX): La combustión continúa de forma invisible a 400-500°C sin incandescencia visible. ¡No tocar el área!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Emergency Action Buttons if in High Risk */}
      {level === 'CRITICAL' && (
        <div className="mt-4 pt-3 border-t border-red-500/30 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-mono text-red-300 flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-red-400 animate-pulse" />
            <span>ACCIÓN RECOMENDADA POR CONTROL DE VUELO:</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playExtinguish()
                onTriggerExtinguish('novec')
              }}
              className="px-3 py-1.5 text-xs font-mono font-bold rounded-lg bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all flex items-center gap-1.5 active:scale-95"
            >
              <span>INUNDAR NOVEC 1230</span>
            </button>
            <button
              onClick={() => {
                sound.playExtinguish()
                onTriggerExtinguish('depressurize')
              }}
              className="px-3 py-1.5 text-xs font-mono font-bold rounded-lg bg-slate-900 border border-red-500/60 hover:bg-red-950 text-red-200 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <span>VENTEAR AL ESPACIO (0 kPa)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
