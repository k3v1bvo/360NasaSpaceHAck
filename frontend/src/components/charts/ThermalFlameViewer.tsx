import React, { useState, useEffect, useRef } from 'react';
import { Layers, Flame, Eye, Thermometer, Info } from 'lucide-react';

interface ThermalFlameViewerProps {
  flowVelocity: number;
  diameter: number;
  material: string;
}

export const ThermalFlameViewer: React.FC<ThermalFlameViewerProps> = ({
  flowVelocity,
  diameter,
  material,
}) => {
  const [activeLayer, setActiveLayer] = useState<'thermal' | 'species' | 'soot'>('thermal');
  const [hoveredRadius, setHoveredRadius] = useState<number | null>(null);

  const canvas1gRef = useRef<HTMLCanvasElement | null>(null);
  const canvas0gRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // -------------------------------------------------------------
    // Canvas 1-g: Convective Buoyant Teardrop
    // -------------------------------------------------------------
    const ctx1g = canvas1gRef.current?.getContext('2d');
    if (ctx1g) {
      const w = 280;
      const h = 230;
      ctx1g.clearRect(0, 0, w, h);
      ctx1g.fillStyle = '#050811';
      ctx1g.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h * 0.72;
      const fuelR = Math.max(5, Math.min(10, diameter * 1.6));

      // Combustible sólido / gota
      ctx1g.fillStyle = '#475569';
      ctx1g.beginPath();
      ctx1g.arc(cx, cy, fuelR, 0, Math.PI * 2);
      ctx1g.fill();

      if (activeLayer === 'thermal') {
        // Isotermas térmicas alargadas por flotabilidad boyante
        const plumeH = 110;

        // Isoterma 800 K (Exterior)
        ctx1g.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        ctx1g.lineWidth = 2;
        ctx1g.beginPath();
        ctx1g.ellipse(cx, cy - plumeH * 0.35, 42, plumeH * 0.65, 0, 0, Math.PI * 2);
        ctx1g.stroke();

        // Isoterma 1200 K (Media)
        ctx1g.strokeStyle = 'rgba(245, 158, 11, 0.7)';
        ctx1g.lineWidth = 2;
        ctx1g.beginPath();
        ctx1g.ellipse(cx, cy - plumeH * 0.38, 28, plumeH * 0.5, 0, 0, Math.PI * 2);
        ctx1g.stroke();

        // Llama amarilla central (1600 K - incandescencia de hollín)
        const grad1g = ctx1g.createLinearGradient(cx, cy, cx, cy - plumeH);
        grad1g.addColorStop(0, 'rgba(56, 189, 248, 0.85)'); // base azul
        grad1g.addColorStop(0.3, 'rgba(245, 158, 11, 0.9)'); // zona amarilla
        grad1g.addColorStop(0.8, 'rgba(239, 68, 68, 0.85)'); // punta naranja
        grad1g.addColorStop(1, 'rgba(239, 68, 68, 0)');

        ctx1g.fillStyle = grad1g;
        ctx1g.beginPath();
        ctx1g.moveTo(cx - 20, cy);
        ctx1g.quadraticCurveTo(cx - 24, cy - plumeH * 0.45, cx, cy - plumeH);
        ctx1g.quadraticCurveTo(cx + 24, cy - plumeH * 0.45, cx + 20, cy);
        ctx1g.closePath();
        ctx1g.fill();
      } else if (activeLayer === 'species') {
        // En 1-g el flujo convectivo arrastra CO2 y humo hacia arriba rápidamente
        const plumeH = 100;
        ctx1g.strokeStyle = 'rgba(148, 163, 184, 0.3)';
        ctx1g.lineWidth = 1.5;
        ctx1g.setLineDash([4, 4]);
        ctx1g.beginPath();
        ctx1g.ellipse(cx, cy - plumeH * 0.4, 38, plumeH * 0.6, 0, 0, Math.PI * 2);
        ctx1g.stroke();
        ctx1g.setLineDash([]);

        ctx1g.font = '10px JetBrains Mono';
        ctx1g.fillStyle = '#94a3b8';
        ctx1g.fillText('Pluma boyante de CO2 / Humo', cx - 70, cy - plumeH - 8);
      } else {
        // Hollín en 1-g: transportado hacia arriba por boyamiento (flama amarilla con humo)
        ctx1g.fillStyle = 'rgba(245, 158, 11, 0.7)';
        for (let i = 0; i < 16; i++) {
          const px = cx + (Math.random() - 0.5) * 20;
          const py = cy - 20 - Math.random() * 80;
          ctx1g.beginPath();
          ctx1g.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx1g.fill();
        }
      }

      ctx1g.font = '11px JetBrains Mono';
      ctx1g.fillStyle = '#e2e8f0';
      ctx1g.fillText('1-g Terrestre (Convección Boyante)', 12, 22);
    }

    // -------------------------------------------------------------
    // Canvas 0-g: Pure Spherical Diffusion in Microgravity
    // -------------------------------------------------------------
    const ctx0g = canvas0gRef.current?.getContext('2d');
    if (ctx0g) {
      const w = 280;
      const h = 230;
      ctx0g.clearRect(0, 0, w, h);
      ctx0g.fillStyle = '#050811';
      ctx0g.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const fuelR = Math.max(5, Math.min(10, diameter * 1.6));
      const flameR = 56;
      const sootR = flameR * 0.72;

      // Combustible sólido central
      ctx0g.fillStyle = '#475569';
      ctx0g.beginPath();
      ctx0g.arc(cx, cy, fuelR, 0, Math.PI * 2);
      ctx0g.fill();

      if (activeLayer === 'thermal') {
        // Isotermas térmicas esféricas (conducción pura T ~ 1/r)
        // 1600 K (Frente de Reacción Azul)
        const gradFlame = ctx0g.createRadialGradient(cx, cy, fuelR + 2, cx, cy, flameR);
        gradFlame.addColorStop(0, 'rgba(14, 165, 233, 0.2)');
        gradFlame.addColorStop(0.7, 'rgba(56, 189, 248, 0.75)');
        gradFlame.addColorStop(0.95, 'rgba(2, 132, 199, 0.95)');
        gradFlame.addColorStop(1, 'rgba(2, 132, 199, 0)');

        ctx0g.fillStyle = gradFlame;
        ctx0g.beginPath();
        ctx0g.arc(cx, cy, flameR, 0, Math.PI * 2);
        ctx0g.fill();

        // Isoterma 800 K (Zona de Pirólisis)
        ctx0g.strokeStyle = 'rgba(245, 158, 11, 0.6)';
        ctx0g.lineWidth = 1.8;
        ctx0g.beginPath();
        ctx0g.arc(cx, cy, sootR, 0, Math.PI * 2);
        ctx0g.stroke();

        // Isoterma 500 K (Disipación exterior)
        ctx0g.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        ctx0g.lineWidth = 1.2;
        ctx0g.setLineDash([3, 3]);
        ctx0g.beginPath();
        ctx0g.arc(cx, cy, flameR * 1.35, 0, Math.PI * 2);
        ctx0g.stroke();
        ctx0g.setLineDash([]);
      } else if (activeLayer === 'species') {
        // Gradiente concéntrico de especies
        // O2 fluye hacia adentro (difusión pura)
        ctx0g.strokeStyle = 'rgba(56, 189, 248, 0.5)';
        ctx0g.lineWidth = 2;
        ctx0g.setLineDash([4, 4]);
        ctx0g.beginPath();
        ctx0g.arc(cx, cy, flameR * 1.4, 0, Math.PI * 2);
        ctx0g.stroke();
        ctx0g.setLineDash([]);

        // Flechas indicando flujo difusivo hacia el frente
        ctx0g.font = '10px JetBrains Mono';
        ctx0g.fillStyle = '#38bdf8';
        ctx0g.fillText('Difusión de O2 hacia el núcleo', cx - 75, cy - flameR * 1.45);

        // CO2 concentrado alrededor
        ctx0g.fillStyle = 'rgba(100, 116, 139, 0.2)';
        ctx0g.beginPath();
        ctx0g.arc(cx, cy, flameR, 0, Math.PI * 2);
        ctx0g.fill();
      } else {
        // Envoltura de Hollín (Soot Shell)
        // Partículas suspendidas en el equilibrio v_stefan + v_thermo = 0
        ctx0g.strokeStyle = '#f59e0b';
        ctx0g.lineWidth = 3.5;
        ctx0g.beginPath();
        ctx0g.arc(cx, cy, sootR, 0, Math.PI * 2);
        ctx0g.stroke();

        // Halo de radiación disipada
        const gradRad = ctx0g.createRadialGradient(cx, cy, sootR - 8, cx, cy, sootR + 12);
        gradRad.addColorStop(0, 'rgba(245, 158, 11, 0)');
        gradRad.addColorStop(0.5, 'rgba(245, 158, 11, 0.35)');
        gradRad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx0g.fillStyle = gradRad;
        ctx0g.beginPath();
        ctx0g.arc(cx, cy, sootR + 12, 0, Math.PI * 2);
        ctx0g.fill();

        ctx0g.font = '10px JetBrains Mono';
        ctx0g.fillStyle = '#fbbf24';
        ctx0g.fillText('Soot Shell: v_stefan + v_thermo = 0', cx - 95, cy + sootR + 18);
      }

      // Highlight de radio interactivo
      if (hoveredRadius !== null) {
        ctx0g.strokeStyle = '#ffffff';
        ctx0g.lineWidth = 1.5;
        ctx0g.setLineDash([2, 2]);
        ctx0g.beginPath();
        ctx0g.arc(cx, cy, hoveredRadius * 2.8, 0, Math.PI * 2);
        ctx0g.stroke();
        ctx0g.setLineDash([]);
      }

      ctx0g.font = '11px JetBrains Mono';
      ctx0g.fillStyle = '#38bdf8';
      ctx0g.fillText('0-g Microgravedad (Difusión Esférica Pura)', 12, 22);
    }
  }, [flowVelocity, diameter, activeLayer, hoveredRadius]);

  // Perfil Radial de Temperatura T(r) en Kelvin desde el centro r=0 hasta r=30 mm
  const radialPoints: Array<{ r: number; t0g: number; t1g: number }> = [];
  for (let r = 2; r <= 28; r += 1) {
    // 0-g perfil esférico con pico en el frente de llama (r ~ 14 mm)
    let t0g = 300;
    if (r < 6) t0g = 650; // sólido en pirólisis
    else if (r <= 15) t0g = 650 + (1550 - 650) * Math.sin(((r - 6) / 9) * (Math.PI / 2));
    else t0g = 300 + (1550 - 300) * (15 / r); // decaimiento difusivo 1/r

    // 1-g perfil axial convectivo
    let t1g = 300;
    if (r < 6) t1g = 700;
    else if (r <= 12) t1g = 700 + (1700 - 700) * Math.sin(((r - 6) / 6) * (Math.PI / 2));
    else t1g = 300 + (1700 - 300) * Math.exp(-(r - 12) / 6); // caída abrupta radial en 1g

    radialPoints.push({ r, t0g: Math.round(t0g), t1g: Math.round(t1g) });
  }

  return (
    <div className="card-aerospace p-6 sm:p-8 shadow-xl">
      {/* Header and Layer Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2.5">
            <Flame className="w-5 h-5 text-amber-400" />
            <span>Morfología y Diagnóstico Térmico Radial (1-g vs 0-g)</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Inspecciona cómo la ausencia de flotabilidad boyante ($g=0$) transforma la física del frente de combustión.
          </p>
        </div>

        {/* Layer Selector */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs font-mono">
          <button
            onClick={() => setActiveLayer('thermal')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 transition-all ${
              activeLayer === 'thermal'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span>Isotermas Térmicas</span>
          </button>
          <button
            onClick={() => setActiveLayer('soot')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 transition-all ${
              activeLayer === 'soot'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Soot Shell (Hollín)</span>
          </button>
          <button
            onClick={() => setActiveLayer('species')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 transition-all ${
              activeLayer === 'species'
                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Especies O2/CO2</span>
          </button>
        </div>
      </div>

      {/* Visual Canvas Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center justify-center">
        {/* 1g Canvas */}
        <div className="flex flex-col items-center">
          <div className="border border-slate-800 rounded-2xl overflow-hidden shadow-2xl bg-slate-950 w-full max-w-[300px]">
            <canvas ref={canvas1gRef} width={280} height={230} className="w-full h-auto" />
          </div>
          <div className="mt-2 text-xs text-slate-400 text-center font-mono">
            Tiro térmico natural vertical: <span className="text-rose-400 font-bold">~1.5 m/s boyante</span>
          </div>
        </div>

        {/* 0g Canvas */}
        <div className="flex flex-col items-center">
          <div className="border border-sky-900/40 rounded-2xl overflow-hidden shadow-2xl bg-slate-950 w-full max-w-[300px] ring-1 ring-sky-500/30">
            <canvas ref={canvas0gRef} width={280} height={230} className="w-full h-auto" />
          </div>
          <div className="mt-2 text-xs text-slate-400 text-center font-mono">
            Simetría esférica por difusión: <span className="text-sky-400 font-bold">Sin convección boyante</span>
          </div>
        </div>
      </div>

      {/* Interactive Radial Temperature Profile T(r) */}
      <div className="mt-8 pt-6 border-t border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Thermometer className="w-4 h-4 text-sky-400" />
            <span className="text-sm font-bold text-slate-200 font-mono">
              Perfil de Temperatura Radial T(r) [Kelvin vs Radio mm]
            </span>
          </div>
          <div className="flex items-center space-x-4 text-xs font-mono">
            <div className="flex items-center space-x-1.5 text-sky-400">
              <span className="w-3 h-0.5 bg-sky-400 inline-block" />
              <span>0-g Difusión Pura</span>
            </div>
            <div className="flex items-center space-x-1.5 text-rose-400">
              <span className="w-3 h-0.5 bg-rose-400 inline-block" />
              <span>1-g Terrestre</span>
            </div>
          </div>
        </div>

        {/* SVG Radial Chart */}
        <div className="w-full h-36 bg-slate-950/80 border border-slate-800/80 rounded-xl p-2 relative">
          <svg viewBox="0 0 500 110" className="w-full h-full">
            {/* Grid Lines */}
            {[400, 800, 1200, 1600].map((temp) => {
              const y = 95 - ((temp - 300) / 1400) * 85;
              return (
                <g key={`tgrid-${temp}`}>
                  <line x1="40" y1={y} x2="480" y2={y} stroke="#1e293b" strokeDasharray="3 3" />
                  <text x="32" y={y + 3} fill="#64748b" fontSize="8" fontFamily="JetBrains Mono" textAnchor="end">
                    {temp}K
                  </text>
                </g>
              );
            })}

            {/* Curva 1-g (Roja) */}
            <path
              d={radialPoints.reduce((acc, pt, i) => {
                const x = 40 + ((pt.r - 2) / 26) * 440;
                const y = 95 - ((pt.t1g - 300) / 1400) * 85;
                return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
              }, '')}
              fill="none"
              stroke="#f43f5e"
              strokeWidth="2"
              strokeDasharray="4 2"
            />

            {/* Curva 0-g (Azul brillante) */}
            <path
              d={radialPoints.reduce((acc, pt, i) => {
                const x = 40 + ((pt.r - 2) / 26) * 440;
                const y = 95 - ((pt.t0g - 300) / 1400) * 85;
                return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
              }, '')}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.8"
            />

            {/* Indicador de Frente de Llama */}
            <line x1={40 + ((15 - 2) / 26) * 440} y1="10" x2={40 + ((15 - 2) / 26) * 440} y2="95" stroke="#38bdf8" strokeDasharray="2 2" />
            <text x={40 + ((15 - 2) / 26) * 440 + 4} y="22" fill="#38bdf8" fontSize="8" fontFamily="JetBrains Mono">
              Frente 0-g (1550 K)
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
};
