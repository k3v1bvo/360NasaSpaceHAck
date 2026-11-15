import React, { useState } from 'react';
import { 
  X, 
  TrendingUp, 
  Calendar, 
  Flame, 
  Wind, 
  Thermometer, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  BarChart3, 
  Clock, 
  MapPin, 
  ArrowUpRight,
  ChevronRight,
  Layers,
  Info,
  BookOpen,
  ExternalLink,
  Database
} from 'lucide-react';
import temporalData from '../data/temporal_trends_data.json';

export default function TemporalTrendModal({ isOpen, onClose, initialTab = 'seasonality' }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'seasonality' | 'fires' | 'air_quality' | 'decadal' | 'protection'
  const [hoveredMonth, setHoveredMonth] = useState(null);
  const [hoveredPm25Month, setHoveredPm25Month] = useState(null);
  const [hoveredDistrict, setHoveredDistrict] = useState(null);

  if (!isOpen) return null;

  const {
    incendios_historicos_anuales,
    ciclo_estacional_mensual,
    tendencias_decadales_distritos,
    matriz_alerta_proteccion
  } = temporalData;

  const maxFocosYear = Math.max(...incendios_historicos_anuales.map(y => y.total_focos));
  const maxFocosMonth = Math.max(...ciclo_estacional_mensual.map(m => m.incendios_promedio));
  const maxPM25Month = Math.max(...ciclo_estacional_mensual.map(m => m.pm25_promedio_ugm3));

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-6xl rounded-2xl sm:rounded-3xl border border-white/15 bg-[#0a0f1d] text-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 sm:px-6 py-3 sm:py-3.5 bg-gradient-to-r from-blue-950/60 via-[#0e1628] to-purple-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 shadow-inner">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-cyan-400 font-mono">
                  NASA Trend Detective
                </span>
                <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-purple-300 border border-purple-400/30">
                  Análisis Temporal & Predicción IA
                </span>
              </div>
              <h2 className="text-sm sm:text-base md:text-lg font-black tracking-tight text-white">
                Tendencias Históricas y Pronóstico de Protección Territorial
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-neutral-800 hover:text-white transition"
            title="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Barra de Pestañas Interactivas (Segmented Grid: Cero desbordes ni texto cortado) */}
        <div className="border-b border-white/10 p-2 sm:px-4 sm:py-2.5 bg-[#070b14] shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1 sm:gap-1.5">
            {[
              { id: 'seasonality', label: 'Ciclo Estacional', sub: 'Mes a Mes', icon: Calendar },
              { id: 'fires', label: 'Incendios Anuales', sub: '2020-2026', icon: Flame },
              { id: 'air_quality', label: 'Inversión & PM2.5', sub: 'Red MÓNICA', icon: Wind },
              { id: 'decadal', label: 'Tendencias LST', sub: 'Mann-Kendall', icon: Thermometer },
              { id: 'protection', label: 'Predicciones & Alerta', sub: 'Pronóstico de Impacto', icon: ShieldAlert },
              { id: 'sources', label: 'Recursos NASA', sub: '14 Fuentes', icon: BookOpen },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center sm:flex-col justify-center gap-1.5 sm:gap-0.5 rounded-xl px-2 py-1.5 sm:py-2 text-center transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 ring-1 ring-blue-400/60 font-black'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 font-semibold'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="text-xs truncate">{tab.label}</span>
                  </div>
                  <span className={`hidden sm:inline text-[10px] font-mono leading-none ${isActive ? 'text-blue-200' : 'text-slate-500'}`}>
                    {tab.sub}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Contenido Principal con Scroll Suave */}
        <div className="flex-1 overflow-y-auto custom-modal-scroll p-3.5 sm:p-5 space-y-4 sm:space-y-5">

          {/* ========================================================================= */}
          {/* PESTAÑA 1: CICLO ESTACIONAL MES A MES                                      */}
          {/* ========================================================================= */}
          {activeTab === 'seasonality' && (
            <div className="space-y-3.5 sm:space-y-4 animate-in fade-in duration-200">
              {/* Alerta de Contexto Físico */}
              <div className="rounded-xl border border-blue-500/25 bg-blue-950/25 p-2.5 sm:p-3 text-xs text-blue-200 flex items-start gap-2.5">
                <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-[11.5px] leading-relaxed">
                  <span className="text-white font-bold">Patrón Estacional del Valle (NASA & GAMC): </span>
                  <span className="text-slate-300">
                    <strong className="text-red-300">Agosto y Septiembre concentran el 79.8% de los incendios</strong> por desecación y vientos; mientras que <strong className="text-amber-300">Mayo, Junio y Julio sufren asfixia por Inversión Térmica nocturna</strong> bajo la Cota 2.750 msnm.
                  </span>
                </div>
              </div>

              {/* Gráfica de Barras Interactiva de Incendios por Mes */}
              <div className="rounded-2xl border border-white/10 bg-[#0c1220] p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2.5">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                      <Flame className="h-4 w-4 text-orange-400" /> Distribución Mensual de Incendios en el Tunari (Promedio Histórico)
                    </h3>
                    <p className="text-[11px] text-slate-400">Porcentaje y número de focos detectados por MODIS/VIIRS cada mes</p>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-mono text-cyan-300 bg-cyan-950/70 px-2.5 py-0.5 rounded-md border border-cyan-800/40 w-fit shrink-0">
                    Pico: Agosto-Septiembre (79.8%)
                  </span>
                </div>

                {/* SVG Bar Chart */}
                <div className="relative pt-1 pb-1">
                  <div className="grid grid-cols-12 gap-1 sm:gap-2 h-32 sm:h-40 items-end border-b border-white/15 px-1 pb-1">
                    {ciclo_estacional_mensual.map((m) => {
                      const heightPct = (m.incendios_promedio / maxFocosMonth) * 100;
                      const isPeak = m.mes_num === 8 || m.mes_num === 9;
                      const isHovered = hoveredMonth === m.mes_num;
                      return (
                        <div 
                          key={m.mes_num} 
                          className="flex flex-col items-center h-full justify-end cursor-pointer"
                          onMouseEnter={() => setHoveredMonth(m.mes_num)}
                          onMouseLeave={() => setHoveredMonth(null)}
                        >
                          <span className={`text-[9px] sm:text-[10px] font-mono font-bold mb-0.5 transition ${
                            isPeak ? 'text-red-400 font-black' : isHovered ? 'text-cyan-300 font-bold' : 'text-slate-400'
                          }`}>
                            {m.incendios_promedio}
                          </span>
                          <div 
                            className={`w-full rounded-t-md transition-colors duration-150 ${
                              isPeak 
                                ? 'bg-gradient-to-t from-red-600 via-orange-500 to-amber-400 shadow-md shadow-red-950/60' 
                                : m.mes_num === 6 || m.mes_num === 7
                                ? 'bg-gradient-to-t from-amber-600 to-amber-400'
                                : 'bg-gradient-to-t from-blue-700/60 to-cyan-500/60'
                            } ${isHovered ? 'brightness-125 ring-2 ring-cyan-400 shadow-md shadow-cyan-950/80' : 'opacity-85 hover:opacity-100'}`}
                            style={{ height: `${Math.max(heightPct, 5)}%` }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Etiquetas de Meses */}
                  <div className="grid grid-cols-12 gap-1 sm:gap-2 mt-1 px-1 text-center">
                    {ciclo_estacional_mensual.map((m) => (
                      <div key={m.mes_num} className="text-[10px] font-bold text-slate-400 truncate">
                        {m.mes_nombre.slice(0, 3)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detalle Dinámico con Altura Fija Reservada (Cero Layout-Shift ni Glitch de Parpadeo) */}
                <div className="min-h-[44px] mt-2 flex items-center">
                  {hoveredMonth ? (() => {
                    const m = ciclo_estacional_mensual.find(x => x.mes_num === hoveredMonth);
                    return (
                      <div className="w-full p-2 rounded-xl border border-cyan-500/30 bg-cyan-950/60 text-xs flex items-center justify-between animate-in fade-in">
                        <div>
                          <strong className="text-cyan-300 font-bold">{m.mes_nombre}: {m.temporada}</strong>
                          <p className="text-slate-300 text-[11px] mt-0.5">{m.descripcion}</p>
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <span className="font-mono font-bold text-orange-400 text-xs">{m.incendios_pct}% del año</span>
                          <div className="text-[10px] text-slate-400">PM2.5: {m.pm25_promedio_ugm3} µg/m³ ({m.calidad_aire})</div>
                        </div>
                      </div>
                    );
                  })() : (
                    <div className="w-full p-2 rounded-xl border border-white/5 bg-white/[0.02] text-[11px] text-slate-400 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Info className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                        Pasa el cursor sobre una barra mensual para ver focos, temporada y calidad del aire PM2.5
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 hidden sm:inline">NASA MODIS + VIIRS (2020-2025)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Grid de las 4 Temporadas Clave del Valle (Tarjetas perfectamente dimensionadas) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
                <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-2.5 sm:p-3 flex flex-col justify-between hover:border-red-500/50 transition">
                  <div>
                    <div className="flex items-center gap-1.5 text-red-400 font-black text-[10.5px] uppercase tracking-wider">
                      <Flame className="h-3.5 w-3.5" /> Temporada Incendios
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-white mt-0.5">Agosto — Octubre</div>
                    <p className="text-slate-300 text-[11px] mt-1 leading-snug">
                      Humedad &lt; 15%, vientos de ladera &gt; 35 km/h. Concentra el <strong>79.8% de los focos</strong> de la década.
                    </p>
                  </div>
                  <div className="mt-2 text-[10px] font-mono font-semibold text-red-300 bg-red-950/80 px-2 py-0.5 rounded border border-red-800/60 w-fit">
                    Peligro: D13 y D3
                  </div>
                </div>

                <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-2.5 sm:p-3 flex flex-col justify-between hover:border-amber-500/50 transition">
                  <div>
                    <div className="flex items-center gap-1.5 text-amber-400 font-black text-[10.5px] uppercase tracking-wider">
                      <Wind className="h-3.5 w-3.5" /> Inversión Térmica
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-white mt-0.5">Mayo — Julio</div>
                    <p className="text-slate-300 text-[11px] mt-1 leading-snug">
                      Piscina de aire frío nocturno queda atrapada bajo Cota 2.750. Asfixia en Casco Viejo (PM2.5 &gt; 78 µg/m³).
                    </p>
                  </div>
                  <div className="mt-2 text-[10px] font-mono font-semibold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60 w-fit">
                    San Juan: Alerta Roja
                  </div>
                </div>

                <div className="rounded-xl border border-orange-500/30 bg-orange-950/20 p-2.5 sm:p-3 flex flex-col justify-between hover:border-orange-500/50 transition">
                  <div>
                    <div className="flex items-center gap-1.5 text-orange-400 font-black text-[10.5px] uppercase tracking-wider">
                      <Thermometer className="h-3.5 w-3.5" /> Calor Extremo
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-white mt-0.5">Octubre — Diciembre</div>
                    <p className="text-slate-300 text-[11px] mt-1 leading-snug">
                      Radiación máxima sobre suelos áridos de Zona Sur (D15, D8, D9), alcanzando LST &gt; 41°C en superficie.
                    </p>
                  </div>
                  <div className="mt-2 text-[10px] font-mono font-semibold text-orange-300 bg-orange-950/80 px-2 py-0.5 rounded border border-orange-800/60 w-fit">
                    Estrés PET &gt; 38°C
                  </div>
                </div>

                <div className="rounded-xl border border-cyan-500/30 bg-blue-950/20 p-2.5 sm:p-3 flex flex-col justify-between hover:border-cyan-500/50 transition">
                  <div>
                    <div className="flex items-center gap-1.5 text-cyan-400 font-black text-[10.5px] uppercase tracking-wider">
                      <Layers className="h-3.5 w-3.5" /> Lavado & Torrenteras
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-white mt-0.5">Diciembre — Marzo</div>
                    <p className="text-slate-300 text-[11px] mt-1 leading-snug">
                      Lluvias intensas lavan la atmósfera (PM2.5 &lt; 16 µg/m³), pero activan 60 torrenteras con riesgo de aluvión.
                    </p>
                  </div>
                  <div className="mt-2 text-[10px] font-mono font-semibold text-cyan-300 bg-blue-950/80 px-2 py-0.5 rounded border border-cyan-800/60 w-fit">
                    Aluvión: Taquiña
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PESTAÑA 2: INCENDIOS ANUALES (2020 - 2026 PREDICCIÓN)                      */}
          {/* ========================================================================= */}
          {activeTab === 'fires' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Flame className="h-5 w-5 text-red-400" /> Serie Temporal Multianual de Incendios en el Parque Nacional Tunari
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Detecciones validadas NASA FIRMS (MODIS + VIIRS) 2020-2025 y proyección del modelo autorregresivo para 2026.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1 text-slate-300">
                    <span className="h-2.5 w-2.5 rounded bg-blue-500"></span> Observado
                  </span>
                  <span className="flex items-center gap-1 text-purple-300">
                    <span className="h-2.5 w-2.5 rounded bg-purple-500 border border-purple-300"></span> Predicción 2026
                  </span>
                </div>
              </div>

              {/* Gráfica de Barras por Año */}
              <div className="rounded-2xl border border-white/10 bg-[#0d1322] p-5">
                <div className="grid grid-cols-7 gap-2 sm:gap-4 h-48 sm:h-56 items-end border-b border-white/15 px-2">
                  {incendios_historicos_anuales.map((y) => {
                    const heightPct = (y.total_focos / maxFocosYear) * 100;
                    return (
                      <div key={y.year} className="flex flex-col items-center h-full justify-end group">
                        <span className={`text-xs font-mono font-bold mb-1.5 ${
                          y.is_prediccion ? 'text-purple-300 font-black' : y.total_focos > 300 ? 'text-red-400' : 'text-slate-300'
                        }`}>
                          {y.total_focos}
                        </span>
                        <div 
                          className={`w-full rounded-t-xl transition-all duration-300 group-hover:brightness-125 ${
                            y.is_prediccion
                              ? 'bg-gradient-to-t from-purple-800 via-purple-600 to-cyan-400 ring-2 ring-purple-400/80 shadow-lg shadow-purple-950/60 animate-pulse'
                              : y.total_focos > 300
                              ? 'bg-gradient-to-t from-red-700 to-orange-500'
                              : 'bg-gradient-to-t from-blue-700 to-cyan-500'
                          }`}
                          style={{ height: `${heightPct}%` }}
                        />
                        <span className={`mt-2 text-xs font-bold ${
                          y.is_prediccion ? 'text-purple-300 font-mono font-black' : 'text-slate-300'
                        }`}>
                          {y.year} {y.is_prediccion ? '✨' : ''}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 text-xs text-slate-400 flex items-center justify-between">
                  <span>Fuente: NASA FIRMS Global Hotspots & UGR Alcaldía de Cochabamba</span>
                  <span className="text-purple-300 font-mono font-bold">2026: Proyección de 340 focos (~3.600 ha en riesgo)</span>
                </div>
              </div>

              {/* Tarjetas de Eventos Críticos Documentados */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Eventos Críticos Históricos Analizados:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {incendios_historicos_anuales.map((y) => (
                    <div 
                      key={y.year}
                      className={`p-3 rounded-2xl border transition ${
                        y.is_prediccion
                          ? 'border-purple-500/40 bg-purple-950/20 ring-1 ring-purple-400/40'
                          : 'border-white/10 bg-[#0c1220] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-sm text-cyan-400">{y.year}</span>
                        <span className="text-[11px] font-mono text-orange-400 font-bold">
                          {y.total_focos} focos • {y.frp_acumulado_mw.toLocaleString()} MW
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white mt-1">{y.evento_mayor}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        <strong>Mes Pico:</strong> {y.mes_pico} • <strong>Condición:</strong> {y.condicion_climatica}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PESTAÑA 3: INVERSIÓN TÉRMICA & CALIDAD DEL AIRE (PM2.5)                     */}
          {/* ========================================================================= */}
          {activeTab === 'air_quality' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="rounded-xl border border-amber-500/25 bg-amber-950/20 p-3 sm:p-4 text-xs text-amber-200 flex items-start gap-2.5">
                <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-[11.5px] leading-relaxed">
                  <span className="text-white font-bold">Fenómeno Físico de Inversión Térmica (Red MÓNICA & NASA): </span>
                  <span className="text-slate-300">
                    En invierno (Mayo a Julio), el aire frío nocturno baja de la Cordillera del Tunari y se asienta en el fondo del valle (2.550 msnm). Sobre este aire frío queda aire más cálido a la altura de la <strong className="text-emerald-300 font-bold">Cota 2.750 msnm</strong>, actuando como una <strong>tapa hermética</strong> que atrapa el humo de ladrilleras, parque automotor y quemas en la Zona Sur.
                  </span>
                </div>
              </div>

              {/* Gráfica de Concentración de PM2.5 a lo largo del Año */}
              <div className="rounded-2xl border border-white/10 bg-[#0c1220] p-3.5 sm:p-5">
                {/* Cabecera con Título y Leyenda Limpia (Sin Textos Encimados) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                      <Wind className="h-4 w-4 text-cyan-400" /> Concentración Mensual de Material Particulado PM2.5 (Red MÓNICA GAMC)
                    </h3>
                    <p className="text-[11px] text-slate-400">Datos continuos de estaciones Kanata (Sur) y SEMAPA (Norte) correlacionados con AOD MODIS Aqua</p>
                  </div>
                  {/* Badges de Referencia Sanitarias Oficiales */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-800/60 px-2 py-0.5 rounded-md">
                      <span className="h-2 w-2 rounded-full bg-emerald-400"></span> Guía OMS: 15 µg/m³
                    </span>
                    <span className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-red-300 bg-red-950/70 border border-red-800/60 px-2 py-0.5 rounded-md">
                      <span className="h-2 w-2 rounded-full bg-red-500"></span> Umbral Crítico GAMC: &gt; 50 µg/m³
                    </span>
                  </div>
                </div>

                {/* SVG Curve Chart Interactivo */}
                <div className="relative pt-2 pb-1">
                  <div className="relative h-44 sm:h-52 w-full">
                    {/* Líneas Horizontales de Referencia Sanitaria con Textos Alineados a la Derecha Fuera de la Curva */}
                    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between">
                      {/* Línea Crítica 50 ug/m3 */}
                      <div className="absolute w-full top-[50%] border-b border-dashed border-red-500/50 flex items-center justify-end pr-1">
                        <span className="text-[9px] font-mono font-bold text-red-400 bg-[#0c1220]/95 px-1.5 py-0.5 rounded border border-red-800/40 -translate-y-1/2">
                          50 µg/m³ (Límite GAMC)
                        </span>
                      </div>
                      {/* Línea Guía OMS 15 ug/m3 */}
                      <div className="absolute w-full top-[85%] border-b border-dashed border-emerald-500/50 flex items-center justify-end pr-1">
                        <span className="text-[9px] font-mono font-bold text-emerald-400 bg-[#0c1220]/95 px-1.5 py-0.5 rounded border border-emerald-800/40 -translate-y-1/2">
                          15 µg/m³ (Guía OMS)
                        </span>
                      </div>
                    </div>

                    <svg className="w-full h-full overflow-visible" viewBox="0 0 600 200" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="pm25Gradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.45" />
                          <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.20" />
                          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.02" />
                        </linearGradient>
                      </defs>

                      {/* Curva de PM2.5 */}
                      {(() => {
                        const points = ciclo_estacional_mensual.map((m, idx) => {
                          const x = (idx / 11) * 600;
                          const y = 200 - (m.pm25_promedio_ugm3 / 100) * 200;
                          return `${x},${y}`;
                        });
                        const dArea = `M 0,200 L ${points.join(' L ')} L 600,200 Z`;
                        const dLine = `M ${points.join(' L ')}`;
                        return (
                          <>
                            <path d={dArea} fill="url(#pm25Gradient)" />
                            <path d={dLine} fill="none" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            {ciclo_estacional_mensual.map((m, idx) => {
                              const x = (idx / 11) * 600;
                              const y = 200 - (m.pm25_promedio_ugm3 / 100) * 200;
                              const isHovered = hoveredPm25Month === m.mes_num;
                              const isCritical = m.pm25_promedio_ugm3 > 50;
                              return (
                                <g key={m.mes_num}>
                                  {isHovered && (
                                    <line x1={x} y1={0} x2={x} y2={200} stroke="#38bdf8" strokeDasharray="3 3" strokeWidth="1.5" />
                                  )}
                                  <circle 
                                    cx={x} 
                                    cy={y} 
                                    r={isHovered ? 7 : isCritical ? 5 : 4} 
                                    fill={isCritical ? '#ef4444' : '#06b6d4'} 
                                    stroke="#ffffff" 
                                    strokeWidth={isHovered ? 2.5 : 1.5} 
                                    className="transition-all duration-150"
                                  />
                                </g>
                              );
                            })}
                          </>
                        );
                      })()}
                    </svg>

                    {/* Columnas Interactivas Transparentes para Hover Táctil y Ratón */}
                    <div className="absolute inset-0 grid grid-cols-12 z-10">
                      {ciclo_estacional_mensual.map((m) => (
                        <div
                          key={m.mes_num}
                          className="h-full w-full cursor-pointer hover:bg-white/[0.04] transition-colors"
                          onMouseEnter={() => setHoveredPm25Month(m.mes_num)}
                          onMouseLeave={() => setHoveredPm25Month(null)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Etiquetas de Meses y Valores Diarios */}
                  <div className="grid grid-cols-12 text-center mt-2 px-0.5">
                    {ciclo_estacional_mensual.map((m) => {
                      const isHovered = hoveredPm25Month === m.mes_num;
                      const isCritical = m.pm25_promedio_ugm3 > 50;
                      return (
                        <div 
                          key={m.mes_num} 
                          className={`text-center cursor-pointer transition ${
                            isHovered ? 'text-cyan-300 font-black' : isCritical ? 'text-red-400 font-bold' : 'text-slate-400'
                          }`}
                          onMouseEnter={() => setHoveredPm25Month(m.mes_num)}
                          onMouseLeave={() => setHoveredPm25Month(null)}
                        >
                          <div className="text-[10px] sm:text-xs font-bold">{m.mes_nombre.slice(0, 3)}</div>
                          <div className={`text-[9px] font-mono ${isCritical ? 'text-red-300 font-bold' : 'text-slate-400'}`}>
                            {m.pm25_promedio_ugm3}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Banner de Detalle del Mes con Altura Fija Reservada (Cero Layout Shift) */}
                <div className="min-h-[50px] mt-3 flex items-center">
                  {hoveredPm25Month ? (() => {
                    const m = ciclo_estacional_mensual.find(x => x.mes_num === hoveredPm25Month);
                    const isCritical = m.pm25_promedio_ugm3 > 50;
                    return (
                      <div className={`w-full p-2.5 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-in fade-in ${
                        isCritical 
                          ? 'border-red-500/40 bg-red-950/50 text-red-200' 
                          : 'border-cyan-500/30 bg-cyan-950/40 text-cyan-200'
                      }`}>
                        <div>
                          <strong className="text-white font-bold text-xs sm:text-sm">
                            {m.mes_nombre} ({m.temporada}):
                          </strong>
                          <span className="text-slate-200 ml-1 text-[11px]">{m.descripcion}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isCritical ? 'bg-red-900/80 text-white' : 'bg-emerald-900/80 text-white'
                          }`}>
                            {m.calidad_aire}
                          </span>
                          <span className="font-mono font-bold text-white text-xs sm:text-sm">
                            {m.pm25_promedio_ugm3} µg/m³
                          </span>
                        </div>
                      </div>
                    );
                  })() : (
                    <div className="w-full p-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-[11px] text-slate-400 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Info className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                        Pasa el cursor sobre cualquier mes en la gráfica para ver la concentración exacta de PM2.5 y el diagnóstico médico-ambiental
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 hidden md:inline">Ground-Truth: Red MÓNICA GAMC (125k reg.)</span>
                    </div>
                  )}
                </div>

                {/* 3 Tarjetas de Resumen Histórico */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/10 text-xs">
                  <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-500/20">
                    <span className="text-slate-400 text-[11px]">Pico 1 (Inversión Térmica & San Juan):</span>
                    <div className="text-amber-300 font-mono font-bold text-sm">78.4 µg/m³ (Junio)</div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Asfixia por aire frío bajo Cota 2.750</p>
                  </div>
                  <div className="p-2 rounded-lg bg-red-950/30 border border-red-500/20">
                    <span className="text-slate-400 text-[11px]">Pico 2 (Incendios Tunari & Humo):</span>
                    <div className="text-red-300 font-mono font-bold text-sm">88.6 µg/m³ (Septiembre)</div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Humo arrastrado por vientos del noreste</p>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/20">
                    <span className="text-slate-400 text-[11px]">Mínimo Anual (Lavado Pluvial):</span>
                    <div className="text-emerald-300 font-mono font-bold text-sm">14.2 µg/m³ (Febrero)</div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Atmósfera limpia pero 60 torrenteras activas</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PESTAÑA 4: CALENTAMIENTO DECADAL LST (MANN-KENDALL)                        */}
          {/* ========================================================================= */}
          {activeTab === 'decadal' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Thermometer className="h-5 w-5 text-red-400" /> Tasa de Calentamiento Superficial LST por Distrito (°C/Década)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Análisis de significancia estadística Mann-Kendall (p &lt; 0.05) con sensores NASA MODIS y VIIRS (2000-2025).
                  </p>
                </div>
                <span className="text-xs font-mono bg-blue-950/80 text-cyan-300 px-3 py-1 rounded-full border border-blue-500/30">
                  Ranking de Prioridad IA
                </span>
              </div>

              {/* Lista Comparativa de Distritos (Grid de 2 Columnas para Máxima Legibilidad) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-2.5">
                {tendencias_decadales_distritos.map((dist, idx) => {
                  const isWarming = dist.tasa_calentamiento_decadal_c > 0;
                  const isSevere = dist.tasa_calentamiento_decadal_c >= 0.70;
                  const isCooling = dist.tasa_calentamiento_decadal_c < 0;
                  return (
                    <div 
                      key={dist.distrito_id}
                      className={`p-2.5 sm:p-3 rounded-xl border transition flex items-center justify-between ${
                        isSevere 
                          ? 'border-red-500/40 bg-red-950/20 shadow-sm'
                          : isCooling
                          ? 'border-cyan-500/40 bg-cyan-950/20 shadow-sm'
                          : 'border-white/10 bg-[#0d1322] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`flex h-7 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-mono font-black ${
                          isSevere ? 'bg-red-600 text-white' : isCooling ? 'bg-cyan-600 text-white' : 'bg-neutral-800 text-slate-300'
                        }`}>
                          {dist.distrito_id}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs sm:text-sm font-bold text-white truncate max-w-[140px] sm:max-w-[180px]">{dist.nombre}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                              isSevere ? 'bg-red-950 text-red-300 border border-red-800' : isCooling ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-neutral-800 text-slate-400'
                            }`}>
                              {dist.nivel_riesgo_calor}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[220px] sm:max-w-xs">{dist.causa_principal}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 ml-2.5">
                        <div className={`text-xs sm:text-sm font-mono font-black ${
                          isSevere ? 'text-red-400' : isCooling ? 'text-cyan-400' : 'text-slate-200'
                        }`}>
                          {dist.tasa_calentamiento_decadal_c > 0 ? '+' : ''}{dist.tasa_calentamiento_decadal_c} °C/déc
                        </div>
                        <div className="text-[9px] text-slate-400 font-mono">
                          p = {dist.p_value} ({dist.significativo ? '✓ Sig.' : 'No sig.'})
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PESTAÑA 5: PREDICCIONES & ALERTA PREVENTIVA DE IMPACTO                     */}
          {/* ========================================================================= */}
          {activeTab === 'protection' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4 text-xs text-emerald-200 flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-bold text-sm">Predicciones Territoriales & Alerta Temprana de Impacto:</strong>
                  <p className="mt-1 text-slate-300 leading-relaxed">
                    Las tendencias históricas y predicciones satelitales no solo deben diagnosticar; deben traducirse en <strong>pronósticos de impacto y medidas preventivas</strong> antes de que ocurran los desastres. A continuación se presentan las predicciones operativas formuladas para la Alcaldía de Cochabamba (GAMC) y las brigadas comunitarias:
                  </p>
                </div>
              </div>

              {/* Grid de Acciones de Protección */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matriz_alerta_proteccion.map((item, idx) => (
                  <div 
                    key={idx}
                    className="rounded-2xl border border-white/10 bg-[#0d1322] p-4 flex flex-col justify-between hover:border-cyan-500/30 transition shadow-lg"
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                        <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" /> {item.zona_objetivo}
                        </span>
                        <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                          {item.periodo_critico}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <strong className="text-red-400 font-bold">⚠️ Amenaza Pronosticada:</strong>
                          <p className="text-slate-300 mt-0.5">{item.amenaza_principal}</p>
                        </div>

                        <div>
                          <strong className="text-purple-400 font-bold">🤖 Predicción IA de Riesgo:</strong>
                          <p className="text-slate-300 mt-0.5">{item.diagnostico_ia}</p>
                        </div>

                        <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-800/40 mt-2">
                          <strong className="text-cyan-300 font-bold flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" /> Acción Preventiva Mandatoria:
                          </strong>
                          <p className="text-slate-200 mt-1 leading-relaxed">{item.accion_preventiva}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-white/10 text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                      <span>🌱 Beneficio a la Comunidad: {item.beneficio_comunidad}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PESTAÑA 6: 14 RECURSOS OFICIALES NASA & AGENCIAS SOCIAS                   */}
          {/* ========================================================================= */}
          {activeTab === 'sources' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-4 text-xs text-cyan-200 flex items-start gap-3">
                <Database className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-bold">Alineación Rigurosa con el Reto Oficial NASA Space Apps:</strong>
                  <p className="mt-1 text-slate-300 leading-relaxed">
                    A continuación se listan las <strong>14 fuentes oficiales y guías metodológicas</strong> provistas por la NASA, la Agencia Espacial Canadiense (CSA), NOAA y KNMI para el reto <em>"Be An Earth System Trend Detective!"</em>, con sus respectivos enlaces directos verificados y su aplicación técnica en la plataforma STEVENS.
                  </p>
                </div>
              </div>

              {/* Categoría 1: NASA Satélites & Telemetría */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-cyan-500/30 pb-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
                  <h3 className="text-sm font-black text-cyan-300 uppercase tracking-wider">
                    1. Telemetría y Portales de Observación de la Tierra (NASA)
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <a
                    href="https://giovanni.gsfc.nasa.gov/giovanni/"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3.5 rounded-xl border border-white/10 bg-[#0d1322] hover:border-cyan-400/60 hover:bg-neutral-900 transition flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                          NASA Giovanni
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                          NASA GSFC
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Portal versátil de visualización y series de tiempo para variables biofísicas, AOD y LST.
                      </p>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                      <span className="text-cyan-400 font-semibold">Uso: Calibración regional MODIS/VIIRS</span>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-cyan-300 transition" />
                    </div>
                  </a>

                  <a
                    href="https://giovanni.gsfc.nasa.gov/giovanni/doc/glossary/Giovanni_Variable_Definitions_Glossary.html#h.e33vsd8q94ll"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3.5 rounded-xl border border-white/10 bg-[#0d1322] hover:border-cyan-400/60 hover:bg-neutral-900 transition flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                          Giovanni Variable Definitions Glossary
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                          NASA Glossary
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Definiciones de variables estándar (Aerosol Optical Depth, Land Surface Temperature, Precipitación).
                      </p>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                      <span className="text-cyan-400 font-semibold">Uso: Taxonomía y unidades de medida</span>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-cyan-300 transition" />
                    </div>
                  </a>

                  <a
                    href="https://appeears.earthdatacloud.nasa.gov/"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3.5 rounded-xl border border-white/10 bg-[#0d1322] hover:border-cyan-400/60 hover:bg-neutral-900 transition flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                          NASA AppEEARS
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                          Earthdata Cloud
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Extracción precisa de series temporales por polígono para MODIS (MOD11A1, MOD13Q1) y ECOSTRESS.
                      </p>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                      <span className="text-cyan-400 font-semibold">Uso: Extracción de series por los 15 distritos</span>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-cyan-300 transition" />
                    </div>
                  </a>

                  <a
                    href="https://disc.gsfc.nasa.gov/information/tools?title=Hydrology%20Time%20Series"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3.5 rounded-xl border border-white/10 bg-[#0d1322] hover:border-cyan-400/60 hover:bg-neutral-900 transition flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                          NASA GES DISC Hydrology Time Series
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                          GES DISC
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Datos hidrológicos globales, balance de cuencas, humedad del suelo y escorrentía superficial.
                      </p>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                      <span className="text-cyan-400 font-semibold">Uso: Módulo AgroAdvisor & Humedad Edáfica</span>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-cyan-300 transition" />
                    </div>
                  </a>

                  <a
                    href="https://www.ncei.noaa.gov/cdo-web/"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3.5 rounded-xl border border-white/10 bg-[#0d1322] hover:border-cyan-400/60 hover:bg-neutral-900 transition flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                          NOAA Climate Data Online (CDO)
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                          NOAA NCEI
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Registros climáticos de estaciones meteorológicas terrestres globales (GHCND / GSOD).
                      </p>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                      <span className="text-cyan-400 font-semibold">Uso: Validación cruzada de temperaturas con SENAMHI</span>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-cyan-300 transition" />
                    </div>
                  </a>

                  <a
                    href="https://ntrs.nasa.gov/api/citations/20090042747/downloads/20090042747.pdf"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3.5 rounded-xl border border-white/10 bg-[#0d1322] hover:border-cyan-400/60 hover:bg-neutral-900 transition flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                          NASA NTRS Paper (SeaWiFS Time-Series)
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                          NASA Technical Report
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Metodología formal de descomposición de series temporales satelitales Y(t) = T(t) + S(t) + R(t).
                      </p>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                      <span className="text-cyan-400 font-semibold">Uso: Base matemática de nuestro motor predictivo</span>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-cyan-300 transition" />
                    </div>
                  </a>
                </div>
              </div>

              {/* Categoría 2: Agencia Espacial Canadiense (CSA) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-emerald-500/30 pb-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                  <h3 className="text-sm font-black text-emerald-300 uppercase tracking-wider">
                    2. Radar SAR, Hidrología y Recursos Espaciales (CSA Canadá)
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <a
                    href="https://www.asc-csa.gc.ca/eng/satellites/swot/"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3.5 rounded-xl border border-white/10 bg-[#0d1322] hover:border-emerald-400/60 hover:bg-neutral-900 transition flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition">
                          Misión SWOT (NASA / CSA / CNES / UKSA)
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                          SWOT Satellite
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Topografía interferométrica de aguas superficiales y monitoreo de niveles en lagos y embalses.
                      </p>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                      <span className="text-emerald-400 font-semibold">Uso: Monitoreo hídrico de Laguna Alalay y Angostura</span>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-300 transition" />
                    </div>
                  </a>

                  <a
                    href="https://donnees-data.asc-csa.gc.ca/en/dataset/rcm"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3.5 rounded-xl border border-white/10 bg-[#0d1322] hover:border-emerald-400/60 hover:bg-neutral-900 transition flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition">
                          Radarsat Constellation Mission (RCM)
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                          CSA Data Portal
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Imágenes de Radar de Apertura Sintética (SAR C-Band) diurnas y nocturnas capaces de penetrar nubes y humo.
                      </p>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                      <span className="text-emerald-400 font-semibold">Uso: Detección de suelo inundado y cicatrices de fuego</span>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-300 transition" />
                    </div>
                  </a>

                  <a
                    href="https://github.com/asc-csa/Synthetic_Aperture_Radar_Tutorial"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3.5 rounded-xl border border-white/10 bg-[#0d1322] hover:border-emerald-400/60 hover:bg-neutral-900 transition flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition">
                          Tutorial Python de SAR (CSA GitHub)
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                          Open Source
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Notebooks de procesamiento de retrodispersión radar, polarimetría y mapeo de humedad en suelo.
                      </p>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                      <span className="text-emerald-400 font-semibold">Uso: Metodología del Módulo Torrenteras</span>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-300 transition" />
                    </div>
                  </a>

                  <a
                    href="https://www.asc-csa.gc.ca/eng/satellites/everyday-lives/monitoring-and-protecting-our-ecosystems-from-space.asp"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3.5 rounded-xl border border-white/10 bg-[#0d1322] hover:border-emerald-400/60 hover:bg-neutral-900 transition flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition">
                          Protección de Ecosistemas desde el Espacio
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                          CSA Article
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Estrategias de gobernanza territorial y mitigación de desastres ecológicos desde satélites.
                      </p>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                      <span className="text-emerald-400 font-semibold">Uso: Enfoque de conservación del Parque Tunari</span>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-300 transition" />
                    </div>
                  </a>

                  <a
                    href="https://geo.ca/home/"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3.5 rounded-xl border border-white/10 bg-[#0d1322] hover:border-emerald-400/60 hover:bg-neutral-900 transition flex flex-col justify-between group md:col-span-2"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition">
                          Portal Geoespacial Geo.ca
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                          OGC Geospatial Data
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Plataforma nacional canadiense para federar catálogos geoespaciales con metadatos estandarizados ISO/OGC.
                      </p>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                      <span className="text-emerald-400 font-semibold">Uso: Estándares de interoperabilidad GeoJSON/WFS</span>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-300 transition" />
                    </div>
                  </a>
                </div>
              </div>

              {/* Categoría 3: Metodología Estadística & KNMI */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-indigo-500/30 pb-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-400"></span>
                  <h3 className="text-sm font-black text-indigo-300 uppercase tracking-wider">
                    3. Metodología Estadística y Detección de Tendencias (KNMI & Papers)
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <a
                    href="https://climexp.knmi.nl/"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3.5 rounded-xl border border-white/10 bg-[#0d1322] hover:border-indigo-400/60 hover:bg-neutral-900 transition flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition">
                          KNMI Climate Explorer
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">
                          Royal KNMI
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Herramienta de investigación climática para correlación de patrones meteorológicos con El Niño / La Niña (ENSO).
                      </p>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                      <span className="text-indigo-400 font-semibold">Uso: Análisis de teleconexión climática</span>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-300 transition" />
                    </div>
                  </a>

                  <a
                    href="https://medium.com/@snp.kriss/statistical-test-methods-to-detect-trends-in-time-series-data-b361a0ec530b"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3.5 rounded-xl border border-white/10 bg-[#0d1322] hover:border-indigo-400/60 hover:bg-neutral-900 transition flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition">
                          Detección de Tendencias (Kriss)
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">
                          Guía Técnica
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Formulación matemática del test de Mann-Kendall, Sen's Slope y pruebas no paramétricas robustas.
                      </p>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                      <span className="text-indigo-400 font-semibold">Uso: Implementado en backend/src/models/</span>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-300 transition" />
                    </div>
                  </a>

                  <a
                    href="https://www.statsig.com/perspectives/a-comprehensive-guide-to-statistical-significance"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3.5 rounded-xl border border-white/10 bg-[#0d1322] hover:border-indigo-400/60 hover:bg-neutral-900 transition flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition">
                          Significancia Estadística (Statsig)
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">
                          Guía Formal
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Cálculo estricto de intervalos de confianza del 95%, p-value y umbrales de decisión para evitar falsos positivos.
                      </p>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                      <span className="text-indigo-400 font-semibold">Uso: Validación p &lt; 0.0001 de tendencias</span>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-300 transition" />
                    </div>
                  </a>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Pie del Modal con Botones */}
        <div className="flex items-center justify-between border-t border-white/10 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#070b14] text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="hidden sm:inline">Algoritmo de Detección: </span>
            <span className="font-mono text-slate-300 font-bold">Mann-Kendall + XGBoost 3.2.0 (p &lt; 0.05)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold transition shadow-lg shadow-blue-900/40"
          >
            Volver al Mapa
          </button>
        </div>
      </div>
    </div>
  );
}
