import React, { useEffect, useRef } from 'react';
import tunariPolygonData from '../../../data/gamc/parque_nacional_tunari.geojson';
import distritosData from '../../../data/gamc/distritos_cochabamba.geojson';
import floodPointsData from '../../../data/gamc/60_puntos_inundacion.geojson';

const COCHABAMBA_CENTER = [-17.3895, -66.1568];

export default function MapViewer({ activeTab, focosData, sensorMode = 'HARMONIZED', reportsData, selectedPoint }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersGroupRef = useRef(null);

  useEffect(() => {
    const initLeaflet = async () => {
      let L;
      try {
        L = await import('leaflet');
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }
      } catch (e) {
        console.warn('Leaflet fallback...');
      }

      if (!L || !mapContainerRef.current) return;
      if (mapInstanceRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: COCHABAMBA_CENTER,
        zoom: 12,
        zoomControl: true,
      });

      // CartoDB Dark Matter tiles (estilo espacial oscuro)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO &copy; NASA Earthdata &copy; GAMC',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      layersGroupRef.current = L.layerGroup().addTo(map);
      renderLayers(L, map);
    };

    initLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const renderLayers = async (L, map) => {
    if (!L) {
      try {
        L = await import('leaflet');
      } catch (e) { return; }
    }
    if (!map || !layersGroupRef.current) return;

    layersGroupRef.current.clearLayers();

    // ==========================================
    // CAPA 1: FOCOS DE CALOR Y POLÍGONO TUNARI (Kevin)
    // ==========================================
    if (activeTab === 'incendios') {
      // 1. Polígono del Parque Nacional Tunari (Cota 2750)
      if (tunariPolygonData?.features?.[0]) {
        const polyCoords = tunariPolygonData.features[0].geometry.coordinates[0].map(
          ([lng, lat]) => [lat, lng]
        );
        const polygon = L.polygon(polyCoords, {
          color: '#10b981',
          weight: 2,
          dashArray: '5, 5',
          fillColor: '#059669',
          fillOpacity: 0.15,
        });
        polygon.bindPopup(`
          <div style="color: #111; font-family: sans-serif; font-size: 12px;">
            <strong style="color: #059669;">🌲 Parque Nacional Tunari (PNT)</strong><br/>
            <strong>Cota límite:</strong> 2750 msnm<br/>
            <strong>Superficie:</strong> ~300,000 ha protegidas<br/>
            <span style="color: #666;">Zona de recarga de acuíferos y pulmón de Cochabamba</span>
          </div>
        `);
        polygon.addTo(layersGroupRef.current);
      }

      // 2. Marcadores según el modo de sensor seleccionado en el módulo de Kevin
      focosData?.forEach((foco) => {
        const [lng, lat] = foco.geometry.coordinates;
        const p = foco.properties;

        let radius, fillColor, color, popupTitle;

        if (sensorMode === 'MODIS') {
          radius = 16; // Píxel grande de 1 km
          fillColor = '#f59e0b';
          color = '#ffffff';
          popupTitle = '🛰️ Sensor MODIS MCD14DL (1 km)';
        } else if (sensorMode === 'VIIRS') {
          radius = 7; // Píxel fino de 375 m
          fillColor = '#06b6d4';
          color = '#ffffff';
          popupTitle = '🛰️ Sensor VIIRS VNP14 (375 m)';
        } else {
          // MODO ARMONIZADO (Kevin)
          const frp = p.frp_total_mw || 35;
          radius = frp > 60 ? 13 : frp > 30 ? 9 : 7;
          fillColor = frp > 60 ? '#dc2626' : frp > 30 ? '#ea580c' : '#f59e0b';
          color = '#ffffff';
          popupTitle = '🔥 Foco Armonizado (Algoritmo de Kevin)';
        }

        const circle = L.circleMarker([lat, lng], {
          radius,
          fillColor,
          color,
          weight: 1.5,
          opacity: 0.95,
          fillOpacity: 0.85,
        });

        circle.bindPopup(`
          <div style="color: #111; font-family: sans-serif; font-size: 12px; min-width: 190px;">
            <strong style="color: ${fillColor};">${popupTitle}</strong><br/>
            <strong>Zona:</strong> ${p.zona}<br/>
            <strong>Fecha:</strong> ${p.fecha}<br/>
            <strong>Potencia (FRP):</strong> ${p.frp_total_mw || p.frp || 35} MW<br/>
            ${sensorMode === 'HARMONIZED' ? `<strong>Puntos fusionados:</strong> ${p.puntos_crudos_fusionados || 2}<br/>` : `<strong>Satélite:</strong> ${p.satellite || 'NASA'}<br/>`}
            <span style="color: ${p.en_parque_tunari ? '#059669' : '#6b7280'}; font-weight: bold;">
              ${p.en_parque_tunari ? '⚠️ Dentro del P.N. Tunari' : '🏡 Interfaz urbana'}
            </span>
          </div>
        `);
        circle.addTo(layersGroupRef.current);
      });
    }

    // ==========================================
    // CAPA 2: MICROCLIMAS & DISTRITOS GAMC (Integrante 2)
    // ==========================================
    if (activeTab === 'microclimas') {
      distritosData?.features?.forEach((dist) => {
        const p = dist.properties;
        const polyCoords = dist.geometry.coordinates[0].map(([lng, lat]) => [lat, lng]);

        const color = p.lst_temperatura_c > 35 ? '#ef4444' :
                      p.lst_temperatura_c > 30 ? '#f59e0b' :
                      p.lst_temperatura_c > 26 ? '#3b82f6' : '#10b981';

        const polygon = L.polygon(polyCoords, {
          color,
          weight: 2,
          fillColor: color,
          fillOpacity: 0.4,
        });

        polygon.bindPopup(`
          <div style="color: #111; font-family: sans-serif; font-size: 12px; min-width: 200px;">
            <strong style="color: ${color};">🌡️ ${p.nombre}</strong><br/>
            <strong>Temperatura LST (NASA):</strong> ${p.lst_temperatura_c} °C<br/>
            <strong>Índice Vegetación NDVI:</strong> ${p.ndvi_vegetacion}<br/>
            <strong>Isla de Calor:</strong> ${p.nivel_isla_calor}<br/>
            <strong>Población:</strong> ~${p.poblacion_estimada.toLocaleString()} hab.<br/>
            <span style="color: #b91c1c; font-weight: bold;">${p.contraste_zona_sur_c}</span>
          </div>
        `);
        polygon.addTo(layersGroupRef.current);
      });
    }

    // ==========================================
    // CAPA 3: TORRENTERAS & 60 PUNTOS GAMC (Integrante 3)
    // ==========================================
    if (activeTab === 'torrenteras') {
      floodPointsData?.features?.forEach((pt) => {
        const [lng, lat] = pt.geometry.coordinates;
        const p = pt.properties;
        const color = p.nivel_riesgo === 'Extremo' ? '#ef4444' :
                      p.nivel_riesgo === 'Alto' ? '#f59e0b' : '#3b82f6';

        const marker = L.circleMarker([lat, lng], {
          radius: p.nivel_riesgo === 'Extremo' ? 9 : 7,
          fillColor: color,
          color: '#ffffff',
          weight: 1.5,
          opacity: 0.95,
          fillOpacity: 0.85,
        });

        marker.bindPopup(`
          <div style="color: #111; font-family: sans-serif; font-size: 12px; min-width: 200px;">
            <strong style="color: ${color};">🌊 ${p.torrentera_zona}</strong><br/>
            <strong>Evento Crítico:</strong> ${p.tipo_evento}<br/>
            <strong>Riesgo Evaluado:</strong> ${p.nivel_riesgo}<br/>
            <strong>Umbral SENAMHI:</strong> &gt; ${p.senamhi_umbral_lluvia_mm} mm en 24h<br/>
            <span style="color: #4b5563; font-size: 11px;">${p.fuente_oficial}</span>
          </div>
        `);
        marker.addTo(layersGroupRef.current);
      });
    }

    // ==========================================
    // ALERTAS VECINALES (Integrante 4)
    // ==========================================
    reportsData?.forEach((rep) => {
      const pin = L.circleMarker(COCHABAMBA_CENTER, {
        radius: 12,
        fillColor: '#f97316',
        color: '#fbbf24',
        weight: 2.5,
        fillOpacity: 0.85,
      });
      pin.bindPopup(`
        <div style="color: #111; font-family: sans-serif; font-size: 12px;">
          <strong style="color: #ea580c;">📢 Alerta Ciudadana Activa</strong><br/>
          <strong>Zona:</strong> ${rep.zona}<br/>
          <strong>Tipo:</strong> ${rep.tipo}<br/>
          <strong>Hora:</strong> ${rep.fecha}<br/>
          <span style="color: #666;">Reportado por vecino con geolocalización GPS</span>
        </div>
      `);
      pin.addTo(layersGroupRef.current);
    });
  };

  useEffect(() => {
    if (mapInstanceRef.current) {
      renderLayers(null, mapInstanceRef.current);
    }
  }, [activeTab, focosData, sensorMode, reportsData]);

  // Centrar en punto seleccionado al hacer clic desde el panel
  useEffect(() => {
    if (selectedPoint && mapInstanceRef.current) {
      const coords = selectedPoint.geometry.type === 'Polygon'
        ? selectedPoint.geometry.coordinates[0][0]
        : selectedPoint.geometry.coordinates;
      const [lng, lat] = coords;
      mapInstanceRef.current.setView([lat, lng], 14, { animate: true });
    }
  }, [selectedPoint]);

  return (
    <div className="relative h-full w-full bg-neutral-950 overflow-hidden">
      <div ref={mapContainerRef} className="h-full w-full z-0" />
      
      {/* Leyenda Flotante Dinámica según el Modo de Sensor de Kevin */}
      <div className="absolute bottom-4 left-4 z-[400] rounded-xl border border-neutral-800 bg-neutral-950/90 p-3 text-xs text-white backdrop-blur-md shadow-2xl">
        <span className="font-bold text-[10px] text-neutral-400 uppercase tracking-wider">
          {activeTab === 'incendios' && (
            sensorMode === 'HARMONIZED' ? 'MODO: DUAL ARMONIZADO (KEVIN)' :
            sensorMode === 'MODIS' ? 'MODO: SENSOR MODIS (1 KM)' : 'MODO: SENSOR VIIRS (375 M)'
          )}
          {activeTab === 'microclimas' && 'LEYENDA: TEMPERATURA LST GAMC'}
          {activeTab === 'torrenteras' && 'LEYENDA: 60 PUNTOS GROUND-TRUTH'}
          {activeTab === 'agrotech' && 'LEYENDA: VALLE COCHABAMBA'}
        </span>

        <div className="mt-2 space-y-1.5 text-[11px]">
          {activeTab === 'incendios' && (
            <>
              {sensorMode === 'HARMONIZED' && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></span>
                    <span>Incendio Armonizado (&gt;50 MW)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-amber-500"></span>
                    <span>Foco Moderado en Valle (&lt;35 MW)</span>
                  </div>
                </>
              )}
              {sensorMode === 'MODIS' && (
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full bg-amber-500/80 border border-white"></span>
                  <span>Footprint MODIS (1,000 m píxel)</span>
                </div>
              )}
              {sensorMode === 'VIIRS' && (
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 border border-white"></span>
                  <span>Detección VIIRS (375 m I-band)</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded border border-dashed border-emerald-400 bg-emerald-900/40"></span>
                <span>Polígono P.N. Tunari (Cota 2750)</span>
              </div>
            </>
          )}

          {activeTab === 'microclimas' && (
            <>
              <div className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded bg-red-500/70 border border-red-400"></span>
                <span>Isla Térmica Crítica (&gt;35 °C - D5 Av. 6 de Agosto)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded bg-emerald-500/70 border border-emerald-400"></span>
                <span>Zona Fresca con Arbolado (&lt;26 °C - Faldas Tunari)</span>
              </div>
            </>
          )}

          {activeTab === 'torrenteras' && (
            <>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500 animate-ping"></span>
                <span>Riesgo Extremo (Taquiña / Aluvión)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-blue-500"></span>
                <span>Punto Histórico GAMC</span>
              </div>
            </>
          )}

          {activeTab === 'agrotech' && (
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
              <span>Recomendación Rotación de Cultivo</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
