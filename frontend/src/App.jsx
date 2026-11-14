import React, { useState } from 'react';
import Navbar from './components/Navbar';
import MetricsStrip from './components/MetricsStrip';
import MapViewer from './components/MapViewer';

// Módulo 1: Explorador Planetario de la NASA (Reto Oficial: Be An Earth System Trend Detective!)
import GlobalNasaMode from './modules/GlobalNasaMode';

// Módulo 2: Caso Piloto Regional Cochabamba (14 Distritos, Red MÓNICA e IA Virtual)
import MicroclimateAITab from './modules/MicroclimateAITab';

// Módulo 3: Causa Física Térmica (Incendios Tunari, NASA FIRMS y Plumas AOD)
import FireMonitorTab from './modules/FireMonitorTab';

import CitizenReportModal from './modules/CitizenReportModal';

// Datos satelitales armonizados y crudos
import focosHarmonized from '../../data/nasa/firms_tunari_harmonized.geojson';
import focosModisRaw from '../../data/nasa/firms_modis_raw.geojson';
import focosViirsRaw from '../../data/nasa/firms_viirs_raw.geojson';
import monicaData from './data/monica_virtual_sensors.json';

export default function App() {
  // Pestaña activa por defecto: Explorador Global Planetario de la NASA
  const [activeTab, setActiveTab] = useState('global_nasa');
  const [offlineMode, setOfflineMode] = useState(false); // Online por defecto para consumir NASA POWER & WMS
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [selectedGlobalSpot, setSelectedGlobalSpot] = useState(null);
  const [sensorMode, setSensorMode] = useState('HARMONIZED'); // 'HARMONIZED' | 'MODIS' | 'VIIRS'

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
        setActiveTab={setActiveTab}
        offlineMode={offlineMode}
        setOfflineMode={setOfflineMode}
        onOpenReport={() => setIsReportModalOpen(true)}
      />

      {/* 2. Barra Científica de Métricas IA Obligatorias (R²=0.9457, RMSE=0.55°C, p < 0.05) */}
      <MetricsStrip metrics={monicaData?.metricas_modelo_ia} />

      {/* 3. Cuerpo Principal: Mapa Planetario/Regional + Panel Lateral */}
      <div 
        className="relative flex flex-1 overflow-hidden min-h-0"
        style={{ flex: 1, display: 'flex', minHeight: 0, position: 'relative' }}
      >
        {/* Mapa Central Interactivo con Controles Planetarios y Regionales */}
        <main 
          className="relative flex-1 h-full min-h-0"
          style={{ flex: 1, height: '100%', minHeight: 0, position: 'relative' }}
        >
          <MapViewer
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            focosData={currentFocosData}
            sensorMode={sensorMode}
            reportsData={reports}
            selectedPoint={selectedPoint}
            setSelectedPoint={setSelectedPoint}
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
        <aside 
          className="w-full max-w-sm md:max-w-md border-l border-neutral-800/80 bg-[#0d1017]/95 overflow-y-auto backdrop-blur-xl shadow-2xl z-10"
          style={{ width: '420px', minWidth: '360px', height: '100%', overflowY: 'auto' }}
        >
          {activeTab === 'global_nasa' && (
            <GlobalNasaMode
              onFocusGlobalCoords={(coords) => setSelectedPoint({ lat: coords[0], lon: coords[1] })}
              onSwitchToPilot={() => setActiveTab('microclimas')}
              selectedLocation={selectedGlobalSpot}
              setSelectedLocation={setSelectedGlobalSpot}
            />
          )}

          {activeTab === 'microclimas' && (
            <MicroclimateAITab
              onSelectPoint={(point) => setSelectedPoint(point)}
              onNavigateToFires={() => setActiveTab('incendios')}
            />
          )}

          {activeTab === 'incendios' && (
            <FireMonitorTab
              onSelectFoco={(foco) => setSelectedPoint(foco)}
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

      {/* Modal Flotante de Alerta Ciudadana */}
      <CitizenReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onAddReport={handleAddReport}
      />
    </div>
  );
}
