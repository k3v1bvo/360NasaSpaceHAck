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
  const [offlineMode, setOfflineMode] = useState(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [sensorMode, setSensorMode] = useState('HARMONIZED'); // 'HARMONIZED' | 'MODIS' | 'VIIRS'

  const [reports, setReports] = useState([
    { tipo: 'humo', zona: 'Cota 2750 Tunari (Taquiña)', desc: 'Columna de humo divisada', fecha: '10:15 AM' }
  ]);

  const handleAddReport = (nuevoReporte) => {
    setReports((prev) => [nuevoReporte, ...prev]);
  };

  // Determinar qué conjunto de datos de fuego mostrar según la selección de Kevin
  const currentFocosData = sensorMode === 'HARMONIZED'
    ? focosHarmonized.features
    : sensorMode === 'MODIS'
    ? focosModisRaw.features
    : focosViirsRaw.features;

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-neutral-950 font-sans text-neutral-100">
      {/* 1. Barra Superior con navegación */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        offlineMode={offlineMode}
        setOfflineMode={setOfflineMode}
        onOpenReport={() => setIsReportModalOpen(true)}
      />

      {/* 2. Cuerpo Principal: Mapa + Panel Lateral de Kevin */}
      <div className="relative flex flex-1 overflow-hidden min-h-0">
        {/* Mapa Central Interactivo */}
        <main className="relative flex-1 h-full min-h-0">
          <MapViewer
            activeTab={activeTab}
            focosData={currentFocosData}
            sensorMode={sensorMode}
            reportsData={reports}
            selectedPoint={selectedPoint}
          />
        </main>

        {/* Panel Lateral: Módulo correspondiente */}
        <aside className="w-full max-w-sm md:max-w-md border-l border-neutral-800 bg-neutral-950/95 overflow-y-auto backdrop-blur-md shadow-2xl z-10">
          {activeTab === 'incendios' && (
            <FireMonitorTab
              onSelectFoco={(foco) => setSelectedPoint(foco)}
              onSensorModeChange={(mode) => setSensorMode(mode)}
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
