import React, { useState, useRef } from 'react';
import { calculateFlameSpread } from '../../physics/flameKinetics';
import { AtmospherePreset, MaterialKey } from '../../types';
import { Activity, Wind, Zap } from 'lucide-react';

interface FlameSpreadChartProps {
  flowVelocity: number;
  diameter: number;
  material: MaterialKey;
  currentAtm: AtmospherePreset;
  vf: number;
  onSelectVelocity?: (v: number) => void;
}

export const FlameSpreadChart: React.FC<FlameSpreadChartProps> = ({
  flowVelocity,
  diameter,
  material,
  currentAtm,
  vf,
  onSelectVelocity,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{ v: number; rate: number; regime: string } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Generar puntos de la curva no monótona (0.05 a 15 cm/s)
  const points: Array<{ v: number; rate: number; regime: string }> = [];
  for (let v = 0.05; v <= 15; v += 0.2) {
    const rate = calculateFlameSpread(v, diameter, material as MaterialKey, currentAtm.P_atm, currentAtm.O2_percent / 100.0);
    let regime = 'Convección Forzada';
    if (v < 0.4) regime = 'Extinción Radiativa (Soot Quenching)';
    else if (v <= 5.0) regime = 'Meseta Crítica HVAC de Cabina';
    else if (v >= 12.0) regime = 'Extinción por Blowoff (Soplado)';

    points.push({ v, rate, regime });
  }

  const maxRate = Math.max(...points.map((p) => p.rate), 3.5);
  const chartW = 540;
  const chartH = 220;
  const padL = 50;
  const padR = 25;
  const padT = 30;
  const padB = 40;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  const toSvgX = (v: number) => padL + (v / 15) * plotW;
  const toSvgY = (rate: number) => padT + plotH - (rate / maxRate) * plotH;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const relativeX = (clientX / rect.width) * chartW;
    const clampedX = Math.max(padL, Math.min(chartW - padR, relativeX));
    const targetV = Math.max(0.05, Math.min(15, ((clampedX - padL) / plotW) * 15));

    // Buscar punto más cercano
    const closest = points.reduce((prev, curr) =>
      Math.abs(curr.v - targetV) < Math.abs(prev.v - targetV) ? curr : prev
    );
    setHoveredPoint(closest);
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  const handleClick = () => {
    if (hoveredPoint && onSelectVelocity) {
      onSelectVelocity(Number(hoveredPoint.v.toFixed(2)));
    }
  };

  // Coordenadas del punto actual de operación
  const currentX = toSvgX(flowVelocity);
  const currentY = toSvgY(vf);

  return (
    <div className="card-aerospace p-6 sm:p-8 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2.5">
            <Wind className="w-5 h-5 text-sky-400" />
            <span>Curva de Propagación de Llama No-Monótona (Vf vs Vg)</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Respuesta a la velocidad de flujo forzado en microgravedad con zonas de peligro y auto-extinción.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>Interactivo: Pasa el cursor o haz clic para ajustar</span>
        </div>
      </div>

      {/* SVG Container */}
      <div className="relative w-full overflow-hidden bg-slate-950/90 border border-slate-800/80 rounded-xl p-2 select-none shadow-inner">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${chartW} ${chartH}`}
          className="w-full h-64 cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        >
          <defs>
            <linearGradient id="curveGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="30%" stopColor="#f43f5e" />
              <stop offset="60%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#2dd4bf" />
            </linearGradient>

            <pattern id="hvacStripe" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(244, 63, 94, 0.25)" strokeWidth="3" />
            </pattern>
          </defs>

          {/* Zona 1: Extinción Radiativa (< 0.4 cm/s) */}
          <rect
            x={toSvgX(0)}
            y={padT}
            width={toSvgX(0.4) - toSvgX(0)}
            height={plotH}
            fill="rgba(56, 189, 248, 0.08)"
          />
          <text
            x={toSvgX(0.08)}
            y={padT + 16}
            fill="#38bdf8"
            fontSize="9"
            fontFamily="JetBrains Mono"
            className="select-none font-semibold"
          >
            EXTINCIÓN RAD.
          </text>

          {/* Zona 2: Meseta Crítica HVAC (0.4 - 5.0 cm/s) */}
          <rect
            x={toSvgX(0.4)}
            y={padT}
            width={toSvgX(5.0) - toSvgX(0.4)}
            height={plotH}
            fill="url(#hvacStripe)"
          />
          <rect
            x={toSvgX(0.4)}
            y={padT}
            width={toSvgX(5.0) - toSvgX(0.4)}
            height={plotH}
            fill="rgba(244, 63, 94, 0.08)"
          />
          <text
            x={toSvgX(0.6)}
            y={padT + 16}
            fill="#f43f5e"
            fontSize="10"
            fontFamily="JetBrains Mono"
            fontWeight="bold"
            className="select-none"
          >
            ⚠️ RANGO CRÍTICO HVAC (0.4 - 5.0 cm/s)
          </text>

          {/* Zona 3: Extinción por Blowoff (> 12 cm/s) */}
          <rect
            x={toSvgX(12.0)}
            y={padT}
            width={toSvgX(15) - toSvgX(12.0)}
            height={plotH}
            fill="rgba(45, 212, 191, 0.07)"
          />
          <text
            x={toSvgX(12.2)}
            y={padT + 16}
            fill="#2dd4bf"
            fontSize="9"
            fontFamily="JetBrains Mono"
            className="select-none font-semibold"
          >
            BLOWOFF
          </text>

          {/* Líneas de rejilla horizontales y verticales */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = padT + plotH - pct * plotH;
            const val = (pct * maxRate).toFixed(1);
            return (
              <g key={`gy-${i}`}>
                <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="#1e293b" strokeDasharray="3 3" />
                <text x={padL - 8} y={y + 4} fill="#64748b" fontSize="9" fontFamily="JetBrains Mono" textAnchor="end">
                  {val}
                </text>
              </g>
            );
          })}

          {[0, 3, 6, 9, 12, 15].map((v) => {
            const x = toSvgX(v);
            return (
              <g key={`gx-${v}`}>
                <line x1={x} y1={padT} x2={x} y2={padT + plotH} stroke="#1e293b" strokeDasharray="3 3" />
                <text x={x} y={chartH - 12} fill="#64748b" fontSize="10" fontFamily="JetBrains Mono" textAnchor="middle">
                  {v}
                </text>
              </g>
            );
          })}

          {/* Ejes principales */}
          <line x1={padL} y1={padT + plotH} x2={chartW - padR} y2={padT + plotH} stroke="#475569" strokeWidth="1.5" />
          <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="#475569" strokeWidth="1.5" />

          {/* Rótulos de ejes */}
          <text
            x={chartW / 2}
            y={chartH - 2}
            fill="#94a3b8"
            fontSize="10"
            fontFamily="JetBrains Mono"
            textAnchor="middle"
            fontWeight="bold"
          >
            Velocidad de Flujo de Gas Convectivo Vg (cm/s)
          </text>
          <text
            x={-(padT + plotH / 2)}
            y={14}
            transform="rotate(-90)"
            fill="#94a3b8"
            fontSize="10"
            fontFamily="JetBrains Mono"
            textAnchor="middle"
            fontWeight="bold"
          >
            Vf Propagación (mm/s)
          </text>

          {/* Trazo de la curva no monótona */}
          <path
            d={points.reduce((acc, pt, i) => {
              const x = toSvgX(pt.v);
              const y = toSvgY(pt.rate);
              return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
            }, '')}
            fill="none"
            stroke="url(#curveGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Línea vertical guía del punto operativo actual */}
          <line
            x1={currentX}
            y1={padT}
            x2={currentX}
            y2={padT + plotH}
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className="opacity-70"
          />

          {/* Punto de Operación Actual (animado) */}
          <circle cx={currentX} cy={currentY} r={10} fill="none" stroke="#38bdf8" strokeWidth="2" className="animate-ping" opacity="0.6" />
          <circle cx={currentX} cy={currentY} r={6.5} fill="#0ea5e9" stroke="#ffffff" strokeWidth="2.5" />

          {/* Etiqueta del Punto de Operación */}
          <g transform={`translate(${Math.min(currentX + 10, chartW - 130)}, ${Math.max(currentY - 28, padT + 10)})`}>
            <rect width="115" height="24" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.2" opacity="0.95" />
            <text x="6" y="16" fill="#38bdf8" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">
              OP: {flowVelocity.toFixed(1)} cm/s | {vf.toFixed(2)} mm/s
            </text>
          </g>

          {/* Scrubber / Hover Interactivo */}
          {hoveredPoint && (
            <g>
              <line
                x1={toSvgX(hoveredPoint.v)}
                y1={padT}
                x2={toSvgX(hoveredPoint.v)}
                y2={padT + plotH}
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <circle
                cx={toSvgX(hoveredPoint.v)}
                cy={toSvgY(hoveredPoint.rate)}
                r={5}
                fill="#f59e0b"
                stroke="#fff"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {/* Floating Tooltip cuando el usuario pasa el cursor */}
        {hoveredPoint && (
          <div className="absolute top-4 right-4 pointer-events-none bg-slate-900/95 border border-amber-500/60 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs font-mono z-20">
            <div className="flex items-center space-x-1.5 text-amber-400 font-bold mb-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Inspección de Flujo</span>
            </div>
            <div className="text-slate-200">
              Flujo Aire: <span className="font-bold text-white">{hoveredPoint.v.toFixed(2)} cm/s</span>
            </div>
            <div className="text-slate-200">
              Tasa Llama: <span className="font-bold text-sky-400">{hoveredPoint.rate.toFixed(2)} mm/s</span>
            </div>
            <div className="mt-1 pt-1 border-t border-slate-800 text-[11px] text-amber-300/90 font-sans">
              {hoveredPoint.regime}
            </div>
          </div>
        )}
      </div>

      {/* Leyenda de Regímenes Físicos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
        <div className="flex items-start space-x-2.5 p-2.5 rounded-lg bg-sky-950/20 border border-sky-900/30">
          <div className="w-3 h-3 rounded-full bg-sky-400 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold text-sky-300 font-mono">1. Quiescente (&lt; 0.4 cm/s)</span>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Sin tiro de aire; el hollín queda atrapado disipando calor por radiación y auto-extinguiendo la llama.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-2.5 p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/30">
          <div className="w-3 h-3 rounded-full bg-rose-500 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold text-rose-300 font-mono">2. Meseta Crítica (0.4 - 5 cm/s)</span>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Velocidad exacta de recirculación HVAC de cabina. Suministra $O_2$ óptimo sin enfriar la base: máxima aceleración.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-2.5 p-2.5 rounded-lg bg-teal-950/20 border border-teal-900/30">
          <div className="w-3 h-3 rounded-full bg-teal-400 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold text-teal-300 font-mono">3. Soplado (&gt; 12 cm/s)</span>
            <p className="text-slate-400 text-[11px] mt-0.5">
              El tiempo de residencia químico se vuelve insuficiente; el gas enfría la zona de reacción hasta el apagado por blowoff.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
