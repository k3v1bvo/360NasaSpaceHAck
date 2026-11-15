import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Compass, 
  X, 
  MapPin, 
  Flame, 
  Globe2,
  Database
} from 'lucide-react';

const STAGES = [
  {
    id: 'microclimas',
    tab: 'microclimas',
    stepNumber: 1,
    icon: MapPin,
    badgeColor: 'from-blue-600 to-indigo-600',
    title: '1. Diagnóstico Urbano: Red de 20 Nodos (Cochabamba)',
    sub: '15 Distritos • 2 Estaciones Físicas Red MÓNICA + 13 Nodos IA + 5 Hotspots OTB',
    whatIsIt: 'El reto central del GAMC: la Alcaldía cuenta con 15 distritos pero solo tiene 2 estaciones físicas continuas (Av. 6 de Agosto y SEMAPA). Mediante Machine Learning (XGBoost Regressor), calibramos datos satelitales NASA (MODIS LST, NDVI, AOD, SRTM) para crear 13 estaciones virtuales en los distritos sin sensor físico + 5 hotspots críticos a costo cero de hardware.',
    keyEvidence: 'Brecha térmica comprobada de +5.8 °C en temperatura superficial entre el Norte boscoso (Tunari: 20.4 °C) y la Zona Sur asfaltada (K\'ara K\'ara / Distrito 15: 37.8 °C). Precisión del modelo: R² = 0.9457, RMSE = 0.55 °C.',
    actionableDecision: 'Plan Maestro de Reforestación Urbana Municipal: la Alcaldía sabe la coordenada exacta de los Distritos 8, 9 y 15 donde plantar árboles nativos para mitigar la isla de calor extrema.',
  },
  {
    id: 'incendios',
    tab: 'incendios',
    stepNumber: 2,
    icon: Flame,
    badgeColor: 'from-red-600 to-amber-600',
    title: '2. Causa Física: Incendios en el Tunari y Humo AOD',
    sub: 'Línea Cota 2750 • Sensores Infrarrojos NASA FIRMS (VIIRS + MODIS)',
    whatIsIt: 'El motor desencadenante del calor y la contaminación: monitoreo en tiempo casi real de quemas e incendios forestales en la cordillera del Tunari sobre la Cota 2750 (frontera con la mancha urbana).',
    keyEvidence: 'El humo y los aerosoles (variable AOD de la NASA) descienden hacia la cuenca del valle empujados por el viento nocturno y quedan atrapados bajo inversión térmica, disparando el efecto invernadero local.',
    actionableDecision: 'Despacho preventivo para Bomberos, UGR y SAR-Bolivia antes de que el fuego salte la cota urbanizada, y alerta de salud pública para colegios del valle por material particulado.',
  },
  {
    id: 'global_nasa',
    tab: 'global_nasa',
    stepNumber: 3,
    icon: Globe2,
    badgeColor: 'from-purple-600 to-indigo-600',
    title: '3. Reto Oficial NASA: Be An Earth System Trend Detective!',
    sub: 'Tendencias Globales vs Dinámicas Locales Multi-Decadales (2016-2026)',
    whatIsIt: 'Respuesta rigurosa a las 4 preguntas de la NASA: qué cambia, dónde cambia, cuánto cambia y si es estadísticamente significativo (p < 0.05 con regresión OLS y Mann-Kendall).',
    keyEvidence: 'Conexión multiescalar: centinelas planetarios globales (Amazonía, Chacaltaya, California) que al hacer zoom transicionan automáticamente a la resolución distrital de Cochabamba.',
    actionableDecision: 'Demostración de impacto: valida cómo los satélites de libre acceso de la NASA resuelven problemas municipales reales ahorrando más de 1.5 millones de dólares en sensores.',
  },
  {
    id: 'recursos_nasa',
    tab: 'global_nasa',
    stepNumber: 4,
    icon: Database,
    badgeColor: 'from-emerald-600 to-teal-600',
    title: '4. Recursos Oficiales NASA & Agencias Socias (CSA, KNMI, NOAA)',
    sub: '13 Herramientas Satelitales, Radares SAR (CSA) y Papers Científicos del Reto',
    whatIsIt: 'Integración y validación cruzada con las 13 plataformas y misiones oficiales indicadas por el reto: telemetría atmosférica de NASA Giovanni y AppEEARS, radar SAR y altimetría hídrica de la Agencia Espacial Canadiense (CSA Radarsat RCM y SWOT), series climáticas de NOAA CDO y KNMI Climate Explorer, y la metodología de significancia del paper SeaWiFS (NTRS 20090042747).',
    keyEvidence: 'Cruce multiescalar: desde la interferometría radar de la misión SWOT (NASA/CSA) sobre la Laguna Alalay hasta la telemetría diaria de NASA POWER API en los 15 distritos de Cochabamba.',
    actionableDecision: 'Respaldo institucional de grado espacial: el GAMC y la comunidad acceden a datos satelitales certificados y reproducibles internacionalmente.',
  }
];

export default function SystemWorkflowTour({ 
  activeTab, 
  onSelectTab, 
  isOpen, 
  onClose 
}) {
  const [currentStageIdx, setCurrentStageIdx] = React.useState(0);

  // Cuando cambia activeTab externamente, alinear el tour
  React.useEffect(() => {
    const idx = STAGES.findIndex(s => s.tab === activeTab);
    if (idx >= 0 && currentStageIdx !== idx && currentStageIdx !== 3) {
      setCurrentStageIdx(idx);
    }
  }, [activeTab]);

  if (!isOpen) return null;

  const current = STAGES[currentStageIdx] || STAGES[0];

  const handlePrev = () => {
    const prevIndex = currentStageIdx > 0 ? currentStageIdx - 1 : STAGES.length - 1;
    setCurrentStageIdx(prevIndex);
    if (onSelectTab && STAGES[prevIndex].tab !== activeTab) {
      onSelectTab(STAGES[prevIndex].tab);
    }
  };

  const handleNext = () => {
    const nextIndex = currentStageIdx < STAGES.length - 1 ? currentStageIdx + 1 : 0;
    setCurrentStageIdx(nextIndex);
    if (onSelectTab && STAGES[nextIndex].tab !== activeTab) {
      onSelectTab(STAGES[nextIndex].tab);
    }
  };

  const IconComponent = current.icon;

  return (
    <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-xl z-[1500] animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="rounded-2xl border border-cyan-500/40 bg-[#0a0d16]/98 p-4 sm:p-5 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10 text-white">
        
        {/* Barra superior de la tarjeta */}
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <div className="flex items-center gap-1.5 text-xs font-black tracking-wider uppercase text-cyan-300">
              <Compass className="h-4 w-4 text-cyan-400" />
              <span>Flujo del Reto • Etapa {current.stepNumber} de {STAGES.length}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white transition"
              title="Ocultar guía"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Contenido principal de la etapa actual */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className={`rounded-xl bg-gradient-to-tr ${current.badgeColor} p-2.5 text-white shadow-lg shrink-0 mt-0.5`}>
              <IconComponent className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold text-white leading-tight">
                {current.title}
              </h3>
              <p className="text-[11px] text-neutral-400 font-medium mt-0.5">
                {current.sub}
              </p>
            </div>
          </div>

          {/* Bloque descriptivo estructurado */}
          <div className="rounded-xl border border-neutral-800/90 bg-[#101420]/80 p-3 space-y-2 text-xs">
            <div>
              <span className="font-bold text-cyan-400 text-[11px] block uppercase tracking-wider mb-0.5">
                ¿Qué resuelve esta etapa?
              </span>
              <p className="text-neutral-300 leading-relaxed">
                {current.whatIsIt}
              </p>
            </div>

            <div className="border-t border-neutral-800/60 pt-2">
              <span className="font-bold text-amber-400 text-[11px] block uppercase tracking-wider mb-0.5">
                Dato científico clave:
              </span>
              <p className="text-neutral-300 leading-relaxed font-mono text-[11px]">
                {current.keyEvidence}
              </p>
            </div>

            <div className="border-t border-neutral-800/60 pt-2">
              <span className="font-bold text-emerald-400 text-[11px] block uppercase tracking-wider mb-0.5">
                Impacto / Decisión territorial:
              </span>
              <p className="text-neutral-200 leading-relaxed font-semibold">
                {current.actionableDecision}
              </p>
            </div>
          </div>
        </div>

        {/* Barra de navegación inferior entre etapas */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-800/80">
          <div className="flex items-center gap-1.5">
            {STAGES.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => {
                  setCurrentStageIdx(idx);
                  if (onSelectTab && s.tab !== activeTab) {
                    onSelectTab(s.tab);
                  }
                }}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStageIdx 
                    ? 'w-7 bg-cyan-400' 
                    : 'w-2 bg-neutral-700 hover:bg-neutral-500'
                }`}
                title={`Ir a ${s.title}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="flex items-center gap-1 rounded-lg border border-neutral-700 bg-neutral-900/90 px-2.5 py-1.5 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white transition"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Anterior</span>
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-cyan-900/30 hover:from-cyan-500 hover:to-blue-500 transition"
            >
              <span>{currentStageIdx === STAGES.length - 1 ? 'Reiniciar' : 'Siguiente Etapa'}</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
