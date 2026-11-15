import React, { useState } from 'react';
import { Map, BarChart3 } from 'lucide-react';
import Navbar from './components/Navbar';
import MetricsStrip from './components/MetricsStrip';
import MapViewer from './components/MapViewer';

// Módulo 1: Explorador Planetario de la NASA (Reto Oficial: Be An Earth System Trend Detective!)
import GlobalNasaMode from './modules/GlobalNasaMode';

// Módulo 2: Caso Piloto Regional Cochabamba (14 Distritos, Red MÓNICA e IA Virtual)
import MicroclimateAITab from './modules/MicroclimateAITab';

// Módulo 3: Causa Física Térmica (Incendios Tunari, NASA FIRMS y Plumas AOD)
import FireMonitorTab from './modules/FireMonitorTab';

import SystemWorkflowTour from './components/SystemWorkflowTour';

// Datos satelitales armonizados y crudos
import focosHarmonized from '../../data/nasa/firms_tunari_harmonized.geojson';
import focosModisRaw from '../../data/nasa/firms_modis_raw.geojson';
import focosViirsRaw from '../../data/nasa/firms_viirs_raw.geojson';
import monicaData from './data/monica_virtual_sensors.json';

export default function App() {
  // Pestaña activa por defecto: Caso Piloto Regional Cochabamba (14 Distritos)
  const [activeTab, setActiveTab] = useState('microclimas');
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isTemporalModalOpen, setIsTemporalModalOpen] = useState(false);
  const [mobileView, setMobileView] = useState('map'); // 'map' | 'panel' para vista móvil responsive
  const [offlineMode, setOfflineMode] = useState(false); // Online por defecto para consumir NASA POWER & WMS
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [selectedGlobalSpot, setSelectedGlobalSpot] = useState(null);
  const [sensorMode, setSensorMode] = useState('HARMONIZED'); // 'HARMONIZED' | 'MODIS' | 'VIIRS'

  // Cambio de pestaña limpio: resetea selecciones para evitar colisión de coordenadas entre mapas
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSelectedPoint(null);
    setSelectedGlobalSpot(null);
  };

  // Estados de las Capas WMS Oficiales del GAMC
  const [wmsCota, setWmsCota] = useState(true);
  const [wmsPeriurbanos, setWmsPeriurbanos] = useState(true);
  const [wmsDistritos, setWmsDistritos] = useState(false);

  // Capa Satelital NASA GIBS Worldview (Reflectancia & Humo)
  const [nasaGibs, setNasaGibs] = useState(false);
  const [gibsDate, setGibsDate] = useState('2024-09-15');

  const currentFocosData = sensorMode === 'HARMONIZED'
    ? focosHarmonized.features
    : sensorMode === 'MODIS'
    ? focosModisRaw.features
    : focosViirsRaw.features;

  return (
    <div 
      className="flex h-screen w-screen flex-col overflow-hidden bg-[#090a0f] font-sans text-neutral-100"
      style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}
    >
      {/* 1. Barra Superior con Navegación Oficial NASA TREND DETECTIVE */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        offlineMode={offlineMode}
        setOfflineMode={setOfflineMode}
        isTourOpen={isTourOpen}
        setIsTourOpen={setIsTourOpen}
        onOpenTemporalAnalytics={() => setIsTemporalModalOpen(true)}
      />

      {/* 2. Barra Científica de Métricas IA Obligatorias (R²=0.9457, RMSE=0.55°C, p < 0.05) */}
      <MetricsStrip metrics={monicaData?.metricas_modelo_ia} />

      {/* 3. Cuerpo Principal: Mapa Planetario/Regional + Panel Lateral */}
      <div className={`relative flex flex-1 overflow-hidden min-h-0 w-full mobile-view-${mobileView}`}>
        {/* Mapa Central Interactivo con Controles Planetarios y Regionales */}
        <main className="desktop-layout-main relative h-full min-h-0">
          <MapViewer
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            focosData={currentFocosData}
            sensorMode={sensorMode}
            reportsData={reports}
            selectedPoint={selectedPoint}
            setSelectedPoint={(p) => setSelectedPoint(p)}
            onSelectGlobalLocation={(spot) => {
              setSelectedPoint({ lat: spot.lat, lon: spot.lon, ...spot });
              setSelectedGlobalSpot(spot);
            }}
            onMapClick={({ lat, lon }) => {
              setSelectedPoint({ lat, lon });
            }}
            offlineMode={offlineMode}
            wmsCota={wmsCota}
            wmsPeriurbanos={wmsPeriurbanos}
            wmsDistritos={wmsDistritos}
            nasaGibs={nasaGibs}
            gibsDate={gibsDate}
            isTemporalModalOpen={isTemporalModalOpen}
            setIsTemporalModalOpen={setIsTemporalModalOpen}
          />
        </main>

        {/* Panel Lateral: Módulo correspondiente */}
        <aside className="desktop-layout-aside border-l border-neutral-800/80 bg-[#0d1017]/95 overflow-y-auto backdrop-blur-xl shadow-2xl z-10">
          {activeTab === 'global_nasa' && (
            <GlobalNasaMode
              onFocusGlobalCoords={(coords) => {
                setSelectedPoint({ lat: coords[0], lon: coords[1] });
                setMobileView('map');
              }}
              onSwitchToPilot={() => {
                handleTabChange('microclimas');
                setMobileView('map');
              }}
              selectedLocation={selectedGlobalSpot}
              setSelectedLocation={setSelectedGlobalSpot}
            />
          )}

          {activeTab === 'microclimas' && (
            <MicroclimateAITab
              selectedPoint={selectedPoint}
              onSelectPoint={(point) => {
                setSelectedPoint(point);
                setMobileView('map');
              }}
              onNavigateToFires={() => handleTabChange('incendios')}
            />
          )}

          {activeTab === 'incendios' && (
            <FireMonitorTab
              selectedPoint={selectedPoint}
              onSelectFoco={(foco) => {
                setSelectedPoint(foco);
                setMobileView('map');
              }}
              sensorMode={sensorMode}
              onSensorModeChange={(mode) => setSensorMode(mode)}
              wmsCota={wmsCota}
              setWmsCota={setWmsCota}
              wmsPeriurbanos={wmsPeriurbanos}
              setWmsPeriurbanos={setWmsPeriurbanos}
              wmsDistritos={wmsDistritos}
              setWmsDistritos={setWmsDistritos}
              nasaGibs={nasaGibs}
              setNasaGibs={setNasaGibs}
              gibsDate={gibsDate}
              setGibsDate={setGibsDate}
              offlineMode={offlineMode}
            />
          )}
        </aside>
      </div>

      {/* 4. Selector Flotante Móvil: Mapa vs Panel de Datos */}
      <div className="desktop-hide-toggle fixed bottom-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center rounded-full border border-blue-500/40 bg-neutral-950/95 p-1 shadow-2xl backdrop-blur-xl">
        <button
          onClick={() => setMobileView('map')}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all ${
            mobileView === 'map'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Map className="h-4 w-4" />
          <span>Ver Mapa</span>
        </button>
        <button
          onClick={() => setMobileView('panel')}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all ${
            mobileView === 'panel'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Ver Panel</span>
        </button>
      </div>

      {/* Guía Interactiva del Sistema / Flujo de Demostración */}
      <SystemWorkflowTour
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
      />
    </div>
  );
}
