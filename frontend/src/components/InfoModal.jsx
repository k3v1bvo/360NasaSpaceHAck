import React from 'react'
import { X, Flame, Orbit, ShieldCheck, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react'
import { sound } from '../utils/audioEffects'

export default function InfoModal({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl glass-panel border border-cyan-500/40 p-6 text-slate-200 font-mono shadow-2xl">
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

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-cyan-500/20 pb-4 mb-5">
          <div className="p-3 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
            <Orbit className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
              DOCUMENTACIÓN CIENTÍFICA OFICIAL
            </span>
            <h2 className="text-xl font-bold text-white font-heading">
              NASA IGNIS-0G // Fuego y Seguridad en Microgravedad
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="space-y-6 text-xs leading-relaxed text-slate-300">
          {/* Section 1: The Challenge */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <h3 className="text-sm font-bold text-cyan-300 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Reto Oficial NASA Space Apps: Combustion in Microgravity AI Dashboard
            </h3>
            <p>
              En misiones a la Luna, Marte o en la Estación Espacial Internacional, un incendio en la cabina es la emergencia más catastrófica posible. Los astronautas no pueden simplemente "abrir las ventanas" ni salir corriendo. Este dashboard interactivo permite a ingenieros y astronautas predecir la física del fuego, simular el impacto de corrientes de ventilación y evaluar contramedidas en tiempo real.
            </p>
          </div>

          {/* Section 2: Earth vs Microgravity Comparison */}
          <div>
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              Física Comparativa: Fuego en la Tierra (1g) vs Fuego en el Espacio (0g)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30">
                <span className="text-amber-400 font-bold block mb-1.5 uppercase">
                  🌍 En la Tierra (1.0g - Convección Boyante):
                </span>
                <ul className="space-y-1.5 text-[11px] list-disc list-inside text-slate-300">
                  <li>El aire caliente es menos denso y sube con fuerza (boyamiento natural).</li>
                  <li>La llama se estira verticalmente formando la clásica <strong>lágrima alargada</strong>.</li>
                  <li>Las partículas de hollín son arrastradas hacia arriba, calentándose a 1400°C e irradiando luz <strong>amarilla/naranja brillante</strong>.</li>
                  <li>Parpadeo continuo (10-15 Hz) por vórtices boyantes.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30">
                <span className="text-cyan-400 font-bold block mb-1.5 uppercase">
                  🛰️ En el Espacio (0.0g - Difusión Molecular Pura):
                </span>
                <ul className="space-y-1.5 text-[11px] list-disc list-inside text-slate-300">
                  <li><strong>Sin boyamiento:</strong> El aire caliente NO sube porque no hay gravedad.</li>
                  <li>La llama forma una <strong>esfera azul perfecta y serena</strong>.</li>
                  <li>El oxígeno solo llega por lenta difusión molecular isotrópica.</li>
                  <li>El hollín no incandesce tanto: predomina la emisión de quimioluminiscencia azul de radicales CH* y C₂*.</li>
                  <li>Riesgo de <strong>Llama Fría (Cool Flame)</strong>: Puede seguir ardiendo invisible a 400°C.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3: Stealth Danger of Microgravity Fire */}
          <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30">
            <h3 className="text-sm font-bold text-red-300 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-red-400" />
              El Peligro "Stealth" y la Ventilación Forzada (ECLSS)
            </h3>
            <p className="mb-2">
              En microgravedad, el humo no sube hacia los detectores del techo. En una cabina cerrada sin ventilación, el fuego puede permanecer oculto acumulando monóxido de carbono tóxico (CO) o auto-asfixiarse por su propia capa esférica de CO₂.
            </p>
            <p>
              Sin embargo, los ventiladores de soporte vital (ECLSS) circulan aire entre 2 y 10 cm/s para que los astronautas respiren. Ese flujo forzado rompe la simetría esférica, suministra oxígeno fresco y convierte la llama en un penacho convectivo destructivo.
            </p>
          </div>

          {/* Flight Experiments */}
          <div>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              Experimentos Espaciales de Referencia
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <strong className="text-cyan-300 block">NASA FLEX</strong>
                <span>Combustión esférica de gotas de combustible y descubrimiento de llamas frías.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <strong className="text-cyan-300 block">NASA BASS</strong>
                <span>Quema y extinción de materiales sólidos (PMMA y telas de trajes espaciales).</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <strong className="text-cyan-300 block">NASA SoFIE</strong>
                <span>Comportamiento de arneses de cables y materiales en naves de espacio profundo.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-cyan-500/20 flex justify-end">
          <button
            onClick={() => {
              sound.playClick()
              onClose()
            }}
            className="px-5 py-2 text-xs font-mono font-bold rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            Entendido, Explorar Simulador
          </button>
        </div>
      </div>
    </div>
  )
}
