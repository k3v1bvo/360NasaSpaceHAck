import React, { useState, useMemo } from 'react'
import Navbar from './components/Navbar'
import CombustionChamber from './components/CombustionChamber'
import HazardAlertHUD from './components/HazardAlertHUD'
import EnvironmentalControls from './components/EnvironmentalControls'
import TelemetryGauges from './components/TelemetryGauges'
import SuppressionControls from './components/SuppressionControls'
import ScenarioPresets from './components/ScenarioPresets'
import AIResearchAssistant from './components/AIResearchAssistant'
import InfoModal from './components/InfoModal'
import NASAJudgingRubricModal from './components/NASAJudgingRubricModal'
import { calculateCombustionState, NASA_SCENARIOS } from './utils/combustionPhysics'
import { sound } from './utils/audioEffects'

export default function App() {
  // Environmental and physical parameters state
  const [params, setParams] = useState({
    gravity: 0.0, // 0 to 2 g
    oxygen: 21, // 10 to 100 %
    airflow: 0.0, // 0 to 40 cm/s
    pressure: 101.3, // 0 to 120 kPa
    fuelId: 'heptane_droplet',
    isIgnited: true,
    activeExtinguisher: null, // null | 'co2' | 'mist' | 'novec' | 'depressurize'
  })

  const [currentScenarioId, setCurrentScenarioId] = useState('iss_flex_nominal')
  const [muted, setMuted] = useState(false)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [isRubricModalOpen, setIsRubricModalOpen] = useState(false)

  // Real-time calculated physical telemetry & safety status
  const telemetry = useMemo(() => {
    return calculateCombustionState(params)
  }, [params])

  // Sound mute toggle
  const handleToggleMute = () => {
    const nextMuted = !muted
    setMuted(nextMuted)
    sound.setMuted(nextMuted)
  }

  // Trigger fire extinguisher / suppression agent
  const handleTriggerExtinguish = (agent) => {
    setParams(prev => ({
      ...prev,
      activeExtinguisher: agent,
    }))

    // In case of depressurization, pressure goes to 0
    if (agent === 'depressurize') {
      setTimeout(() => {
        setParams(prev => ({
          ...prev,
          pressure: 0,
          isIgnited: false,
          activeExtinguisher: null,
        }))
      }, 700)
    } else {
      setTimeout(() => {
        setParams(prev => ({
          ...prev,
          isIgnited: agent === 'novec' ? false : prev.isIgnited,
          activeExtinguisher: null,
        }))
      }, 1400)
    }
  }

  // Reignite chamber
  const handleIgnite = () => {
    setParams(prev => ({
      ...prev,
      isIgnited: true,
      pressure: prev.pressure < 20 ? 101.3 : prev.pressure,
      activeExtinguisher: null,
    }))
  }

  // Reset to nominal microgravity state
  const handleResetNominal = () => {
    sound.playClick()
    setParams({
      gravity: 0.0,
      oxygen: 21,
      airflow: 0.0,
      pressure: 101.3,
      fuelId: 'heptane_droplet',
      isIgnited: true,
      activeExtinguisher: null,
    })
    setCurrentScenarioId('iss_flex_nominal')
  }

  // Load a NASA historical or experimental scenario
  const handleSelectScenario = (scenario) => {
    setCurrentScenarioId(scenario.id)
    setParams({
      gravity: scenario.gravity,
      oxygen: scenario.oxygen,
      airflow: scenario.airflow,
      pressure: scenario.pressure,
      fuelId: scenario.fuelId,
      isIgnited: true,
      activeExtinguisher: null,
    })
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200 hud-grid">
      {/* Top Cockpit Navbar */}
      <Navbar 
        muted={muted}
        onToggleMute={handleToggleMute}
        onOpenInfoModal={() => setIsInfoModalOpen(true)}
        onOpenRubricModal={() => setIsRubricModalOpen(true)}
      />

      {/* Main Mission Control Cockpit */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* TOP SECTION: Primary Combustion Chamber & Real-Time Hazard Alert HUD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Main Visual Chamber Simulator (7 cols) */}
          <div className="lg:col-span-7 flex flex-col">
            <CombustionChamber 
              telemetry={telemetry}
              params={params}
              setParams={setParams}
              onTriggerExtinguish={handleTriggerExtinguish}
              onIgnite={handleIgnite}
            />
          </div>

          {/* Real-Time Hazard HUD & Threat Matrix (5 cols) */}
          <div className="lg:col-span-5 flex flex-col">
            <HazardAlertHUD 
              telemetry={telemetry}
              params={params}
              onTriggerExtinguish={handleTriggerExtinguish}
            />
          </div>
        </div>

        {/* MID SECTION: Real-Time Telemetry Gauges & Countermeasures Suite */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Real-time Telemetry with Live Sparkline Chart (7 cols) */}
          <div className="lg:col-span-7">
            <TelemetryGauges 
              telemetry={telemetry}
              params={params}
            />
          </div>

          {/* Suppression & Emergency Countermeasures (5 cols) */}
          <div className="lg:col-span-5">
            <SuppressionControls 
              params={params}
              setParams={setParams}
              onTriggerExtinguish={handleTriggerExtinguish}
            />
          </div>
        </div>

        {/* BOTTOM SECTION: Environmental Sandbox Controls & Fuel Placement */}
        <div>
          <EnvironmentalControls 
            params={params}
            setParams={setParams}
            onReset={handleResetNominal}
          />
        </div>

        {/* NASA Historical & Experimental Flight Scenarios */}
        <div>
          <ScenarioPresets 
            currentScenarioId={currentScenarioId}
            onSelectScenario={handleSelectScenario}
          />
        </div>

        {/* AI Research Synthesizer & NASA Papers Library (Challenge #10 Core Deliverable) */}
        <div>
          <AIResearchAssistant 
            telemetry={telemetry}
            params={params}
          />
        </div>
      </main>

      {/* Scientific Guide Modal */}
      <InfoModal 
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />

      {/* NASA Space Apps 5 Criteria & Rubric Defense Modal */}
      <NASAJudgingRubricModal 
        isOpen={isRubricModalOpen}
        onClose={() => setIsRubricModalOpen(false)}
      />

      {/* Cockpit Footer */}
      <footer className="mt-auto border-t border-cyan-500/10 bg-slate-950/80 py-6 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            <span className="text-slate-400 font-bold">NASA IGNIS-0G // CIR COMBUSTION PLATFORM</span>
          </div>
          <div>
            Desarrollado para NASA Space Apps Challenge 2026 · Desafío Oficial #10
          </div>
          <div className="text-slate-400">
            Física verificada con experimentos NASA BASS, FLEX & SoFIE
          </div>
        </div>
      </footer>
    </div>
  )
}
