import React, { useState } from 'react';
import { Flame, AlertTriangle, ShieldCheck, RefreshCw, BarChart2, Filter, Layers, Compass } from 'lucide-react';
import harmonizedData from '../../../data/nasa/firms_tunari_harmonized.geojson';
import metricsData from '../../../data/nasa/metricas_anomalias_tunari.json';

export default function FireMonitorTab({ onSelectFoco }) {
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterZone, setFilterZone] = useState('ALL');
  const [showMetrics, setShowMetrics] = useState(false);

  const features = harmonizedData?.features || [];

  const filteredFeatures = features.filter((f) => {
    const props = f.properties;
    if (filterSeverity !== 'ALL' && props.nivel_alerta !== filterSeverity) return false;
    if (filterZone === 'TUNARI' && !props.en_parque_tunari) return false;
    if (filterZone === 'VALLE' && props.en_parque_tunari) return false;
    return true;
  });

  const totalFRP = filteredFeatures.reduce((acc, curr) => acc + (curr.properties.frp_total_mw || 0), 0);
  const criticosCount = features.filter(f => f.properties.nivel_alerta === 'Critico').length;
  const tunariCount = features.filter(f => f.properties.en_parque_tunari).length;

  return (
    <div className="space-y-4 p-4 text-white">
      {/* Header del Módulo */}
      <div className="flex items-center justify-between border-b border-red-900/50 pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-red-600/20 p-2 text-red-500 shadow-inner">
            <Flame className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-black tracking-wide text-red-400">
              FOCOS DE CALOR & TUNARI
            </h2>
            <p className="text-[11px] text-neutral-400">
              NASA FIRMS • Armonización MODIS & VIIRS
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowMetrics(!showMetrics)}
          className={`rounded-lg border px-2.5 py-1 text-xs font-semibold flex items-center gap-1.5 transition ${
            showMetrics
              ? 'border-red-500 bg-red-950 text-red-300'
              : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
          }`}
        >
          <BarChart2 className="h-3.5 w-3.5" />
          <span>{showMetrics ? 'Ver Lista' : 'Análisis Épocas'}</span>
        </button>
      </div>

      {/* Tarjetas de Métricas Clave */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-2.5">
          <span className="text-[10px] text-neutral-400 uppercase tracking-wider">Eventos</span>
          <p className="text-xl font-black text-red-500">{filteredFeatures.length}</p>
          <span className="text-[9px] text-neutral-500">Armonizados</span>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-2.5">
          <span className="text-[10px] text-neutral-400 uppercase tracking-wider">P.N. Tunari</span>
          <p className="text-xl font-black text-amber-400">{tunariCount}</p>
          <span className="text-[9px] text-amber-500/80">En cota protegida</span>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-2.5">
          <span className="text-[10px] text-neutral-400 uppercase tracking-wider">FRP Total</span>
          <p className="text-xl font-black text-orange-400">{Math.round(totalFRP)}</p>
          <span className="text-[9px] text-neutral-500">Megawatts (MW)</span>
        </div>
      </div>

      {/* Vista de Análisis de Épocas Críticas y Anomalías */}
      {showMetrics ? (
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3 space-y-3">
          <div className="border-b border-neutral-800 pb-2">
            <h3 className="text-xs font-bold text-red-400 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" />
              <span>Patrones Históricos & Épocas Críticas (GAMC)</span>
            </h3>
            <p className="text-[11px] text-neutral-400 mt-1">
              Periodo de Máximo Riesgo: <strong>Julio a Noviembre</strong> (Picos en Agosto y Septiembre).
            </p>
          </div>

          <div className="space-y-1.5 text-xs">
            {metricsData?.distribucion_mensual?.map((item) => (
              <div key={item.mes} className="flex items-center justify-between py-1 border-b border-neutral-900 text-[11px]">
                <span className={item.es_periodo_critico ? 'font-bold text-red-300' : 'text-neutral-400'}>
                  {item.mes} {item.es_periodo_critico && '⚠️'}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-neutral-400">{item.focos_registrados} eventos</span>
                  <span className="font-mono text-neutral-200">{item.frp_acumulado_mw} MW</span>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg bg-red-950/40 border border-red-900/40 p-2 text-[11px] text-red-200">
            <strong>Hallazgo de Armonización:</strong> {metricsData?.hallazgo_armonizacion}
          </div>
        </div>
      ) : (
        <>
          {/* Barra de Filtros */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="w-full rounded-lg border border-neutral-800 bg-neutral-900 p-2 text-[11px] text-neutral-200 outline-none focus:border-red-500"
              >
                <option value="ALL">Todos los Niveles</option>
                <option value="Critico">Solo Críticos (&gt;50 MW)</option>
                <option value="Alto">Solo Nivel Alto</option>
                <option value="Moderado">Solo Moderados</option>
              </select>
            </div>
            <div className="flex-1">
              <select
                value={filterZone}
                onChange={(e) => setFilterZone(e.target.value)}
                className="w-full rounded-lg border border-neutral-800 bg-neutral-900 p-2 text-[11px] text-neutral-200 outline-none focus:border-red-500"
              >
                <option value="ALL">Todo Cochabamba</option>
                <option value="TUNARI">Solo Parque Tunari</option>
                <option value="VALLE">Solo Valle / Quemas</option>
              </select>
            </div>
          </div>

          {/* Lista de Focos Armonizados */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-neutral-300">
              Focos Armonizados ({filteredFeatures.length})
            </span>

            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {filteredFeatures.map((foco) => {
                const p = foco.properties;
                return (
                  <div
                    key={p.id}
                    onClick={() => onSelectFoco && onSelectFoco(foco)}
                    className="cursor-pointer rounded-xl border border-neutral-800 bg-neutral-950 p-3 transition hover:border-red-600/60 hover:bg-neutral-900"
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-neutral-100">{p.zona}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        p.nivel_alerta === 'Critico' ? 'bg-red-950 text-red-400 border border-red-800/80 animate-pulse' :
                        p.nivel_alerta === 'Alto' ? 'bg-amber-950 text-amber-400 border border-amber-800/60' :
                        'bg-neutral-800 text-neutral-300'
                      }`}>
                        {p.nivel_alerta} • {p.frp_total_mw} MW
                      </span>
                    </div>

                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-neutral-400">
                      <span>Fecha: <strong className="text-neutral-300">{p.fecha}</strong></span>
                      <span className="rounded bg-neutral-900 px-1.5 py-0.5 text-[10px] font-mono text-cyan-400 border border-neutral-800">
                        {p.sensor_armonizado}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-neutral-500 pt-1.5 border-t border-neutral-900">
                      <span>{p.clasificacion}</span>
                      <span>{p.en_parque_tunari ? '🌲 Dentro del Tunari' : '🏡 Interfaz urbana'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Nota científica */}
      <div className="rounded-xl border border-neutral-800/80 bg-neutral-950/60 p-2.5 text-[11px] text-neutral-400 space-y-1">
        <div className="flex items-center gap-1.5 text-neutral-200 font-semibold">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Solución Científica de Kevin:</span>
        </div>
        <p className="leading-snug">
          Fusionamos la resolución fina de VIIRS (375 m) con la serie histórica de 24 años de MODIS (1 km) usando agrupamiento espaciotemporal a 1.2 km y normalización de potencia FRP.
        </p>
      </div>
    </div>
  );
}
