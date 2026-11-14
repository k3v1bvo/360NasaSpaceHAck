import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  ExternalLink, 
  Filter, 
  Layers, 
  FileText, 
  CheckCircle2, 
  ArrowUpRight,
  Flame,
  Info
} from 'lucide-react';
import { PSI_INVESTIGATIONS } from '../data/psiInvestigations';

export function PSIRepository() {
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState("ALL");
  const [selectedInvestigation, setSelectedInvestigation] = useState(PSI_INVESTIGATIONS[0]);

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
      {/* Header Banner */}
      <div className="p-6 bg-[#0f172a] rounded-xl border border-[#334155] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#0284c7]/10 text-[#38bdf8] text-xs font-mono font-medium tracking-wide mb-2">
            <Database className="w-3.5 h-3.5" />
            NASA PHYSICAL SCIENCES INFORMATICS (PSI) OFFICIAL REPOSITORY
          </div>
          <h2 className="text-2xl font-bold text-slate-100">Catálogo de 24 Investigaciones Espaciales PSI</h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Repositorio completo con 12 Terabytes de datos experimentales de combustión en microgravedad compilados por NASA 
            (ISS CIR/MSG, naves orbitales Cygnus Saffire y Transbordador Espacial).
          </p>
        </div>

        <div className="px-4 py-2.5 rounded-lg bg-[#020617] border border-[#1e293b] text-xs font-mono text-slate-300">
          Total Investigaciones: <strong className="text-[#38bdf8]">{PSI_INVESTIGATIONS.length}</strong> | Datos Abiertos
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre (FLEX, Saffire, SoFIE), material (heptano, PMMA, Nomex) o categoría..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#0f172a] border border-[#334155] rounded-xl text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:border-[#38bdf8]"
          />
        </div>

        {/* Platform Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {platforms.map((plat) => (
            <button
              key={plat}
              onClick={() => setPlatformFilter(plat)}
              className={`px-3.5 py-2 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
                platformFilter === plat
                  ? 'bg-[#38bdf8] text-slate-950 font-bold shadow-sm'
                  : 'bg-[#0f172a] text-slate-400 hover:text-slate-200 border border-[#334155]'
              }`}
            >
              {plat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Split List and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Cards List (5 cols) */}
        <div className="lg:col-span-5 space-y-3 max-h-[720px] overflow-y-auto pr-1">
          <div className="text-xs font-mono uppercase text-slate-400 px-1 mb-2">
            Misiones Filtradas ({filtered.length})
          </div>

          {filtered.map((inv) => {
            const isSelected = selectedInvestigation && selectedInvestigation.id === inv.id;
            return (
              <button
                key={inv.id}
                onClick={() => setSelectedInvestigation(inv)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-[#0284c7]/15 border-[#38bdf8] text-white shadow-sm'
                    : 'bg-[#0f172a] border-[#334155] text-slate-300 hover:border-slate-500 hover:bg-[#1e293b]/50'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className="font-bold text-[#38bdf8]">{inv.id}</span>
                  <span className="text-slate-400">{inv.year_range}</span>
                </div>
                <div className="text-sm font-semibold text-slate-100 line-clamp-1">
                  {inv.name}
                </div>
                <div className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {inv.description}
                </div>
                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[#1e293b] text-[11px] font-mono text-slate-500">
                  <span className="px-1.5 py-0.5 rounded bg-[#020617] text-slate-300">{inv.platform}</span>
                  <span>{inv.category}</span>
                </div>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="p-8 text-center bg-[#0f172a] rounded-xl border border-[#334155] text-slate-400 text-sm">
              No se encontraron misiones con los filtros seleccionados.
            </div>
          )}
        </div>

        {/* Right Column: Detailed Investigation Data (7 cols) */}
        <div className="lg:col-span-7">
          {selectedInvestigation ? (
            <div className="p-6 bg-[#0f172a] rounded-xl border border-[#334155] space-y-6">
              {/* Header */}
              <div className="border-b border-[#334155] pb-5">
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="px-2 py-0.5 rounded bg-[#0284c7]/20 text-[#38bdf8] border border-[#0284c7]/40 font-bold">
                    {selectedInvestigation.id}
                  </span>
                  <span className="text-slate-400">Plataforma: <strong className="text-white">{selectedInvestigation.platform}</strong> ({selectedInvestigation.year_range})</span>
                </div>
                <h3 className="text-xl font-bold text-slate-100">
                  {selectedInvestigation.name}
                </h3>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  {selectedInvestigation.description}
                </p>
              </div>

              {/* Parameters Table */}
              <div>
                <div className="text-xs font-mono uppercase text-slate-400 mb-3 flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>Condiciones Experimentales Registradas</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                  {Object.entries(selectedInvestigation.parameters).map(([key, val]) => (
                    <div key={key} className="p-3 rounded-lg bg-[#020617] border border-[#1e293b]">
                      <span className="text-slate-500 block mb-0.5 text-[10px] uppercase">{key.replace(/_/g, ' ')}</span>
                      <span className="text-slate-200 font-bold">{val}</span>
                    </div>
                  ))}
                  <div className="p-3 rounded-lg bg-[#020617] border border-[#1e293b] sm:col-span-3">
                    <span className="text-slate-500 block mb-0.5 text-[10px] uppercase">Materiales Analizados</span>
                    <span className="text-slate-200 font-bold">{selectedInvestigation.materials.join(", ")}</span>
                  </div>
                </div>
              </div>

              {/* Objectives */}
              <div>
                <div className="text-xs font-mono uppercase text-slate-400 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>Objetivos de Vuelo</span>
                </div>
                <div className="space-y-2">
                  {selectedInvestigation.objectives.map((obj, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#020617] border border-[#1e293b] text-xs text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] mt-1.5 flex-shrink-0" />
                      <span>{obj}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Findings */}
              <div>
                <div className="text-xs font-mono uppercase text-slate-400 mb-3 flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hallazgos Clave para Seguridad Espacial</span>
                </div>
                <div className="space-y-2">
                  {selectedInvestigation.key_findings.map((finding, i) => (
                    <div key={i} className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/40 text-xs text-amber-200 leading-relaxed">
                      {finding}
                    </div>
                  ))}
                </div>
              </div>

              {/* Publication DOI Link */}
              <div className="pt-2 border-t border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="font-mono text-slate-400">
                  <span className="text-slate-500 block text-[10px]">PUBLICACIÓN PRINCIPAL:</span>
                  <span className="text-slate-300">{selectedInvestigation.publications[0]}</span>
                </div>
                {selectedInvestigation.doi && (
                  <a
                    href={selectedInvestigation.doi}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#38bdf8] text-slate-950 font-bold text-xs hover:bg-[#7dd3fc] transition-colors whitespace-nowrap"
                  >
                    <span>Ver Paper en DOI</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-[#0f172a] rounded-xl border border-[#334155] text-slate-400">
              Seleccione una investigación para inspeccionar los parámetros y descubrimientos científicos.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
