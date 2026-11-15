import React, { useState } from 'react'
import { 
  Bot, 
  BookOpen, 
  Sparkles, 
  Search, 
  FileText, 
  ShieldCheck, 
  Cpu, 
  Send,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { sound } from '../utils/audioEffects'

const NASA_PAPERS = [
  {
    id: 'bass_2016',
    title: 'NASA BASS: Burning and Suppression of Solids Flight Results',
    authors: 'G.A. Ruff, D.L. Urban, P.V. Ferkul (NASA Glenn Research Center)',
    journal: 'Combustion and Flame, Vol. 161 (ISS Flight Archive)',
    keyFinding: 'Los sólidos poliméricos (PMMA) arden en microgravedad con velocidades de propagación dominadas por flujo de convección forzada muy bajo (1 a 5 cm/s). Por debajo de 1 cm/s, la llama puede extinguirse por radiación o acumular monóxido de carbono.',
    relevance: 'Fundamental para cables y paneles de cabina en módulos ISS y Lunar Gateway.',
  },
  {
    id: 'flex_cool_flames',
    title: 'Discovery of Quasi-Steady Cool Flames in Droplet Combustion',
    authors: 'F.A. Williams, F.L. Dryer, V. Nayagam (NASA FLEX Experiment)',
    journal: 'Science / Combustion Integrated Rack (CIR)',
    keyFinding: 'Gotas de heptano en microgravedad continuaron oxidándose químicamente a temperaturas de 400-500°C sin incandescencia visible después de la aparente extinción de la llama caliente. Peligro de reinflamación furtiva.',
    relevance: 'Cambió los protocolos de seguridad espacial: un fuego que parece apagado puede seguir activo.',
  },
  {
    id: 'sofie_2024',
    title: 'SoFIE: Solid Fuel Ignition and Extinction in Microgravity',
    authors: 'J.S. T’ien, S. Olson (NASA Glenn & Case Western Reserve)',
    journal: 'Microgravity Science and Technology',
    keyFinding: 'La inclinación del flujo de aire y el grosor del material dictan si una llama esférica pasa a ser un frente de ignición en avance o retroceso. Determinó los grosores mínimos de aislantes de cable seguros.',
    relevance: 'Regla de diseño de arneses para naves Artemis Orion y trajes xEMU.',
  },
  {
    id: 'nasa_std_6001',
    title: 'NASA-STD-6001B: Flammability, Offgassing, and Odor Tests',
    authors: 'NASA Materials and Processes Technical Branch',
    journal: 'NASA Technical Standards Program',
    keyFinding: 'Prueba 1 (Upward Flame Propagation) estandarizada para evaluar materiales en la atmósfera más severa prevista de la misión (hasta 40% O₂ para esclusas de descompresión).',
    relevance: 'Estándar obligatorio para todo tornillo, velcro y polímero que vuele al espacio.',
  },
]

const FAQ_QUERIES = [
  {
    q: '¿Por qué la llama en microgravedad es esférica y de color azul?',
    a: 'En la Tierra, el aire caliente asciende por boyamiento (convección natural), creando la típica forma de lágrima y arrastrando partículas de hollín que brillan de amarillo a 1400°C. En microgravedad (g ≈ 0), no hay boyamiento: el transporte se rige exclusivamente por difusión molecular isotrópica (igual en todas direcciones), formando una esfera perfecta. El color azul se debe a la quimioluminiscencia de radicales excitados CH* y C₂* sin brillo de hollín incandescente.',
  },
  {
    q: '¿Por qué los detectores de humo estándar fallan en el espacio?',
    a: 'Los detectores terrestres dependen del "efecto chimenea": el humo caliente asciende naturalmente hacia el techo. En una nave espacial sin boyamiento, el humo y los gases tóxicos no suben; flotan formando una nube estancada alrededor del foco o son transportados al azar por ductos de aire acondicionado. Por eso, la NASA requiere detectores integrados en ductos de ventilación ECLSS y sensores fotoeléctricos láser.',
  },
  {
    q: '¿Qué es una llama fría (Cool Flame) en microgravedad?',
    a: 'Descubierto en la ISS en el experimento FLEX: tras apagarse la llama brillante caliente, la combustión continúa a baja temperatura (~400°C) mediante cinética química de peróxidos y cetohidroperóxidos. Es completamente invisible a simple vista y no genera luz amarilla ni azul, pero sigue consumiendo oxígeno y produciendo monóxido de carbono.',
  },
  {
    q: '¿Por qué un flujo de ventilación bajo (2-8 cm/s) es el más peligroso?',
    a: 'En calma total (0 cm/s), el fuego en microgravedad a menudo se autoasfixia con su propio dióxido de carbono acumulado. Sin embargo, si la ventilación de la cabina sopla apenas entre 2 y 8 cm/s, suministra continuamente oxígeno fresco sin llegar a enfriar la llama, estirándola en un penacho que propaga el fuego a lo largo de cables.',
  },
]

export default function AIResearchAssistant({ telemetry, params }) {
  const [activeTab, setActiveTab] = useState('synthesis') // 'synthesis' | 'papers' | 'assistant'
  const [userQuery, setUserQuery] = useState('')
  const [customAnswer, setCustomAnswer] = useState(null)
  const [expandedPaper, setExpandedPaper] = useState(null)

  const { gravity, oxygen, airflow, pressure, fuelId } = params
  const { flameTempC, grashofNumber, pecletNumber, isCoolFlame } = telemetry

  const handleAsk = (questionText) => {
    sound.playClick()
    const q = questionText || userQuery
    if (!q) return

    // Dynamic simulated AI synthesis based on question and current chamber state
    const matched = FAQ_QUERIES.find(item => item.q.toLowerCase().includes(q.toLowerCase().slice(0, 15)))
    if (matched) {
      setCustomAnswer(matched.a)
    } else {
      setCustomAnswer(
        `[INFERENCIA IA CIR]: Analizando tu consulta "${q}" bajo las condiciones actuales de la cámara (${gravity}g, ${oxygen}% O₂, flujo ${airflow} cm/s):\n\n` +
        `• Régimen Físico: El número de Grashof es ${grashofNumber}. ` +
        (gravity < 0.05 
          ? 'En ausencia de flotabilidad boyante, el frente de combustión está gobernado por transporte difusivo. ' 
          : 'La aceleración gravitatoria reactiva el gradiente convectivo boyante. ') +
        `\n• Recomendación según NASA-STD-6001: Para el material ${fuelId}, mantener el flujo de aire por debajo de 2 cm/s previene la transición a régimen advectivo de alta tasa de quemado. ` +
        `En caso de evento imprevisto, la prioridad 1 de control de vuelo es el aislamiento de ventilación ECLSS para promover la auto-asfixia radiativa.`
      )
    }
  }

  return (
    <div className="rounded-2xl p-5 glass-panel border border-cyan-500/20 flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-500/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-800/40">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-cyan-400 tracking-wider">
              NASA SPACE APPS CHALLENGE #10
            </div>
            <h3 className="text-base font-bold font-mono tracking-tight text-white uppercase">
              ASISTENTE IA & SÍNTESIS DE INVESTIGACIONES
            </h3>
          </div>
        </div>

        {/* Tab buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/70 border border-slate-800 font-mono text-xs">
          <button
            onClick={() => { sound.playClick(); setActiveTab('synthesis') }}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === 'synthesis'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Diagnóstico IA
          </button>
          <button
            onClick={() => { sound.playClick(); setActiveTab('papers') }}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === 'papers'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Papers NASA ({NASA_PAPERS.length})
          </button>
          <button
            onClick={() => { sound.playClick(); setActiveTab('assistant') }}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === 'assistant'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Consultas Científicas
          </button>
        </div>
      </div>

      {/* TAB 1: Real-time AI Synthesis */}
      {activeTab === 'synthesis' && (
        <div className="space-y-3 font-mono text-xs">
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-slate-900/50 to-slate-950/50 border border-cyan-500/20">
            <div className="flex items-center gap-2 text-cyan-300 font-bold mb-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>SÍNTESIS CIENTÍFICA AUTOMÁTICA DEL ESTADO ACTUAL</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {gravity < 0.05 ? (
                <>
                  La simulación se encuentra en régimen de <strong>Microgravedad Pura (0.00g)</strong>. Al anularse la fuerza boyante (Número de Grashof Gr ≈ {grashofNumber}), el campo de velocidad térmica es estrictamente esférico. Los reactivos convergen por gradiente difusivo de Fick.
                  {airflow > 2 ? (
                    <span className="text-amber-300 block mt-1">
                      ⚠️ Atención: El flujo forzado ECLSS de {airflow} cm/s induce un Pe = {pecletNumber}, rompiendo la simetría esférica y creando un penacho de estela que transporta calor hacia la pared posterior.
                    </span>
                  ) : (
                    <span className="text-cyan-200 block mt-1">
                      ✓ Estado Quiescente: Los productos de combustión (CO₂ y vapor de agua) permanecen como una capa esférica envolvente, promoviendo la asfixia radiativa natural del foco.
                    </span>
                  )}
                </>
              ) : (
                <>
                  La simulación se encuentra en régimen de <strong>Gravedad Parcial o Terrestre ({gravity.toFixed(2)}g)</strong>. La aceleración activa la flotabilidad convectiva, provocando un penacho ascendente de hollín que alcanza temperaturas de {flameTempC}°C.
                </>
              )}
            </p>
          </div>

          {/* Quick AI Bullet Points */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
              <span className="text-slate-400 font-bold block mb-1">Impacto en la Tripulación:</span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {oxygen > 28 
                  ? 'Nivel de O₂ peligroso. Aceleración drástica de quema de tejidos y batas. Requerido uso inmediato de máscaras de oxígeno PBE (Protective Breathing Equipment).'
                  : 'Nivel respirable dentro de la envolvente nominal ISS. No se observan concentraciones tóxicas letales de CO en el corto plazo.'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
              <span className="text-slate-400 font-bold block mb-1">Protocolo de Extinción Sugerido:</span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {fuelId === 'li_ion_battery'
                  ? 'Fuga térmica: Inundar inmediatamente con niebla fina de agua para absorber calor latente y neutralizar gas fluorado.'
                  : airflow > 5 
                  ? 'Paso 1: Parar ventilación ECLSS. Paso 2: Descargar extintor de CO₂ o Novec 1230 a 0.5m de distancia.'
                  : 'En calma de 0g, esperar autoextinción por asfixia radiativa o aplicar extintor portátil de CO₂ si persiste.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NASA Flight Papers Library */}
      {activeTab === 'papers' && (
        <div className="space-y-3 font-mono text-xs">
          <div className="text-[11px] text-slate-400 mb-2">
            Investigaciones experimentales realizadas en el Combustion Integrated Rack (CIR) de la Estación Espacial Internacional y vuelos del Transbordador Espacial:
          </div>

          <div className="space-y-2.5">
            {NASA_PAPERS.map((paper) => {
              const isExp = expandedPaper === paper.id
              return (
                <div 
                  key={paper.id}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/30 transition-all"
                >
                  <div 
                    onClick={() => setExpandedPaper(isExp ? null : paper.id)}
                    className="cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-cyan-300">
                        {paper.title}
                      </h4>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {paper.authors} · <span className="text-slate-500">{paper.journal}</span>
                      </div>
                    </div>
                    {isExp ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                  </div>

                  {isExp && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-2 text-[11px]">
                      <div>
                        <strong className="text-amber-300">Hallazgo Clave: </strong>
                        <span className="text-slate-300">{paper.keyFinding}</span>
                      </div>
                      <div>
                        <strong className="text-cyan-300">Aplicación en Seguridad Espacial: </strong>
                        <span className="text-slate-300">{paper.relevance}</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Scientific Questions & Inquiries */}
      {activeTab === 'assistant' && (
        <div className="space-y-4 font-mono text-xs">
          {/* FAQ Suggestions */}
          <div>
            <span className="text-slate-400 text-[11px] font-bold block mb-2">
              PREGUNTAS CIENTÍFICAS FRECUENTES:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {FAQ_QUERIES.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAsk(item.q)}
                  className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-left hover:border-cyan-500/40 text-slate-300 hover:text-cyan-200 transition-all text-[11px]"
                >
                  {item.q}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Question Input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Consulta a la IA de combustión en microgravedad (ej. ¿cómo se comporta el PMMA?)..."
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              className="flex-1 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-slate-200 text-xs font-mono"
            />
            <button
              onClick={() => handleAsk()}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Preguntar</span>
            </button>
          </div>

          {/* AI Response Box */}
          {customAnswer && (
            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-slate-200 text-[11px] leading-relaxed whitespace-pre-line animate-fadeIn">
              <div className="flex items-center gap-2 text-cyan-300 font-bold mb-2">
                <Bot className="w-4 h-4 text-cyan-400" />
                <span>RESPUESTA DE IA EXPERTA EN MICROGRAVEDAD:</span>
              </div>
              {customAnswer}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
