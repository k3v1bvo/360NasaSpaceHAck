import React, { useState } from 'react';
import Navbar from './components/Navbar';
import MissionDashboard from './components/MissionDashboard';
import FlameSimulator from './components/FlameSimulator';
import { RiskPredictor } from './components/RiskPredictor';
import { AIAssistant } from './components/AIAssistant';
import { PSIRepository } from './components/PSIRepository';
import { ATMOSPHERES } from './physics/flameKinetics';
import { ShieldCheck, Database, Radio, Flame, Sparkles } from 'lucide-react';

const ATMOSPHERE_PRESETS = {
  ISS_Standard: {
    name: "ISS Standard (Nivel del Mar)",
    o2: 21.0,
    pressure: 1.0,
    description: "101.3 kPa (14.7 psia), 21.0% O2 - Atmósfera base de la Estación Espacial Internacional"
  },
  Artemis_Gateway: {
    name: "Artemis Gateway (Exploración)",
    o2: 34.0,
    pressure: 0.56,
    description: "56.0 kPa (8.2 psia), 34.0% O2 - Atmósfera hipobárica enriquecida para reducción de descompresión"
  },
  Lunar_Habitat: {
    name: "Base Lunar Artemis / EVA Prep",
    o2: 32.0,
    pressure: 0.70,
    description: "70.0 kPa (10.2 psia), 32.0% O2 - Protocolo operacional para trajes xEMU"
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [atmosphere, setAtmosphere] = useState('ISS_Standard');

  const currentAtmData = ATMOSPHERE_PRESETS[atmosphere] || ATMOSPHERE_PRESETS.ISS_Standard;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-200">
      {/* Top Aerospace Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        atmosphere={atmosphere} 
        setAtmosphere={setAtmosphere} 
      />

      {/* Main Mission Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <MissionDashboard atmosphere={atmosphere} />
        )}

        {activeTab === 'simulator' && (
          <FlameSimulator atmosphere={atmosphere} />
        )}

        {activeTab === 'predictor' && (
          <RiskPredictor atmosphere={atmosphere} atmData={currentAtmData} />
        )}

        {activeTab === 'assistant' && (
          <AIAssistant />
        )}

        {activeTab === 'psi' && (
          <PSIRepository />
        )}
      </main>

      {/* Clean Engineering Footer */}
      <footer className="border-t border-[#1e293b] bg-[#020617] py-6 px-4 sm:px-6 lg:px-8 mt-12 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>NASA Physical Sciences Informatics (PSI) Database · Combustion Science Discipline</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-slate-400">Microgravity Fire Safety Architecture</span>
            <span className="text-slate-600">|</span>
            <span className="text-[#38bdf8]">Vercel Production Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
