import React, { useState, useEffect } from 'react';
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
              <h2 className="text-base sm:text-lg font-black tracking-wide text-red-400">
                INCENDIOS TUNARI
              </h2>
              <span className="rounded bg-red-950 px-2 py-0.5 text-xs font-bold text-red-300 border border-red-800">
                CAUSA TÉRMICA
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              Monitoreo Satelital de Fuego & Plumas de Aerosoles AOD
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadGeoJSON}
          className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-200 hover:border-neutral-700 hover:text-white transition"
          title="Descargar dataset armonizado GeoJSON"
        >
          <Download className="h-3.5 w-3.5 text-red-400" />
          <span className="hidden sm:inline">Exportar</span>
        </button>
      </div>

      {/* 2. Banner de Causalidad Física con la Isla de Calor */}
      <div className="rounded-xl border border-red-800/60 bg-gradient-to-r from-red-950/50 via-neutral-900/80 to-amber-950/40 p-3.5 text-xs sm:text-[13px] space-y-1.5">
        <div className="flex items-center justify-between text-red-300 font-bold">
          <span className="flex items-center gap-1.5 text-xs sm:text-[13px]">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            Nexo Físico: Fuego $\rightarrow$ Aerosoles $\rightarrow$ Calor
          </span>
          <span className="text-xs text-slate-300 font-mono font-bold">Inversión Térmica</span>
        </div>
        <p className="text-xs sm:text-[13px] text-slate-200 leading-relaxed">
          Los incendios en la serranía del Tunari inyectan humo y partículas (<strong className="text-amber-300">AOD &gt; 0.6</strong>) que quedan atrapadas por la topografía del valle, multiplicando la retención térmica urbana.
        </p>
      </div>

      {/* 3. Selector de Modo Satelital */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-2.5 text-xs">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="font-bold text-xs sm:text-[13px] text-slate-200 flex items-center gap-1.5">
            <Satellite className="h-4 w-4 text-cyan-400" />
            Modo Satelital:
          </span>
          <span className="text-xs text-slate-300 font-mono font-semibold">
            {sensorMode === 'HARMONIZED' && 'Fusión MODIS + VIIRS'}
            {sensorMode === 'MODIS' && 'MODIS Terra/Aqua (1 km)'}
            {sensorMode === 'VIIRS' && 'VIIRS S-NPP (375 m)'}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 text-xs sm:text-[13px]">
          <button
            onClick={() => onSensorModeChange && onSensorModeChange('HARMONIZED')}
            className={`py-2 px-2 rounded-lg font-bold transition text-center ${
              sensorMode === 'HARMONIZED'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md'
                : 'bg-neutral-950/60 text-slate-400 hover:text-white'
            }`}
          >
            Armonizado
          </button>
          <button
            onClick={() => onSensorModeChange && onSensorModeChange('MODIS')}
            className={`py-2 px-2 rounded-lg font-bold transition text-center ${
              sensorMode === 'MODIS'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-neutral-950/60 text-slate-400 hover:text-white'
            }`}
          >
            MODIS (1km)
          </button>
          <button
            onClick={() => onSensorModeChange && onSensorModeChange('VIIRS')}
            className={`py-2 px-2 rounded-lg font-bold transition text-center ${
              sensorMode === 'VIIRS'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'bg-neutral-950/60 text-slate-400 hover:text-white'
            }`}
          >
            VIIRS (375m)
          </button>
        </div>
      </div>

      {/* 4. Tarjetas Resumen de Métricas */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Focos</span>
          <p className="text-2xl font-black text-red-500 my-0.5">{filteredFeatures.length}</p>
          <span className="text-xs text-slate-400 font-medium">Detectados</span>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">P.N. Tunari</span>
          <p className="text-2xl font-black text-amber-400 my-0.5">{tunariCount}</p>
          <span className="text-xs text-amber-400/90 font-medium">En cota protegida</span>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">FRP Total</span>
          <p className="text-2xl font-black text-orange-400 my-0.5">{Math.round(totalFRP)}</p>
          <span className="text-xs text-slate-400 font-medium">Megawatts (MW)</span>
        </div>
      </div>

      {/* 5. Sub-Navegación Limpia y Enfocada en Producto */}
      <div className="flex items-center gap-1 border-b border-neutral-800 pb-2 text-xs sm:text-[13px]">
        <button
          onClick={() => setActiveSubTab('list')}
          className={`flex-1 py-2 px-2 rounded-lg font-bold text-center transition ${
            activeSubTab === 'list'
              ? 'bg-neutral-800 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Focos Activos
        </button>
        <button
          onClick={() => setActiveSubTab('simulation')}
          className={`flex-1 py-2 px-2 rounded-lg font-bold text-center transition ${
            activeSubTab === 'simulation'
              ? 'bg-neutral-800 text-red-300 shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Viento
        </button>
        <button
          onClick={() => setActiveSubTab('layers')}
          className={`flex-1 py-2 px-2 rounded-lg font-bold text-center transition ${
            activeSubTab === 'layers'
              ? 'bg-neutral-800 text-emerald-300 shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Capas Territoriales
        </button>
        <button
          onClick={() => setActiveSubTab('metrics')}
          className={`flex-1 py-2 px-2 rounded-lg font-bold text-center transition ${
            activeSubTab === 'metrics'
              ? 'bg-neutral-800 text-amber-300 shadow'
              : 'text-slate-400 hover:text-white'
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
                className="w-full rounded-lg border border-neutral-800 bg-neutral-900 p-2 text-xs sm:text-sm text-neutral-200 outline-none focus:border-red-500 font-medium"
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
                className="w-full rounded-lg border border-neutral-800 bg-neutral-900 p-2 text-xs sm:text-sm text-neutral-200 outline-none focus:border-red-500 font-medium"
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
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span className="text-white flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-red-500" />
                      {p.zona}
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      p.nivel_alerta === 'Critico' 
                        ? 'bg-red-950 text-red-400 border border-red-800/80 animate-pulse' 
                        : p.nivel_alerta === 'Alto' 
                        ? 'bg-amber-950 text-amber-400 border border-amber-800/60' 
                        : 'bg-neutral-800 text-slate-200'
                    }`}>
                      {p.nivel_alerta} • {p.frp_total_mw} MW
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs sm:text-[13px] text-slate-300">
                    <span>Fecha: <strong className="text-white">{p.fecha}</strong></span>
                    <span className="rounded bg-neutral-900 px-2 py-0.5 text-xs font-mono font-bold text-cyan-300 border border-neutral-800">
                      {p.sensor_armonizado}
                    </span>
                  </div>

                  <div className="mt-1.5 flex items-center justify-between text-xs text-purple-300 bg-purple-950/40 px-2.5 py-1 rounded-lg border border-purple-900/40">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                      Score IA (Isolation Forest): <strong className="font-mono text-purple-100">{p.ia_anomaly_score || 0.88}</strong>
                    </span>
                    <span className="text-purple-300 text-xs font-semibold">{p.ia_clasificacion || 'Anomalía Térmica'}</span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs text-slate-400 pt-1.5 border-t border-neutral-900">
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
        <div className="space-y-3.5 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
            <h3 className="text-sm font-bold text-red-400 flex items-center gap-2">
              <Wind className="h-4 w-4" />
              Simulador de Avance hacia Cota 2750
            </h3>
            <span className="text-xs text-amber-400 font-mono font-bold">Modelo Tunari</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-[13px]">
              <span className="text-slate-300">Velocidad del Viento:</span>
              <span className="font-bold text-red-400 font-mono text-sm">{windSpeed} km/h</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              value={windSpeed}
              onChange={(e) => setWindSpeed(Number(e.target.value))}
              className="w-full accent-red-500 h-2 bg-neutral-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>Brisa (5 km/h)</span>
              <span>Moderado (25 km/h)</span>
              <span>Ráfaga Fuerte (60 km/h)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1.5">
            <div className="rounded-lg bg-neutral-900 p-2.5 border border-neutral-800">
              <span className="text-xs text-slate-300 font-semibold block">Velocidad de Frente:</span>
              <span className="text-base font-black text-amber-300 font-mono block mt-0.5">{spreadRate} km/h</span>
            </div>
            <div className="rounded-lg bg-neutral-900 p-2.5 border border-neutral-800">
              <span className="text-xs text-slate-300 font-semibold block">Tiempo a Interfaz:</span>
              <span className="text-base font-black text-red-400 font-mono block mt-0.5">~{timeToCota} min</span>
            </div>
          </div>

          <div className="rounded-lg bg-red-950/40 border border-red-900/50 p-3 text-xs sm:text-[13px] text-red-100 leading-relaxed">
            <p className="font-bold flex items-center gap-1.5 text-red-300 mb-1">
              <AlertTriangle className="h-4 w-4" />
              Recomendación Operativa:
            </p>
            Viento canalizado por cañadones y torrenteras. Con ráfagas &gt; 25 km/h, priorizar líneas de defensa en la franja periurbana antes de las horas de máxima insolación.
          </div>
        </div>
      )}

      {/* 5C. SUB-TAB 3: CONTROL DE CAPAS TERRITORIALES & SATÉLITE */}
      {activeSubTab === 'layers' && (
        <div className="space-y-3.5 rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-xs sm:text-[13px]">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
            <h3 className="font-bold text-emerald-400 flex items-center gap-2 text-sm">
              <Layers className="h-4 w-4" />
              Capas Territoriales & Satelitales
            </h3>
            <span className="rounded bg-emerald-950 px-2 py-0.5 text-xs font-mono font-bold text-emerald-400 border border-emerald-800">
              INTERACTIVO
            </span>
          </div>

          <div className="space-y-2.5">
            {/* Capa 1: Cota 2750 Tunari */}
            <label className="flex items-center justify-between p-3 rounded-xl border border-neutral-800 bg-neutral-900 cursor-pointer hover:border-emerald-500/50 transition">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={wmsCota}
                  onChange={(e) => setWmsCota && setWmsCota(e.target.checked)}
                  className="rounded accent-emerald-500 h-4 w-4"
                />
                <div>
                  <span className="font-bold text-white block text-xs sm:text-sm">🌲 Cota 2750 Parque Tunari</span>
                  <span className="text-xs text-slate-300">Límite biofísico de protección ambiental</span>
                </div>
              </div>
              <span className={`h-2.5 w-2.5 rounded-full ${wmsCota ? 'bg-emerald-400' : 'bg-neutral-600'}`}></span>
            </label>

            {/* Capa 2: Zonas Periurbanas */}
            <label className="flex items-center justify-between p-3 rounded-xl border border-neutral-800 bg-neutral-900 cursor-pointer hover:border-purple-500/50 transition">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={wmsPeriurbanos}
                  onChange={(e) => setWmsPeriurbanos && setWmsPeriurbanos(e.target.checked)}
                  className="rounded accent-purple-500 h-4 w-4"
                />
                <div>
                  <span className="font-bold text-white block text-xs sm:text-sm">🏡 Zonas Periurbanas</span>
                  <span className="text-xs text-slate-300">Áreas de interfaz habitada con alto riesgo de quemas</span>
                </div>
              </div>
              <span className={`h-2.5 w-2.5 rounded-full ${wmsPeriurbanos ? 'bg-purple-400' : 'bg-neutral-600'}`}></span>
            </label>

            {/* Capa 3: Límites Distritales */}
            <label className="flex items-center justify-between p-3 rounded-xl border border-neutral-800 bg-neutral-900 cursor-pointer hover:border-blue-500/50 transition">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={wmsDistritos}
                  onChange={(e) => setWmsDistritos && setWmsDistritos(e.target.checked)}
                  className="rounded accent-blue-500 h-4 w-4"
                />
                <div>
                  <span className="font-bold text-white block text-xs sm:text-sm">🏛️ Límites Distritales</span>
                  <span className="text-xs text-slate-300">15 distritos municipales oficiales de Cochabamba</span>
                </div>
              </div>
              <span className={`h-2.5 w-2.5 rounded-full ${wmsDistritos ? 'bg-blue-400' : 'bg-neutral-600'}`}></span>
            </label>

            {/* Capa 4: Capa Satelital de Humo NASA GIBS Worldview */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={nasaGibs}
                    onChange={(e) => setNasaGibs && setNasaGibs(e.target.checked)}
                    id="gibsToggleClean"
                    className="rounded accent-cyan-500 h-4 w-4 cursor-pointer"
                  />
                  <label htmlFor="gibsToggleClean" className="cursor-pointer">
                    <span className="text-xs sm:text-sm font-bold text-white block">
                      🛰️ Capa Satelital de Humo (NASA GIBS)
                    </span>
                    <span className="text-xs text-slate-300">
                      Reflectancia real y penachos de humo sobre el valle
                    </span>
                  </label>
                </div>
                <span className={`h-2.5 w-2.5 rounded-full ${nasaGibs ? 'bg-cyan-400 animate-pulse' : 'bg-neutral-600'}`}></span>
              </div>

              {nasaGibs && (
                <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-slate-300 text-xs sm:text-[13px] flex items-center gap-1.5 font-medium">
                    <Calendar className="h-4 w-4 text-cyan-400" />
                    Fecha de Observación:
                  </span>
                  <input
                    type="date"
                    value={gibsDate}
                    onChange={(e) => setGibsDate && setGibsDate(e.target.value)}
                    className="rounded bg-neutral-950 px-2.5 py-1 text-xs sm:text-sm font-mono text-cyan-300 border border-neutral-800 outline-none"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5D. SUB-TAB 4: ANÁLISIS DE ÉPOCAS CRÍTICAS */}
      {activeSubTab === 'metrics' && (
        <div className="space-y-3.5 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
          <div className="border-b border-neutral-800 pb-2.5">
            <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              Patrones Históricos & Épocas Críticas
            </h3>
            <p className="text-xs sm:text-[13px] text-slate-300 mt-1 leading-relaxed">
              Periodo de Máximo Riesgo: <strong>Julio a Noviembre</strong> (Picos en Agosto y Septiembre).
            </p>
          </div>

          <div className="space-y-3 text-xs sm:text-[13px]">
            {metricsData?.distribucion_mensual?.map((item) => {
              const maxFRP = 550;
              const percent = Math.min(100, Math.max(8, Math.round((item.frp_acumulado_mw / maxFRP) * 100)));
              return (
                <div key={item.mes} className="space-y-1">
                  <div className="flex items-center justify-between text-xs sm:text-[13px]">
                    <span className={item.es_periodo_critico ? 'font-bold text-red-400 flex items-center gap-1.5' : 'text-slate-300'}>
                      {item.mes} {item.es_periodo_critico && <span className="text-xs text-red-400 font-bold bg-red-950 px-1.5 py-0.5 rounded border border-red-900">CRÍTICO</span>}
                    </span>
                    <span className="font-mono text-slate-200">
                      {item.focos_registrados} focos • <strong className="text-amber-400 font-bold">{item.frp_acumulado_mw} MW</strong>
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
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

          <div className="rounded-lg bg-neutral-900 border border-neutral-800 p-3 text-xs sm:text-[13px] text-slate-200 leading-relaxed">
            <strong className="text-amber-300">Patrón Térmico Anual:</strong> La concentración de incendios en el estiaje genera el salto térmico que activa la isla de calor urbana en los meses de transición primaveral.
          </div>
        </div>
      )}

      {/* 6. Nota Científica & Algoritmo de Armonización */}
      <div className="rounded-xl border border-neutral-800/80 bg-neutral-950/60 p-3.5 text-xs sm:text-[13px] text-slate-300 space-y-1.5 leading-relaxed">
        <div className="flex items-center gap-2 text-white font-bold text-xs sm:text-sm">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Algoritmo de Armonización Espaciotemporal:</span>
        </div>
        <p>
          Fusiona la resolución fina de VIIRS (375 m) con la serie histórica de MODIS (1 km) aplicando clustering a 1.2 km y normalización de potencia radiativa (FRP).
        </p>
      </div>
    </div>
  );
}
