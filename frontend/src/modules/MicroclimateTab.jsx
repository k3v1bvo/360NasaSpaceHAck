import React, { useState, useEffect, useMemo } from 'react';
import { SunMedium, Trees, Layers, TrendingUp, AlertTriangle, ShieldCheck, Wind, Thermometer, Info } from 'lucide-react';
import distritosGeoJson from '../../../data/gamc/distritos_cochabamba.geojson';

/**
 * MICROCLIMATETAB.JSX — NASA TREND DETECTIVE
 * Reto NASA: "Be An Earth System Trend Detective! - Microclimas Urbanos con IA"
 * Reto Local: GAMC Cochabamba (Resiliencia Microclimática & Islas de Calor)
 * Rama de Git: feature/modulo-microclimas
 */

export default function MicroclimateTab({ onSelectDistrito }) {
  // Cargar datos oficiales de los 14 distritos desde el GeoJSON local
  const distritosIniciales = useMemo(() => {
    if (distritosGeoJson && distritosGeoJson.features) {
      return distritosGeoJson.features.map(f => f.properties);
    }
    return [];
  }, []);

  const [distritos, setDistritos] = useState(distritosIniciales);
  const [selectedId, setSelectedId] = useState("D9"); // Distrito crítico inicial (K'ara K'ara)
  const [activeLayer, setActiveLayer] = useState("LST"); // "LST" | "NDVI" | "PET" | "HVR"
  const [filterZona, setFilterZona] = useState("TODAS");

  // Parámetros del Simulador de Intervención Urbana GAMC
  const [arboladoPct, setArboladoPct] = useState(0);
  const [albedoTechos, setAlbedoTechos] = useState(0.0);
  const [recuperarAlalay, setRecuperarAlalay] = useState(false);
  const [olaCalor, setOlaCalor] = useState(false);

  // Alerta de Paradoja de Albedo (Albedo Penalty)
  const albedoPenaltyActive = useMemo(() => {
    return albedoTechos >= 0.3 && arboladoPct < 15;
  }, [albedoTechos, arboladoPct]);

  // Simulación dinámica en tiempo real
  const distritosSimulados = useMemo(() => {
    return distritos.map(d => {
      let lst = d.lst_nasa_promedio_c;
      let pet = d.pet_pred_c;
      let ndvi = d.ndvi_promedio;

      if (olaCalor) {
        lst += 3.5;
        pet += 4.0;
      }

      // Enfriamiento por arbolado (-0.65°C LST y -0.95°C PET por cada 10%)
      const enfArb = (arboladoPct / 10.0) * 0.65;
      const redPetArb = (arboladoPct / 10.0) * 0.95;

      // Efecto albedo en cubierta (-1.2°C) vs reflejo al peatón (+0.4°C PET si arbolado < 15%)
      const enfAlb = (albedoTechos / 0.1) * 0.35;
      const refAlbPeatonal = (albedoTechos / 0.1) * 0.45;

      // Efecto Laguna Alalay (Distritos 6, 7, 8, 11)
      const enfAlalay = (recuperarAlalay && ["D6", "D7", "D8", "D11"].includes(d.distrito_id)) ? 1.8 : 0.0;

      lst = Math.max(18.0, Number((lst - enfArb - enfAlb - enfAlalay).toFixed(1)));
      pet = Math.max(18.0, Number((pet - redPetArb + (arboladoPct < 15 ? refAlbPeatonal : 0.0) - (enfAlalay * 0.8)).toFixed(1)));
      ndvi = Math.min(0.95, Number((ndvi + (arboladoPct / 100.0) * 0.35).toFixed(2)));

      // Recálculo del Índice Sintético de Riesgo HVR
      const beta = d.cota_categoria === "Sobre_2750m" ? 0.8 : 1.2;
      const factorPet = Math.max(0.0, (pet - 20.0) / 25.0);
      const factorVeg = 1.0 - ndvi;
      const factorDens = Math.min(2.0, (d.poblacion_total / d.area_km2) / 5000.0);
      const hvr = Math.min(1.0, Number((factorPet * factorDens * factorVeg * beta).toFixed(2)));
      const nivel = hvr >= 0.75 ? "CRITICO" : hvr >= 0.5 ? "ALTO" : hvr >= 0.25 ? "MODERADO" : "BAJO";

      return {
        ...d,
        lst_simulada: lst,
        pet_simulado: pet,
        ndvi_simulado: ndvi,
        hvr_simulado: hvr,
        nivel_simulado: nivel,
        delta_lst: Number((lst - d.lst_nasa_promedio_c).toFixed(1)),
        delta_pet: Number((pet - d.pet_pred_c).toFixed(1))
      };
    });
  }, [distritos, arboladoPct, albedoTechos, recuperarAlalay, olaCalor]);

  const currentDistrito = useMemo(() => {
    return distritosSimulados.find(d => d.distrito_id === selectedId) || distritosSimulados[0];
  }, [distritosSimulados, selectedId]);

  const filteredDistritos = useMemo(() => {
    if (filterZona === "TODAS") return distritosSimulados;
    return distritosSimulados.filter(d => d.zona_geografica.toLowerCase().includes(filterZona.toLowerCase()));
  }, [distritosSimulados, filterZona]);

  const handleSelect = (id) => {
    setSelectedId(id);
    if (onSelectDistrito) onSelectDistrito(id);
  };

  const getBadgeColor = (nivel) => {
    switch (nivel) {
      case "CRITICO": return "bg-red-950 text-red-400 border border-red-800/60";
      case "ALTO": return "bg-orange-950 text-orange-400 border border-orange-800/60";
      case "MODERADO": return "bg-amber-950 text-amber-400 border border-amber-800/60";
      default: return "bg-emerald-950 text-emerald-400 border border-emerald-800/60";
    }
  };

  return (
    <div className="space-y-4 p-4 text-white">
      {/* CABECERA DEL MÓDULO */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-emerald-600/20 p-2 text-emerald-400">
            <SunMedium className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Tendencias Microclimáticas & Islas de Calor
              <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800/50">
                14 Distritos GAMC
              </span>
            </h2>
            <p className="text-xs text-neutral-400">NASA Earthdata (MODIS/VIIRS LST + NDVI) • Cota 2750 Tunari</p>
          </div>
        </div>
      </div>

      {/* SELECTOR DE CAPAS ACTIVAS */}
      <div className="grid grid-cols-4 gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-[11px] font-semibold text-center">
        {[
          { id: "LST", label: "LST Térmico", icon: "🌡️" },
          { id: "NDVI", label: "NDVI Verde", icon: "🌿" },
          { id: "PET", label: "PET Confort", icon: "🚶" },
          { id: "HVR", label: "Riesgo HVR", icon: "⚠️" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveLayer(tab.id)}
            className={`py-1.5 px-1 rounded-lg transition-all flex flex-col items-center gap-0.5 ${
              activeLayer === tab.id
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/50 font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <span className="text-xs">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* CONTRASTE TERRITORIAL EXIGIDO POR LA ALCALDÍA */}
      <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/30 via-neutral-900/40 to-red-950/30 p-3 text-xs leading-relaxed">
        <div className="flex justify-between items-center mb-1">
          <strong className="text-neutral-200 uppercase text-[10px] tracking-wider">Contraste Oficial GAMC:</strong>
          <span className="text-[10px] text-amber-400 font-bold">Brecha: +17.4 °C</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-neutral-800/80">
          <div>
            <span className="text-emerald-400 font-semibold">Tunari D13 (&gt;2750m):</span>
            <div className="text-white font-bold">20.4 °C • NDVI 0.58</div>
          </div>
          <div>
            <span className="text-red-400 font-semibold">Zona Sur D9 (Asfalto):</span>
            <div className="text-white font-bold">37.8 °C • NDVI 0.07</div>
          </div>
        </div>
      </div>

      {/* FICHA TÉCNICA DEL DISTRITO SELECCIONADO */}
      {currentDistrito && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-3.5 space-y-2.5">
          <div className="flex items-start justify-between gap-2 border-b border-neutral-800 pb-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-bold text-emerald-400">{currentDistrito.distrito_id}</span>
                <span className="text-xs font-bold text-white">{currentDistrito.nombre.split('-')[1]}</span>
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">
                {currentDistrito.zona_geografica} • {currentDistrito.cota_categoria === "Sobre_2750m" ? "🏔️ Cota > 2750m (Tunari)" : "🏙️ Cota < 2750m (Valle)"}
              </div>
            </div>

            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getBadgeColor(currentDistrito.nivel_simulado)}`}>
              {currentDistrito.nivel_simulado}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-neutral-950 p-2 rounded-lg border border-neutral-800">
              <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                <Thermometer className="w-3 h-3 text-red-400" /> Temp LST
              </span>
              <div className="text-base font-extrabold text-white mt-0.5">
                {currentDistrito.lst_simulada} °C
              </div>
              <div className="text-[9px] text-neutral-500">
                Δ Tunari: +{currentDistrito.diferencial_isla_calor_c} °C
              </div>
            </div>

            <div className="bg-neutral-950 p-2 rounded-lg border border-neutral-800">
              <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                <Trees className="w-3 h-3 text-emerald-400" /> NDVI Vegetal
              </span>
              <div className="text-base font-extrabold text-emerald-400 mt-0.5">
                {currentDistrito.ndvi_simulado}
              </div>
              <div className="text-[9px] text-neutral-500">
                Déficit arbolado: {currentDistrito.deficit_arbolado_pct}%
              </div>
            </div>

            <div className="bg-neutral-950 p-2 rounded-lg border border-neutral-800">
              <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                <Wind className="w-3 h-3 text-amber-400" /> Sensación PET
              </span>
              <div className="text-base font-extrabold text-amber-400 mt-0.5">
                {currentDistrito.pet_simulado} °C
              </div>
              <div className="text-[9px] text-neutral-500">
                UTCI: {currentDistrito.utci_pred_c} °C
              </div>
            </div>

            <div className="bg-neutral-950 p-2 rounded-lg border border-neutral-800">
              <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-orange-400" /> Riesgo HVR
              </span>
              <div className="text-base font-extrabold text-orange-400 mt-0.5">
                {currentDistrito.hvr_simulado}
              </div>
              <div className="text-[9px] text-neutral-500">
                Población: {currentDistrito.poblacion_total?.toLocaleString()} hab.
              </div>
            </div>
          </div>

          <div className="text-[11px] bg-neutral-950/80 p-2 rounded-lg border border-neutral-800/80 text-neutral-300">
            <span className="text-emerald-400 font-bold block text-[10px] uppercase">Recomendación GAMC:</span>
            {currentDistrito.estrategia_recomendada}
          </div>
        </div>
      )}

      {/* LABORATORIO DE SIMULACIÓN DE INTERVENCIÓN BIOCLIMÁTICA */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/90 p-3.5 space-y-3">
        <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Simulador de Intervención Urbana</span>
          </div>
          <button
            onClick={() => {
              setArboladoPct(0);
              setAlbedoTechos(0.0);
              setRecuperarAlalay(false);
              setOlaCalor(false);
            }}
            className="text-[10px] text-neutral-400 hover:text-white underline"
          >
            Reset
          </button>
        </div>

        {/* SLIDER ARBOLADO */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-neutral-300">🌳 Cobertura Arbórea:</span>
            <span className="font-mono font-bold text-emerald-400">+{arboladoPct}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            step="5"
            value={arboladoPct}
            onChange={(e) => setArboladoPct(Number(e.target.value))}
            className="w-full h-1 bg-neutral-800 rounded appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        {/* SLIDER ALBEDO (TECHOS BLANCOS) */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-neutral-300">🏢 Techos Reflectantes (Albedo):</span>
            <span className="font-mono font-bold text-cyan-400">Δα = +{albedoTechos.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="0.6"
            step="0.05"
            value={albedoTechos}
            onChange={(e) => setAlbedoTechos(Number(e.target.value))}
            className="w-full h-1 bg-neutral-800 rounded appearance-none cursor-pointer accent-cyan-500"
          />
        </div>

        {/* SWITCHES */}
        <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
          <label className="flex items-center gap-1.5 cursor-pointer bg-neutral-950 p-2 rounded border border-neutral-800">
            <input
              type="checkbox"
              checked={recuperarAlalay}
              onChange={(e) => setRecuperarAlalay(e.target.checked)}
              className="rounded text-cyan-600 focus:ring-0 bg-neutral-800 border-neutral-700"
            />
            <span className="text-neutral-300">🌊 Laguna Alalay Llena</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer bg-neutral-950 p-2 rounded border border-neutral-800">
            <input
              type="checkbox"
              checked={olaCalor}
              onChange={(e) => setOlaCalor(e.target.checked)}
              className="rounded text-red-600 focus:ring-0 bg-neutral-800 border-neutral-700"
            />
            <span className="text-neutral-300">🔥 Ola de Calor (+3.5°C)</span>
          </label>
        </div>

        {/* ALERTA DE PARADOJA DE ALBEDO */}
        {albedoPenaltyActive && (
          <div className="p-2.5 rounded-lg bg-amber-950/60 border border-amber-500/50 text-[11px] text-amber-200 leading-tight space-y-1">
            <div className="font-bold flex items-center gap-1 text-amber-400 text-xs">
              <AlertTriangle className="w-3.5 h-3.5" /> PARADOJA DE ALBEDO DETECTADA
            </div>
            <p>
              Pintar techos sin plantar árboles (&lt;15%) refleja la radiación a nivel peatonal, subiendo el PET a <strong>&gt;40 °C</strong>.
            </p>
            <span className="text-emerald-400 font-semibold block text-[10px]">
              Solución: Incrementar arbolado a al menos 15%.
            </span>
          </div>
        )}
      </div>

      {/* LISTA COMPLETA DE LOS 14 DISTRITOS */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-neutral-300">
          <span>Ranking de Distritos (1 al 14)</span>
          <select
            value={filterZona}
            onChange={(e) => setFilterZona(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 text-[10px] rounded px-2 py-0.5 text-neutral-300"
          >
            <option value="TODAS">Todas las Zonas</option>
            <option value="Norte">Norte / Tunari</option>
            <option value="Centro">Centro</option>
            <option value="Sur">Sur / Asfalto</option>
            <option value="Oeste">Oeste</option>
            <option value="Este">Este</option>
          </select>
        </div>

        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
          {filteredDistritos.map((dist) => {
            const isSelected = dist.distrito_id === selectedId;
            return (
              <div
                key={dist.distrito_id}
                onClick={() => handleSelect(dist.distrito_id)}
                className={`rounded-lg border p-2 cursor-pointer transition-all ${
                  isSelected
                    ? "bg-emerald-950/40 border-emerald-500"
                    : "bg-neutral-950 border-neutral-800 hover:border-neutral-700"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-mono text-[10px] text-emerald-400">{dist.distrito_id}</span>
                    <span className="text-neutral-200 truncate">{dist.nombre.split('-')[1]}</span>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${getBadgeColor(dist.nivel_simulado)}`}>
                    {dist.nivel_simulado}
                  </span>
                </div>

                <div className="mt-1.5 flex items-center justify-between text-[11px] text-neutral-400">
                  <span>
                    {activeLayer === "LST" ? `LST: ${dist.lst_simulada} °C` :
                     activeLayer === "NDVI" ? `NDVI: ${dist.ndvi_simulado}` :
                     activeLayer === "PET" ? `PET: ${dist.pet_simulado} °C` :
                     `HVR: ${dist.hvr_simulado}`}
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    {dist.cota_categoria === "Sobre_2750m" ? "🏔️ >2750m" : "🏙️ <2750m"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg bg-neutral-900/40 p-2 text-center text-[10px] text-neutral-500">
        Módulo desarrollado por: <strong className="text-neutral-300">Integrante 2</strong> (NASA Earth Trend + GAMC Microclimas)
      </div>
    </div>
  );
}
