import React, { useRef, useEffect, useState } from 'react'
import { 
  Flame, 
  Wind, 
  Maximize2, 
  RotateCcw, 
  Zap, 
  ShieldAlert, 
  Eye, 
  EyeOff, 
  Gauge, 
  Sparkles,
  Layers,
  ThermometerSnowflake
} from 'lucide-react'
import { sound } from '../utils/audioEffects'

export default function CombustionChamber({ 
  telemetry, 
  params, 
  setParams, 
  onTriggerExtinguish,
  onIgnite 
}) {
  const canvasRef = useRef(null)
  const [showIsotherms, setShowIsotherms] = useState(true)
  const [showVectors, setShowVectors] = useState(true)
  const [hoverData, setHoverData] = useState(null)
  const animationFrameRef = useRef(null)

  // Particles system state
  const particlesRef = useRef([])
  const smokeParticlesRef = useRef([])
  const sparksRef = useRef([])
  const timeRef = useRef(0)

  const { gravity, oxygen, airflow, pressure, isIgnited, activeExtinguisher, fuelId } = params
  const { flameActive, flameTempC, flameRadiusMm, isCoolFlame } = telemetry

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let width = (canvas.width = canvas.parentElement.clientWidth)
    let height = (canvas.height = canvas.parentElement.clientHeight)

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return
      width = canvas.width = canvas.parentElement.clientWidth
      height = canvas.height = canvas.parentElement.clientHeight
    }
    window.addEventListener('resize', handleResize)

    // Main render frame
    const render = () => {
      timeRef.current += 0.035
      const t = timeRef.current

      // Clear with deep space cockpit backdrop
      ctx.fillStyle = '#050814'
      ctx.fillRect(0, 0, width, height)

      const centerX = width * 0.5
      const centerY = height * 0.52

      // Draw Chamber Reticle & Grid
      drawChamberHUD(ctx, width, height, centerX, centerY, t, params, showIsotherms, showVectors)

      // Fuel object depiction at center
      drawFuelSource(ctx, centerX, centerY, fuelId, isIgnited)

      if (flameActive && isIgnited && pressure > 15) {
        // Physical parameters for visualization
        const baseRadius = Math.max(12, flameRadiusMm * 1.6)
        const buoyancyEffect = gravity * 38 // vertical elongation factor
        const draftX = (airflow / 10) * 24 // horizontal draft deflection

        // Draw thermal diffusion glow (spherical halo)
        drawFlameAura(ctx, centerX, centerY, baseRadius, buoyancyEffect, draftX, t, telemetry, params)

        // Spawn flame & soot particles
        spawnCombustionParticles(centerX, centerY, baseRadius, buoyancyEffect, draftX, params, telemetry, particlesRef, smokeParticlesRef, sparksRef)

        // Draw particles
        drawCombustionParticles(ctx, particlesRef, smokeParticlesRef, sparksRef, draftX, buoyancyEffect)

        // Draw Isothermal Temperature Contours
        if (showIsotherms) {
          drawIsotherms(ctx, centerX, centerY, baseRadius, buoyancyEffect, draftX, flameTempC, isCoolFlame)
        }

        // Draw Airflow Streamlines
        if (showVectors && (airflow > 0 || gravity > 0)) {
          drawVelocityVectors(ctx, width, height, centerX, centerY, airflow, gravity, t)
        }
      }

      // Draw active extinguisher suppression effect
      if (activeExtinguisher) {
        drawSuppressionEffect(ctx, width, height, centerX, centerY, activeExtinguisher, t)
      }

      animationFrameRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [gravity, oxygen, airflow, pressure, isIgnited, activeExtinguisher, fuelId, flameActive, flameTempC, flameRadiusMm, isCoolFlame, showIsotherms, showVectors])

  // Mouse move handler for interactive sensor probe
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = canvas.width * 0.5
    const centerY = canvas.height * 0.52

    const dx = x - centerX
    const dy = y - centerY
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist < 260) {
      // Calculate local temperature and CO2 estimate based on distance and draft
      const baseR = flameRadiusMm * 1.5 || 25
      const ratio = Math.max(0, 1 - dist / (baseR * 2.8))
      const localTemp = Math.round(22 + (flameTempC - 22) * (ratio ** 2))
      const localO2 = Math.max(2, (oxygen * (1 - ratio * 0.7)).toFixed(1))
      const localCO2 = Math.round(450 + (telemetry.co2Ppm - 450) * ratio)

      setHoverData({
        x: e.clientX,
        y: e.clientY,
        distMm: Math.round(dist * 0.4),
        temp: localTemp,
        o2: localO2,
        co2: localCO2,
      })
    } else {
      setHoverData(null)
    }
  }

  return (
    <div className="relative w-full h-[480px] lg:h-[580px] rounded-2xl overflow-hidden glass-panel border border-cyan-500/20 shadow-2xl flex flex-col group">
      {/* Top Chamber Header Bar */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-5 py-3.5 bg-gradient-to-b from-slate-950/90 via-slate-900/60 to-transparent backdrop-blur-md border-b border-cyan-500/10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${flameActive ? 'bg-cyan-400' : 'bg-slate-500'}`} />
              <span className={`relative inline-flex rounded-full h-3 w-3 ${flameActive ? (gravity < 0.05 ? 'bg-cyan-400 shadow-[0_0_8px_#38bdf8]' : 'bg-amber-400 shadow-[0_0_8px_#f59e0b]') : 'bg-slate-600'}`} />
            </span>
            <span className="text-xs font-mono font-bold tracking-wider text-cyan-300 uppercase">
              CIR RACK // {gravity < 0.05 ? '0G SPHERICAL DIFFUSION' : `BUOYANT ${gravity.toFixed(2)}G REGIME`}
            </span>
          </div>

          <span className="hidden sm:inline-block text-[11px] px-2 py-0.5 rounded font-mono bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">
            {isCoolFlame ? 'COOL FLAME 460°C' : `${flameTempC}°C CORE`}
          </span>
        </div>

        {/* View toggles & quick triggers */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowIsotherms(!showIsotherms)}
            title="Alternar Isotermas Térmicas"
            className={`px-2.5 py-1 text-xs font-mono rounded flex items-center gap-1.5 transition-all ${
              showIsotherms 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
                : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Isotermas</span>
          </button>

          <button
            onClick={() => setShowVectors(!showVectors)}
            title="Alternar Vectores de Convección"
            className={`px-2.5 py-1 text-xs font-mono rounded flex items-center gap-1.5 transition-all ${
              showVectors 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
                : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-slate-200'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Vectores</span>
          </button>

          {isIgnited ? (
            <button
              onClick={() => {
                sound.playClick()
                onTriggerExtinguish('co2')
              }}
              className="px-3 py-1 text-xs font-mono font-semibold rounded bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <ThermometerSnowflake className="w-3.5 h-3.5" />
              <span>Extinguir</span>
            </button>
          ) : (
            <button
              onClick={() => {
                sound.playIgnite()
                onIgnite()
              }}
              className="px-3 py-1 text-xs font-mono font-semibold rounded bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/30 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.25)] active:scale-95 animate-pulse"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Ignición</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Canvas Element */}
      <canvas 
        ref={canvasRef} 
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverData(null)}
        className="w-full h-full cursor-crosshair"
      />

      {/* Interactive Sensor HUD Tooltip on Hover */}
      {hoverData && (
        <div 
          className="absolute z-30 pointer-events-none p-3 rounded-lg glass-panel text-xs font-mono border border-cyan-400/40 shadow-xl"
          style={{ 
            left: `${hoverData.x - 70}px`, 
            top: `${hoverData.y - 120}px` 
          }}
        >
          <div className="flex items-center gap-2 text-cyan-300 font-bold border-b border-cyan-500/20 pb-1 mb-1.5">
            <Gauge className="w-3.5 h-3.5" />
            <span>SONDA CRIOMÉTRICA // {hoverData.distMm} mm</span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-slate-300">
            <span className="text-slate-400">Temp Local:</span>
            <span className={hoverData.temp > 800 ? 'text-amber-400 font-bold' : 'text-cyan-200'}>
              {hoverData.temp} °C
            </span>
            <span className="text-slate-400">O₂ Local:</span>
            <span>{hoverData.o2} %</span>
            <span className="text-slate-400">CO₂ Local:</span>
            <span>{hoverData.co2} ppm</span>
          </div>
        </div>
      )}

      {/* Bottom Telemetry Overlay Strip inside Canvas */}
      <div className="absolute bottom-3 inset-x-4 z-20 flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-slate-950/70 backdrop-blur-md border border-cyan-500/15 text-xs font-mono">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="text-slate-500">GRAVEDAD:</span>
            <span className={`font-bold ${gravity < 0.05 ? 'text-cyan-400' : 'text-amber-300'}`}>
              {gravity === 0 ? '0.00 g (Microgravedad)' : `${gravity.toFixed(2)} g`}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="text-slate-500">O₂ CABINA:</span>
            <span className={`font-bold ${oxygen > 30 ? 'text-red-400 animate-pulse' : 'text-cyan-300'}`}>
              {oxygen}%
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="text-slate-500">VENTILACIÓN ECLSS:</span>
            <span className="font-bold text-slate-200">
              {airflow} cm/s {airflow > 0 ? '→' : '∅'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="text-slate-500">PRESIÓN:</span>
            <span className="font-bold text-slate-200">
              {pressure} kPa
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 hidden sm:inline">RÉGIMEN:</span>
          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
            gravity < 0.05 
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
          }`}>
            {gravity < 0.05 ? 'DIFUSIÓN ESFÉRICA (Gr ≈ 0)' : 'CONVECCIÓN BOYANTE (Boyance-Driven)'}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ========================================================
   CANVAS DRAWING SUBROUTINES & PROCEDURAL PHYSICS
======================================================== */

function drawChamberHUD(ctx, width, height, cx, cy, t, params, showIsotherms, showVectors) {
  // Chamber crosshair and circular safety confinement boundary
  ctx.save()
  
  // Outer circular containment boundary (representing ISS CIR combustion chamber)
  const chamberRadius = Math.min(width, height) * 0.42
  ctx.beginPath()
  ctx.arc(cx, cy, chamberRadius, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)'
  ctx.lineWidth = 1.5
  ctx.setLineDash([4, 6])
  ctx.stroke()
  ctx.setLineDash([])

  // Concentric distance rings (10mm, 25mm, 50mm, 75mm)
  const rings = [45, 90, 140, 190]
  rings.forEach((r, idx) => {
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.06)'
    ctx.lineWidth = 1
    ctx.stroke()

    // Ring label
    ctx.fillStyle = 'rgba(100, 116, 139, 0.4)'
    ctx.font = '9px JetBrains Mono'
    ctx.fillText(`${(idx + 1) * 20}mm`, cx + r + 4, cy - 3)
  })

  // Crosshair lines
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.1)'
  ctx.beginPath()
  ctx.moveTo(cx - chamberRadius - 15, cy)
  ctx.lineTo(cx + chamberRadius + 15, cy)
  ctx.moveTo(cx, cy - chamberRadius - 15)
  ctx.lineTo(cx, cy + chamberRadius + 15)
  ctx.stroke()

  // Corner HUD Tech Accents
  drawHUDCorners(ctx, width, height)

  ctx.restore()
}

function drawHUDCorners(ctx, width, height) {
  const margin = 24
  const len = 16
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)'
  ctx.lineWidth = 1.5

  // Top Left
  ctx.beginPath()
  ctx.moveTo(margin, margin + len)
  ctx.lineTo(margin, margin)
  ctx.lineTo(margin + len, margin)
  ctx.stroke()

  // Top Right
  ctx.beginPath()
  ctx.moveTo(width - margin - len, margin)
  ctx.lineTo(width - margin, margin)
  ctx.lineTo(width - margin, margin + len)
  ctx.stroke()

  // Bottom Left
  ctx.beginPath()
  ctx.moveTo(margin, height - margin - len)
  ctx.lineTo(margin, height - margin)
  ctx.lineTo(margin + len, height - margin)
  ctx.stroke()

  // Bottom Right
  ctx.beginPath()
  ctx.moveTo(width - margin - len, height - margin)
  ctx.lineTo(width - margin, height - margin)
  ctx.lineTo(width - margin, height - margin - len)
  ctx.stroke()
}

function drawFuelSource(ctx, cx, cy, fuelId, isIgnited) {
  ctx.save()

  if (fuelId === 'heptane_droplet') {
    // Silica quartz fiber / needle holding a liquid droplet
    ctx.strokeStyle = '#94a3b8'
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.moveTo(cx, cy - 40)
    ctx.lineTo(cx, cy - 4)
    ctx.stroke()

    // Droplet bead
    const grad = ctx.createRadialGradient(cx - 2, cy - 2, 1, cx, cy, 7)
    grad.addColorStop(0, '#ffffff')
    grad.addColorStop(0.4, 'rgba(56, 189, 248, 0.8)')
    grad.addColorStop(1, 'rgba(14, 165, 233, 0.3)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(cx, cy, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.lineWidth = 1
    ctx.stroke()
  } else if (fuelId === 'pmma_solid') {
    // PMMA Polymer Rod / Slab
    ctx.fillStyle = 'rgba(203, 213, 225, 0.4)'
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)'
    ctx.lineWidth = 1.5
    ctx.fillRect(cx - 8, cy - 2, 16, 28)
    ctx.strokeRect(cx - 8, cy - 2, 16, 28)

    // Pyrolyzing melt tip
    if (isIgnited) {
      ctx.fillStyle = 'rgba(251, 146, 60, 0.7)'
      ctx.beginPath()
      ctx.ellipse(cx, cy - 2, 9, 4, 0, 0, Math.PI * 2)
      ctx.fill()
    }
  } else if (fuelId === 'polyethylene_wire') {
    // Spacecraft Cable (Copper core with blue PE insulation)
    ctx.strokeStyle = '#38bdf8'
    ctx.lineWidth = 6
    ctx.beginPath()
    ctx.moveTo(cx - 30, cy + 12)
    ctx.lineTo(cx + 30, cy + 12)
    ctx.stroke()

    // Stripped copper core exposed
    ctx.strokeStyle = '#f59e0b'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(cx - 10, cy + 12)
    ctx.lineTo(cx + 10, cy + 12)
    ctx.stroke()
  } else if (fuelId === 'li_ion_battery') {
    // 18650 Battery Cell
    ctx.fillStyle = '#1e293b'
    ctx.strokeStyle = '#ef4444'
    ctx.lineWidth = 2
    ctx.fillRect(cx - 12, cy - 2, 24, 32)
    ctx.strokeRect(cx - 12, cy - 2, 24, 32)

    // Positive terminal cap
    ctx.fillStyle = '#cbd5e1'
    ctx.fillRect(cx - 5, cy - 6, 10, 4)

    // Warning hazard stripes
    ctx.fillStyle = '#ef4444'
    ctx.fillRect(cx - 10, cy + 8, 20, 4)
  } else {
    // Default burner orifice / needle
    ctx.fillStyle = '#475569'
    ctx.beginPath()
    ctx.arc(cx, cy, 5, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

function drawFlameAura(ctx, cx, cy, radius, buoyancy, draftX, t, telemetry, params) {
  ctx.save()
  ctx.globalCompositeOperation = 'screen'

  const { gravity, oxygen } = params
  const { isCoolFlame } = telemetry

  // Flame offset due to buoyancy (rises upwards) and draft (pushed right)
  const flameOffsetY = -buoyancy * 0.8
  const flameOffsetX = draftX

  // Flicker oscillation (in 0g: steady quiet sphere, in 1g: 10Hz convective flicker)
  const flicker = gravity < 0.05 
    ? Math.sin(t * 1.5) * 1.5 
    : Math.sin(t * 12) * (buoyancy * 0.22) + Math.cos(t * 22) * 3

  const r = Math.max(10, radius + flicker)

  // Gradient selection based on gravity and combustion regime:
  // In 0g: Chemiluminescent Blue Sphere (CH* & C2* emission at 430nm)
  // In 1g: Convective teardrop with Yellow incandescent soot tip
  const grad = ctx.createRadialGradient(
    cx + flameOffsetX * 0.5, 
    cy + flameOffsetY * 0.4, 
    r * 0.15, 
    cx + flameOffsetX * 0.5, 
    cy + flameOffsetY * 0.4, 
    r * (1 + (gravity > 0.4 ? 1.4 : 0.4))
  )

  if (isCoolFlame) {
    // NASA Cool Flame: faint diffuse blue-violet, low intensity
    grad.addColorStop(0, 'rgba(168, 85, 247, 0.4)')
    grad.addColorStop(0.4, 'rgba(56, 189, 248, 0.25)')
    grad.addColorStop(0.8, 'rgba(99, 102, 241, 0.1)')
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
  } else if (gravity < 0.15) {
    // Microgravity pure diffusion flame: Gorgeous pure cyan/blue glowing ball
    const intensity = Math.min(1.0, 0.65 + (oxygen / 50))
    grad.addColorStop(0, `rgba(255, 255, 255, ${intensity * 0.95})`)
    grad.addColorStop(0.25, `rgba(56, 189, 248, ${intensity * 0.9})`)
    grad.addColorStop(0.6, `rgba(14, 165, 233, ${intensity * 0.55})`)
    grad.addColorStop(0.85, `rgba(37, 99, 235, ${intensity * 0.25})`)
    grad.addColorStop(1, 'rgba(2, 6, 23, 0)')
  } else {
    // Earth / Partial Gravity: Convective elongation with yellow/orange soot cap
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.98)')
    grad.addColorStop(0.2, 'rgba(254, 240, 138, 0.95)')
    grad.addColorStop(0.45, 'rgba(249, 115, 22, 0.8)')
    grad.addColorStop(0.75, 'rgba(225, 29, 72, 0.45)')
    grad.addColorStop(1, 'rgba(2, 6, 23, 0)')
  }

  // Draw flame shell shape
  ctx.fillStyle = grad
  ctx.beginPath()

  if (gravity < 0.15 && Math.abs(draftX) < 4) {
    // Pure sphere in microgravity!
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
  } else {
    // Teardrop / Elongated flame under gravity or draft
    const tipX = cx + flameOffsetX * 1.5
    const tipY = cy - r * (1 + buoyancy * 0.05) - (buoyancy * 1.2)
    const baseW = r * (1 - Math.min(0.5, gravity * 0.3))

    ctx.moveTo(cx - baseW, cy)
    ctx.bezierCurveTo(
      cx - baseW * 0.9, cy - r * 0.6,
      tipX - baseW * 0.4, tipY + r * 0.4,
      tipX, tipY
    )
    ctx.bezierCurveTo(
      tipX + baseW * 0.4, tipY + r * 0.4,
      cx + baseW * 0.9, cy - r * 0.6,
      cx + baseW, cy
    )
    ctx.bezierCurveTo(
      cx + baseW * 0.8, cy + r * 0.8,
      cx - baseW * 0.8, cy + r * 0.8,
      cx - baseW, cy
    )
  }
  ctx.fill()

  // Inner bright chemiluminescent core ring (NASA observation: spherical blue flame has thin bright reaction zone)
  if (gravity < 0.15) {
    ctx.beginPath()
    ctx.arc(cx, cy, r * 0.65, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(125, 211, 252, 0.7)'
    ctx.lineWidth = 1.8
    ctx.stroke()
  }

  ctx.restore()
}

function spawnCombustionParticles(cx, cy, radius, buoyancy, draftX, params, telemetry, particlesRef, smokeRef, sparksRef) {
  const { gravity, oxygen, fuelId } = params
  const { isCoolFlame } = telemetry

  // In 0g, soot stays near the sphere or oxidizes slowly. In 1g, it shoots upward.
  const spawnRate = isCoolFlame ? 1 : Math.round(2 + (oxygen / 20) + (gravity * 3))

  for (let i = 0; i < spawnRate; i++) {
    // Angle around fuel
    const angle = gravity < 0.15 
      ? Math.random() * Math.PI * 2 
      : -Math.PI * 0.5 + (Math.random() - 0.5) * 1.4

    const speed = gravity < 0.15 ? 0.3 + Math.random() * 0.6 : 1.2 + gravity * 1.8

    // Velocity vector: isotropic in 0g, upward in 1g, plus draft
    const vx = Math.cos(angle) * speed + (draftX / 30)
    const vy = Math.sin(angle) * speed - (buoyancy * 0.04)

    particlesRef.current.push({
      x: cx + (Math.random() - 0.5) * 8,
      y: cy + (Math.random() - 0.5) * 8,
      vx,
      vy,
      size: gravity < 0.15 ? 2.5 + Math.random() * 3.5 : 2 + Math.random() * 2.5,
      life: 1.0,
      decay: gravity < 0.15 ? 0.012 : 0.024,
      isBlue: gravity < 0.25,
    })
  }

  // Battery thermal runaway or solid PMMA produces violent sparks and soot puffs
  if (fuelId === 'li_ion_battery' || oxygen > 35) {
    for (let j = 0; j < 3; j++) {
      const sparkAngle = (Math.random() - 0.5) * Math.PI * 2
      const sparkSpd = 3.5 + Math.random() * 5.0
      sparksRef.current.push({
        x: cx,
        y: cy,
        vx: Math.cos(sparkAngle) * sparkSpd + (draftX / 15),
        vy: Math.sin(sparkAngle) * sparkSpd - (buoyancy * 0.08),
        size: 1.5 + Math.random() * 2.0,
        life: 1.0,
        decay: 0.035,
      })
    }
  }

  // Limit particles count for 60fps performance
  if (particlesRef.current.length > 250) {
    particlesRef.current.splice(0, particlesRef.current.length - 250)
  }
  if (sparksRef.current.length > 100) {
    sparksRef.current.splice(0, sparksRef.current.length - 100)
  }
}

function drawCombustionParticles(ctx, particlesRef, smokeRef, sparksRef, draftX, buoyancy) {
  ctx.save()
  ctx.globalCompositeOperation = 'screen'

  // Update & Draw Flame Particles
  for (let i = particlesRef.current.length - 1; i >= 0; i--) {
    const p = particlesRef.current[i]
    p.x += p.vx
    p.y += p.vy
    p.life -= p.decay

    if (p.life <= 0) {
      particlesRef.current.splice(i, 1)
      continue
    }

    const alpha = p.life * 0.8
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)

    if (p.isBlue) {
      ctx.fillStyle = `rgba(56, 189, 248, ${alpha})`
    } else {
      ctx.fillStyle = `rgba(249, 115, 22, ${alpha})`
    }
    ctx.fill()
  }

  // Update & Draw Sparks
  for (let i = sparksRef.current.length - 1; i >= 0; i--) {
    const s = sparksRef.current[i]
    s.x += s.vx
    s.y += s.vy
    s.life -= s.decay

    if (s.life <= 0) {
      sparksRef.current.splice(i, 1)
      continue
    }

    ctx.fillStyle = `rgba(254, 240, 138, ${s.life})`
    ctx.beginPath()
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

function drawIsotherms(ctx, cx, cy, baseRadius, buoyancy, draftX, temp, isCoolFlame) {
  ctx.save()
  ctx.setLineDash([3, 4])
  ctx.lineWidth = 1

  const contours = [
    { scale: 1.25, temp: Math.round(temp * 0.8), color: 'rgba(239, 68, 68, 0.45)' },
    { scale: 1.85, temp: Math.round(temp * 0.5), color: 'rgba(245, 158, 11, 0.35)' },
    { scale: 2.60, temp: Math.round(temp * 0.25), color: 'rgba(56, 189, 248, 0.25)' },
  ]

  contours.forEach(c => {
    const rx = baseRadius * c.scale
    const ry = (baseRadius + buoyancy * 0.4) * c.scale
    const offsetY = -buoyancy * 0.3 * (c.scale - 1)
    const offsetX = draftX * 0.4 * (c.scale - 1)

    ctx.strokeStyle = c.color
    ctx.beginPath()
    ctx.ellipse(cx + offsetX, cy + offsetY, rx, ry, 0, 0, Math.PI * 2)
    ctx.stroke()

    // Label on isotherm
    ctx.fillStyle = c.color
    ctx.font = '9px JetBrains Mono'
    ctx.fillText(`${c.temp}°C`, cx + rx + offsetX + 3, cy + offsetY)
  })

  ctx.restore()
}

function drawVelocityVectors(ctx, width, height, cx, cy, airflow, gravity, t) {
  ctx.save()
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)'
  ctx.lineWidth = 1

  // Draw 6 subtle vector streamlines showing air drift
  const linesCount = 7
  for (let i = 0; i < linesCount; i++) {
    const yBase = cy - 120 + i * 40
    const offset = ((t * 40 + i * 60) % width) - (width * 0.5)

    const x = cx + offset
    const y = yBase - (gravity * 15 * Math.sin((x - cx) * 0.02))

    ctx.beginPath()
    ctx.moveTo(x - 14, y)
    ctx.lineTo(x + 14, y)
    ctx.stroke()

    // Arrowhead
    ctx.beginPath()
    ctx.moveTo(x + 10, y - 3)
    ctx.lineTo(x + 15, y)
    ctx.lineTo(x + 10, y + 3)
    ctx.stroke()
  }

  ctx.restore()
}

function drawSuppressionEffect(ctx, width, height, cx, cy, agent, t) {
  ctx.save()

  if (agent === 'co2' || agent === 'novec') {
    // Billowing gas blanket
    const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 220)
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.85)')
    grad.addColorStop(0.4, 'rgba(226, 232, 240, 0.6)')
    grad.addColorStop(0.8, 'rgba(148, 163, 184, 0.25)')
    grad.addColorStop(1, 'rgba(2, 6, 23, 0)')

    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(cx, cy, 220, 0, Math.PI * 2)
    ctx.fill()
  } else if (agent === 'mist') {
    // Fine water fog spray mist particles
    ctx.fillStyle = 'rgba(186, 230, 253, 0.7)'
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2
      const dist = Math.random() * 180
      ctx.beginPath()
      ctx.arc(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, 1.5, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  ctx.restore()
}
