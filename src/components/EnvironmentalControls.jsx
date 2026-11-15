import React from 'react'
import { 
  Orbit, 
  Wind, 
  Gauge, 
  Sparkles, 
  Sliders, 
  Flame, 
  RotateCcw,
  Zap,
  Info
} from 'lucide-react'
import { FUEL_PROPERTIES } from '../utils/combustionPhysics'
import { sound } from '../utils/audioEffects'

export default function EnvironmentalControls({ 
  params, 
  setParams, 
  onReset 
}) {
  const { gravity, oxygen, airflow, pressure, fuelId, isIgnited } = params

  const handleGravityChange = (val) => {
    sound.playClick()
    setParams(prev => ({ ...prev, gravity: parseFloat(val) }))
  }

  const handleOxygenChange = (val) => {
    sound.playClick()
    setParams(prev => ({ ...prev, oxygen: parseInt(val, 10) }))
  }

  const handleAirflowChange = (val) => {
    sound.playClick()
    setParams(prev => ({ ...prev, airflow: parseFloat(val) }))
  }

  const handlePressureChange = (val) => {
    sound.playClick()
    setParams(prev => ({ ...prev, pressure: parseFloat(val) }))
  }

  const handleFuelSelect = (id) => {
    sound.playClick()
    setParams(prev => ({ ...prev, fuelId: id }))
  }

  return (
    <div className="rounded-2xl p-5 glass-panel border border-cyan-500/20 flex flex-col gap-6">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-cyan-500/10 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold font-mono tracking-tight text-white uppercase">
            PARÁMETROS AMBIENTALES & COMBUSTIBLE
          </h3>
        </div>
        <button
          onClick={onReset}
          className="text-xs font-mono text-slate-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Nominal</span>
        </button>
      </div>

      {/* Fuel Type Selection Grid (Cositas que podés poner a quemar) */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5 uppercase">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>1. Material Combustible a Probar</span>
          </label>
          <span className="text-[10px] font-mono text-cyan-400">
            {FUEL_PROPERTIES[fuelId]?.category}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.values(FUEL_PROPERTIES).map((fuel) => {
            const isSelected = fuelId === fuel.id
            return (
              <button
                key={fuel.id}
                onClick={() => handleFuelSelect(fuel.id)}
                className={`p-2.5 rounded-xl text-left font-mono transition-all border ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                <div className="text-xs font-bold truncate">{fuel.name}</div>
                <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                  <span>{fuel.baseTemp}°C Base</span>
                  <span className={`px-1 rounded ${
                    fuel.hazardRating === 'Extreme' ? 'bg-red-950 text-red-400 border border-red-800' :
                    fuel.hazardRating === 'High' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    {fuel.hazardRating}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
        <p className="text-[11px] font-mono text-slate-400 mt-2 bg-slate-950/40 p-2 rounded-lg border border-slate-800/60">
          <strong className="text-cyan-300">Detalle de Material: </strong>
          {FUEL_PROPERTIES[fuelId]?.description}
        </p>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Gravity Slider (g) */}
        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
          <div className="flex justify-between items-center mb-2 font-mono">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Orbit className="w-3.5 h-3.5 text-cyan-400" />
              GRAVEDAD EFECTIVA (g)
            </span>
            <span className={`text-sm font-bold ${gravity < 0.05 ? 'text-cyan-400' : 'text-amber-400'}`}>
              {gravity.toFixed(2)} g
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="2"
            step="0.01"
            value={gravity}
            onChange={(e) => handleGravityChange(e.target.value)}
            className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />

          {/* Quick Gravity Preset Buttons */}
          <div className="grid grid-cols-4 gap-1.5 mt-2.5 font-mono text-[10px]">
            <button
              onClick={() => handleGravityChange(0)}
              className={`py-1 rounded border transition-all ${gravity === 0 ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
              0g (ISS)
            </button>
            <button
              onClick={() => handleGravityChange(0.166)}
              className={`py-1 rounded border transition-all ${Math.abs(gravity - 0.166) < 0.01 ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
              0.17g (Luna)
            </button>
            <button
              onClick={() => handleGravityChange(0.38)}
              className={`py-1 rounded border transition-all ${Math.abs(gravity - 0.38) < 0.01 ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
              0.38g (Marte)
            </button>
            <button
              onClick={() => handleGravityChange(1.0)}
              className={`py-1 rounded border transition-all ${Math.abs(gravity - 1.0) < 0.01 ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
              1.0g (Tierra)
            </button>
          </div>
        </div>

        {/* Oxygen Concentration Slider (O2 %) */}
        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
          <div className="flex justify-between items-center mb-2 font-mono">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              CONCENTRACIÓN DE OXÍGENO (O₂)
            </span>
            <span className={`text-sm font-bold ${oxygen > 30 ? 'text-red-400 animate-pulse' : oxygen < 15 ? 'text-amber-400' : 'text-cyan-400'}`}>
              {oxygen}% O₂
            </span>
          </div>

          <input
            type="range"
            min="10"
            max="100"
            step="1"
            value={oxygen}
            onChange={(e) => handleOxygenChange(e.target.value)}
            className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />

          <div className="grid grid-cols-4 gap-1.5 mt-2.5 font-mono text-[10px]">
            <button
              onClick={() => handleOxygenChange(14)}
              className={`py-1 rounded border transition-all ${oxygen === 14 ? 'bg-amber-500/20 text-amber-300 border-amber-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
              14% (Límite)
            </button>
            <button
              onClick={() => handleOxygenChange(21)}
              className={`py-1 rounded border transition-all ${oxygen === 21 ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
              21% (Nominal)
            </button>
            <button
              onClick={() => handleOxygenChange(34)}
              className={`py-1 rounded border transition-all ${oxygen === 34 ? 'bg-orange-500/20 text-orange-300 border-orange-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
              34% (Orion)
            </button>
            <button
              onClick={() => handleOxygenChange(100)}
              className={`py-1 rounded border transition-all ${oxygen === 100 ? 'bg-red-500/30 text-red-300 border-red-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
              100% (Apolo 1)
            </button>
          </div>
        </div>

        {/* Airflow / Draft Velocity (cm/s) */}
        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
          <div className="flex justify-between items-center mb-2 font-mono">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-cyan-400" />
              VENTILACIÓN ECLSS / TIRO (cm/s)
            </span>
            <span className="text-sm font-bold text-slate-200">
              {airflow.toFixed(1)} cm/s
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="40"
            step="0.5"
            value={airflow}
            onChange={(e) => handleAirflowChange(e.target.value)}
            className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />

          <div className="grid grid-cols-4 gap-1.5 mt-2.5 font-mono text-[10px]">
            <button
              onClick={() => handleAirflowChange(0)}
              className={`py-1 rounded border transition-all ${airflow === 0 ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
              0 cm/s (Calma)
            </button>
            <button
              onClick={() => handleAirflowChange(6)}
              className={`py-1 rounded border transition-all ${airflow === 6 ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
              6 cm/s (ISS)
            </button>
            <button
              onClick={() => handleAirflowChange(15)}
              className={`py-1 rounded border transition-all ${airflow === 15 ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
              15 cm/s (Ducto)
            </button>
            <button
              onClick={() => handleAirflowChange(35)}
              className={`py-1 rounded border transition-all ${airflow === 35 ? 'bg-amber-500/20 text-amber-300 border-amber-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
              35 cm/s (Ráfaga)
            </button>
          </div>
        </div>

        {/* Pressure Slider (kPa) */}
        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
          <div className="flex justify-between items-center mb-2 font-mono">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              PRESIÓN DE CABINA (kPa)
            </span>
            <span className={`text-sm font-bold ${pressure < 20 ? 'text-red-400 animate-pulse' : 'text-slate-200'}`}>
              {pressure.toFixed(1)} kPa
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="120"
            step="1"
            value={pressure}
            onChange={(e) => handlePressureChange(e.target.value)}
            className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />

          <div className="grid grid-cols-3 gap-1.5 mt-2.5 font-mono text-[10px]">
            <button
              onClick={() => handlePressureChange(0)}
              className={`py-1 rounded border transition-all ${pressure === 0 ? 'bg-red-500/20 text-red-300 border-red-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
              0 kPa (Vacío)
            </button>
            <button
              onClick={() => handlePressureChange(56)}
              className={`py-1 rounded border transition-all ${pressure === 56 ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
              56 kPa (Gateway)
            </button>
            <button
              onClick={() => handlePressureChange(101.3)}
              className={`py-1 rounded border transition-all ${Math.abs(pressure - 101.3) < 0.1 ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
              101.3 kPa (1 atm)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
