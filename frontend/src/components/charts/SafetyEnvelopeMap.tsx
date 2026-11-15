import React from 'react';
import { AtmospherePreset } from '../../types';
import { Compass, ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface SafetyEnvelopeMapProps {
  currentAtm: AtmospherePreset;
  flowVelocity: number;
  material: string;
}

export const SafetyEnvelopeMap: React.FC<SafetyEnvelopeMapProps> = ({
  currentAtm,
  flowVelocity,
  material,
}) => {
  // Dimensiones del diagrama de fases 2D (% O2 en Y de 10% a 40%, Vg en X de 0 a 12 cm/s)
  const chartW = 540;
  const chartH = 260;
  const padL = 55;
  const padR = 25;
  const padT = 30;
  const padB = 40;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  const toSvgX = (v: number) => padL + (v / 12) * plotW;
  const toSvgY = (o2: number) => padT + plotH - ((o2 - 12) / (38 - 12)) * plotH;

  // Límite de Auto-extinción (LOI Boundary Curve según NASA-STD-6001 y BASS)
  // En microgravedad a bajo flujo (< 0.5 cm/s) el LOI aumenta drásticamente (difícil quemar por falta de O2)
  // A flujo crítico (1-4 cm/s) el LOI baja a su mínimo (máximo peligro)
  // A flujos altos (> 8 cm/s) el LOI vuelve a subir por enfriamiento
  const boundaryPoints: Array<{ v: number; o2Limit: number }> = [
    { v: 0.1, o2Limit: 28 },
    { v: 0.3, o2Limit: 23 },
    { v: 0.6, o2Limit: 17.5 },
    { v: 1.5, o2Limit: 16.5 },
    { v: 3.0, o2Limit: 16.8 },
    { v: 5.0, o2Limit: 18.2 },
    { v: 7.0, o2Limit: 20.5 },
    { v: 9.0, o2Limit: 24.0 },
    { v: 11.5, o2Limit: 30.0 },
  ];

  // Coordenadas del punto actual de la cabina
  const curX = toSvgX(Math.min(12, Math.max(0, flowVelocity)));
  const curY = toSvgY(Math.min(38, Math.max(12, currentAtm.O2_percent)));

  // Determinar si el punto operativo actual está en zona segura o de riesgo
  // Interpolar el LOI límite para la velocidad actual
  const interpLimit = (() => {
    if (flowVelocity <= 0.3) return 25.0;
    if (flowVelocity <= 1.0) return 17.5;
    if (flowVelocity <= 4.0) return 16.8;
    if (flowVelocity <= 7.0) return 19.5;
    return 26.0;
  })();

  const isSafe = currentAtm.O2_percent < interpLimit || flowVelocity < 0.25;
  const isCriticalHVAC = flowVelocity >= 0.4 && flowVelocity <= 5.0;

  return (
    <div className="card-aerospace p-6 sm:p-8 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2.5">
            <Compass className="w-5 h-5 text-sky-400" />
            <span>Diagrama de Fases: Envolvente de Seguridad de Cabina (O2 vs Flujo)</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Frontera de auto-extinción vs combustión sostenida según norma NASA-STD-6001 y misiones BASS.
          </p>
        </div>

        {/* Safety Badge */}
        <div
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold ${
            isSafe
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-400'
          }`}
        >
          {isSafe ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />}
          <span>{isSafe ? 'ZONA SEGURA / AUTO-EXTINCIÓN' : 'ZONA DE RIESGO: COMBUSTIÓN SOSTENIDA'}</span>
        </div>
      </div>

      {/* SVG Phase Diagram */}
      <div className="relative w-full overflow-hidden bg-slate-950/90 border border-slate-800/80 rounded-xl p-2 select-none shadow-inner">
        <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-72">
          <defs>
            {/* Gradiente para la zona de peligro sostenido (arriba de la curva) */}
            <linearGradient id="dangerZoneGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(244, 63, 94, 0.22)" />
              <stop offset="100%" stopColor="rgba(244, 63, 94, 0.05)" />
            </linearGradient>

            {/* Gradiente para la zona de auto-extinción (abajo de la curva) */}
            <linearGradient id="safeZoneGrad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="rgba(16, 185, 129, 0.18)" />
              <stop offset="100%" stopColor="rgba(16, 185, 129, 0.02)" />
            </linearGradient>
          </defs>

          {/* Área Superior: Peligro de Combustión Sostenida */}
          <polygon
            points={`
              ${padL},${padT}
              ${chartW - padR},${padT}
              ${chartW - padR},${toSvgY(30)}
              ${boundaryPoints.map((p) => `${toSvgX(p.v)},${toSvgY(p.o2Limit)}`).reverse().join(' ')}
              ${padL},${toSvgY(28)}
            `}
            fill="url(#dangerZoneGrad)"
          />

          {/* Área Inferior: Auto-extinción Segura */}
          <polygon
            points={`
              ${padL},${padT + plotH}
              ${chartW - padR},${padT + plotH}
              ${chartW - padR},${toSvgY(30)}
              ${boundaryPoints.map((p) => `${toSvgX(p.v)},${toSvgY(p.o2Limit)}`).reverse().join(' ')}
              ${padL},${toSvgY(28)}
            `}
            fill="url(#safeZoneGrad)"
          />

          {/* Rejilla de O2 (%) */}
          {[15, 20, 25, 30, 35].map((o2) => {
            const y = toSvgY(o2);
            return (
              <g key={`o2grid-${o2}`}>
                <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="#1e293b" strokeDasharray="3 3" />
                <text x={padL - 8} y={y + 4} fill="#64748b" fontSize="9" fontFamily="JetBrains Mono" textAnchor="end">
                  {o2}%
                </text>
              </g>
            );
          })}

          {/* Rejilla de Velocidad Vg (cm/s) */}
          {[0, 2, 4, 6, 8, 10, 12].map((v) => {
            const x = toSvgX(v);
            return (
              <g key={`vgrid-${v}`}>
                <line x1={x} y1={padT} x2={x} y2={padT + plotH} stroke="#1e293b" strokeDasharray="3 3" />
                <text x={x} y={chartH - 14} fill="#64748b" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle">
                  {v}
                </text>
              </g>
            );
          })}

          {/* Ejes principales */}
          <line x1={padL} y1={padT + plotH} x2={chartW - padR} y2={padT + plotH} stroke="#475569" strokeWidth="1.5" />
          <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="#475569" strokeWidth="1.5" />

          {/* Etiquetas de los Ejes */}
          <text
            x={chartW / 2}
            y={chartH - 2}
            fill="#94a3b8"
            fontSize="10"
            fontFamily="JetBrains Mono"
            textAnchor="middle"
            fontWeight="bold"
          >
            Velocidad de Flujo Forzado HVAC (cm/s)
          </text>
          <text
            x={-(padT + plotH / 2)}
            y={16}
            transform="rotate(-90)"
            fill="#94a3b8"
            fontSize="10"
            fontFamily="JetBrains Mono"
            textAnchor="middle"
            fontWeight="bold"
          >
            Concentración de Oxígeno % O2
          </text>

          {/* Trazo del Límite de Inflamabilidad (Frontera LOI) */}
          <path
            d={boundaryPoints.reduce((acc, pt, i) => {
              const x = toSvgX(pt.v);
              const y = toSvgY(pt.o2Limit);
              return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
            }, '')}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3"
            strokeDasharray="6 3"
          />

          {/* Textos dentro de las zonas */}
          <text x={chartW - padR - 10} y={padT + 30} fill="#f43f5e" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="end">
            ZONA DE PROPAGACIÓN SOSTENIDA (ALTO RIESGO)
          </text>
          <text x={chartW - padR - 10} y={padT + plotH - 18} fill="#10b981" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="end">
            ZONA DE AUTO-EXTINCIÓN SEGURA (NASA-STD-6001)
          </text>

          {/* Puntos de Referencia de Naves Reales */}
          {/* ISS Standard (21% O2, 2.5 cm/s) */}
          <circle cx={toSvgX(2.5)} cy={toSvgY(21)} r={4.5} fill="#38bdf8" stroke="#0f172a" strokeWidth="1.5" />
          <text x={toSvgX(2.5) + 6} y={toSvgY(21) - 4} fill="#38bdf8" fontSize="8" fontFamily="JetBrains Mono">
            ISS Nominal (21% O2)
          </text>

          {/* Orion EVA Prep (34% O2, 2.0 cm/s) */}
          <circle cx={toSvgX(2.0)} cy={toSvgY(34)} r={4.5} fill="#f43f5e" stroke="#0f172a" strokeWidth="1.5" />
          <text x={toSvgX(2.0) + 6} y={toSvgY(34) - 4} fill="#f43f5e" fontSize="8" fontFamily="JetBrains Mono">
            Orion EVA (34% O2)
          </text>

          {/* Lunar Habitat (30% O2, 3.0 cm/s) */}
          <circle cx={toSvgX(3.0)} cy={toSvgY(30)} r={4.5} fill="#fbbf24" stroke="#0f172a" strokeWidth="1.5" />
          <text x={toSvgX(3.0) + 6} y={toSvgY(30) - 4} fill="#fbbf24" fontSize="8" fontFamily="JetBrains Mono">
            Lunar Base (30% O2)
          </text>

          {/* Punto Operativo Actual de la Cabina */}
          <circle cx={curX} cy={curY} r={12} fill="none" stroke={isSafe ? '#10b981' : '#f43f5e'} strokeWidth="2.5" className="animate-ping" opacity="0.6" />
          <circle cx={curX} cy={curY} r={7} fill={isSafe ? '#10b981' : '#f43f5e'} stroke="#ffffff" strokeWidth="2" />

          {/* Rótulo Flotante del Punto Actual */}
          <g transform={`translate(${Math.min(curX + 12, chartW - 165)}, ${Math.max(curY - 32, padT + 10)})`}>
            <rect width="155" height="26" rx="5" fill="#0f172a" stroke={isSafe ? '#10b981' : '#f43f5e'} strokeWidth="1.5" opacity="0.95" />
            <text x="7" y="17" fill="#ffffff" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">
              ESTADO ACTUAL: {currentAtm.O2_percent}% O2 | {flowVelocity.toFixed(1)} cm/s
            </text>
          </g>
        </svg>
      </div>

      {/* Explicación Técnica Resumida */}
      <div className="mt-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start space-x-3">
        <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${isSafe ? 'text-emerald-400' : 'text-amber-400'}`} />
        <div className="leading-relaxed">
          <span className="font-bold text-slate-100 font-mono">Regla Operacional para Tripulación: </span>
          {isSafe
            ? 'En esta condición la tasa de disipación radiativa o la baja concentración de oxígeno superan la liberación de calor químico. Cualquier llama accidental tenderá a auto-extinguirse.'
            : isCriticalHVAC
            ? 'PELIGRO: El sistema HVAC está dentro del rango de flujo forzado de 0.4 a 5 cm/s combinando suministro continuo de O2 con convección lenta sin enfriamiento, maximizando la velocidad de propagación. Protocolo recomendado: Detención inmediata de ventilación HVAC.'
            : 'PRECAUCIÓN: Atmósfera rica en oxígeno. Reducir la velocidad de flujo o despresurizar para llevar el punto a la zona de auto-extinción.'}
        </div>
      </div>
    </div>
  );
};
