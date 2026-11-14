import React, { useState } from 'react';
import Navbar from './components/Navbar';
import MapViewer from './components/MapViewer';

// Módulos de los 4 integrantes
import FireMonitorTab from './modules/FireMonitorTab';
import MicroclimateTab from './modules/MicroclimateTab';
import FloodRiskTab from './modules/FloodRiskTab';
import AgroAdvisorTab from './modules/AgroAdvisorTab';
import CitizenReportModal from './modules/CitizenReportModal';

// Datos satelitales armonizados de Kevin
import focosHarmonized from '../../data/nasa/firms_tunari_harmonized.geojson';

export default function App() {
  const [activeTab, setActiveTab] = useState('incendios');
  const [offlineMode, setOfflineMode] = useState(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [reports, setReports] = useState([
    { tipo: 'humo', zona: 'Cota 2750 Tunari (Taquiña)', desc: 'Columna de humo divisada', fecha: '10:15 AM' }
  ]);

  const handleAddReport = (nuevoReporte) => {
    setReports((prev) => [nuevoReporte, ...prev]);
  };

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

      {/* 2. Cuerpo Principal: Mapa + Panel Lateral del Módulo Activo */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Mapa Central Interactivo */}
        <main className="relative flex-1">
          <MapViewer
            activeTab={activeTab}
            focosData={focosHarmonized.features}
            reportsData={reports}
            selectedPoint={selectedPoint}
          />
        </main>

        {/* Panel Lateral: Módulo correspondiente al Reto */}
        <aside className="w-full max-w-sm md:max-w-md border-l border-neutral-800 bg-neutral-950/95 overflow-y-auto backdrop-blur-md shadow-2xl z-10">
          {activeTab === 'incendios' && (
            <FireMonitorTab
              onSelectFoco={(foco) => setSelectedPoint(foco)}
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
