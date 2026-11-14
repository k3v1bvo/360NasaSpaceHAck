import React, { useState } from 'react';
import Navbar from './components/Navbar';
import MapViewer from './components/MapViewer';

// Módulo Principal de Kevin
import FireMonitorTab from './modules/FireMonitorTab';

// Módulos de apoyo de los compañeros
import MicroclimateTab from './modules/MicroclimateTab';
import FloodRiskTab from './modules/FloodRiskTab';
import AgroAdvisorTab from './modules/AgroAdvisorTab';
import CitizenReportModal from './modules/CitizenReportModal';

// Datos satelitales armonizados y crudos de Kevin
import focosHarmonized from '../../data/nasa/firms_tunari_harmonized.geojson';
import focosModisRaw from '../../data/nasa/firms_modis_raw.geojson';
import focosViirsRaw from '../../data/nasa/firms_viirs_raw.geojson';

export default function App() {
  const [activeTab, setActiveTab] = useState('incendios');
  const [offlineMode, setOfflineMode] = useState(false); // Online por defecto para consumir WMS GAMC
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [sensorMode, setSensorMode] = useState('HARMONIZED'); // 'HARMONIZED' | 'MODIS' | 'VIIRS'

  // Estados de las Capas WMS Oficiales del GAMC
  const [wmsCota, setWmsCota] = useState(true);
  const [wmsPeriurbanos, setWmsPeriurbanos] = useState(true);
  const [wmsDistritos, setWmsDistritos] = useState(false);

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
      {/* 1. Barra Superior con navegación */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        offlineMode={offlineMode}
        setOfflineMode={setOfflineMode}
        onOpenReport={() => setIsReportModalOpen(true)}
      />

      {/* 2. Cuerpo Principal: Mapa + Panel Lateral de Kevin */}
      <div 
        className="relative flex flex-1 overflow-hidden min-h-0"
        style={{ flex: 1, display: 'flex', minHeight: 0, position: 'relative' }}
      >
        {/* Mapa Central Interactivo */}
        <main 
          className="relative flex-1 h-full min-h-0"
          style={{ flex: 1, height: '100%', minHeight: 0, position: 'relative' }}
        >
          <MapViewer
            activeTab={activeTab}
            focosData={currentFocosData}
            sensorMode={sensorMode}
            reportsData={reports}
            selectedPoint={selectedPoint}
            offlineMode={offlineMode}
            wmsCota={wmsCota}
            wmsPeriurbanos={wmsPeriurbanos}
            wmsDistritos={wmsDistritos}
          />
        </main>

        {/* Panel Lateral: Módulo correspondiente */}
        <aside 
          className="w-full max-w-sm md:max-w-md border-l border-neutral-800/80 bg-[#0d1017]/95 overflow-y-auto backdrop-blur-xl shadow-2xl z-10"
          style={{ width: '420px', minWidth: '360px', height: '100%', overflowY: 'auto' }}
        >
          {activeTab === 'incendios' && (
            <FireMonitorTab
              onSelectFoco={(foco) => setSelectedPoint(foco)}
              onSensorModeChange={(mode) => setSensorMode(mode)}
              wmsCota={wmsCota}
              setWmsCota={setWmsCota}
              wmsPeriurbanos={wmsPeriurbanos}
              setWmsPeriurbanos={setWmsPeriurbanos}
              wmsDistritos={wmsDistritos}
              setWmsDistritos={setWmsDistritos}
              offlineMode={offlineMode}
            />
          )}

          {activeTab === 'microclimas' && (
            <MicroclimateTab
              onSelectDistrito={(dist) => setSelectedPoint(dist)}
            />
          )}

          {activeTab === 'torrenteras' && (
            <FloodRiskTab
              onSelectPunto={(pt) => setSelectedPoint(pt)}
            />
          )}

          {activeTab === 'agrotech' && (
            <AgroAdvisorTab
              onOpenReportModal={() => setIsReportModalOpen(true)}
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
