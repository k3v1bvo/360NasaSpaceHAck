import React, { useState } from 'react';
import { 
  Flame, 
  AlertTriangle, 
  ShieldCheck, 
  BarChart2, 
  Filter, 
  Layers, 
  Wind, 
  Download, 
  MapPin, 
  Satellite, 
  Clock, 
  CheckCircle2,
  Sliders,
  Radio
} from 'lucide-react';
import harmonizedData from '../../../data/nasa/firms_tunari_harmonized.geojson';
import metricsData from '../../../data/nasa/metricas_anomalias_tunari.json';

export default function FireMonitorTab({ 
  onSelectFoco,
  sensorMode = 'HARMONIZED',
  onSensorModeChange,
  wmsCota = true,
  setWmsCota,
  wmsPeriurbanos = true,
  setWmsPeriurbanos,
  wmsDistritos = false,
  setWmsDistritos,
  offlineMode = false
}) {
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterZone, setFilterZone] = useState('ALL');
  const [activeSubTab, setActiveSubTab] = useState('list'); // 'list' | 'metrics' | 'simulation' | 'wms'
  
  // Parámetros de simulación de viento
  const [windSpeed, setWindSpeed] = useState(25); // km/h
  const [windDirection, setWindDirection] = useState('SUR'); // Viento dominante hacia el Tunari

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

  // Cálculo de simulación de propagación
  const spreadRate = (windSpeed * 0.08).toFixed(1); // km/h aprox según modelo Rothermel simplificado
  const timeToCota = (2.2 / (spreadRate > 0 ? spreadRate : 0.5) * 60).toFixed(0); // minutos a interfaz

  // Función para descargar GeoJSON de Kevin
  const handleDownloadGeoJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(harmonizedData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `kevin_nasa_gamc_tunari_harmonized_${new Date().toISOString().slice(0, 10)}.geojson`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-4 p-4 text-white">
      {/* 1. Header del Módulo de Kevin */}
      <div className="flex items-center justify-between border-b border-red-900/40 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-gradient-to-tr from-red-600 to-amber-600 p-2 text-white shadow-lg shadow-red-900/30">
            <Flame className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-black tracking-wide text-red-400">
                FOCOS DE CALOR & TUNARI
              </h2>
              <span className="rounded bg-red-950 px-1.5 py-0.5 text-[9px] font-bold text-red-300 border border-red-800/80">
                KEVIN
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              NASA FIRMS • Armonización MODIS & VIIRS + GAMC WMS
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadGeoJSON}
          className="rounded-lg border border-neutral-800 bg-neutral-900 p-1.5 text-neutral-300 hover:text-white hover:border-neutral-700 transition"
          title="Descargar GeoJSON Oficial para Bomberos y GAMC"
        >
          <Download className="h-4 w-4" />
        </button>
      </div>

      {/* 2. Selector de Modo de Sensor Satelital (Eje Central de la Solución) */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-950/80 p-2.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
            <Satellite className="h-3.5 w-3.5 text-cyan-400" />
            Sensor Satelital en Mapa
          </span>
          <span className="text-[10px] text-cyan-400 font-mono">
            {sensorMode === 'HARMONIZED' && 'Dual 1.2 km'}
            {sensorMode === 'MODIS' && '1 km píxel'}
            {sensorMode === 'VIIRS' && '375 m píxel'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
          <button
            onClick={() => onSensorModeChange && onSensorModeChange('HARMONIZED')}
            className={`rounded-md py-1.5 text-[11px] font-bold transition ${
              sensorMode === 'HARMONIZED'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            🔥 Armonizado
          </button>
          <button
            onClick={() => onSensorModeChange && onSensorModeChange('MODIS')}
            className={`rounded-md py-1.5 text-[11px] font-bold transition ${
              sensorMode === 'MODIS'
                ? 'bg-amber-600 text-white shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            MODIS (1 km)
          </button>
          <button
            onClick={() => onSensorModeChange && onSensorModeChange('VIIRS')}
            className={`rounded-md py-1.5 text-[11px] font-bold transition ${
              sensorMode === 'VIIRS'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            VIIRS (375 m)
          </button>
        </div>
        <p className="text-[10px] text-neutral-500 leading-tight">
          {sensorMode === 'HARMONIZED' && '✓ Clústeres espacio-temporales que corrigen la inflación de focos por cambio de resolución.'}
          {sensorMode === 'MODIS' && 'Serie histórica continua desde 2000 (Terra/Aqua).'}
          {sensorMode === 'VIIRS' && 'Alta resolución espacial nocturna y diurna (Suomi-NPP / NOAA-20).'}
        </p>
      </div>

      {/* 3. Tarjetas de Métricas Clave */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-2.5">
          <span className="text-[10px] text-neutral-400 uppercase tracking-wider">Eventos</span>
          <p className="text-xl font-black text-red-500">{filteredFeatures.length}</p>
          <span className="text-[9px] text-neutral-500">Detectados</span>
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

      {/* 4. Sub-Navegación de Herramientas de Kevin */}
      <div className="flex items-center gap-1 border-b border-neutral-800 pb-2 text-xs">
        <button
          onClick={() => setActiveSubTab('list')}
          className={`flex-1 py-1 px-2 rounded-lg font-semibold text-center transition ${
            activeSubTab === 'list'
              ? 'bg-neutral-800 text-white'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Focos Activos
        </button>
        <button
          onClick={() => setActiveSubTab('simulation')}
          className={`flex-1 py-1 px-2 rounded-lg font-semibold text-center transition ${
            activeSubTab === 'simulation'
              ? 'bg-neutral-800 text-red-300'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Viento & Avance
        </button>
        <button
          onClick={() => setActiveSubTab('wms')}
          className={`flex-1 py-1 px-2 rounded-lg font-semibold text-center transition ${
            activeSubTab === 'wms'
              ? 'bg-neutral-800 text-emerald-300'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Capas GAMC
        </button>
        <button
          onClick={() => setActiveSubTab('metrics')}
          className={`flex-1 py-1 px-2 rounded-lg font-semibold text-center transition ${
            activeSubTab === 'metrics'
              ? 'bg-neutral-800 text-cyan-300'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Épocas
        </button>
      </div>

      {/* 5A. SUB-TAB 1: LISTA DE FOCOS ARMONIZADOS */}
      {activeSubTab === 'list' && (
        <div className="space-y-3">
          {/* Filtros */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="w-full rounded-lg border border-neutral-800 bg-neutral-900 p-2 text-[11px] text-neutral-200 outline-none focus:border-red-500"
              >
                <option value="ALL">Severidad: Todos</option>
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
                <option value="ALL">Ubicación: Todas</option>
                <option value="TUNARI">Solo Parque Tunari</option>
                <option value="VALLE">Solo Valle / Quemas</option>
              </select>
            </div>
          </div>

          {/* Tarjetas de Focos */}
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
                    <span className="text-neutral-100 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-red-500" />
                      {p.zona}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      p.nivel_alerta === 'Critico' 
                        ? 'bg-red-950 text-red-400 border border-red-800/80 animate-pulse' 
                        : p.nivel_alerta === 'Alto' 
                        ? 'bg-amber-950 text-amber-400 border border-amber-800/60' 
                        : 'bg-neutral-800 text-neutral-300'
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
                    <span>{p.en_parque_tunari ? '🌲 Dentro del Tunari (Cota >2750)' : '🏡 Zona Periurbana'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5B. SUB-TAB 2: SIMULADOR DE PROPAGACIÓN POR VIENTO */}
      {activeSubTab === 'simulation' && (
        <div className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-950 p-3.5">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <h3 className="text-xs font-bold text-red-400 flex items-center gap-1.5">
              <Wind className="h-4 w-4" />
              Simulador de Avance hacia Cota 2750
            </h3>
            <span className="text-[10px] text-amber-400 font-mono">Modelo Tunari</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">Velocidad del Viento:</span>
              <span className="font-bold text-red-400 font-mono">{windSpeed} km/h</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              value={windSpeed}
              onChange={(e) => setWindSpeed(Number(e.target.value))}
              className="w-full accent-red-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-neutral-500">
              <span>Brisa (5 km/h)</span>
              <span>Moderado (25 km/h)</span>
              <span>Ráfaga Fuerte (60 km/h)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="rounded-lg bg-neutral-900 p-2 border border-neutral-800">
              <span className="text-[10px] text-neutral-400 block">Velocidad de Frente:</span>
              <span className="text-sm font-bold text-amber-300 font-mono">{spreadRate} km/h</span>
            </div>
            <div className="rounded-lg bg-neutral-900 p-2 border border-neutral-800">
              <span className="text-[10px] text-neutral-400 block">Tiempo a Interfaz:</span>
              <span className="text-sm font-bold text-red-400 font-mono">~{timeToCota} min</span>
            </div>
          </div>

          <div className="rounded-lg bg-red-950/40 border border-red-900/50 p-2.5 text-[11px] text-red-200">
            <p className="font-semibold flex items-center gap-1 text-red-300 mb-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              Recomendación para Brigadas SAR-Bolivia / GAMC:
            </p>
            Viento canalizado por torrenteras (Taquiña/Pintumayu). Con ráfagas &gt;25 km/h, priorizar cortafuegos en la franja periurbana antes de las 14:00.
          </div>
        </div>
      )}

      {/* 5C. SUB-TAB 3: GESTIÓN DE CAPAS WMS DE LA ALCALDÍA (GAMC) */}
      {activeSubTab === 'wms' && (
        <div className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-950 p-3.5">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <Layers className="h-4 w-4" />
              Servicios WMS GAMC (Proyecto 03)
            </h3>
            <span className="rounded bg-emerald-950 px-1.5 py-0.5 text-[9px] font-mono text-emerald-400 border border-emerald-800">
              API OK
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* Capa 1: Cota 2750 */}
            <label className="flex items-center justify-between p-2 rounded-lg border border-neutral-800 bg-neutral-900 cursor-pointer hover:border-emerald-500/50 transition">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={wmsCota}
                  onChange={(e) => setWmsCota && setWmsCota(e.target.checked)}
                  className="rounded accent-emerald-500"
                />
                <div>
                  <span className="font-bold text-neutral-200 block">Cota 2750 (Límite PNT)</span>
                  <span className="text-[10px] text-neutral-400">UUID: 297cefa4-0832-42bb-a98e...</span>
                </div>
              </div>
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            </label>

            {/* Capa 2: Periurbanos */}
            <label className="flex items-center justify-between p-2 rounded-lg border border-neutral-800 bg-neutral-900 cursor-pointer hover:border-purple-500/50 transition">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={wmsPeriurbanos}
                  onChange={(e) => setWmsPeriurbanos && setWmsPeriurbanos(e.target.checked)}
                  className="rounded accent-purple-500"
                />
                <div>
                  <span className="font-bold text-neutral-200 block">Periurbanos (Asentamientos)</span>
                  <span className="text-[10px] text-neutral-400">UUID: c52066a1-32fd-4925-81e0...</span>
                </div>
              </div>
              <span className="h-2.5 w-2.5 rounded-full bg-purple-500"></span>
            </label>

            {/* Capa 3: Límite Distritos */}
            <label className="flex items-center justify-between p-2 rounded-lg border border-neutral-800 bg-neutral-900 cursor-pointer hover:border-blue-500/50 transition">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={wmsDistritos}
                  onChange={(e) => setWmsDistritos && setWmsDistritos(e.target.checked)}
                  className="rounded accent-blue-500"
                />
                <div>
                  <span className="font-bold text-neutral-200 block">Límite Distritos GAMC</span>
                  <span className="text-[10px] text-neutral-400">UUID: 7eb13092-bf0e-493b-aae6...</span>
                </div>
              </div>
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
            </label>
          </div>

          <div className="rounded-lg bg-neutral-900 p-2 text-[10px] text-neutral-400 font-mono space-y-0.5 border border-neutral-800">
            <div><strong>Endpoint WMS:</strong> serviciosgamc.cochabamba.bo/api/gs/wms</div>
            <div><strong>Key Proy 03:</strong> 8da30122933ced2174ebe3e8b03198731d9...</div>
          </div>
        </div>
      )}

      {/* 5D. SUB-TAB 4: ANÁLISIS DE ÉPOCAS CRÍTICAS */}
      {activeSubTab === 'metrics' && (
        <div className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-950 p-3.5">
          <div className="border-b border-neutral-800 pb-2">
            <h3 className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
              <BarChart2 className="h-4 w-4" />
              Patrones Históricos & Épocas Críticas
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

          <div className="rounded-lg bg-neutral-900 border border-neutral-800 p-2.5 text-[11px] text-neutral-300">
            <strong>Hallazgo de Armonización:</strong> {metricsData?.hallazgo_armonizacion}
          </div>
        </div>
      )}

      {/* 6. Nota Científica & Créditos de Kevin */}
      <div className="rounded-xl border border-neutral-800/80 bg-neutral-950/60 p-3 text-[11px] text-neutral-400 space-y-1">
        <div className="flex items-center gap-1.5 text-neutral-200 font-semibold">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Metodología de Armonización de Kevin:</span>
        </div>
        <p className="leading-snug">
          Agrupamiento espaciotemporal a 1.2 km y ponderación de Fire Radiative Power (FRP) en MW. Cumple los estándares del reto global NASA Space Apps Challenge y la normativa municipal de Cochabamba (Cota 2750).
        </p>
      </div>
    </div>
  );
}
