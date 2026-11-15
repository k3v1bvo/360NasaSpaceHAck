import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  ExternalLink, 
  Filter, 
  CheckCircle2, 
  Flame 
} from 'lucide-react';
import { PSI_INVESTIGATIONS } from '../data/psiInvestigations';
import { PSIInvestigation } from '../types';

export const PSIRepository: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [platformFilter, setPlatformFilter] = useState<string>("ALL");
  const [selectedInvestigation, setSelectedInvestigation] = useState<PSIInvestigation>(PSI_INVESTIGATIONS[0]);

  const platforms = ["ALL", "ISS (CIR)", "ISS (MSG)", "Cygnus", "Shuttle"];

  const filtered = PSI_INVESTIGATIONS.filter(inv => {
    const matchesPlatform = platformFilter === "ALL" || inv.platform.includes(platformFilter.replace("ALL", ""));
    const matchesSearch = searchQuery.trim() === "" ||
      inv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.materials.some(m => m.toLowerCase().includes(searchQuery.toLowerCase())) ||
      inv.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPlatform && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner - Spacious & Roomy */}
      <div className="p-6 sm:p-8 bg-[#0f172a] rounded-2xl border border-[#334155] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0284c7]/15 text-[#38bdf8] text-xs font-mono font-bold tracking-wide border border-[#0284c7]/30">
              <Database className="w-4 h-4" />
              <span>REPOSITORIO NASA PSI (PHYSICAL SCIENCES INFORMATICS)</span>
            </div>
            <details>
              <summary className="text-sm text-sky-400 font-mono cursor-pointer hover:text-sky-300 select-none">
                ▶ Sobre los Datos Experimentales de Vuelo
              </summary>
              <p className="text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed pl-3 border-l-2 border-sky-500/40">
                Catálogo con 12 Terabytes de telemetría y mediciones directas compiladas por la NASA a lo largo de 30 años de investigaciones de combustión espacial en la ISS (CIR/MSG), naves Cygnus y el Transbordador Espacial.
              </p>
            </details>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mt-2.5 tracking-tight">Catálogo de 24 Investigaciones Espaciales</h2>
        </div>

        <div className="px-4 py-2 rounded-xl bg-[#020617] border border-[#1e293b] text-xs sm:text-sm font-mono text-slate-300 self-start md:self-auto font-bold shadow-sm">
          Misiones Oficiales: <strong className="text-[#38bdf8]">{PSI_INVESTIGATIONS.length}</strong> | Open Data
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-4 top-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre (FLEX, Saffire, SoFIE), material (heptano, PMMA, Nomex) o categoría..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-[#0f172a] border border-[#334155] rounded-xl text-slate-100 text-sm sm:text-base placeholder-slate-500 focus:outline-none focus:border-[#38bdf8]"
          />
        </div>

        {/* Platform Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {platforms.map((plat) => (
            <button
              key={plat}
              onClick={() => setPlatformFilter(plat)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-mono transition-all whitespace-nowrap font-bold ${
                platformFilter === plat
                  ? 'bg-[#38bdf8] text-slate-950 shadow-md'
                  : 'bg-[#0f172a] text-slate-400 hover:text-slate-200 border border-[#334155]'
              }`}
            >
              {plat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Split List and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Cards List (5 cols) */}
        <div className="lg:col-span-5 space-y-4 max-h-[750px] overflow-y-auto pr-2">
          <div className="text-xs font-mono uppercase text-slate-400 px-1 mb-2 font-bold">
            Misiones Filtradas ({filtered.length})
          </div>

          {filtered.map((inv) => {
            const isSelected = selectedInvestigation && selectedInvestigation.id === inv.id;
            return (
              <button
                key={inv.id}
                onClick={() => setSelectedInvestigation(inv)}
                className={`w-full text-left p-5 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-[#0284c7]/20 border-[#38bdf8] text-white shadow-md'
                    : 'bg-[#0f172a] border-[#334155] text-slate-300 hover:border-slate-500 hover:bg-[#1e293b]/60'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="font-bold text-[#38bdf8] text-sm">{inv.id}</span>
                  <span className="text-slate-400 font-bold">{inv.year_range}</span>
                </div>
                <div className="text-base font-bold text-slate-100 mb-1.5 line-clamp-1">
                  {inv.name}
                </div>
                <div className="text-xs text-slate-400 font-mono mb-2">
                  Plataforma: <strong className="text-slate-200">{inv.platform}</strong> · {inv.category}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">
                  {inv.description}
                </p>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="p-10 text-center bg-[#0f172a] rounded-2xl border border-[#334155] text-slate-400 text-sm">
              No se encontraron misiones con los filtros seleccionados.
            </div>
          )}
        </div>

        {/* Right Column: Detailed Investigation Data (7 cols) */}
        <div className="lg:col-span-7">
          {selectedInvestigation ? (
            <div className="p-6 sm:p-8 bg-[#0f172a] rounded-2xl border border-[#334155] space-y-6 shadow-xl">
              {/* Header */}
              <div className="border-b border-[#334155] pb-5">
                <div className="flex items-center justify-between text-xs sm:text-sm font-mono mb-2.5">
                  <span className="px-3 py-1 rounded-lg bg-[#0284c7]/25 text-[#38bdf8] border border-[#0284c7]/50 font-bold">
                    {selectedInvestigation.id}
                  </span>
                  <span className="text-slate-300">
                    Plataforma: <strong className="text-white">{selectedInvestigation.platform}</strong> ({selectedInvestigation.year_range})
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-100 mt-2">
                  {selectedInvestigation.name}
                </h3>
                <p className="text-sm sm:text-base text-slate-200 mt-3 leading-relaxed">
                  {selectedInvestigation.description}
                </p>
              </div>

              {/* Key Findings - Highest priority */}
              <div>
                <div className="text-sm font-mono uppercase text-slate-300 mb-3 flex items-center gap-2 font-bold">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Hallazgos Clave para Seguridad Espacial</span>
                </div>
                <div className="space-y-3">
                  {selectedInvestigation.key_findings.map((finding, i) => (
                    <div key={i} className="p-4 rounded-xl bg-amber-950/25 border border-amber-900/50 text-sm text-amber-200 leading-relaxed font-medium">
                      {finding}
                    </div>
                  ))}
                </div>
              </div>

              {/* Parameters Table - Collapsible */}
              <details className="rounded-xl border border-[#1e293b] bg-[#020617]/70 p-4">
                <summary className="text-sm font-mono uppercase text-sky-400 cursor-pointer hover:text-sky-300 select-none flex items-center gap-2 font-bold">
                  <Filter className="w-4 h-4 text-[#38bdf8]" />
                  <span>▶ Condiciones Experimentales Registradas</span>
                </summary>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-xs sm:text-sm font-mono mt-4">
                  {Object.entries(selectedInvestigation.parameters).map(([key, val]) => (
                    <div key={key} className="p-3 rounded-xl bg-[#0f172a] border border-[#334155]">
                      <span className="text-slate-400 block mb-1 text-xs uppercase font-semibold">{key.replace(/_/g, ' ')}</span>
                      <span className="text-slate-100 font-bold text-sm">{val}</span>
                    </div>
                  ))}
                  <div className="p-3.5 rounded-xl bg-[#0f172a] border border-[#334155] sm:col-span-3">
                    <span className="text-slate-400 block mb-1 text-xs uppercase font-semibold">Materiales Analizados</span>
                    <span className="text-slate-100 font-bold text-sm">{selectedInvestigation.materials.join(", ")}</span>
                  </div>
                </div>
              </details>

              {/* Objectives - Collapsible */}
              <details className="rounded-xl border border-[#1e293b] bg-[#020617]/70 p-4">
                <summary className="text-sm font-mono uppercase text-sky-400 cursor-pointer hover:text-sky-300 select-none flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-[#38bdf8]" />
                  <span>▶ Objetivos de Vuelo ({selectedInvestigation.objectives.length})</span>
                </summary>
                <div className="space-y-2.5 mt-4">
                  {selectedInvestigation.objectives.map((obj, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[#0f172a] border border-[#334155] text-sm text-slate-200">
                      <div className="w-2 h-2 rounded-full bg-[#38bdf8] mt-2 flex-shrink-0" />
                      <span className="leading-relaxed">{obj}</span>
                    </div>
                  ))}
                </div>
              </details>

              {/* Publication DOI Link - Spacious */}
              <div className="pt-4 border-t border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm">
                <div className="font-mono text-slate-400">
                  <span className="text-slate-400 block text-xs font-semibold uppercase mb-1">PUBLICACIÓN PRINCIPAL:</span>
                  <span className="text-slate-200 font-medium">{selectedInvestigation.publications[0]}</span>
                </div>
                {selectedInvestigation.doi && (
                  <a
                    href={selectedInvestigation.doi}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#38bdf8] text-slate-950 font-bold text-sm hover:bg-[#7dd3fc] transition-colors whitespace-nowrap shadow-md self-start sm:self-auto"
                  >
                    <span>Ver Paper en DOI</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-[#0f172a] rounded-2xl border border-[#334155] text-slate-400 text-sm">
              Seleccione una investigación para inspeccionar los parámetros y descubrimientos científicos.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PSIRepository;
