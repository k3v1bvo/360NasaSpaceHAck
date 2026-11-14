import React, { useEffect, useRef } from 'react';
import tunariPolygonData from '../../../data/gamc/parque_nacional_tunari.geojson';
import distritosData from '../../../data/gamc/distritos_cochabamba.geojson';
import floodPointsData from '../../../data/gamc/60_puntos_inundacion.geojson';
import monicaData from '../data/monica_virtual_sensors.json';

const COCHABAMBA_CENTER = [-17.3895, -66.1568];
const GAMC_WMS_ENDPOINT = 'https://serviciosgamc.cochabamba.bo/api/gs/wms';
const GAMC_PROJECT_03_KEY = '8da30122933ced2174ebe3e8b03198731d9cae6dc3230d32';

export default function MapViewer({ 
  activeTab, 
  focosData, 
  sensorMode = 'HARMONIZED', 
  reportsData, 
  selectedPoint,
  offlineMode = false,
  wmsCota = true,
  wmsPeriurbanos = true,
  wmsDistritos = false,
  nasaGibs = false,
  gibsDate = '2024-09-15'
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersGroupRef = useRef(null);

  useEffect(() => {
    const initLeaflet = async () => {
      let L;
      try {
        L = await import('leaflet');
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

      // Base Satelital NASA (Esri World Imagery) - 100% libre sin API key
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; NASA Earthdata &copy; Esri &copy; GAMC Cochabamba',
        maxZoom: 19,
      }).addTo(map);

      // Etiquetas y límites urbanos claros sobre la imagen satelital
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        attribution: '',
        maxZoom: 19,
        opacity: 0.75,
      }).addTo(map);

      mapInstanceRef.current = map;
      layersGroupRef.current = L.layerGroup().addTo(map);
      renderLayers(L, map);

      setTimeout(() => {
        map.invalidateSize();
      }, 250);
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

    // =========================================================================
    // CAPA 1: FOCOS DE CALOR (Kevin) + SERVICIOS WMS OFICIALES DE LA ALCALDÍA
    // =========================================================================
    if (activeTab === 'incendios') {
      
      // A0. Capa Satelital NASA GIBS Worldview (Reflectancia de Superficie y Humo)
      if (nasaGibs) {
        try {
          L.tileLayer(
            `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${gibsDate}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`,
            {
              attribution: '&copy; NASA EOSDIS GIBS / Worldview',
              maxZoom: 9,
              opacity: 0.85,
            }
          ).addTo(layersGroupRef.current);
        } catch (e) {
          console.warn('NASA GIBS Error:', e);
        }
      }

      // A. Servicios WMS Oficiales de la Alcaldía de Cochabamba (Proyecto 03)
      if (!offlineMode) {
        // 1. Capa WMS Oficial GAMC: Cota 2750 (Límite P.N. Tunari)
        if (wmsCota) {
          try {
            L.tileLayer.wms(GAMC_WMS_ENDPOINT, {
              key: GAMC_PROJECT_03_KEY,
              service_id: '297cefa4-0832-42bb-a98e-2cbea989fd9d',
              layers: '',
              format: 'image/png',
              transparent: true,
              version: '1.1.1',
              maxZoom: 19
            }).addTo(layersGroupRef.current);
          } catch (e) {
            console.warn('WMS Cota 2750 error:', e);
          }
        }

        // 2. Capa WMS Oficial GAMC: Periurbanos (Zonas habitadas de interfaz)
        if (wmsPeriurbanos) {
          try {
            L.tileLayer.wms(GAMC_WMS_ENDPOINT, {
              key: GAMC_PROJECT_03_KEY,
              service_id: 'c52066a1-32fd-4925-81e0-c2dcb8f4238f',
              layers: '',
              format: 'image/png',
              transparent: true,
              version: '1.1.1',
              maxZoom: 19
            }).addTo(layersGroupRef.current);
          } catch (e) {
            console.warn('WMS Periurbanos error:', e);
          }
        }

        // 3. Capa WMS Oficial GAMC: Límite Distritos
        if (wmsDistritos) {
          try {
            L.tileLayer.wms(GAMC_WMS_ENDPOINT, {
              key: GAMC_PROJECT_03_KEY,
              service_id: '7eb13092-bf0e-493b-aae6-03c43eedda2c',
              layers: '',
              format: 'image/png',
              transparent: true,
              version: '1.1.1',
              maxZoom: 19
            }).addTo(layersGroupRef.current);
          } catch (e) {
            console.warn('WMS Distritos error:', e);
          }
        }
      }

      // Respaldo Local: Polígono Parque Nacional Tunari (Modo Offline o complemento)
      if (offlineMode && tunariPolygonData?.features?.[0]) {
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
            <strong>Área:</strong> ~300,000 ha protegidas
          </div>
        `);
        polygon.addTo(layersGroupRef.current);
      }

      // B. Marcadores Satelitales de Fuego de la NASA (MODIS, VIIRS o Armonizado)
      focosData?.forEach((foco) => {
        const [lng, lat] = foco.geometry.coordinates;
        const p = foco.properties;

        let radius, fillColor, color, popupTitle;

        if (sensorMode === 'MODIS') {
          radius = 16;
          fillColor = '#f59e0b';
          color = '#ffffff';
          popupTitle = '🛰️ Sensor MODIS MCD14DL (1 km)';
        } else if (sensorMode === 'VIIRS') {
          radius = 7;
          fillColor = '#06b6d4';
          color = '#ffffff';
          popupTitle = '🛰️ Sensor VIIRS VNP14 (375 m)';
        } else {
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
            ${p.ia_anomaly_score ? `<strong>Score IA (Isolation Forest):</strong> <span style="color: #7c3aed; font-weight: bold;">${p.ia_anomaly_score}</span> (${p.ia_clasificacion || 'Anomalía'})<br/>` : ''}
            <span style="color: ${p.en_parque_tunari ? '#059669' : '#6b7280'}; font-weight: bold;">
              ${p.en_parque_tunari ? '🌲 Dentro del P.N. Tunari' : '🏡 Interfaz urbana'}
            </span>
          </div>
        `);
        circle.addTo(layersGroupRef.current);
      });
    }

    // ==========================================
    // CAPA 2: MICROCLIMAS & RED MÓNICA IA (Trend Detective)
    // ==========================================
    if (activeTab === 'microclimas') {
      // 1. Polígonos de Distritos con Gradiente Térmico LST
      distritosData?.features?.forEach((dist) => {
        const p = dist.properties;
        const polyCoords = dist.geometry.coordinates[0].map(([lng, lat]) => [lat, lng]);

        const color = p.lst_temperatura_c > 35 ? '#ef4444' :
                      p.lst_temperatura_c > 30 ? '#f59e0b' :
                      p.lst_temperatura_c > 26 ? '#3b82f6' : '#10b981';

        const polygon = L.polygon(polyCoords, {
          color,
          weight: 1.5,
          fillColor: color,
          fillOpacity: 0.25,
        });

        polygon.bindPopup(`
          <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; min-width: 210px; line-height: 1.4;">
            <div style="font-weight: bold; font-size: 13px; color: ${color}; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; margin-bottom: 4px;">
              📍 ${p.nombre}
            </div>
            <strong>Temperatura LST (NASA):</strong> <span style="font-weight: bold; color: ${color};">${p.lst_temperatura_c} °C</span><br/>
            <strong>Índice Vegetación NDVI:</strong> ${p.ndvi_vegetacion}<br/>
            <strong>Diagnóstico Isla de Calor:</strong> ${p.nivel_isla_calor}<br/>
            <span style="color: #b91c1c; font-size: 11px; font-weight: bold;">${p.contraste_zona_sur_c}</span>
          </div>
        `);
        polygon.addTo(layersGroupRef.current);
      });

      // 2. Las 2 Estaciones Físicas de la Red MÓNICA (GAMC - Ground Truth)
      monicaData?.estaciones_fisicas?.forEach((est) => {
        const marker = L.circleMarker([est.lat, est.lon], {
          radius: 12,
          fillColor: '#06b6d4',
          color: '#ffffff',
          weight: 3,
          opacity: 1,
          fillOpacity: 0.9,
        });

        marker.bindPopup(`
          <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; min-width: 230px; line-height: 1.45;">
            <div style="background: #0284c7; color: white; padding: 5px 8px; border-radius: 4px 4px 0 0; font-weight: bold; display: flex; align-items: center; justify-content: space-between;">
              <span>🏛️ Red MÓNICA (GAMC)</span>
              <span style="font-size: 9px; background: rgba(255,255,255,0.3); padding: 1px 5px; border-radius: 3px; letter-spacing: 0.5px;">ESTACIÓN FÍSICA</span>
            </div>
            <div style="padding: 7px 9px; border: 1px solid #0284c7; border-top: none; border-radius: 0 0 4px 4px; background: white;">
              <strong style="color: #0369a1; font-size: 13px;">${est.nombre}</strong><br/>
              <span style="color: #64748b; font-size: 11px;">${est.distrito} • Elevación: ${est.elevacion_m} msnm</span>
              <hr style="margin: 5px 0; border: 0; border-top: 1px solid #e2e8f0;"/>
              <strong>Temp. Aire Real (T2M):</strong> <span style="color: #b91c1c; font-weight: bold;">${est.temp_aire_t2m_c} °C</span><br/>
              <strong>Superficie LST (NASA):</strong> ${est.lst_nasa_c} °C<br/>
              <strong>Material Particulado PM2.5:</strong> <span style="font-weight: bold; color: ${est.pm25_ug_m3 > 35 ? '#dc2626' : '#059669'};">${est.pm25_ug_m3} µg/m³</span><br/>
              <strong>Índice Vegetal (NDVI):</strong> ${est.ndvi_vegetacion} | <strong>AOD:</strong> ${est.aod_aerosoles}<br/>
              <div style="margin-top: 5px; padding: 4px; background: #ecfeff; border-left: 3px solid #06b6d4; font-size: 11px;">
                <strong>Estado:</strong> ${est.estado_calidad_aire}
              </div>
            </div>
          </div>
        `);
        marker.addTo(layersGroupRef.current);
      });

      // 3. Los 13 Sensores Virtuales IA (XGBoost + ElasticNet)
      monicaData?.sensores_virtuales_ia?.forEach((sens) => {
        const isHot = sens.lst_nasa_c > 34;
        const marker = L.circleMarker([sens.lat, sens.lon], {
          radius: 9,
          fillColor: isHot ? '#a855f7' : '#8b5cf6',
          color: '#ffffff',
          weight: 2,
          opacity: 0.95,
          fillOpacity: 0.85,
        });

        marker.bindPopup(`
          <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; min-width: 230px; line-height: 1.45;">
            <div style="background: #7c3aed; color: white; padding: 5px 8px; border-radius: 4px 4px 0 0; font-weight: bold; display: flex; align-items: center; justify-content: space-between;">
              <span>🤖 Sensor Virtual IA</span>
              <span style="font-size: 9px; background: rgba(255,255,255,0.3); padding: 1px 5px; border-radius: 3px;">XGBoost (R²=0.91)</span>
            </div>
            <div style="padding: 7px 9px; border: 1px solid #7c3aed; border-top: none; border-radius: 0 0 4px 4px; background: white;">
              <strong style="color: #6d28d9; font-size: 13px;">${sens.nombre}</strong><br/>
              <span style="color: #64748b; font-size: 11px;">${sens.distrito} • Elevación: ${sens.elevacion_m} msnm</span>
              <hr style="margin: 5px 0; border: 0; border-top: 1px solid #e2e8f0;"/>
              <strong>Temp. Estimada (T2M):</strong> <span style="color: #b91c1c; font-weight: bold;">${sens.temp_aire_t2m_c} °C</span><br/>
              <strong>Temperatura LST (NASA):</strong> ${sens.lst_nasa_c} °C<br/>
              <strong>PM2.5 Estimado:</strong> <span style="font-weight: bold; color: ${sens.pm25_ug_m3 > 35 ? '#dc2626' : '#059669'};">${sens.pm25_ug_m3} µg/m³</span><br/>
              <strong>Confianza del Modelo:</strong> <span style="color: #16a34a; font-weight: bold;">${sens.confianza_prediccion_ia}</span><br/>
              <div style="margin-top: 5px; padding: 4px; background: #faf5ff; border-left: 3px solid #7c3aed; font-size: 11px;">
                <strong>Diagnóstico:</strong> ${sens.alerta_isla_calor}
              </div>
            </div>
          </div>
        `);
        marker.addTo(layersGroupRef.current);
      });
    }

    // ==========================================
    // CAPA 3: GLOBAL NASA MODE (Evaluación Internacional)
    // ==========================================
    if (activeTab === 'global_nasa' && selectedPoint) {
      const lat = selectedPoint.lat || selectedPoint.geometry?.coordinates?.[1];
      const lng = selectedPoint.lon || selectedPoint.lng || selectedPoint.geometry?.coordinates?.[0];
      if (lat && lng) {
        const targetMarker = L.circleMarker([lat, lng], {
          radius: 14,
          fillColor: '#3b82f6',
          color: '#ffffff',
          weight: 3,
          opacity: 1,
          fillOpacity: 0.8,
        });
        targetMarker.bindPopup(`
          <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; min-width: 200px;">
            <strong style="color: #2563eb;">🛰️ NASA POWER Stream Target</strong><br/>
            <strong>Coordinates:</strong> ${lat.toFixed(4)}, ${lng.toFixed(4)}<br/>
            <span style="color: #16a34a; font-size: 11px;">Direct Geospatial Satellite Query</span>
          </div>
        `);
        targetMarker.addTo(layersGroupRef.current);
      }
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
          <strong>Hora:</strong> ${rep.fecha}
        </div>
      `);
      pin.addTo(layersGroupRef.current);
    });
  };

  useEffect(() => {
    if (mapInstanceRef.current) {
      renderLayers(null, mapInstanceRef.current);
    }
  }, [activeTab, focosData, sensorMode, reportsData, offlineMode, wmsCota, wmsPeriurbanos, wmsDistritos, nasaGibs, gibsDate]);

  // Centrar en punto seleccionado
  useEffect(() => {
    if (selectedPoint && mapInstanceRef.current) {
      let lat, lng;
      if (selectedPoint.lat !== undefined && selectedPoint.lon !== undefined) {
        lat = selectedPoint.lat;
        lng = selectedPoint.lon;
      } else if (selectedPoint.lat !== undefined && selectedPoint.lng !== undefined) {
        lat = selectedPoint.lat;
        lng = selectedPoint.lng;
      } else if (selectedPoint.geometry) {
        const coords = selectedPoint.geometry.type === 'Polygon'
          ? selectedPoint.geometry.coordinates[0][0]
          : selectedPoint.geometry.coordinates;
        [lng, lat] = coords;
      }
      if (lat !== undefined && lng !== undefined) {
        const zoom = (activeTab === 'global_nasa' && (Math.abs(lat) > 20 || Math.abs(lng) > 70)) ? 8 : 14;
        mapInstanceRef.current.setView([lat, lng], zoom, { animate: true });
      }
    }
  }, [selectedPoint, activeTab]);

  return (
    <div 
      className="relative h-full w-full bg-[#080b18] overflow-hidden min-h-0"
      style={{ position: 'relative', height: '100%', width: '100%', minHeight: 0 }}
    >
      <div 
        ref={mapContainerRef} 
        className="absolute inset-0 h-full w-full z-0" 
        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, height: '100%', width: '100%' }}
      />
      
      {/* Leyenda Flotante Dinámica */}
      <div className="absolute bottom-4 left-4 z-[400] rounded-2xl border border-white/10 bg-[#0f172a]/90 p-3.5 text-xs text-white backdrop-blur-xl shadow-2xl max-w-xs">
        <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
          <span className="font-bold text-[10px] text-cyan-400 uppercase tracking-wider">
            {activeTab === 'incendios' && 'NASA FIRMS + GAMC WMS'}
            {activeTab === 'microclimas' && 'NASA LST + GAMC DISTRITOS'}
            {activeTab === 'torrenteras' && 'GAMC GROUND-TRUTH'}
            {activeTab === 'agrotech' && 'VALLE COCHABAMBA'}
          </span>
          <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            WMS GAMC Activo
          </span>
        </div>

        <div className="space-y-1.5 text-[11px]">
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
                  <span className="h-3.5 w-3.5 rounded-full bg-amber-500 border border-white"></span>
                  <span>Footprint MODIS (1,000 m píxel)</span>
                </div>
              )}
              {sensorMode === 'VIIRS' && (
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 border border-white"></span>
                  <span>Detección VIIRS (375 m I-band)</span>
                </div>
              )}
              <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                <span className="h-3 w-3 rounded border border-emerald-400 bg-emerald-900/60"></span>
                <span>WMS Oficial: Cota 2750 (GAMC)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded border border-purple-400 bg-purple-900/60"></span>
                <span>WMS Oficial: Periurbanos (GAMC)</span>
              </div>
              {nasaGibs && (
                <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                  <span className="h-3 w-3 rounded border border-cyan-400 bg-cyan-950/80"></span>
                  <span className="text-cyan-300 font-semibold">NASA GIBS WMTS ({gibsDate})</span>
                </div>
              )}
            </>
          )}

          {activeTab === 'microclimas' && (
            <>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-cyan-400 border border-white"></span>
                <span>🏛️ Red MÓNICA Física (2 estaciones)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-purple-500 border border-white"></span>
                <span>🤖 Sensor Virtual IA XGBoost (13 dist.)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-red-500/80"></span>
                <span>Isla de Calor Urbana (&gt;35°C LST)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-emerald-500/80"></span>
                <span>Bioclima Tunari (&lt;26°C LST)</span>
              </div>
            </>
          )}

          {activeTab === 'global_nasa' && (
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-blue-500 animate-pulse border border-white"></span>
              <span>🛰️ Live NASA POWER Satellite Stream</span>
            </div>
          )}

          {activeTab === 'torrenteras' && (
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500 animate-ping"></span>
              <span>Punto de Riesgo Extremo GAMC (60 pts)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
