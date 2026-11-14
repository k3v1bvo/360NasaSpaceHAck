import React, { useEffect, useRef } from 'react';
import distritosGeoJson from '../../../data/gamc/distritos_cochabamba.geojson';
import cotaGeoJson from '../../../data/gamc/cota_2750_tunari.geojson';

// Coordenadas centrales de Cochabamba, Bolivia
const COCHABAMBA_CENTER = [-17.3895, -66.1568];

export default function MapViewer({ activeTab, focosData, torrenterasData, reportsData, selectedPoint }) {
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
        console.warn('Leaflet cargando fallback...');
      }

      if (!L || !mapContainerRef.current) return;
      if (mapInstanceRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: COCHABAMBA_CENTER,
        zoom: 12,
        zoomControl: true,
      });

      // Capa base satelital Esri / NASA (sin marcas de agua ni API key)
      const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri, Earthstar Geographics, NASA Earthdata',
        maxZoom: 18,
      });

      const osmLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      });

      satelliteLayer.addTo(map);

      // Selector de capas base
      L.control.layers({
        "🛰️ Satelital NASA/Esri": satelliteLayer,
        "🗺️ Callejero OpenStreetMap": osmLayer,
      }, null, { position: 'topright' }).addTo(map);

      mapInstanceRef.current = map;
      layersGroupRef.current = L.layerGroup().addTo(map);
      updateLayers(L, map);
    };

    initLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const updateLayers = async (L, map) => {
    if (!L) {
      try {
        L = await import('leaflet');
      } catch (e) { return; }
    }
    if (!map || !layersGroupRef.current) return;

    layersGroupRef.current.clearLayers();

    // 1. CAPA DE FOCOS DE CALOR (Kevin - Tunari)
    if (activeTab === 'incendios' || activeTab === 'todos') {
      focosData?.forEach((foco) => {
        const [lng, lat] = foco.geometry.coordinates;
        const circle = L.circleMarker([lat, lng], {
          radius: 10,
          fillColor: '#ef4444',
          color: '#ffffff',
          weight: 1.5,
          opacity: 0.9,
          fillOpacity: 0.8,
        });

        circle.bindPopup(`
          <div style="color: #111; font-family: sans-serif; font-size: 12px;">
            <strong style="color: #dc2626;">🔥 Foco de Calor Detectado</strong><br/>
            <strong>Zona:</strong> ${foco.properties.zona}<br/>
            <strong>Sensor:</strong> ${foco.properties.sensor}<br/>
            <strong>FRP (Intensidad):</strong> ${foco.properties.frp_intensidad} MW<br/>
            <strong>Fecha:</strong> ${foco.properties.fecha}
          </div>
        `);
        circle.addTo(layersGroupRef.current);
      });
    }

    // 2. CAPA DE TORRENTERAS E INUNDACIONES (Integrante 3)
    if (activeTab === 'torrenteras' || activeTab === 'todos') {
      torrenterasData?.forEach((pt) => {
        const [lng, lat] = pt.geometry.coordinates;
        const color = pt.properties.nivel_riesgo === 'Extremo' ? '#ef4444' : '#3b82f6';
        const marker = L.circleMarker([lat, lng], {
          radius: 8,
          fillColor: color,
          color: '#ffffff',
          weight: 1.5,
          opacity: 0.9,
          fillOpacity: 0.75,
        });

        marker.bindPopup(`
          <div style="color: #111; font-family: sans-serif; font-size: 12px;">
            <strong style="color: #2563eb;">🌊 Torrentera / Colector Crítico</strong><br/>
            <strong>Nombre:</strong> ${pt.properties.torrentera}<br/>
            <strong>Riesgo:</strong> ${pt.properties.nivel_riesgo}<br/>
            <strong>Evento:</strong> ${pt.properties.tipo_evento}<br/>
            <strong>Colector:</strong> ${pt.properties.estado_colector}
          </div>
        `);
        marker.addTo(layersGroupRef.current);
      });
    }

    // 3. CAPA DE ALERTAS VECINALES (Integrante 4)
    reportsData?.forEach((rep) => {
      const pin = L.circleMarker(COCHABAMBA_CENTER, {
        radius: 12,
        fillColor: '#f97316',
        color: '#fbbf24',
        weight: 2,
        fillOpacity: 0.85,
      });
      pin.bindPopup(`
        <div style="color: #111; font-family: sans-serif; font-size: 12px;">
          <strong style="color: #ea580c;">📢 Reporte Vecinal Activo</strong><br/>
          <strong>Zona:</strong> ${rep.zona}<br/>
          <strong>Tipo:</strong> ${rep.tipo}<br/>
          <strong>Hora:</strong> ${rep.fecha}
        </div>
      `);
      pin.addTo(layersGroupRef.current);
    });

    // 4. CAPA DE MICROCLIMAS URBANOS E ISLAS DE CALOR (Integrante 2 - Reto NASA Trend Detective)
    if (activeTab === 'microclimas' || activeTab === 'todos') {
      // Dibujar polígonos de los 14 Distritos con escala térmica LST
      if (distritosGeoJson && distritosGeoJson.features) {
        L.geoJSON(distritosGeoJson, {
          style: (feature) => {
            const lst = feature.properties.lst_nasa_promedio_c;
            const fillColor = lst >= 36 ? '#ef4444' :
                              lst >= 32 ? '#f97316' :
                              lst >= 28 ? '#eab308' :
                              lst >= 24 ? '#06b6d4' : '#10b981';
            return {
              fillColor: fillColor,
              weight: 2,
              opacity: 0.9,
              color: '#ffffff',
              dashArray: '3',
              fillOpacity: 0.65
            };
          },
          onEachFeature: (feature, layer) => {
            const p = feature.properties;
            layer.bindPopup(`
              <div style="color: #111; font-family: sans-serif; font-size: 12px; line-height: 1.4;">
                <strong style="color: #10b981; font-size: 13px;">${p.nombre}</strong><br/>
                <strong>Zona:</strong> ${p.zona_geografica} • ${p.cota_categoria}<br/>
                <strong>LST Superficial:</strong> <span style="color: #dc2626; font-weight: bold;">${p.lst_nasa_promedio_c} °C</span><br/>
                <strong>NDVI Vegetal:</strong> <span style="color: #16a34a; font-weight: bold;">${p.ndvi_promedio}</span><br/>
                <strong>PET Sensación:</strong> <span style="color: #ea580c; font-weight: bold;">${p.pet_pred_c} °C</span><br/>
                <strong>Riesgo Térmico HVR:</strong> <strong>${p.riesgo_termico_hvr}</strong> (${p.nivel_alerta})<br/>
                <div style="margin-top: 4px; font-size: 11px; color: #475569;">
                  <em>${p.estrategia_recomendada}</em>
                </div>
              </div>
            `);
          }
        }).addTo(layersGroupRef.current);
      }

      // Dibujar Línea oficial de la Cota 2750 m s.n.m. (Parque Tunari)
      if (cotaGeoJson && cotaGeoJson.features) {
        L.geoJSON(cotaGeoJson, {
          style: {
            color: '#10b981',
            weight: 3.5,
            dashArray: '6, 6',
            opacity: 0.95
          },
          onEachFeature: (feature, layer) => {
            layer.bindPopup(`
              <div style="color: #111; font-family: sans-serif; font-size: 12px;">
                <strong style="color: #059669;">🏔️ Cota 2750 m s.n.m. — Límite Parque Tunari</strong><br/>
                Frontera biofísica y límite de urbanización del GAMC.<br/>
                Por encima rige protección forestal y brisas de ladera montaña-valle.
              </div>
            `);
          }
        }).addTo(layersGroupRef.current);
      }
    }
  };

  useEffect(() => {
    if (mapInstanceRef.current) {
      updateLayers(null, mapInstanceRef.current);
    }
  }, [activeTab, focosData, torrenterasData, reportsData]);

  useEffect(() => {
    if (selectedPoint && mapInstanceRef.current) {
      const [lng, lat] = selectedPoint.geometry.coordinates;
      mapInstanceRef.current.setView([lat, lng], 14, { animate: true });
    }
  }, [selectedPoint]);

  return (
    <div className="relative h-full w-full bg-neutral-950 overflow-hidden">
      <div ref={mapContainerRef} className="h-full w-full z-0" />
      
      {/* Leyenda Flotante en el Mapa */}
      <div className="absolute bottom-4 left-4 z-[400] rounded-xl border border-neutral-800 bg-neutral-950/90 p-3 text-xs text-white backdrop-blur-md shadow-xl">
        <span className="font-bold text-[11px] text-neutral-400">LEYENDA GEO-COCHABAMBA 360</span>
        <div className="mt-1.5 space-y-1">
          {activeTab === 'incendios' && (
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></span>
              <span>Foco de Calor Tunari (NASA FIRMS)</span>
            </div>
          )}
          {activeTab === 'torrenteras' && (
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-blue-500"></span>
              <span>Torrentera / Colector (GAMC 60 pts)</span>
            </div>
          )}
          {activeTab === 'microclimas' && (
            <>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-red-500"></span>
                <span>Isla de Calor &gt;36 °C (Zona Sur D9)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-emerald-500"></span>
                <span>Zona Fresca &lt;24 °C (Tunari D13)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-0.5 bg-emerald-400 border border-emerald-400 border-dashed"></span>
                <span>Línea Cota 2750m Parque Tunari</span>
              </div>
            </>
          )}
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-orange-500"></span>
            <span>Reporte Vecinal GPS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
