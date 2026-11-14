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

// Módulo 4: Riesgo Hidrológico & Torrenteras (NASA SAR / DEM + 60 Puntos GAMC)
import FloodRiskTab from './modules/FloodRiskTab';

// Módulo 5: Asistente Agro-Climático Resiliente (NASA SMAP + Evapotranspiración Valles)
import AgroAdvisorTab from './modules/AgroAdvisorTab';

import CitizenReportModal from './modules/CitizenReportModal';

// Datos satelitales armonizados y crudos
import focosHarmonized from '../../data/nasa/firms_tunari_harmonized.geojson';
import focosModisRaw from '../../data/nasa/firms_modis_raw.geojson';
import focosViirsRaw from '../../data/nasa/firms_viirs_raw.geojson';
import monicaData from './data/monica_virtual_sensors.json';

export default function App() {
  // Pestaña activa por defecto: Explorador Global Planetario de la NASA
  const [activeTab, setActiveTab] = useState('global_nasa');
  const [mobileView, setMobileView] = useState('map'); // 'map' | 'panel' para vista móvil responsive
  const [offlineMode, setOfflineMode] = useState(false); // Online por defecto para consumir NASA POWER & WMS
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
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

  const [reports, setReports] = useState([
    { tipo: 'humo', zona: 'Cota 2750 Tunari (Taquiña)', desc: 'Columna de humo divisada', fecha: '10:15 AM' }
  ]);

  const handleAddReport = (nuevoReporte) => {
    setReports((prev) => [nuevoReporte, ...prev]);
  };

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
        onOpenReport={() => setIsReportModalOpen(true)}
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
              onSelectPoint={(point) => {
                setSelectedPoint(point);
                setMobileView('map');
              }}
              onNavigateToFires={() => handleTabChange('incendios')}
            />
          )}

          {activeTab === 'incendios' && (
            <FireMonitorTab
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

          {activeTab === 'torrenteras' && (
            <FloodRiskTab
              selectedPoint={selectedPoint}
              onSelectPunto={(point) => {
                const [lng, lat] = point.geometry.coordinates;
                setSelectedPoint({ lat, lon: lng, ...point.properties });
                setMobileView('map');
              }}
              onOpenReportModal={() => setIsReportModalOpen(true)}
            />
          )}

          {activeTab === 'agrotech' && (
            <AgroAdvisorTab
              onOpenReportModal={() => setIsReportModalOpen(true)}
              onSelectParcela={(parcela) => {
                setSelectedPoint({ lat: parcela.lat, lon: parcela.lon, ...parcela });
                setMobileView('map');
              }}
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

      {/* Modal Flotante de Alerta Ciudadana */}
      <CitizenReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onAddReport={handleAddReport}
      />
    </div>
  );
}
