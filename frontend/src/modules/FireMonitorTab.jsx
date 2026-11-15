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
  Sparkles,
  Eye,
  Calendar
} from 'lucide-react';
import harmonizedData from '../../../data/nasa/firms_tunari_harmonized.geojson';
import metricsData from '../../../data/nasa/metricas_anomalias_tunari.json';

export default function FireMonitorTab({ 
  selectedPoint,
  onSelectFoco,
  sensorMode = 'HARMONIZED',
  onSensorModeChange,
  wmsCota = true,
  setWmsCota,
  wmsPeriurbanos = true,
  setWmsPeriurbanos,
  wmsDistritos = false,
  setWmsDistritos,
  nasaGibs = false,
  setNasaGibs,
  gibsDate = '2024-09-15',
  setGibsDate,
  offlineMode = false
}) {
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterZone, setFilterZone] = useState('ALL');
  const [activeSubTab, setActiveSubTab] = useState('list'); // 'list' | 'simulation' | 'layers' | 'metrics'
  const [selectedFocoId, setSelectedFocoId] = useState(null);

  // Sincronizar foco seleccionado cuando se hace clic en el mapa
  useEffect(() => {
    if (!selectedPoint) return;
    if (selectedPoint.type === 'foco' || selectedPoint.frp_total_mw) {
      setSelectedFocoId(selectedPoint.id || selectedPoint.properties?.id);
    }
  }, [selectedPoint]);

  // Parámetros de simulación de viento
  const [windSpeed, setWindSpeed] = useState(25); // km/h
  const [windDirection, setWindDirection] = useState('SUR');

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

  // Cálculo de propagación
  const spreadRate = (windSpeed * 0.08).toFixed(1); // km/h aprox
  const timeToCota = (2.2 / (spreadRate > 0 ? spreadRate : 0.5) * 60).toFixed(0); // minutos a interfaz

  // Descarga de GeoJSON armonizado
  const handleDownloadGeoJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(harmonizedData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `nasa_firms_tunari_harmonized_${new Date().toISOString().slice(0, 10)}.geojson`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-3.5 p-4 text-white font-sans">
      {/* 1. Header del Módulo de Incendios */}
      <div className="flex items-center justify-between border-b border-red-900/40 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-gradient-to-tr from-red-600 to-amber-600 p-2 text-white shadow-lg shadow-red-900/30">
            <Flame className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-black tracking-wide text-red-400">
                INCENDIOS TUNARI
              </h2>
              <span className="rounded bg-red-950 px-1.5 py-0.5 text-[9px] font-bold text-red-300 border border-red-800">
                CAUSA TÉRMICA
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Monitoreo Satelital de Fuego & Plumas de Aerosoles AOD
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadGeoJSON}
          className="flex items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-900 px-2 py-1 text-[11px] font-medium text-neutral-300 hover:border-neutral-700 hover:text-white transition"
          title="Descargar dataset armonizado GeoJSON"
        >
          <Download className="h-3 w-3 text-red-400" />
          <span className="hidden sm:inline">Exportar</span>
        </button>
      </div>

      {/* 2. Banner de Causalidad Física con la Isla de Calor */}
      <div className="rounded-xl border border-red-800/60 bg-gradient-to-r from-red-950/50 via-neutral-900/80 to-amber-950/40 p-3 text-xs space-y-1">
        <div className="flex items-center justify-between text-red-300 font-bold">
          <span className="flex items-center gap-1.5 text-[11px]">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            Nexo Físico: Fuego $\rightarrow$ Aerosoles $\rightarrow$ Calor
          </span>
          <span className="text-[10px] text-neutral-400 font-mono">Inversión Térmica</span>
        </div>
        <p className="text-[11px] text-neutral-300 leading-snug">
          Los incendios en la serranía del Tunari inyectan humo y partículas (<strong className="text-amber-300">AOD &gt; 0.6</strong>) que quedan atrapadas por la topografía del valle, multiplicando la retención térmica urbana.
        </p>
      </div>

      {/* 3. Selector de Modo Satelital */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-2 text-xs">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="font-bold text-[11px] text-neutral-300 flex items-center gap-1">
            <Satellite className="h-3.5 w-3.5 text-cyan-400" />
            Modo Satelital:
          </span>
          <span className="text-[10px] text-neutral-400 font-mono">
            {sensorMode === 'HARMONIZED' && 'Fusión MODIS + VIIRS'}
            {sensorMode === 'MODIS' && 'MODIS Terra/Aqua (1 km)'}
            {sensorMode === 'VIIRS' && 'VIIRS S-NPP (375 m)'}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1 text-[11px]">
          <button
            onClick={() => onSensorModeChange && onSensorModeChange('HARMONIZED')}
            className={`py-1.5 px-2 rounded-lg font-bold transition text-center ${
              sensorMode === 'HARMONIZED'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md'
                : 'bg-neutral-950/60 text-neutral-400 hover:text-white'
            }`}
          >
            Armonizado
          </button>
          <button
            onClick={() => onSensorModeChange && onSensorModeChange('MODIS')}
            className={`py-1.5 px-2 rounded-lg font-bold transition text-center ${
              sensorMode === 'MODIS'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-neutral-950/60 text-neutral-400 hover:text-white'
            }`}
          >
            MODIS (1km)
          </button>
          <button
            onClick={() => onSensorModeChange && onSensorModeChange('VIIRS')}
            className={`py-1.5 px-2 rounded-lg font-bold transition text-center ${
              sensorMode === 'VIIRS'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'bg-neutral-950/60 text-neutral-400 hover:text-white'
            }`}
          >
            VIIRS (375m)
          </button>
        </div>
      </div>

      {/* 4. Tarjetas Resumen de Métricas */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-2.5">
          <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Focos</span>
          <p className="text-xl font-black text-red-500">{filteredFeatures.length}</p>
          <span className="text-[9px] text-neutral-500">Detectados</span>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-2.5">
          <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">P.N. Tunari</span>
          <p className="text-xl font-black text-amber-400">{tunariCount}</p>
          <span className="text-[9px] text-amber-500/80">En cota protegida</span>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-2.5">
          <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">FRP Total</span>
          <p className="text-xl font-black text-orange-400">{Math.round(totalFRP)}</p>
          <span className="text-[9px] text-neutral-500">Megawatts (MW)</span>
        </div>
      </div>

      {/* 5. Sub-Navegación Limpia y Enfocada en Producto */}
      <div className="flex items-center gap-1 border-b border-neutral-800 pb-2 text-[11px]">
        <button
          onClick={() => setActiveSubTab('list')}
          className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-center transition ${
            activeSubTab === 'list'
              ? 'bg-neutral-800 text-white shadow'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Focos Activos
        </button>
        <button
          onClick={() => setActiveSubTab('simulation')}
          className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-center transition ${
            activeSubTab === 'simulation'
              ? 'bg-neutral-800 text-red-300 shadow'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Viento
        </button>
        <button
          onClick={() => setActiveSubTab('layers')}
          className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-center transition ${
            activeSubTab === 'layers'
              ? 'bg-neutral-800 text-emerald-300 shadow'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Capas Territoriales
        </button>
        <button
          onClick={() => setActiveSubTab('metrics')}
          className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-center transition ${
            activeSubTab === 'metrics'
              ? 'bg-neutral-800 text-amber-300 shadow'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Épocas Críticas
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
              const isSelected = selectedFocoId === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedFocoId(p.id);
                    if (onSelectFoco) {
                      onSelectFoco({
                        type: 'foco',
                        id: p.id,
                        lat: foco.geometry.coordinates[1],
                        lon: foco.geometry.coordinates[0],
                        ...p
                      });
                    }
                  }}
                  className={`cursor-pointer rounded-xl border p-3 transition ${
                    isSelected
                      ? 'border-red-500 bg-red-950/50 shadow-lg ring-1 ring-red-500/50'
                      : 'border-neutral-800 bg-neutral-950 hover:border-red-600/60 hover:bg-neutral-900'
                  }`}
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

                  <div className="mt-1 flex items-center justify-between text-[10px] text-purple-300 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-900/40">
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-2.5 w-2.5 text-purple-400" />
                      Score IA (Isolation Forest): <strong className="font-mono text-purple-200">{p.ia_anomaly_score || 0.88}</strong>
                    </span>
                    <span className="text-purple-400/90 text-[9px] font-semibold">{p.ia_clasificacion || 'Anomalía Térmica'}</span>
                  </div>

                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-neutral-500 pt-1.5 border-t border-neutral-900">
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
              Recomendación Operativa:
            </p>
            Viento canalizado por cañadones y torrenteras. Con ráfagas &gt; 25 km/h, priorizar líneas de defensa en la franja periurbana antes de las horas de máxima insolación.
          </div>
        </div>
      )}

      {/* 5C. SUB-TAB 3: CONTROL DE CAPAS TERRITORIALES & SATÉLITE */}
      {activeSubTab === 'layers' && (
        <div className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-950 p-3.5 text-xs">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <h3 className="font-bold text-emerald-400 flex items-center gap-1.5 text-xs">
              <Layers className="h-4 w-4" />
              Capas Territoriales & Satelitales
            </h3>
            <span className="rounded bg-emerald-950 px-1.5 py-0.5 text-[9px] font-mono text-emerald-400 border border-emerald-800">
              INTERACTIVO
            </span>
          </div>

          <div className="space-y-2">
            {/* Capa 1: Cota 2750 Tunari */}
            <label className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-800 bg-neutral-900 cursor-pointer hover:border-emerald-500/50 transition">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={wmsCota}
                  onChange={(e) => setWmsCota && setWmsCota(e.target.checked)}
                  className="rounded accent-emerald-500 h-4 w-4"
                />
                <div>
                  <span className="font-bold text-neutral-200 block text-xs">🌲 Cota 2750 Parque Tunari</span>
                  <span className="text-[10px] text-neutral-400">Límite biofísico de protección ambiental</span>
                </div>
              </div>
              <span className={`h-2.5 w-2.5 rounded-full ${wmsCota ? 'bg-emerald-400' : 'bg-neutral-600'}`}></span>
            </label>

            {/* Capa 2: Zonas Periurbanas */}
            <label className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-800 bg-neutral-900 cursor-pointer hover:border-purple-500/50 transition">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={wmsPeriurbanos}
                  onChange={(e) => setWmsPeriurbanos && setWmsPeriurbanos(e.target.checked)}
                  className="rounded accent-purple-500 h-4 w-4"
                />
                <div>
                  <span className="font-bold text-neutral-200 block text-xs">🏡 Zonas Periurbanas</span>
                  <span className="text-[10px] text-neutral-400">Áreas de interfaz habitada con alto riesgo de quemas</span>
                </div>
              </div>
              <span className={`h-2.5 w-2.5 rounded-full ${wmsPeriurbanos ? 'bg-purple-400' : 'bg-neutral-600'}`}></span>
            </label>

            {/* Capa 3: Límites Distritales */}
            <label className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-800 bg-neutral-900 cursor-pointer hover:border-blue-500/50 transition">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={wmsDistritos}
                  onChange={(e) => setWmsDistritos && setWmsDistritos(e.target.checked)}
                  className="rounded accent-blue-500 h-4 w-4"
                />
                <div>
                  <span className="font-bold text-neutral-200 block text-xs">🏛️ Límites Distritales</span>
                  <span className="text-[10px] text-neutral-400">14 polígonos distritales del municipio</span>
                </div>
              </div>
              <span className={`h-2.5 w-2.5 rounded-full ${wmsDistritos ? 'bg-blue-400' : 'bg-neutral-600'}`}></span>
            </label>

            {/* Capa 4: Capa Satelital de Humo NASA GIBS Worldview */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={nasaGibs}
                    onChange={(e) => setNasaGibs && setNasaGibs(e.target.checked)}
                    id="gibsToggleClean"
                    className="rounded accent-cyan-500 h-4 w-4 cursor-pointer"
                  />
                  <label htmlFor="gibsToggleClean" className="cursor-pointer">
                    <span className="text-xs font-bold text-neutral-200 block">
                      🛰️ Capa Satelital de Humo (NASA GIBS)
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      Reflectancia real y penachos de humo sobre el valle
                    </span>
                  </label>
                </div>
                <span className={`h-2.5 w-2.5 rounded-full ${nasaGibs ? 'bg-cyan-400 animate-pulse' : 'bg-neutral-600'}`}></span>
              </div>

              {nasaGibs && (
                <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs">
                  <span className="text-neutral-400 text-[11px] flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-cyan-400" />
                    Fecha de Observación:
                  </span>
                  <input
                    type="date"
                    value={gibsDate}
                    onChange={(e) => setGibsDate && setGibsDate(e.target.value)}
                    className="rounded bg-neutral-950 px-2 py-1 text-[11px] font-mono text-cyan-300 border border-neutral-800 outline-none"
                  />
                </div>
              )}
            </div>
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

          <div className="space-y-2.5 text-xs">
            {metricsData?.distribucion_mensual?.map((item) => {
              const maxFRP = 550;
              const percent = Math.min(100, Math.max(8, Math.round((item.frp_acumulado_mw / maxFRP) * 100)));
              return (
                <div key={item.mes} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className={item.es_periodo_critico ? 'font-bold text-red-400 flex items-center gap-1' : 'text-neutral-400'}>
                      {item.mes} {item.es_periodo_critico && <span className="text-[10px] text-red-400 font-bold bg-red-950 px-1 py-0.2 rounded border border-red-900">CRÍTICO</span>}
                    </span>
                    <span className="font-mono text-neutral-300">
                      {item.focos_registrados} focos • <strong className="text-amber-400">{item.frp_acumulado_mw} MW</strong>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.es_periodo_critico 
                          ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 shadow-sm' 
                          : 'bg-neutral-700'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-lg bg-neutral-900 border border-neutral-800 p-2.5 text-[11px] text-neutral-300">
            <strong>Patrón Térmico Anual:</strong> La concentración de incendios en el estiaje genera el salto térmico que activa la isla de calor urbana en los meses de transición primaveral.
          </div>
        </div>
      )}

      {/* 6. Nota Científica & Algoritmo de Armonización */}
      <div className="rounded-xl border border-neutral-800/80 bg-neutral-950/60 p-3 text-[11px] text-neutral-400 space-y-1">
        <div className="flex items-center gap-1.5 text-neutral-200 font-semibold">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Algoritmo de Armonización Espaciotemporal:</span>
        </div>
        <p className="leading-snug">
          Fusiona la resolución fina de VIIRS (375 m) con la serie histórica de MODIS (1 km) aplicando clustering a 1.2 km y normalización de potencia radiativa (FRP).
        </p>
      </div>
    </div>
  );
}
