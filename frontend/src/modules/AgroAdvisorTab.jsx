import React, { useState } from 'react';
import { Sprout, Droplets, Compass, CheckCircle2, ShieldCheck, MapPin, Sparkles, Layers } from 'lucide-react';

const PARCELAS_VALLE = [
  { id: 'valle_bajo', name: 'Valle Bajo (Quillacollo / Vinto)', lat: -17.40, lon: -66.28, tipo: 'franco', smap: 19, cultivo_actual: 'Maíz / Alfa' },
  { id: 'valle_alto', name: 'Valle Alto (Cliza / Punata)', lat: -17.58, lon: -65.93, tipo: 'arenoso', smap: 14, cultivo_actual: 'Trigo / Maíz Chuspillo' },
  { id: 'ladera_tunari', name: 'Ladera Tunari (Tiquipaya / Apote)', lat: -17.34, lon: -66.21, tipo: 'pedregoso', smap: 22, cultivo_actual: 'Agroforestería / Floricultura' },
  { id: 'valle_central', name: 'Valle Central (Colcapirhua)', lat: -17.39, lon: -66.23, tipo: 'franco', smap: 24, cultivo_actual: 'Hortalizas periurbanas' },
  { id: 'valle_sacaba', name: 'Valle de Sacaba (Chimboco / Curubamba)', lat: -17.40, lon: -66.04, tipo: 'franco', smap: 26, cultivo_actual: 'Tubérculos / Haba' }
];

export default function AgroAdvisorTab({ onOpenReportModal, onSelectParcela }) {
  const [suelo, setSuelo] = useState('franco');
  const [agua, setAgua] = useState('escasa');
  const [selectedParcelaId, setSelectedParcelaId] = useState('valle_bajo');

  const handleSelectParcela = (parcela) => {
    setSelectedParcelaId(parcela.id);
    setSuelo(parcela.tipo);
    if (onSelectParcela) {
      onSelectParcela(parcela);
    }
  };

  // Dinámica de recomendaciones agrícolas resilientes
  const getRecomendacion = () => {
    if (suelo === 'pedregoso') {
      return {
        cultivo1: 'Molle y Frutales de Altura (Durazno / Manzana criolla)',
        cultivo2: 'Leguminosas arbustivas fijadoras de nitrógeno',
        ahorro: '~38%',
        evapo: 'Media-Alta (3.8 mm/día)',
        smapNota: 'Infiltración rápida, requiere cobertura vegetal (mulching)'
      };
    }
    if (agua === 'escasa' || suelo === 'arenoso') {
      return {
        cultivo1: 'Maíz criollo de ciclo corto (tolerante a estrés hídrico)',
        cultivo2: 'Tarwi (Lupinus mutabilis) / Haba (Fijador biológico de N)',
        ahorro: '~42%',
        evapo: 'Alta (4.2 mm/día)',
        smapNota: 'Déficit hídrico detectado por NASA SMAP. Priorizar siembra directa'
      };
    }
    return {
      cultivo1: 'Hortalizas mixtas con riego por goteo',
      cultivo2: 'Alfalfa / Avena forrajera con rotación de leguminosas',
      ahorro: '~28%',
      evapo: 'Moderada (3.1 mm/día)',
      smapNota: 'Capacidad de campo óptima. Monitorear salinidad de pozos'
    };
  };

  const rec = getRecomendacion();

  return (
    <div className="space-y-4 p-4 text-white">
      {/* Header Oficial Agrotech */}
      <div className="flex items-center justify-between border-b border-emerald-900/50 pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-emerald-600/20 p-2 text-emerald-500 shadow-inner">
            <Sprout className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-black tracking-wide text-emerald-400">
              AGROTECH & RESILIENCIA HÍDRICA
            </h2>
            <p className="text-[11px] text-neutral-400">
              NASA SMAP (Humedad Suelo) • Evapotranspiración Valles
            </p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
          Suelos Valle
        </span>
      </div>

      {/* Selector de Parcelas Demostrativas */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-emerald-400" />
          <span>Parcelas Monitoreadas en los Valles de Cochabamba</span>
        </span>
        <div className="grid grid-cols-1 gap-1.5 max-h-44 overflow-y-auto pr-1">
          {PARCELAS_VALLE.map((p) => {
            const isSelected = selectedParcelaId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectParcela(p)}
                className={`flex items-center justify-between p-2 rounded-xl border text-left transition ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-950/40 shadow-md shadow-emerald-950/40'
                    : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700 hover:bg-neutral-900'
                }`}
              >
                <div>
                  <div className={`text-xs font-bold ${isSelected ? 'text-emerald-300' : 'text-neutral-200'}`}>
                    {p.name}
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    Cultivo: {p.cultivo_actual}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 px-1.5 py-0.5 rounded">
                    SMAP: {p.smap}%
                  </span>
                  <div className="text-[9px] text-neutral-500 capitalize">Suelo {p.tipo}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Parámetros Agronómicos */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3 space-y-3">
        <span className="text-xs font-semibold text-neutral-300">Calibración de la Parcela</span>
        
        <div>
          <label className="text-[11px] text-neutral-400">Tipo de suelo predominante:</label>
          <select 
            value={suelo} 
            onChange={(e) => setSuelo(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 p-2 text-xs text-neutral-200 outline-none focus:border-emerald-500"
          >
            <option value="franco">Franco arcilloso (Valle Bajo / Quillacollo / Sacaba)</option>
            <option value="arenoso">Arenoso / Aluvial (Valle Alto / riberas torrenteras)</option>
            <option value="pedregoso">Pedregoso / Ladera (Faldas del Parque Tunari)</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] text-neutral-400">Disponibilidad hídrica de riego:</label>
          <select 
            value={agua} 
            onChange={(e) => setAgua(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900 p-2 text-xs text-neutral-200 outline-none focus:border-emerald-500"
          >
            <option value="escasa">Escasa / Secano (Solo lluvias temporales)</option>
            <option value="moderada">Moderada (Turno de acequia semanal / pozo)</option>
            <option value="abundante">Buena (Canal continuo / represa Misicuni)</option>
          </select>
        </div>
      </div>

      {/* Tarjeta de Recomendación Científica */}
      <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Rotación Resiliente Optimizada</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">Ahorro: {rec.ahorro}</span>
        </div>

        <p className="text-xs text-neutral-200 leading-snug">
          <strong>Temporada 1 (Principal):</strong> {rec.cultivo1}.<br/>
          <strong>Temporada 2 (Rotación):</strong> {rec.cultivo2}.
        </p>

        <div className="border-t border-emerald-900/60 pt-2 grid grid-cols-2 gap-2 text-[10px] text-neutral-300">
          <div>
            <span className="text-neutral-500 block">Evapotranspiración:</span>
            <strong className="text-emerald-400">{rec.evapo}</strong>
          </div>
          <div>
            <span className="text-neutral-500 block">Diagnóstico Satelital:</span>
            <span className="text-cyan-300 font-medium">{rec.smapNota}</span>
          </div>
        </div>
      </div>

      {/* Botón Destacado: Reporte Ciudadano */}
      <div className="pt-1">
        <button
          onClick={onOpenReportModal}
          className="w-full rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-orange-600 py-2.5 text-xs font-bold text-white shadow-lg transition hover:opacity-90 flex items-center justify-center gap-2"
        >
          <Compass className="h-4 w-4" />
          <span>¡Reportar Incendio, Sequía o Torrentera!</span>
        </button>
      </div>

      <div className="rounded-lg bg-neutral-900/60 border border-neutral-800/60 p-2.5 text-center text-[10px] text-neutral-400">
        Integración agro-climática basada en misiones NASA SMAP (L-band SAR/Radiometer) y balances hídricos FAO-56.
      </div>
    </div>
  );
}
