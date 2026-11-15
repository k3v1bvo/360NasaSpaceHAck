import React, { useState } from 'react';
import { MATERIALS } from '../../physics/flameKinetics';
import { MaterialKey } from '../../types';
import { BarChart3, ShieldCheck, AlertTriangle, ChevronRight, Info } from 'lucide-react';

interface MaterialRankingChartProps {
  currentAtmO2: number;
  onSelectMaterial?: (id: MaterialKey) => void;
}

const MAT_META: Record<string, { formula: string; spaceUse: string; description: string }> = {
  PMMA:         { formula: '(C5H8O2)n', spaceUse: 'Cubiertas experimentales, visores', description: 'Alta tasa de propagación por bajo LOI orbital; peligroso en enriquecimiento de O2.' },
  ETFE_Wire:    { formula: '(C4H4F4)n', spaceUse: 'Aislamiento de cableado eléctrico', description: 'LOI alto en tierra, pero cae drásticamente en microgravedad por enfriamiento reducido.' },
  Nomex:        { formula: 'Aramida', spaceUse: 'Trajes, tabiques de cabina', description: 'El mejor tejido sintético: escasa tasa de propagación y elevado LOI incluso en 0-g.' },
  Cotton:       { formula: 'Celulosa', spaceUse: 'Muestra Saffire; referencia de riesgo', description: 'Encendido fácil (bajo LOI_1g), propagación moderada. Base de comparación del experimento SAFFIRE.' },
  Polyethylene: { formula: '(C2H4)n', spaceUse: 'Embalajes, contenedores flexibles', description: 'Mayor calor de combustión de la lista (43.6 MJ/kg). Alta propagación si se expone a flujo HVAC.' },
  Kapton:       { formula: 'Poliimida', spaceUse: 'Circuitos flexibles, MLI térmico', description: 'Muy alta temperatura de pirólisis (520°C), bajo factor de propagación. Relativamente seguro.' },
  PTFE:         { formula: '(C2F4)n', spaceUse: 'Teflón: manguitos, lubricantes secos', description: 'Prácticamente inerte: LOI_1g de 95%. Referencia de material más seguro del catálogo NASA-STD-6001.' },
};

export const MaterialRankingChart: React.FC<MaterialRankingChartProps> = ({ currentAtmO2, onSelectMaterial }) => {
  const [metric, setMetric] = useState<'vf' | 'loi' | 'heat'>('vf');
  const [hoveredMat, setHoveredMat] = useState<string | null>(null);

  const materials = (Object.keys(MATERIALS) as MaterialKey[]).map((id) => {
    const data = MATERIALS[id];
    const loi = Number((data.LOI_1g + data.base_shift).toFixed(1));
    const heat = data.heat_combustion_MJ_kg;
    const vf = Number(((data.alpha * data.k_burn * (currentAtmO2 / 21)) / 2.5).toFixed(2));
    const meta = MAT_META[id] || { formula: '—', spaceUse: '—', description: '—' };

    return { id, name: data.name, loi, heat, vf, ...meta };
  });

  const sorted = [...materials].sort((a, b) => {
    if (metric === 'vf') return b.vf - a.vf;
    if (metric === 'loi') return a.loi - b.loi;
    return b.heat - a.heat;
  });

  const maxVal = metric === 'vf'
    ? Math.max(...materials.map((m) => m.vf), 2.0)
    : metric === 'loi'
    ? 55
    : Math.max(...materials.map((m) => m.heat), 10);

  return (
    <div className="card-aerospace p-6 sm:p-8 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2.5">
            <BarChart3 className="w-5 h-5 text-sky-400" />
            <span>Ranking de Inflamabilidad de Materiales Aeroespaciales</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Haz clic en cualquier material para ver su <span className="text-sky-300 font-semibold underline decoration-sky-500/40 cursor-pointer">ficha técnica aeroespacial completa</span>. <span className="text-sky-400 font-mono">O₂ cabina: {currentAtmO2}%</span>
          </p>
        </div>

        {/* Metric Tabs */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs font-mono flex-shrink-0">
          <button
            onClick={() => setMetric('vf')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              metric === 'vf' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tasa Vf
          </button>
          <button
            onClick={() => setMetric('loi')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              metric === 'loi' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            LOI Orbital %
          </button>
          <button
            onClick={() => setMetric('heat')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              metric === 'heat' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Calor Comb. MJ/kg
          </button>
        </div>
      </div>

      {/* Column Headers */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-3 px-1">
        <span>Material / Polímero (Haz clic para detalles)</span>
        <div className="flex items-center space-x-4">
          {metric === 'vf' && <span className="text-rose-400">⚠ Umbral crítico NASA: &gt; 1.5 mm/s</span>}
          {metric === 'loi' && <span className="text-emerald-400">🛡 Seguro si LOI orbital &gt; {currentAtmO2}%</span>}
          <span className="text-slate-400">
            ({metric === 'vf' ? 'mm/s' : metric === 'loi' ? '%' : 'MJ/kg'})
          </span>
        </div>
      </div>

      {/* Bar List */}
      <div className="space-y-3.5">
        {sorted.map((mat) => {
          const val = metric === 'vf' ? mat.vf : metric === 'loi' ? mat.loi : mat.heat;
          const pct = Math.min(100, Math.max(5, (val / maxVal) * 100));

          let barColor = 'bg-sky-500';
          let textColor = 'text-sky-400';
          if (metric === 'vf') {
            if (val > 2.0) { barColor = 'bg-rose-500'; textColor = 'text-rose-400'; }
            else if (val > 1.0) { barColor = 'bg-amber-500'; textColor = 'text-amber-400'; }
            else { barColor = 'bg-emerald-500'; textColor = 'text-emerald-400'; }
          } else if (metric === 'loi') {
            if (val < currentAtmO2) { barColor = 'bg-rose-500'; textColor = 'text-rose-400'; }
            else if (val < currentAtmO2 + 4) { barColor = 'bg-amber-500'; textColor = 'text-amber-400'; }
            else { barColor = 'bg-emerald-500'; textColor = 'text-emerald-400'; }
          }

          return (
            <div
              key={mat.id}
              onClick={() => onSelectMaterial && onSelectMaterial(mat.id)}
              onMouseEnter={() => setHoveredMat(mat.id)}
              onMouseLeave={() => setHoveredMat(null)}
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-sky-500/60 hover:bg-slate-900 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2.5">
                  <span className="font-bold text-sm text-slate-200 group-hover:text-sky-300 transition-colors">
                    {mat.name}
                  </span>
                  <span className="text-xs font-mono text-slate-500">({mat.formula})</span>
                  <span className="hidden sm:inline-flex items-center space-x-1 text-[11px] font-mono text-sky-400/80 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Ficha técnica</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
                <span className={`font-mono font-bold text-sm ${textColor}`}>
                  {val.toFixed(metric === 'vf' ? 2 : 1)}{' '}
                  <span className="text-xs font-normal text-slate-400">
                    {metric === 'vf' ? 'mm/s' : metric === 'loi' ? '%' : 'MJ/kg'}
                  </span>
                </span>
              </div>

              {/* Bar track with NASA reference line */}
              <div className="relative w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800/50">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
                  style={{ width: `${pct}%` }}
                />
                {metric === 'loi' && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-emerald-400/70 z-10"
                    style={{ left: `${(currentAtmO2 / maxVal) * 100}%` }}
                    title={`O₂ de cabina actual: ${currentAtmO2}%`}
                  />
                )}
                {metric === 'vf' && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-rose-400/70 z-10"
                    style={{ left: `${(1.5 / maxVal) * 100}%` }}
                    title="Umbral crítico propagación NASA: 1.5 mm/s"
                  />
                )}
              </div>

              {/* Hover detail preview */}
              {hoveredMat === mat.id && (
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 animate-fade-in">
                  <div>
                    <span className="font-semibold text-slate-400">Uso Espacial: </span>
                    <span className="text-slate-200">{mat.spaceUse}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-400">Comportamiento 0-g: </span>
                    <span className="text-slate-200">{mat.description}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="mt-5 p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 flex items-start space-x-2.5 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
        <span>
          <span className="font-bold text-slate-200">NASA-STD-6001B: </span>
          Haz clic en cualquier material de la lista para inspeccionar su química de pirólisis, antecedentes de vuelo y directrices de mitigación de conatos de fuego.
        </span>
      </div>
    </div>
  );
};
