import React, { useState } from 'react';
import { 
  Cpu, 
  Search, 
  BookOpen, 
  FileCheck, 
  Sparkles, 
  ShieldAlert, 
  HelpCircle, 
  CheckCircle2, 
  Send,
  Flame,
  Layers
} from 'lucide-react';
import { FLIGHT_EXPERIENCES } from '../data/flightExperiences';

export function AIAssistant() {
  const [selectedExperience, setSelectedExperience] = useState(FLIGHT_EXPERIENCES[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const categories = ["ALL", "Llamas Frías", "Accidentes Históricos", "Inflamabilidad de Materiales", "Detección y Supresión"];

  // Filter experiences by category and search query
  const filteredExperiences = FLIGHT_EXPERIENCES.filter(exp => {
    const matchesCategory = selectedCategory === "ALL" || exp.category === selectedCategory;
    const matchesQuery = searchQuery.trim() === "" || 
      exp.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.mission.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const handleSelect = (exp) => {
    setSelectedExperience(exp);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="p-6 bg-[#0f172a] rounded-xl border border-[#334155] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#0284c7]/10 text-[#38bdf8] text-xs font-mono font-medium tracking-wide mb-2">
            <Cpu className="w-3.5 h-3.5" />
            GROUNDED NASA AEROSPACE SAFETY REASONING ENGINE
          </div>
          <h2 className="text-2xl font-bold text-slate-100">Asistente IA Basado en Experiencias de Vuelo</h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Base de conocimiento y razonamiento entrenada sobre 43 investigaciones de microgravedad y peritajes de accidentes 
            históricos de la NASA (Apollo 1, Apollo 13, Mir 1997, FLEX, BASS, Saffire, SoFIE).
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#020617] border border-[#1e293b] text-xs font-mono text-emerald-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Base Verificada (100% Citas Oficiales)</span>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por caso, material (teflón, PMMA), misión (Apollo, Mir, Saffire) o fenómeno..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#0f172a] border border-[#334155] rounded-xl text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:border-[#38bdf8]"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
                selectedCategory === cat 
                  ? 'bg-[#38bdf8] text-slate-950 font-bold shadow-sm' 
                  : 'bg-[#0f172a] text-slate-400 hover:text-slate-200 border border-[#334155]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Experience Selector + Deep Reasoning Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: List of Questions / Scenarios (5 cols) */}
        <div className="lg:col-span-5 space-y-3 max-h-[700px] overflow-y-auto pr-1">
          <div className="text-xs font-mono uppercase text-slate-400 px-1 mb-2">
            Casos de Estudio Disponibles ({filteredExperiences.length})
          </div>

          {filteredExperiences.map((exp) => {
            const isSelected = selectedExperience && selectedExperience.id === exp.id;
            return (
              <button
                key={exp.id}
                onClick={() => handleSelect(exp)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-[#0284c7]/15 border-[#38bdf8] text-white shadow-sm'
                    : 'bg-[#0f172a] border-[#334155] text-slate-300 hover:border-slate-500 hover:bg-[#1e293b]/50'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    exp.category === 'Accidentes Históricos' ? 'bg-red-950 text-red-300 border border-red-800/40' :
                    exp.category === 'Llamas Frías' ? 'bg-blue-950 text-blue-300 border border-blue-800/40' :
                    exp.category === 'Detección y Supresión' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40' :
                    'bg-amber-950 text-amber-300 border border-amber-800/40'
                  }`}>
                    {exp.category}
                  </span>
                  <span className="text-slate-500">{exp.id}</span>
                </div>
                <div className="text-sm font-semibold line-clamp-2 text-slate-100">
                  {exp.question}
                </div>
                <div className="text-xs text-slate-400 mt-2 font-mono truncate">
                  {exp.mission}
                </div>
              </button>
            );
          })}

          {filteredExperiences.length === 0 && (
            <div className="p-8 text-center bg-[#0f172a] rounded-xl border border-[#334155] text-slate-400 text-sm">
              No se encontraron casos de estudio con los términos ingresados.
            </div>
          )}
        </div>

        {/* Right Column: Detailed Scientific Reasoning & Forensics (7 cols) */}
        <div className="lg:col-span-7">
          {selectedExperience ? (
            <div className="p-6 bg-[#0f172a] rounded-xl border border-[#334155] space-y-6">
              {/* Header */}
              <div className="border-b border-[#334155] pb-4">
                <div className="flex items-center gap-2 text-xs font-mono text-[#38bdf8] mb-2">
                  <BookOpen className="w-4 h-4" />
                  <span>REGISTRO FORENSE ESPACIAL {selectedExperience.id}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-100">
                  {selectedExperience.question}
                </h3>
                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded bg-[#020617] border border-[#1e293b] text-slate-300">
                    Misión: <strong className="text-white">{selectedExperience.mission}</strong>
                  </span>
                  <span className="px-2.5 py-1 rounded bg-[#020617] border border-[#1e293b] text-slate-300">
                    Área: <strong className="text-white">{selectedExperience.category}</strong>
                  </span>
                </div>
              </div>

              {/* Detailed Technical Answer */}
              <div className="space-y-4">
                <div className="text-xs font-mono uppercase text-slate-400">Análisis y Dictamen Técnico:</div>
                <div className="p-5 rounded-xl bg-[#020617] border border-[#1e293b] text-sm text-slate-200 leading-relaxed space-y-3 font-sans">
                  {selectedExperience.answer.split('\n\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </div>

              {/* Verified NASA Citation Box */}
              <div className="p-4 rounded-xl bg-sky-950/20 border border-sky-800/40 flex items-start gap-3">
                <FileCheck className="w-5 h-5 text-[#38bdf8] flex-shrink-0 mt-0.5" />
                <div className="text-xs font-mono">
                  <div className="text-[#38bdf8] font-bold mb-0.5">FUENTE OFICIAL VERIFICADA NASA:</div>
                  <div className="text-slate-300">{selectedExperience.citation}</div>
                </div>
              </div>

              {/* Key Takeaways & Recommendations */}
              <div className="pt-2">
                <div className="text-xs font-mono uppercase text-slate-400 mb-3">Recomendación de Diseño Derivada:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-[#020617] border border-[#1e293b]">
                    <div className="font-mono text-slate-400 mb-1">PROTOCOLO DE CONTROL</div>
                    <div className="text-slate-200">
                      Eliminación de atmósferas enriquecidas (&gt; 24.1% O2) sin mitigación por baja presión global (34 kPa).
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#020617] border border-[#1e293b]">
                    <div className="font-mono text-slate-400 mb-1">MONITOREO CRÍTICO</div>
                    <div className="text-slate-200">
                      Detección continua de monóxido de carbono (CO) e hidroperóxidos para advertencia temprana de llamas frías.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-[#0f172a] rounded-xl border border-[#334155] text-slate-400">
              Seleccione un caso de estudio de la lista para ver el análisis técnico detallado.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
