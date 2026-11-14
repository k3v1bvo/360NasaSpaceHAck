import React, { useState, useEffect, useRef } from 'react';
import { Flame, Play, RefreshCw, AlertTriangle, Wind, Gauge, Layers, Info } from 'lucide-react';
import { calculateFlameSpread, simulateCoolFlame, MATERIALS, ATMOSPHERES } from '../physics/flameKinetics';

export default function FlameSimulator({ atmosphere }) {
  const currentAtm = ATMOSPHERES[atmosphere] || ATMOSPHERES.ISS_Standard;

  const [material, setMaterial] = useState("PMMA");
  const [diameter, setDiameter] = useState(2.0);
  const [flowVelocity, setFlowVelocity] = useState(2.5);
  const [isSimulatingCool, setIsSimulatingCool] = useState(false);
  const [coolSimStep, setCoolSimStep] = useState(0);

  const canvas1gRef = useRef(null);
  const canvas0gRef = useRef(null);

  // Calculate current flame spread rate
  const vf = calculateFlameSpread(flowVelocity, diameter, material, currentAtm.P_atm, currentAtm.O2_percent / 100.0);

  // Cool flame simulation trajectory
  const coolData = simulateCoolFlame(60, 60);

  // Animation for cool flame
  useEffect(() => {
    let interval = null;
    if (isSimulatingCool) {
      interval = setInterval(() => {
        setCoolSimStep((prev) => {
          if (prev >= coolData.times.length - 1) {
            setIsSimulatingCool(false);
            return prev;
          }
          return prev + 1;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isSimulatingCool, coolData.times.length]);

  // Physical 2D Flame Rendering on Canvas
  useEffect(() => {
    // 1-g Canvas: Buoyant teardrop yellow flame
    const ctx1g = canvas1gRef.current?.getContext('2d');
    if (ctx1g) {
      const w = 240, h = 180;
      ctx1g.clearRect(0, 0, w, h);

      // Background
      ctx1g.fillStyle = '#080c14';
      ctx1g.fillRect(0, 0, w, h);

      // Burner / fuel rod
      ctx1g.fillStyle = '#334155';
      ctx1g.fillRect(w / 2 - 4, h - 35, 8, 35);

      // 1-g Plume gradient (Buoyant convection)
      const grad = ctx1g.createLinearGradient(w / 2, h - 35, w / 2, 25);
      grad.addColorStop(0, '#38bdf8');
      grad.addColorStop(0.2, '#f59e0b');
      grad.addColorStop(0.7, '#ea580c');
      grad.addColorStop(1, 'rgba(234, 88, 12, 0)');

      ctx1g.beginPath();
      ctx1g.moveTo(w / 2 - 14, h - 35);
      ctx1g.bezierCurveTo(w / 2 - 22, h - 90, w / 2 - 6, 35, w / 2, 20);
      ctx1g.bezierCurveTo(w / 2 + 6, 35, w / 2 + 22, h - 90, w / 2 + 14, h - 35);
      ctx1g.closePath();
      ctx1g.fillStyle = grad;
      ctx1g.fill();

      // Label
      ctx1g.font = '10px JetBrains Mono';
      ctx1g.fillStyle = '#94a3b8';
      ctx1g.fillText('Lágrima Convectiva (1-g)', 12, 20);
    }

    // 0-g Canvas: Spherical translucent blue diffusion flame with soot shell
    const ctx0g = canvas0gRef.current?.getContext('2d');
    if (ctx0g) {
      const w = 240, h = 180;
      ctx0g.clearRect(0, 0, w, h);

      ctx0g.fillStyle = '#080c14';
      ctx0g.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const radius = 42;

      // Fuel sphere / cylinder
      ctx0g.fillStyle = '#475569';
      ctx0g.beginPath();
      ctx0g.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx0g.fill();

      // Soot Shell (concentric ring where Stefan flow = Thermophoretic velocity)
      ctx0g.strokeStyle = 'rgba(245, 158, 11, 0.45)';
      ctx0g.lineWidth = 4;
      ctx0g.beginPath();
      ctx0g.arc(cx, cy, radius * 0.72, 0, Math.PI * 2);
      ctx0g.stroke();

      // Spherical blue diffusion flame
      const grad0g = ctx0g.createRadialGradient(cx, cy, 8, cx, cy, radius);
      grad0g.addColorStop(0, 'rgba(14, 165, 233, 0.15)');
      grad0g.addColorStop(0.7, 'rgba(56, 189, 248, 0.65)');
      grad0g.addColorStop(0.95, 'rgba(2, 132, 199, 0.85)');
      grad0g.addColorStop(1, 'rgba(2, 132, 199, 0)');

      ctx0g.beginPath();
      ctx0g.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx0g.fillStyle = grad0g;
      ctx0g.fill();

      // Label
      ctx0g.font = '10px JetBrains Mono';
      ctx0g.fillStyle = '#38bdf8';
      ctx0g.fillText('Esfera Difusiva (0-g)', 12, 20);
    }
  }, [flowVelocity, diameter]);

  // Non-monotonic curve points
  const curvePoints = [];
  for (let v = 0.05; v <= 12; v += 0.25) {
    const rate = calculateFlameSpread(v, diameter, material, currentAtm.P_atm, currentAtm.O2_percent / 100.0);
    curvePoints.push({ v, rate });
  }
  const maxRate = Math.max(...curvePoints.map(p => p.rate), 4.0);

  return (
    <div className="space-y-6">
      
      {/* Parameter Control Bar */}
      <div className="card-aerospace p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <Flame className="w-5 h-5 text-sky-400" />
            <span>Parámetros Físicos de Combustión</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">
            Atmósfera: {currentAtm.name} ({currentAtm.O2_percent}% O₂)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-xs font-semibold uppercase text-slate-400 block mb-2">Material Combustible</label>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="w-full font-medium"
            >
              {Object.keys(MATERIALS).map((k) => (
                <option key={k} value={k}>{MATERIALS[k].name}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold uppercase text-slate-400 mb-2">
              <span>Diámetro de Combustible</span>
              <span className="font-mono text-sky-400 font-bold">{diameter.toFixed(1)} mm</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="6.0"
              step="0.5"
              value={diameter}
              onChange={(e) => setDiameter(parseFloat(e.target.value))}
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold uppercase text-slate-400 mb-2">
              <span>Flujo Opuesto HVAC</span>
              <span className="font-mono text-sky-400 font-bold">{flowVelocity.toFixed(1)} cm/s</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="12.0"
              step="0.2"
              value={flowVelocity}
              onChange={(e) => setFlowVelocity(parseFloat(e.target.value))}
            />
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold">Tasa de Propagación (Vf)</div>
            <div className="text-2xl font-mono font-bold text-sky-400 mt-1">{vf.toFixed(2)} mm/s</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold">Régimen Aerotérmico</div>
            <div className="text-sm font-semibold text-slate-200 mt-1.5">
              {flowVelocity >= 0.4 && flowVelocity <= 5.0 ? "Meseta Crítica HVAC" : flowVelocity < 0.4 ? "Asfixia Difusiva" : "Soplado Convectivo"}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold">Efecto de Curvatura</div>
            <div className="text-sm font-semibold text-slate-200 mt-1.5">
              {diameter <= 1.0 ? "Crítico (Acelerado)" : "Normal"}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold">Pérdida Radiativa</div>
            <div className="text-sm font-semibold text-slate-200 mt-1.5">
              {flowVelocity < 0.5 ? "Extinción por Soot Shell" : "Estable"}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Simulation & Non-Monotonic Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: 2D Flame Morphing Canvas */}
        <div className="lg:col-span-5 card-aerospace p-6">
          <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2 mb-2">
            <Layers className="w-4 h-4 text-sky-400" />
            <span>Morfología de Flama: 1-g vs Microgravedad</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Comparación directa: En 1-g la flotabilidad estira la llama; en microgravedad forma una esfera azul difusiva con anillo de hollín concéntrico.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="border border-slate-800 rounded-lg overflow-hidden">
              <canvas ref={canvas1gRef} width={240} height={180} />
            </div>
            <div className="border border-slate-800 rounded-lg overflow-hidden">
              <canvas ref={canvas0gRef} width={240} height={180} />
            </div>
          </div>

          <div className="mt-4 p-3 rounded bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <b>Envoltura de Hollín (Soot Shell):</b> En el radio donde el flujo de Stefan se iguala a la fuerza termoforética (<span className="font-mono">v_Stefan + v_thermo = 0</span>), el hollín queda suspendido, disipando calor por radiación.
          </div>
        </div>

        {/* Right: Non-Monotonic Curve SVG */}
        <div className="lg:col-span-7 card-aerospace p-6">
          <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2 mb-1">
            <Wind className="w-4 h-4 text-sky-400" />
            <span>Curva de Propagación de Llama No Monótona (Vf vs Vg)</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            La velocidad máxima de propagación ocurre en la meseta crítica entre 0.4 y 5.0 cm/s (rango de ventilación de cabina).
          </p>

          {/* SVG Plot */}
          <div className="w-full h-56 bg-slate-950 border border-slate-800 rounded-lg p-2 relative">
            <svg viewBox="0 0 500 200" className="w-full h-full">
              {/* HVAC danger zone background */}
              <rect x="50" y="20" width="160" height="150" fill="rgba(239, 68, 68, 0.12)" />
              <text x="55" y="35" fill="#ef4444" fontSize="10" fontFamily="JetBrains Mono">Meseta HVAC (0.4 - 5 cm/s)</text>

              {/* Grid lines */}
              <line x1="40" y1="170" x2="480" y2="170" stroke="#1e293b" strokeWidth="1" />
              <line x1="40" y1="20" x2="40" y2="170" stroke="#1e293b" strokeWidth="1" />

              {/* Plot Path */}
              <path
                d={curvePoints.reduce((acc, pt, i) => {
                  const x = 40 + (pt.v / 12) * 440;
                  const y = 170 - (pt.rate / maxRate) * 140;
                  return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
                }, '')}
                fill="none"
                stroke="#00d4ff"
                strokeWidth="2.5"
              />

              {/* Operating Point Mark */}
              {(() => {
                const curX = 40 + (flowVelocity / 12) * 440;
                const curY = 170 - (vf / maxRate) * 140;
                return (
                  <g>
                    <circle cx={curX} cy={curY} r="6" fill="#f8fafc" stroke="#ef4444" strokeWidth="2.5" />
                    <text x={curX + 8} y={curY - 6} fill="#f8fafc" fontSize="10" fontFamily="JetBrains Mono">
                      {vf.toFixed(2)} mm/s
                    </text>
                  </g>
                );
              })()}
            </svg>
          </div>

          <div className="flex justify-between items-center text-xs font-mono text-slate-400 mt-2 px-2">
            <span>Flujo 0 cm/s (Quiescente)</span>
            <span className="text-sky-400">Punto Blanco: Condición Seleccionada</span>
            <span>Flujo 12 cm/s</span>
          </div>
        </div>

      </div>

      {/* Cool Flame LTC Dynamic Simulation Section */}
      <div className="card-aerospace p-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>Simulación Transitoria de Llama Fría (Química LTC: 600–800 K)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Descubierto en el experimento FLEX: tras la extinción óptica visible, la reacción continúa emitiendo peróxido de hidrógeno sin llama visible.
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => {
                setCoolSimStep(0);
                setIsSimulatingCool(true);
              }}
              disabled={isSimulatingCool}
              className="btn-primary"
            >
              <Play className="w-4 h-4 mr-2" />
              <span>{isSimulatingCool ? "Simulando..." : "Ejecutar Transitorio (60s)"}</span>
            </button>
            <button
              onClick={() => {
                setIsSimulatingCool(false);
                setCoolSimStep(0);
              }}
              className="btn-secondary"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Trajectory Display */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-slate-900 border border-slate-800 mb-4 font-mono">
          <div>
            <div className="text-xs text-slate-400">Tiempo de Misión</div>
            <div className="text-xl font-bold text-slate-100">{coolData.times[coolSimStep]} s</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Temperatura de Zona</div>
            <div className="text-xl font-bold text-red-400">{coolData.temperatures[coolSimStep]} K</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Peróxido (H₂O₂)</div>
            <div className="text-xl font-bold text-sky-400">{coolData.h2o2_ppm[coolSimStep]} ppm</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Fase Cinética</div>
            <div className="text-sm font-bold text-amber-400 mt-1">{coolData.phases[coolSimStep]}</div>
          </div>
        </div>

        {/* Trajectory Timeline Bar */}
        <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-red-500 via-amber-500 to-sky-500 h-full transition-all duration-100"
            style={{ width: `${(coolSimStep / (coolData.times.length - 1)) * 100}%` }}
          />
        </div>

        <div className="mt-4 p-3 rounded bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
          <b>Riesgo Operacional Crítico:</b> Durante la fase de Llama Fría (t = 12s a 45s), los detectores fotoeléctricos registran nivel cero de humo. Si la tripulación restablece la ventilación de cabina, la reacción se reenciende como fuego caliente destructivo.
        </div>
      </div>

    </div>
  );
}
