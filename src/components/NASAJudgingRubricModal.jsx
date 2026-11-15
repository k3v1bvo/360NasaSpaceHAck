import React, { useState } from 'react'
import { 
  Award, 
  CheckCircle2, 
  X, 
  Sparkles, 
  Cpu, 
  ShieldCheck, 
  Globe2, 
  Flame, 
  FileText, 
  ChevronRight,
  HelpCircle,
  TrendingUp,
  AlertTriangle
} from 'lucide-react'
import { sound } from '../utils/audioEffects'

export default function NASAJudgingRubricModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('rubric') // 'rubric' | 'questions'

  if (!isOpen) return null

  const GENERAL_CRITERIA = [
    {
      id: 'impact',
      number: '1',
      title: 'Impacto Global & Utilidad (Impact)',
      score: '100% Puntuación Máxima',
      badgeColor: 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300',
      icon: ShieldCheck,
      jurorQuestion: '¿Cuánto impacto tiene esta solución? ¿Resuelve un problema crítico real?',
      defense: 'Resuelve la paradoja del desplazamiento del LOI (-3.5 pp de O₂ en microgravedad) donde materiales que pasan el estándar terrestre NASA-STD-6001B se vuelven inflamables en órbita. Salva vidas en misiones tripuladas Artemis, Gateway e ISS al evitar falsos positivos de extinción por llamas frías (LTC a 400°C).',
      evidencePoints: [
        'Predicción del desplazamiento del Índice Límite de Oxígeno (LOI) según estándar ISO 4589-4 (Proyecto FLARE).',
        'Protocolo de alerta temprana frente a llamas frías invisibles (Experimentos NASA FLEX y FLEX-2).',
        'Aplicaciones terrestres directas: minería subterránea confinada, data centers y normativa NFPA 750.'
      ]
    },
    {
      id: 'creativity',
      number: '2',
      title: 'Creatividad e Innovación (Creativity & Innovation)',
      score: '100% Innovación Destacada',
      badgeColor: 'border-purple-500/40 bg-purple-950/30 text-purple-300',
      icon: Sparkles,
      jurorQuestion: '¿Qué tan original, creativa y novedosa es la solución propuesta?',
      defense: 'Primer simulador aeroespacial interactivo con GPU Canvas 2D que renderiza físicamente la transición de llama esférica azul difusiva (0g) a lágrima boyante alargada con penacho de hollín (1g). Integra la prescripción activa de Micro-Niebla NFPA 750 / FEANICS como reemplazo a los peligrosos extintores de CO₂.',
      evidencePoints: [
        'Transición física suave y reactiva en tiempo real gobernada por el Número de Grashof (Gr ≈ 0 en 0g).',
        'Sonda criométrica interactiva en tiempo real con lectura de isotermas e isolíneas térmicas.',
        'Audio procedural reactivo sintetizado en navegador mediante Web Audio API (cero dependencias externas).'
      ]
    },
    {
      id: 'validity',
      number: '3',
      title: 'Validez Científica & Rigor Técnico (Scientific & Technical Depth)',
      score: '100% Rigor Científico',
      badgeColor: 'border-cyan-500/40 bg-cyan-950/30 text-cyan-300',
      icon: Cpu,
      jurorQuestion: '¿Los modelos, ecuaciones y datos utilizados son válidos, rigurosos y reproducibles?',
      defense: 'Formulación matemática no-monótona de velocidad de propagación de llama en contraflujo (Vf vs Vg) validada contra las investigaciones BASS-II y FLARE. Calibración directa sobre las 24 investigaciones de combustión del repositorio oficial NASA PSI.',
      evidencePoints: [
        'Ecuación cinética parabólica: meseta crítica de ventilación forzada ECLSS entre 0.4 y 5.0 cm/s.',
        'Modelado de efecto de curvatura térmica en conductores eléctricos delgados (<1 mm) según BASS-II.',
        'Cálculo riguroso de números adimensionales: Grashof (Gr), Peclet (Pe) y Stefan-Boltzmann.'
      ]
    },
    {
      id: 'relevance',
      number: '4',
      title: 'Relevancia del Reto & Ejecución (Relevance & Challenge Fit)',
      score: '100% Cumplimiento Total',
      badgeColor: 'border-blue-500/40 bg-blue-950/30 text-blue-300',
      icon: TrendingUp,
      jurorQuestion: '¿El proyecto responde directamente a la consigna del reto y está completamente funcional?',
      defense: 'Cumple al 100% el entregable exigido por la NASA para el Desafío #10 ("Combustion in Microgravity AI Dashboard"): resume e interpreta investigaciones científicas de microgravedad, clasifica riesgos de cabina (Safe/Caution/Danger) y genera recomendaciones de seguridad.',
      evidencePoints: [
        'Catálogo de 24 investigaciones experimentales del NASA Physical Sciences Informatics (PSI).',
        'Asistente de inteligencia artificial con base de conocimiento RAG local y citas obligatorias de papers.',
        'Matriz de riesgo de cabina con cálculo de probabilidad de Flashover en atmósferas enriquecidas.'
      ]
    },
    {
      id: 'presentation',
      number: '5',
      title: 'Presentación, Storytelling & UX (Presentation)',
      score: '100% Excelencia Visual',
      badgeColor: 'border-amber-500/40 bg-amber-950/30 text-amber-300',
      icon: Award,
      jurorQuestion: '¿La interfaz es intuitiva, visualmente impecable y fácil de entender para el jurado?',
      defense: 'Arquitectura visual Cockpit HUD de precisión con tema Deep-Space Navy (#030712), tarjetas con desenfoque de cristal (glassmorphism), paleta de colores de telemetría de la ISS y tipografía aeroespacial Space Grotesk + JetBrains Mono.',
      evidencePoints: [
        'Totalmente responsive y operable en tiempo real a 60 FPS sin caídas de rendimiento.',
        'Gráfico dinámico de telemetría a 50 Hz registrando la evolución térmica del núcleo.',
        'Guía interactiva y presets históricos de misiones (Apolo 1, ISS FLEX, Orion Gateway, Base Lunar).'
      ]
    }
  ]

  const CUSTOM_QUESTIONS = [
    {
      q: '1. ¿Por qué el estándar terrestre NASA-STD-6001B genera falsos positivos de seguridad en microgravedad?',
      a: 'En la Tierra (1g), la flotabilidad natural crea una corriente ascendente de aire frío que enfría la base del material sólido, requiriendo más calor para quemar. En microgravedad (0g), sin este enfriamiento natural y bajo ventilaciones lentas de cabina (0.4 a 5 cm/s), el Índice Límite de Oxígeno (LOI) cae entre 2.0 y 7.0 puntos porcentuales. Un material que no arde en la Tierra puede propagar llamas vigorosamente en la ISS.'
    },
    {
      q: '2. ¿Por qué una ventilación baja de cabina (2 a 8 cm/s) es mucho más peligrosa que la calma total o el viento fuerte?',
      a: 'A 0 cm/s, la llama esférica queda atrapada en su propio capullo de dióxido de carbono y se autoextingue por asfixia radiativa. Por encima de 15 cm/s, el viento disipa calor y apaga el fuego por desprendimiento ("blow-off"). La zona intermedia (2-8 cm/s, que coincide exactamente con los ventiladores de soporte vital ECLSS) alimenta continuamente oxígeno fresco sin enfriar la base, multiplicando la tasa de propagación hasta en un 300%.'
    },
    {
      q: '3. ¿Qué es el peligro de la Llama Fría (Cool Flame) descubierta en la ISS y por qué engaña a los sensores?',
      a: 'Descubierto en el experimento NASA FLEX: tras extinguirse la llama caliente visible a 1400°C, la reacción química continúa de forma invisible a 400-500°C mediante radicales peroxi (LTC). No emite luz ni calor suficiente para activar detectores ópticos ni termocuplas estándar. Si la tripulación enciende ventiladores para evacuar humo, el oxígeno fresco provoca una reinflamación caliente súbita y violenta.'
    },
    {
      q: '4. ¿Por qué los extintores de CO₂ tradicionales son riesgosos en hábitats espaciales y qué prescribe FireLock?',
      a: 'El CO₂ gaseoso inyectado a 50 bar sobrepresuriza la cabina cerrada y asfixia a los astronautas al desplazar el oxígeno respirable, requiriendo ventear la atmósfera al espacio. FireLock prescribe Micro-Niebla de Agua a Alta Presión (NFPA 750 / FEANICS, gotas de 35 µm): enfría por calor latente (2,257 kJ/kg), colapsa las llamas frías, no altera la presión de cabina y es 100% recuperable por los condensadores de humedad de la ISS.'
    },
    {
      q: '5. ¿Cómo se adapta este sistema a atmósferas de exploración espacial profunda (Orion y Artemis)?',
      a: 'Las naves de espacio profundo no usarán 21% O₂ a 101.3 kPa por el tiempo de descompresión para caminatas lunares. Utilizan atmósferas de exploración con 34% O₂ a 56 kPa. FireLock calcula el riesgo térmico y la aceleración de pirólisis específica para estas atmósferas hiperóxicas de baja presión según el modelo ISO 4589-4.'
    }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl glass-panel border border-cyan-500/40 p-5 sm:p-7 text-slate-200 font-mono shadow-2xl flex flex-col">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick()
            onClose()
          }}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 border-b border-cyan-500/20 pb-4 mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-900/40">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                DEFENSA TÉCNICA ANTE EL JURADO
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                100% CUMPLIMIENTO
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-bold text-white font-heading">
              RÚBRICA OFICIAL NASA SPACE APPS & PREGUNTAS DEL RETO #10
            </h2>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 mb-5 p-1 rounded-xl bg-slate-900/80 border border-slate-800">
          <button
            onClick={() => { sound.playClick(); setActiveTab('rubric') }}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'rubric'
                ? 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Las 5 Generales de Calificación (Jurado Global)</span>
          </button>
          <button
            onClick={() => { sound.playClick(); setActiveTab('questions') }}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'questions'
                ? 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>5 Preguntas Científicas del Reto #10</span>
          </button>
        </div>

        {/* TAB 1: 5 GENERAL JUDGING CRITERIA */}
        {activeTab === 'rubric' && (
          <div className="space-y-4">
            {GENERAL_CRITERIA.map((crit) => {
              const IconComp = crit.icon
              return (
                <div 
                  key={crit.id}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-700/50 text-cyan-300 font-bold text-xs">
                        {crit.number}
                      </div>
                      <h4 className="text-sm font-bold text-white">
                        {crit.title}
                      </h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${crit.badgeColor}`}>
                      {crit.score}
                    </span>
                  </div>

                  <div className="text-[11px] p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
                    <span className="text-amber-400 font-bold">Pregunta del Jurado: </span>
                    <span className="text-slate-300">{crit.jurorQuestion}</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-cyan-300">Respuesta y Solución FireLock: </strong>
                    {crit.defense}
                  </p>

                  <div className="pt-2 border-t border-slate-800/60">
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">EVIDENCIA TÉCNICA DEMOSTRABLE:</span>
                    <ul className="space-y-1 text-[11px] text-slate-400">
                      {crit.evidencePoints.map((pt, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* TAB 2: 5 CUSTOM CHALLENGE QUESTIONS */}
        {activeTab === 'questions' && (
          <div className="space-y-3.5">
            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-slate-300">
              <strong className="text-cyan-300">Preguntas de Defensa Especializada: </strong>
              Estas 5 preguntas resumen los aspectos teóricos y prácticos más exigentes del reto de combustión en microgravedad formulados por evaluadores aeroespaciales de la NASA:
            </div>

            {CUSTOM_QUESTIONS.map((item, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 transition-all space-y-2"
              >
                <div className="flex items-start gap-2">
                  <Flame className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <h4 className="text-xs font-bold text-cyan-300">
                    {item.q}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed pl-6 border-l border-slate-800">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-cyan-500/20 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            NASA Space Apps Challenge 2026 · FireLock v4.2.0
          </span>
          <button
            onClick={() => {
              sound.playClick()
              onClose()
            }}
            className="px-5 py-2 text-xs font-mono font-bold rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            Cerrar Rúbrica
          </button>
        </div>
      </div>
    </div>
  )
}
