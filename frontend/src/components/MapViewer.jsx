import React, { useEffect, useRef } from 'react';

// Coordenadas centrales de Cochabamba, Bolivia
const COCHABAMBA_CENTER = [-17.3895, -66.1568];

export default function MapViewer({ activeTab, focosData, torrenterasData, reportsData, selectedPoint }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersGroupRef = useRef(null);

  useEffect(() => {
    // Si Leaflet está disponible globalmente o se carga dinámicamente
    const initLeaflet = async () => {
      let L;
      try {
        L = await import('leaflet');
        // Importar CSS si no está inyectado
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
      if (mapInstanceRef.current) return; // Ya inicializado

      const map = L.map(mapContainerRef.current, {
        center: COCHABAMBA_CENTER,
        zoom: 12,
        zoomControl: true,
      });

      // CartoDB Dark Matter / OpenStreetMap tiles (estilo espacial oscuro)
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

  // Función para redibujar capas según el tab activo
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
            <span>Foco de Calor Tunari (NASA FIRMS)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-blue-500"></span>
            <span>Torrentera / Colector (GAMC 60 pts)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-amber-500"></span>
            <span>Isla de Calor Urbana (LST NASA)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
