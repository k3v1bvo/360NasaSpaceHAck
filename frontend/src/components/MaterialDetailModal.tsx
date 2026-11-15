import React from 'react';
import { SpaceMaterial, MaterialKey } from '../types';
import { MATERIALS } from '../physics/flameKinetics';
import { X, Flame, ShieldAlert, ShieldCheck, Thermometer, Zap, Layers, Compass, ArrowRight } from 'lucide-react';

interface MaterialDetailModalProps {
  materialKey: MaterialKey | null;
  onClose: () => void;
  currentAtmO2: number;
  onLoadInSimulator?: (materialKey: MaterialKey) => void;
}

// Ficha técnica aeroespacial ampliada de cada material
const AEROSPACE_DOSSIER: Record<MaterialKey, {
  formula: string;
  chemicalFamily: string;
  nasaStandardRating: 'NO RECOMENDADO EN ALTO O2' | 'CONDICIONAL / CONFINADO' | 'APROBADO PARA USO ORBITAL';
  nasaRatingColor: string;
  flightHistory: string;
  zeroGBreakdown: string;
  extinguisherRecommendation: string;
  criticalHazard: string;
}> = {
  PMMA: {
    formula: '(C₅O₂H₈)ₙ — Polimetilmetacrilato',
    chemicalFamily: 'Termoplástico Acrílico de Alta Claridad Óptica',
    nasaStandardRating: 'NO RECOMENDADO EN ALTO O2',
    nasaRatingColor: 'text-rose-400 border-rose-500/40 bg-rose-950/40',
    flightHistory: 'Utilizado en ventanillas secundarias de experimentación física (misiones STS, Spacelab, CIR en la ISS). En el experimento BASS-II ardió vigorosamente a velocidades de ventilación tan bajas como 1 cm/s.',
    zeroGBreakdown: 'Al calentarse, el PMMA sufre despolimerización térmica casi completa a monómero MMA líquido/gaseoso. En 0-g, el monómero forma una envoltura vaporizada alrededor del cilindro sin convección que lo disipe, facilitando una llama difusiva continua si el O₂ supera su bajo LOI orbital (~15.2%).',
    extinguisherRecommendation: 'Niebla de agua NFPA 750 (35 bar) para enfriar la superficie por debajo de 360°C de pirólisis y condensar el vapor monomérico.',
    criticalHazard: 'Goteo y desprendimiento de masa fundida incandescente que en microgravedad flota como glóbulos encendidos.',
  },
  ETFE_Wire: {
    formula: '(-CH₂-CH₂-CH₂-CF₂-)ₙ — Etileno-Tetrafluoroetileno',
    chemicalFamily: 'Fluoropolímero Termoplástico de Grado Militar / Aeroespacial',
    nasaStandardRating: 'CONDICIONAL / CONFINADO',
    nasaRatingColor: 'text-amber-400 border-amber-500/40 bg-amber-950/40',
    flightHistory: 'Aislamiento estándar de cableado en el Shuttle, Estación Espacial Internacional y cápsula Orion. En el experimento BASS-II se demostró que cables con núcleo de cobre de calibre delgado (< 1 mm) propagan llama 4 veces más rápido de lo previsto por pruebas terrestres.',
    zeroGBreakdown: 'El núcleo de cobre actúa como sumidero térmico axial en 1-g, pero en 0-g el calor no se pierde por flotabilidad; la delgada envoltura de ETFE piróliza radialmente y los gases fluorados arden sostenidos en la meseta crítica de 0.4 a 5 cm/s de la ventilación del rack.',
    extinguisherRecommendation: 'Desconexión eléctrica inmediata del bus y sofocación por niebla de agua con microgotas de 35 µm.',
    criticalHazard: 'Emisión de trazas de fluoruro de hidrógeno (HF) corrosivo y tóxico para los filtros del soporte vital ECLSS.',
  },
  Nomex: {
    formula: 'Aramida Meta — Poli(m-fenileno isoftalamida)',
    chemicalFamily: 'Poliamida Aromática Sintética de Alta Resistencia Térmica',
    nasaStandardRating: 'APROBADO PARA USO ORBITAL',
    nasaRatingColor: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40',
    flightHistory: 'Material estructural indispensable del traje espacial EMU de la NASA, vestimenta interior de tripulaciones desde el programa Apolo y recubrimiento interior de módulos habitables.',
    zeroGBreakdown: 'En lugar de fundirse o licuarse, el Nomex se carboniza formando una capa porosa de char (coque aislante) que bloquea el oxígeno y absorbe radiación. En 0-g, sin corrientes ascendentes que arranquen esta capa, el material se auto-extingue de forma aún más efectiva que en la Tierra.',
    extinguisherRecommendation: 'Auto-extinguible en atmósferas estándar. Enriquecimientos extremos (>30% O₂) requieren agua nebulizada F-500.',
    criticalHazard: 'Generación de monóxido de carbono (CO) durante la carbonización forzada.',
  },
  Cotton: {
    formula: '(C₆H₁₀O₅)ₙ — Celulosa Natural Fibrosa',
    chemicalFamily: 'Polímero Biológico de Carbohidratos',
    nasaStandardRating: 'NO RECOMENDADO EN ALTO O2',
    nasaRatingColor: 'text-rose-400 border-rose-500/40 bg-rose-950/40',
    flightHistory: 'Muestra testigo fundamental en los experimentos SAFFIRE I a VI en naves de carga no tripuladas Cygnus al desacoplarse de la ISS, permitiendo quemar paneles de tela de 1 metro de escala real.',
    zeroGBreakdown: 'La matriz porosa de celulosa atrapa el calor y genera combustión latente (smoldering) sin llama visible, con capacidad de reaccionar a niveles mínimos de oxígeno y reactivarse súbitamente si la ventilación cambia de dirección.',
    extinguisherRecommendation: 'Inundación con agua nebulizada de penetración profunda; el CO₂ es ineficaz contra la combustión latente interna.',
    criticalHazard: 'Fácil ignición a baja temperatura (300°C) y emisión de humo particulado ultrafino.',
  },
  Polyethylene: {
    formula: '(C₂H₄)ₙ — Polietileno de Baja Densidad (LDPE)',
    chemicalFamily: 'Poliolefina Termoplástica Simple',
    nasaStandardRating: 'NO RECOMENDADO EN ALTO O2',
    nasaRatingColor: 'text-rose-400 border-rose-500/40 bg-rose-950/40',
    flightHistory: 'Utilizado en bolsas de almacenamiento logístico y bloques de blindaje contra radiación por su alto contenido de hidrógeno. Estrictamente regulado por NASA-STD-6001B.',
    zeroGBreakdown: 'Posee el calor de combustión más elevado de todos los polímeros aeroespaciales (43.6 MJ/kg, similar al combustible de aviación). En 0-g arde con desprendimiento copioso de gotas fundidas incandescentes que no caen al suelo, sino que flotan libremente empujadas por la ventilación.',
    extinguisherRecommendation: 'Supresión masiva inmediata por niebla de agua para absorber su inmensa liberación térmica de 43.6 MJ/kg.',
    criticalHazard: 'Liberación extrema de calor por kilogramo de material y proyectiles flotantes de masa líquida fundida.',
  },
  Kapton: {
    formula: 'Poli(4,4\'-oxidifenileno-piromelitimida)',
    chemicalFamily: 'Poliimida Termoestable de Alta Resistencia Dieléctrica',
    nasaStandardRating: 'APROBADO PARA USO ORBITAL',
    nasaRatingColor: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40',
    flightHistory: 'La icónica película dorada de mantas térmicas (MLI) de satélites, circuitos flexibles del Telescopio James Webb y módulos de la ISS.',
    zeroGBreakdown: 'Requiere 520°C para iniciar pirólisis. Su índice LOI orbital es de 31.8%, lo que significa que en la atmósfera estándar de la ISS (21% O₂) es intrínsecamente incapaz de sostener llama abierta.',
    extinguisherRecommendation: 'Generalmente auto-extinguible en atmósferas normóxicas (<25% O₂).',
    criticalHazard: 'En arcos eléctricos directos de alta energía puede sufrir carbonización conductiva (arc tracking).',
  },
  PTFE: {
    formula: '(C₂F₄)ₙ — Politetrafluoroetileno (Teflón)',
    chemicalFamily: 'Fluoropolímero Perfluorado de Alta Inercia',
    nasaStandardRating: 'APROBADO PARA USO ORBITAL',
    nasaRatingColor: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40',
    flightHistory: 'Juntas tóricas de sellado hermético, cojinetes secos, fontanería de fluidos criogénicos y trajes espaciales desde el Proyecto Gemini.',
    zeroGBreakdown: 'Es el material más seguro de la base de datos: con un LOI terrestre de 95% y LOI orbital de 87%, requiere atmósferas de oxígeno puro casi absolutas y calor externo masivo para reaccionar.',
    extinguisherRecommendation: 'No inflamable en condiciones operacionales normales.',
    criticalHazard: 'Si se sobrecalienta a más de 560°C emite gases tóxicos fluorados (perfluoroisobutileno).',
  },
};

export const MaterialDetailModal: React.FC<MaterialDetailModalProps> = ({
  materialKey,
  onClose,
  currentAtmO2,
  onLoadInSimulator,
}) => {
  if (!materialKey) return null;

  const mat = MATERIALS[materialKey];
  const dossier = AEROSPACE_DOSSIER[materialKey];
  if (!mat || !dossier) return null;

  const loiOrbital = (mat.LOI_1g + mat.base_shift).toFixed(1);
  const isFlammableNow = currentAtmO2 >= Number(loiOrbital);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800 pr-10">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="font-mono text-xs uppercase px-2.5 py-1 rounded bg-sky-500/20 text-sky-400 border border-sky-500/40 font-bold">
                Ficha Técnica Aeroespacial
              </span>
              <span className="text-xs font-mono text-slate-400">{dossier.chemicalFamily}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5 flex items-center space-x-2">
              <span>{mat.name}</span>
            </h2>
            <div className="text-xs font-mono text-slate-400 mt-0.5">{dossier.formula}</div>
          </div>

          <div className="flex flex-col sm:items-end">
            <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold border font-mono ${dossier.nasaRatingColor}`}>
              {dossier.nasaStandardRating === 'APROBADO PARA USO ORBITAL' ? (
                <ShieldCheck className="w-4 h-4 mr-1.5 shrink-0" />
              ) : (
                <ShieldAlert className="w-4 h-4 mr-1.5 shrink-0" />
              )}
              <span>{dossier.nasaStandardRating}</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400 mt-1">Norma NASA-STD-6001B Test 1</span>
          </div>
        </div>

        {/* Telemetry Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono">
            <div className="text-xs text-slate-400 flex items-center space-x-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>LOI 1-g (Tierra)</span>
            </div>
            <div className="text-2xl font-bold text-slate-100 mt-1">{mat.LOI_1g}% <span className="text-xs font-normal text-slate-400">O₂</span></div>
            <div className="text-[10px] text-slate-500 mt-0.5">Norma ASTM D2863</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono">
            <div className="text-xs text-slate-400 flex items-center space-x-1">
              <Compass className="w-3.5 h-3.5 text-orange-400" />
              <span>LOI 0-g (Orbital)</span>
            </div>
            <div className="text-2xl font-bold text-orange-400 mt-1">{loiOrbital}% <span className="text-xs font-normal text-slate-400">O₂</span></div>
            <div className="text-[10px] text-orange-300/80 mt-0.5">Caída: {mat.base_shift} pp en microg</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono">
            <div className="text-xs text-slate-400 flex items-center space-x-1">
              <Thermometer className="w-3.5 h-3.5 text-rose-400" />
              <span>T. Pirólisis (Tp)</span>
            </div>
            <div className="text-2xl font-bold text-rose-400 mt-1">{mat.pyrolysis_C}°C</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Descomposición térmica</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono">
            <div className="text-xs text-slate-400 flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5 text-sky-400" />
              <span>Calor Combustión</span>
            </div>
            <div className="text-2xl font-bold text-sky-400 mt-1">{mat.heat_combustion_MJ_kg} <span className="text-xs font-normal text-slate-400">MJ/kg</span></div>
            <div className="text-[10px] text-slate-500 mt-0.5">Energía liberada ΔHc</div>
          </div>
        </div>

        {/* Current Atmosphere Status Banner */}
        <div className={`p-4 rounded-xl border flex items-center justify-between mb-6 ${
          isFlammableNow 
            ? 'bg-rose-950/30 border-rose-500/40 text-rose-200' 
            : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
        }`}>
          <div className="flex items-center space-x-3">
            {isFlammableNow ? (
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <div className="text-sm">
              <span className="font-bold">
                {isFlammableNow ? 'Veredicto Actual: INFLAMABLE EN LA CABINA SELECCIONADA' : 'Veredicto Actual: AUTO-EXTINGUIBLE EN ESTA CABINA'}
              </span>
              <p className="text-xs opacity-80 mt-0.5">
                El nivel de O₂ actual ({currentAtmO2}%) {isFlammableNow ? 'SUPERA' : 'ESTÁ POR DEBAJO DE'} su Límite de Oxígeno Orbital ({loiOrbital}%).
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-4 text-sm leading-relaxed">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <h4 className="font-bold text-sky-400 font-mono text-xs uppercase flex items-center space-x-2 mb-1.5">
              <Layers className="w-4 h-4" />
              <span>¿Por qué se quema diferente en Microgravedad (0-g)?</span>
            </h4>
            <p className="text-slate-300 text-xs sm:text-sm">{dossier.zeroGBreakdown}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <h4 className="font-bold text-amber-400 font-mono text-xs uppercase flex items-center space-x-2 mb-1.5">
              <Compass className="w-4 h-4" />
              <span>Antecedentes y Misiones de Vuelo NASA (PSI)</span>
            </h4>
            <p className="text-slate-300 text-xs sm:text-sm">{dossier.flightHistory}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="font-bold text-rose-400 font-mono text-xs uppercase block mb-1">
                Peligro Crítico Operacional
              </span>
              <p className="text-slate-300 text-xs">{dossier.criticalHazard}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="font-bold text-emerald-400 font-mono text-xs uppercase block mb-1">
                Estrategia de Supresión (NFPA 750)
              </span>
              <p className="text-slate-300 text-xs">{dossier.extinguisherRecommendation}</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-500 font-mono">
            Datos indexados del Physical Sciences Informatics (PSI) · NASA Glenn Research Center
          </span>
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            {onLoadInSimulator && (
              <button
                onClick={() => {
                  onLoadInSimulator(materialKey);
                  onClose();
                }}
                className="btn-primary py-2.5 px-4 text-xs font-semibold flex items-center justify-center space-x-2 w-full sm:w-auto"
              >
                <span>Probar este Material en Simulador</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="btn-secondary py-2.5 px-4 text-xs font-semibold w-full sm:w-auto"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
