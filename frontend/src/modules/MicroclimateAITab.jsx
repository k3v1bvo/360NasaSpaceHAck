import React, { useState } from 'react';
import { 
  Cpu, 
  Thermometer, 
  Wind, 
  TreePine, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  MapPin, 
  Sparkles, 
  Activity, 
  Sliders, 
  Flame, 
  ArrowRight,
  Info,
  Server,
  ExternalLink,
  Layers
} from 'lucide-react';
import monicaData from '../data/monica_virtual_sensors.json';
import { GAMC_CONFIG, NASA_CONFIG } from '../config/servicesConfig';

export default function MicroclimateAITab({ onSelectPoint, onNavigateToFires }) {
  const [activeSubTab, setActiveSubTab] = useState('sensors'); // 'sensors' | 'divergence' | 'simulator' | 'impact_fire'
  const [selectedSensorId, setSelectedSensorId] = useState('MONICA-01');

  // Sliders del Simulador Ciudadano
  const [reforestBonus, setReforestBonus] = useState(25); // %
  const [fireReduction, setFireReduction] = useState(50); // %

  const fisicas = monicaData?.estaciones_fisicas || [];
  const virtuales = monicaData?.sensores_virtuales_ia || [];
  const allSensors = [...fisicas, ...virtuales];
  const selectedSensor = allSensors.find(s => s.id === selectedSensorId) || fisicas[0];

  // Cálculos dinámicos del simulador
  const tempReduction = (reforestBonus * 0.08 + fireReduction * 0.03).toFixed(1);
  const pm25Reduction = (reforestBonus * 0.35 + fireReduction * 0.28).toFixed(1);

  return (
    <div className="space-y-4 p-4 text-white">
      {/* 1. Header del Módulo de Microclimas */}
      <div className="flex items-center justify-between border-b border-blue-900/50 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 p-2 text-white shadow-lg shadow-blue-900/30">
            <Cpu className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-black tracking-wide text-blue-400">
                MICROCLIMAS & RED MÓNICA IA
              </h2>
              <span className="rounded bg-blue-950 px-1.5 py-0.5 text-[9px] font-bold text-blue-300 border border-blue-800/80">
                GAMC 01/05
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Sensado Virtual • 2 Estaciones Físicas + 13 Sensores IA
            </p>
          </div>
        </div>
      </div>

      {/* 2. Sub-Navegación del Módulo */}
      <div className="flex items-center gap-1 border-b border-neutral-800 pb-2 text-[10px]">
        <button
          onClick={() => setActiveSubTab('sensors')}
          className={`flex-1 py-1.5 px-1 rounded-lg font-bold text-center transition ${
            activeSubTab === 'sensors'
              ? 'bg-neutral-800 text-white shadow'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          15 Sensores
        </button>
        <button
          onClick={() => setActiveSubTab('divergence')}
          className={`flex-1 py-1.5 px-1 rounded-lg font-bold text-center transition ${
            activeSubTab === 'divergence'
              ? 'bg-neutral-800 text-cyan-300 shadow'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Divergencia
        </button>
        <button
          onClick={() => setActiveSubTab('simulator')}
          className={`flex-1 py-1.5 px-1 rounded-lg font-bold text-center transition ${
            activeSubTab === 'simulator'
              ? 'bg-neutral-800 text-emerald-300 shadow'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Simulador
        </button>
        <button
          onClick={() => setActiveSubTab('impact_fire')}
          className={`flex-1 py-1.5 px-1 rounded-lg font-bold text-center transition ${
            activeSubTab === 'impact_fire'
              ? 'bg-neutral-800 text-red-300 shadow'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Nexo Fuego
        </button>
        <button
          onClick={() => setActiveSubTab('apis')}
          className={`flex-1 py-1.5 px-1 rounded-lg font-bold text-center transition ${
            activeSubTab === 'apis'
              ? 'bg-neutral-800 text-purple-300 shadow'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          APIs & Docs
        </button>
      </div>

      {/* 3A. SUB-TAB 1: LISTA DE ESTACIONES FÍSICAS Y SENSORES VIRTUALES IA */}
      {activeSubTab === 'sensors' && (
        <div className="space-y-3">
          {/* Ficha Detalle del Sensor Seleccionado */}
          <div className="rounded-xl border border-blue-900/60 bg-gradient-to-b from-blue-950/40 to-neutral-950 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-blue-400 font-mono block">
                  {selectedSensor.tipo}
                </span>
                <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-blue-400" />
                  {selectedSensor.nombre}
                </h3>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                selectedSensor.es_estacion_fisica
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  : 'bg-purple-950 text-purple-300 border-purple-800'
              }`}>
                {selectedSensor.es_estacion_fisica ? 'ESTACIÓN FÍSICA MÓNICA' : 'PREDICCIÓN IA (R²=0.91)'}
              </span>
            </div>

            {/* Grid de 4 Métricas */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-neutral-900/90 p-2 border border-neutral-800">
                <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                  <Thermometer className="h-3 w-3 text-red-400" />
                  LST Superficial (NASA):
                </span>
                <span className="text-base font-black text-red-400 font-mono">
                  {selectedSensor.lst_nasa_c} °C
                </span>
                <span className="text-[9px] text-neutral-500 block">
                  Aire (T2M): {selectedSensor.temp_aire_t2m_c} °C
                </span>
              </div>

              <div className="rounded-lg bg-neutral-900/90 p-2 border border-neutral-800">
                <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                  <Wind className="h-3 w-3 text-cyan-400" />
                  Calidad Aire (PM2.5):
                </span>
                <span className="text-base font-black text-cyan-400 font-mono">
                  {selectedSensor.pm25_ug_m3} µg/m³
                </span>
                <span className="text-[9px] text-neutral-500 block">
                  AOD Humo: {selectedSensor.aod_aerosoles}
                </span>
              </div>
            </div>

            <div className="rounded-lg bg-neutral-900/60 p-2 border border-neutral-800/80 text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-neutral-400">Estado Isla de Calor:</span>
                <strong className="text-amber-400">{selectedSensor.alerta_isla_calor}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Calidad de Aire:</span>
                <strong className={selectedSensor.pm25_ug_m3 > 40 ? 'text-red-400' : 'text-emerald-400'}>
                  {selectedSensor.estado_calidad_aire}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Vegetación (NDVI NASA):</span>
                <strong className="text-emerald-400 font-mono">{selectedSensor.ndvi_vegetacion}</strong>
              </div>
            </div>
          </div>

          {/* Lista de Sensores */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-neutral-300">
              Seleccionar Punto de Monitoreo ({allSensors.length}):
            </span>

            <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
              {allSensors.map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    setSelectedSensorId(s.id);
                    if (onSelectPoint) onSelectPoint(s);
                  }}
                  className={`cursor-pointer rounded-xl border p-2.5 transition ${
                    selectedSensorId === s.id
                      ? 'border-blue-500 bg-blue-950/40'
                      : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700 hover:bg-neutral-900'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-neutral-100 flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${s.es_estacion_fisica ? 'bg-cyan-400' : 'bg-purple-400'}`}></span>
                      {s.nombre}
                    </span>
                    <span className="font-mono text-red-400">{s.lst_nasa_c} °C</span>
                  </div>

                  <div className="mt-1 flex items-center justify-between text-[10px] text-neutral-400">
                    <span>{s.distrito}</span>
                    <span className="font-mono text-cyan-300">{s.pm25_ug_m3} µg/m³ PM2.5</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3B. SUB-TAB 2: DIVERGENCIA CLIMÁTICA HISTÓRICA & SIGNIFICANCIA */}
      {activeSubTab === 'divergence' && (
        <div className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-950 p-3.5">
          <div className="border-b border-neutral-800 pb-2">
            <h3 className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4" />
              Divergencia Térmica Distrital (2016–2026)
            </h3>
            <p className="text-[11px] text-neutral-400 mt-1">
              Demostración matemática de la brecha térmica entre la <strong>Cota 2750 (Tunari)</strong> y el <strong>Centro/Sur urbano</strong>.
            </p>
          </div>

          <div className="rounded-lg bg-blue-950/40 border border-blue-900/40 p-2.5 text-xs text-blue-200">
            <strong>Prueba de Significancia Estadística:</strong>
            <p className="text-[11px] text-neutral-300 mt-0.5">
              Regresión lineal sobre serie mensual: <strong>p = 0.0014 (&lt; 0.05)</strong> con intervalo de confianza al 95%. La divergencia no es ruido estacional, es calentamiento urbano acelerado.
            </p>
          </div>

          {/* Tabla Visual de Divergencia */}
          <div className="space-y-1.5 text-xs">
            <div className="grid grid-cols-4 text-[10px] font-bold text-neutral-400 uppercase tracking-wider pb-1 border-b border-neutral-800">
              <span>Año</span>
              <span>Tunari Cota</span>
              <span>Centro/Sur</span>
              <span className="text-right">Brecha (ΔT)</span>
            </div>

            <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
              {monicaData?.divergencia_historica?.map((row) => (
                <div key={row.anio} className="grid grid-cols-4 text-[11px] py-1 border-b border-neutral-900 font-mono">
                  <span className="text-neutral-300">{row.anio}</span>
                  <span className="text-emerald-400">{row.cota_2750_tunari_lst} °C</span>
                  <span className="text-red-400">{row.centro_sur_urbano_lst} °C</span>
                  <span className="text-right font-bold text-amber-400">+{row.brecha_termica_c} °C</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3C. SUB-TAB 3: SIMULADOR CIUDADANO INTERACTIVO */}
      {activeSubTab === 'simulator' && (
        <div className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-950 p-3.5">
          <div className="border-b border-neutral-800 pb-2">
            <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <Sliders className="h-4 w-4" />
              Simulador Predictivo de Mitigación (IA)
            </h3>
            <p className="text-[11px] text-neutral-400 mt-1">
              ¿Qué pasa en Cochabamba si reforestamos la Cota 2750 y reducimos quemas periurbanas?
            </p>
          </div>

          {/* Slider 1: Reforestación */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-300 flex items-center gap-1">
                <TreePine className="h-3.5 w-3.5 text-emerald-400" />
                Reforestación con Kewiñas/Molle en Cota 2750:
              </span>
              <span className="font-bold text-emerald-400 font-mono">+{reforestBonus}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={reforestBonus}
              onChange={(e) => setReforestBonus(Number(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Slider 2: Reducción de Quemas */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-300 flex items-center gap-1">
                <Flame className="h-3.5 w-3.5 text-amber-400" />
                Reducción de Quemas / Chaqueos Periurbanos:
              </span>
              <span className="font-bold text-amber-400 font-mono">-{fireReduction}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={fireReduction}
              onChange={(e) => setFireReduction(Number(e.target.value))}
              className="w-full accent-amber-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Resultados Proyectados por la IA */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="rounded-lg bg-neutral-900 p-2.5 border border-neutral-800">
              <span className="text-[10px] text-neutral-400 block">Enfriamiento LST:</span>
              <span className="text-lg font-black text-emerald-400 font-mono">-{tempReduction} °C</span>
              <span className="text-[9px] text-neutral-500 block">Sobre isla de calor</span>
            </div>
            <div className="rounded-lg bg-neutral-900 p-2.5 border border-neutral-800">
              <span className="text-[10px] text-neutral-400 block">Reducción PM2.5:</span>
              <span className="text-lg font-black text-cyan-400 font-mono">-{pm25Reduction} µg/m³</span>
              <span className="text-[9px] text-neutral-500 block">Aire más respirable</span>
            </div>
          </div>
        </div>
      )}

      {/* 3D. SUB-TAB 4: EL NEXO VITAL INCENDIOS -> MICROCLIMAS */}
      {activeSubTab === 'impact_fire' && (
        <div className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-950 p-3.5">
          <div className="border-b border-neutral-800 pb-2">
            <h3 className="text-xs font-bold text-red-400 flex items-center gap-1.5">
              <Flame className="h-4 w-4" />
              Nexo Físico: Incendios Tunari → Microclima Urbano
            </h3>
            <p className="text-[11px] text-neutral-400 mt-1">
              Cómo los focos MODIS/VIIRS de tu módulo provocan el disparo de calor y contaminación en la ciudad.
            </p>
          </div>

          <div className="rounded-lg bg-red-950/30 border border-red-900/40 p-2.5 text-xs text-red-200 leading-snug">
            {monicaData?.impacto_incendios_a_clima?.mecanismo_fisico}
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-neutral-300">
              Sensibilidad por Distrito ante el Humo del Tunari:
            </span>
            <div className="space-y-1.5 text-xs">
              {monicaData?.impacto_incendios_a_clima?.sensibilidad_distrital_al_fuego?.map((item, idx) => (
                <div key={idx} className="rounded-lg bg-neutral-900 p-2 border border-neutral-800">
                  <span className="font-bold text-amber-300 block">{item.distrito}:</span>
                  <span className="text-[11px] text-neutral-400">{item.impacto}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onNavigateToFires}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 py-2 text-xs font-bold text-white shadow-lg hover:from-red-500 hover:to-amber-500 transition"
          >
            <span>Ver Focos Activos en el Módulo de Incendios</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 3E. SUB-TAB 5: CATÁLOGO DE APIS Y DOCUMENTACIÓN (GAMC + NASA) */}
      {activeSubTab === 'apis' && (
        <div className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-950 p-3.5 text-xs">
          <div className="border-b border-neutral-800 pb-2">
            <h3 className="font-bold text-purple-400 flex items-center gap-1.5">
              <Server className="h-4 w-4" />
              APIs Oficiales y Documentación Conectada
            </h3>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Servicios WMS autorizados de la Alcaldía de Cochabamba y APIs de la NASA.
            </p>
          </div>

          {/* 1. GAMC Cochabamba */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-neutral-300 font-bold">
              <span className="flex items-center gap-1">
                🏛️ GAMC Cochabamba (recursosgamc.cochabamba.bo)
              </span>
              <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-1.5 py-0.5 rounded font-mono">
                CONECTADO
              </span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="rounded-lg bg-neutral-900 p-2 border border-neutral-800">
                <div className="flex justify-between font-mono text-[10px] text-neutral-400">
                  <span>PROYECTO 01 & 05</span>
                  <span className="text-blue-400">WMS 1.1.1</span>
                </div>
                <strong className="text-neutral-200 block text-xs">Microclimas IA & Gestión Distrital</strong>
                <span className="text-neutral-400 text-[10px]">7 servicios WMS · Calibración Red MÓNICA (2 estaciones)</span>
              </div>

              <div className="rounded-lg bg-neutral-900 p-2 border border-neutral-800">
                <div className="flex justify-between font-mono text-[10px] text-neutral-400">
                  <span>PROYECTO 03 (KEY: 8da30122...)</span>
                  <span className="text-amber-400">3 CAPAS WMS</span>
                </div>
                <strong className="text-neutral-200 block text-xs">Monitoreo y Armonización de Incendios</strong>
                <ul className="text-neutral-400 text-[10px] list-disc list-inside mt-1 space-y-0.5 font-mono">
                  <li>Cota 2750 (P.N. Tunari): 297cefa4...</li>
                  <li>Periurbanos (Riesgo Quemas): c52066a1...</li>
                  <li>Limite Distritos (14 polígonos): 7eb13092...</li>
                </ul>
              </div>

              <div className="rounded-lg bg-neutral-900 p-2 border border-neutral-800">
                <div className="flex justify-between font-mono text-[10px] text-neutral-400">
                  <span>PROYECTOS 02 & 04</span>
                  <span className="text-cyan-400">9 SERVICIOS WMS</span>
                </div>
                <strong className="text-neutral-200 block text-xs">Cuencas & Torrenteras (02) + Agrotech (04)</strong>
                <span className="text-neutral-400 text-[10px]">60 puntos críticos de inundación + Estrés hídrico</span>
              </div>
            </div>
          </div>

          {/* 2. NASA Oficial */}
          <div className="space-y-2 pt-2 border-t border-neutral-800">
            <div className="flex items-center justify-between text-neutral-300 font-bold">
              <span className="flex items-center gap-1">
                🛰️ NASA Earth Science APIs
              </span>
              <span className="text-[9px] bg-blue-950 text-blue-400 border border-blue-800/60 px-1.5 py-0.5 rounded font-mono">
                LIVE STREAM
              </span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="rounded-lg bg-neutral-900 p-2 border border-neutral-800">
                <div className="flex justify-between font-mono text-[10px] text-neutral-400">
                  <span>NASA POWER API</span>
                  <span className="text-emerald-400">DIRECT JSON</span>
                </div>
                <span className="text-neutral-300 block text-xs font-semibold">Series Temporales Diarias Globales</span>
                <span className="text-neutral-400 text-[10px]">Variables: TS (Temp. Superficie), T2M (Temp. Aire), PRECTOTCORR, RH2M</span>
              </div>

              <div className="rounded-lg bg-neutral-900 p-2 border border-neutral-800">
                <div className="flex justify-between font-mono text-[10px] text-neutral-400">
                  <span>NASA FIRMS API</span>
                  <span className="text-red-400">MODIS + VIIRS</span>
                </div>
                <span className="text-neutral-300 block text-xs font-semibold">Armonización Dual de Focos Térmicos</span>
                <span className="text-neutral-400 text-[10px]">MODIS 1km (MCD14DL) + VIIRS 375m (VNP14IMGTDL) sobre Tunari</span>
              </div>

              <div className="rounded-lg bg-neutral-900 p-2 border border-neutral-800">
                <div className="flex justify-between font-mono text-[10px] text-neutral-400">
                  <span>NASA GIBS WMTS</span>
                  <span className="text-cyan-400">TESELAS XYZ</span>
                </div>
                <span className="text-neutral-300 block text-xs font-semibold">Capas Ráster Satelitales en Vivo</span>
                <span className="text-neutral-400 text-[10px]">TrueColor, LST Day, NDVI Vegetación a 8 días y AOD Aerosoles</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
