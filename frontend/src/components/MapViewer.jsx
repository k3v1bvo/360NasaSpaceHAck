import React, { useEffect, useRef } from 'react';
import tunariPolygonData from '../../../data/gamc/parque_nacional_tunari.geojson';

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
        attribution: '&copy; OpenStreetMap &copy; CARTO &copy; NASA Earthdata',
        maxZoom: 19,
      }).addTo(map);

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

    // 1. CAPA DE FOCOS DE CALOR Y POLÍGONO TUNARI (Kevin)
    if (activeTab === 'incendios' || activeTab === 'todos') {
      // Dibujar polígono del Parque Tunari
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
            <strong>Superficie:</strong> ~300,000 ha<br/>
            <span style="color: #666;">Área protegida de recarga hídrica</span>
          </div>
        `);
        polygon.addTo(layersGroupRef.current);
      }

      // Dibujar focos de calor armonizados
      focosData?.forEach((foco) => {
        const [lng, lat] = foco.geometry.coordinates;
        const frp = foco.properties.frp_total_mw || foco.properties.frp_intensidad || 30;
        const sensor = foco.properties.sensor_armonizado || foco.properties.sensor || 'VIIRS';
        const nivel = foco.properties.nivel_alerta || 'Alto';

        const radius = nivel === 'Critico' ? 12 : nivel === 'Alto' ? 9 : 7;
        const fillColor = nivel === 'Critico' ? '#dc2626' : nivel === 'Alto' ? '#ea580c' : '#eab308';

        const circle = L.circleMarker([lat, lng], {
          radius,
          fillColor,
          color: '#ffffff',
          weight: 1.5,
          opacity: 0.95,
          fillOpacity: 0.85,
        });

        circle.bindPopup(`
          <div style="color: #111; font-family: sans-serif; font-size: 12px; min-width: 180px;">
            <strong style="color: #dc2626;">🔥 Foco de Calor Armonizado</strong><br/>
            <strong>Zona:</strong> ${foco.properties.zona}<br/>
            <strong>Sensor:</strong> ${sensor}<br/>
            <strong>FRP (Potencia):</strong> ${frp} MW<br/>
            <strong>Nivel:</strong> ${nivel}<br/>
            <strong>Fecha:</strong> ${foco.properties.fecha}<br/>
            <span style="color: ${foco.properties.en_parque_tunari ? '#059669' : '#6b7280'}; font-weight: bold;">
              ${foco.properties.en_parque_tunari ? '⚠️ Dentro del P.N. Tunari' : '🏡 Interfaz urbana'}
            </span>
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
  };

  useEffect(() => {
    if (mapInstanceRef.current) {
      updateLayers(null, mapInstanceRef.current);
    }
  }, [activeTab, focosData, torrenterasData, reportsData]);

  // Centrar en punto seleccionado
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
        <span className="font-bold text-[11px] text-neutral-400">LEYENDA COCHABAMBA</span>
        <div className="mt-1.5 space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></span>
            <span>Foco de Calor (NASA FIRMS Armonizado)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded border border-dashed border-emerald-400 bg-emerald-900/40"></span>
            <span>Polígono P.N. Tunari (Cota 2750)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-blue-500"></span>
            <span>Torrentera / Colector (GAMC 60 pts)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
