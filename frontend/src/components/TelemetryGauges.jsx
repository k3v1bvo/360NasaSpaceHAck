import React, { useRef, useEffect } from 'react'
import { 
  Activity, 
  Thermometer, 
  Flame, 
  Sun, 
  Wind, 
  Radio, 
  ShieldAlert,
  Binary
} from 'lucide-react'

export default function TelemetryGauges({ telemetry, params }) {
  const sparklineRef = useRef(null)
  const historyRef = useRef([])

  const {
    flameTempC,
    flameRadiusMm,
    radiantFluxKw,
    coPpm,
    co2Ppm,
    sootFraction,
    grashofNumber,
    pecletNumber,
    flameAspectRatio,
    isCoolFlame,
    flameActive
  } = telemetry

  // Keep a running buffer of temperatures for the live sparkline
  useEffect(() => {
    historyRef.current.push({
      temp: flameTempC,
      flux: parseFloat(radiantFluxKw) || 0,
      time: Date.now()
    })
    if (historyRef.current.length > 50) {
      historyRef.current.shift()
    }

    const canvas = sparklineRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const w = (canvas.width = canvas.parentElement.clientWidth)
    const h = (canvas.height = canvas.parentElement.clientHeight)

    ctx.clearRect(0, 0, w, h)

    // Draw background grid lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)'
    ctx.lineWidth = 1
    for (let y = 0; y < h; y += 18) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
      ctx.stroke()
    }

    if (historyRef.current.length < 2) return

    // Draw Temperature curve
    ctx.beginPath()
    const maxTemp = 2000
    historyRef.current.forEach((point, i) => {
      const x = (i / (historyRef.current.length - 1)) * w
      const y = h - (point.temp / maxTemp) * (h - 10) - 5
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })

    ctx.strokeStyle = '#38bdf8'
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw subtle area gradient
    const grad = ctx.createLinearGradient(0, 0, 0, h)
    grad.addColorStop(0, 'rgba(56, 189, 248, 0.25)')
    grad.addColorStop(1, 'rgba(56, 189, 248, 0.0)')
    ctx.lineTo(w, h)
    ctx.lineTo(0, h)
    ctx.closePath()
    ctx.fillStyle = grad
    ctx.fill()
  }, [flameTempC, radiantFluxKw])

  return (
    <div className="rounded-2xl p-5 glass-panel border border-cyan-500/20 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/10 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold font-mono tracking-tight text-white uppercase">
            TELEMETRÍA FÍSICA EN TIEMPO REAL
          </h3>
        </div>
        <span className="text-xs font-mono text-cyan-400 animate-pulse flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-cyan-400" />
          STREAM SENSOR CIR 50 Hz
        </span>
      </div>

      {/* Primary 4 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        {/* Core Flame Temp */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
            <span>Temp. Núcleo</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white flex items-baseline gap-1">
            <span className={flameTempC > 1400 ? 'text-amber-400' : 'text-cyan-300'}>
              {flameTempC}
            </span>
            <span className="text-xs text-slate-400">°C</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            {flameTempC + 273} K
          </span>
        </div>

        {/* Radiant Heat Flux */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>Flujo Radiante</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white flex items-baseline gap-1">
            <span className={radiantFluxKw > 25 ? 'text-red-400' : 'text-amber-300'}>
              {radiantFluxKw}
            </span>
            <span className="text-xs text-slate-400">kW/m²</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            Stefan-Boltzmann
          </span>
        </div>

        {/* Flame Diameter */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <Flame className="w-3.5 h-3.5 text-cyan-400" />
            <span>Radio Esférico</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white flex items-baseline gap-1">
            <span className="text-cyan-300">{flameRadiusMm}</span>
            <span className="text-xs text-slate-400">mm</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            Relación Aspecto: {flameAspectRatio}:1
          </span>
        </div>

        {/* Carbon Monoxide (CO) */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>Monóxido (CO)</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white flex items-baseline gap-1">
            <span className={coPpm > 100 ? 'text-red-400' : 'text-slate-200'}>
              {coPpm}
            </span>
            <span className="text-xs text-slate-400">ppm</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            CO₂: {co2Ppm} ppm
          </span>
        </div>
      </div>

      {/* Live Graph of Thermal Evolution */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 font-mono">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            HISTORIAL DINÁMICO DE TEMPERATURA (°C)
          </span>
          <span className="text-[10px] text-cyan-400">Escala 0 - 2000 °C</span>
        </div>
        <div className="w-full h-24 relative rounded overflow-hidden bg-slate-900/60 border border-slate-800/80">
          <canvas ref={sparklineRef} className="w-full h-full" />
        </div>
      </div>

      {/* NASA Dimensionless Physics Numbers */}
      <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 font-mono text-xs">
        <div className="flex items-center gap-2 text-cyan-300 font-bold mb-2">
          <Binary className="w-3.5 h-3.5" />
          <span>NÚMEROS ADIMENSIONALES DE COMBUSTIÓN ESPACIAL</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300 text-[11px]">
          <div className="p-2 rounded bg-slate-900/50 border border-slate-800">
            <div className="flex justify-between text-slate-400">
              <strong>Número de Grashof (Gr):</strong>
              <span className="text-cyan-300 font-bold">{grashofNumber}</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {params.gravity < 0.05 
                ? 'Gr ≈ 0 → Extinción total de fuerzas de flotabilidad. Transporte puramente molecular.' 
                : 'Gr > 0 → La aceleración gravitatoria reactiva la convección natural ascendente.'}
            </p>
          </div>

          <div className="p-2 rounded bg-slate-900/50 border border-slate-800">
            <div className="flex justify-between text-slate-400">
              <strong>Número de Peclet (Pe):</strong>
              <span className="text-cyan-300 font-bold">{pecletNumber}</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Ratio de advección forzada por ventilación ECLSS versus difusión térmica.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
