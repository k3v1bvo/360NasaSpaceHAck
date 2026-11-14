import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Compass, 
  X, 
  MapPin, 
  Flame, 
  Waves, 
  Wheat, 
  Globe2,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

const STAGES = [
  {
    id: 'microclimas',
    tab: 'microclimas',
    stepNumber: 1,
    icon: MapPin,
    badgeColor: 'from-blue-600 to-indigo-600',
    title: '1. Diagnóstico Urbano: Red de 20 Nodos (Cochabamba)',
    sub: '14 Distritos • 2 Estaciones Físicas GAMC + 13 Nodos Calibrados + 5 Hotspots OTB',
    whatIsIt: 'El municipio solo cuenta con 2 estaciones físicas de aire y clima (Red MÓNICA). Nuestro modelo calibrado con satélites NASA genera 18 estaciones virtuales de alta resolución para cubrir toda la ciudad.',
    keyEvidence: 'Brecha térmica comprobada de +5.8 °C entre el Norte arbolado (20.4 °C) y la Zona Sur asfaltada (37.8 °C en superficie). Precisión estadística R² = 0.9457.',
    actionableDecision: 'Plan Maestro de Reforestación Urbana Municipal: indica los manzanos exactos de los Distritos 8 y 9 donde plantar árboles nativos para mitigar la isla de calor.',
  },
  {
    id: 'incendios',
    tab: 'incendios',
    stepNumber: 2,
    icon: Flame,
    badgeColor: 'from-red-600 to-amber-600',
    title: '2. Alerta Temprana en Cordillera del Tunari',
    sub: 'Línea Cota 2750 • Sensores Infrarrojos NASA FIRMS (VIIRS + MODIS)',
    whatIsIt: 'Monitoreo continuo de focos de calor satelitales en las laderas del Parque Nacional Tunari sobre la Cota 2750 (frontera con la mancha urbana).',
    keyEvidence: 'Detección en tiempo casi real de anomalías térmicas y dirección del viento, modelando cómo el humo desciende al valle por inversión térmica.',
    actionableDecision: 'Despacho preventivo para Bomberos, UGR y SAR-Bolivia antes de que el fuego alcance zonas residenciales o fuentes de agua.',
  },
  {
    id: 'torrenteras',
    tab: 'torrenteras',
    stepNumber: 3,
    icon: Waves,
    badgeColor: 'from-cyan-600 to-blue-600',
    title: '3. Red Hidrológica: 60 Torrenteras Críticas GAMC',
    sub: 'Gestión de Cuencas • Taquiña, Pintumayu, Cantarranas y Aranjuez',
    whatIsIt: 'Mapeo oficial de las 60 torrenteras y canales de desagüe que bajan de la cordillera hacia los distritos 1, 2 y 3 de la ciudad.',
    keyEvidence: 'Cruce de la topografía digital (DEM SRTM) con el acumulado de precipitaciones satelitales (NASA GPM) y el semáforo municipal de riesgo de mazamorras.',
    actionableDecision: 'Obras Públicas y Defensa Civil: programación de maquinaria pesada para limpieza de lechos y cierre preventivo de pasos a desnivel en tormentas.',
  },
  {
    id: 'agrotech',
    tab: 'agrotech',
    stepNumber: 4,
    icon: Wheat,
    badgeColor: 'from-emerald-600 to-teal-600',
    title: '4. Resiliencia Agro-Climática & Humedad de Suelo',
    sub: 'Satélite de Radar NASA SMAP • Cuenca Lechera de La Maica & Valle Bajo',
    whatIsIt: 'Estimación satelital del contenido de agua en los primeros 5 cm del suelo agrícola mediante radar de microondas de alta penetración.',
    keyEvidence: 'Detección de déficit hídrico y sequía edáfica con 5 días de anticipación respecto al marchitamiento visible del forraje y cultivos.',
    actionableDecision: 'Asociaciones de Regantes y Agricultores: optimización de turnos de riego de represas, evitando pérdidas de cosechas y estrés hídrico.',
  },
  {
    id: 'global_nasa',
    tab: 'global_nasa',
    stepNumber: 5,
    icon: Globe2,
    badgeColor: 'from-purple-600 to-indigo-600',
    title: '5. Reto Oficial NASA: Be An Earth System Trend Detective!',
    sub: 'Tendencias Globales vs Dinámicas Locales Multi-Decadales (2016-2026)',
    whatIsIt: 'Cumplimiento de las 4 preguntas científicas de la NASA: qué cambia, dónde cambia, cuánto cambia y si es estadísticamente significativo (p < 0.05).',
    keyEvidence: 'Conexión entre macro-centinelas planetarios (Amazonía, Chacaltaya, California) y el valle local mediante Downscaling dinámico al hacer zoom.',
    actionableDecision: 'Validación científica rigurosa: demuestra cómo datos globales de libre acceso de la NASA se transforman en políticas públicas locales aplicables.',
  },
];

export default function SystemWorkflowTour({ 
  activeTab, 
  onSelectTab, 
  isOpen, 
  onClose 
}) {
  if (!isOpen) return null;

  // Encontrar la etapa correspondiente según el activeTab actual
  const currentStageIndex = STAGES.findIndex(s => s.tab === activeTab);
  const safeIndex = currentStageIndex >= 0 ? currentStageIndex : 0;
  const current = STAGES[safeIndex];

  const handlePrev = () => {
    const prevIndex = safeIndex > 0 ? safeIndex - 1 : STAGES.length - 1;
    onSelectTab(STAGES[prevIndex].tab);
  };

  const handleNext = () => {
    const nextIndex = safeIndex < STAGES.length - 1 ? safeIndex + 1 : 0;
    onSelectTab(STAGES[nextIndex].tab);
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
              <span>Guía del Sistema • Etapa {current.stepNumber} de {STAGES.length}</span>
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
                onClick={() => onSelectTab(s.tab)}
                className={`h-2 rounded-full transition-all ${
                  idx === safeIndex 
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
              <span>{safeIndex === STAGES.length - 1 ? 'Reiniciar' : 'Siguiente Etapa'}</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
