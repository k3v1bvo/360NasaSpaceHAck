import React, { useEffect, useRef, useState } from 'react';
import { Info, ChevronDown } from 'lucide-react';
import tunariPolygonData from '../../../data/gamc/parque_nacional_tunari.geojson';
import distritosData from '../../../data/gamc/distritos_cochabamba.geojson';
import floodPointsData from '../../../data/gamc/60_puntos_inundacion.geojson';
import cota2750Data from '../../../data/gamc/cota_2750_tunari.geojson';
import monicaData from '../data/monica_virtual_sensors.json';
import globalHotspots from '../data/global_trend_hotspots.json';

const GLOBAL_CENTER = [15.0, -10.0];
const GLOBAL_ZOOM = 3;
const COCHABAMBA_CENTER = [-17.3895, -66.1568];
const COCHABAMBA_ZOOM = 12;
const GAMC_WMS_ENDPOINT = 'https://serviciosgamc.cochabamba.bo/api/gs/wms';
const GAMC_PROJECT_03_KEY = '8da30122933ced2174ebe3e8b03198731d9cae6dc3230d32';

export default function MapViewer({ 
  activeTab, 
  setActiveTab,
  focosData, 
  sensorMode = 'HARMONIZED', 
  reportsData, 
  selectedPoint,
  setSelectedPoint,
  onSelectGlobalLocation,
  onMapClick,
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
  const [isLegendOpen, setIsLegendOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);

  // ResizeObserver para recalcular tamaño de Leaflet instantáneamente en responsive
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const observer = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    observer.observe(mapContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // Inicialización de Leaflet
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

      const initialCenter = activeTab === 'global_nasa' ? GLOBAL_CENTER : COCHABAMBA_CENTER;
      const initialZoom = activeTab === 'global_nasa' ? GLOBAL_ZOOM : COCHABAMBA_ZOOM;

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        zoomControl: true,
        minZoom: 2,
        worldCopyJump: true
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

      // Listener para clic en cualquier punto del mapa en modo global
      map.on('click', (e) => {
        if (onMapClick) {
          onMapClick({ lat: e.latlng.lat, lon: e.latlng.lng });
        }
      });

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

  // Vuelo suave cuando cambia activeTab
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (activeTab === 'global_nasa') {
      map.flyTo(GLOBAL_CENTER, GLOBAL_ZOOM, { duration: 1.5 });
    } else if (activeTab === 'microclimas') {
      map.flyTo(COCHABAMBA_CENTER, COCHABAMBA_ZOOM, { duration: 1.8 });
    } else if (activeTab === 'incendios') {
      map.flyTo([-17.36, -66.16], 12.5, { duration: 1.8 });
    }
  }, [activeTab]);

  const renderLayers = async (L, map) => {
    if (!L) {
      try {
        L = await import('leaflet');
      } catch (e) { return; }
    }
    if (!map || !layersGroupRef.current) return;

    layersGroupRef.current.clearLayers();

    // =========================================================================
    // CAPA 1: GLOBAL NASA DETECTIVE (7 Puntos Críticos Planetarios + Target)
    // =========================================================================
    if (activeTab === 'global_nasa') {
      globalHotspots.forEach((spot) => {
        const isPilot = spot.is_pilot;
        const color = isPilot ? '#c084fc' :
                      spot.id === 'artico' ? '#38bdf8' :
                      spot.id === 'sahel' ? '#fbbf24' :
                      spot.id === 'gran_barrera' ? '#34d399' : '#f87171';

        const marker = L.circleMarker([spot.lat, spot.lon], {
          radius: isPilot ? 14 : 11,
          fillColor: color,
          color: '#ffffff',
          weight: isPilot ? 3 : 2,
          opacity: 1,
          fillOpacity: 0.85,
        });

        marker.bindPopup(`
          <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; min-width: 250px; line-height: 1.45;">
            <div style="background: ${color}; color: ${isPilot || spot.id === 'sahel' ? '#000' : '#fff'}; padding: 6px 10px; border-radius: 6px 6px 0 0; font-weight: bold; display: flex; justify-content: space-between; align-items: center;">
              <span>🛰️ ${spot.name}</span>
              <span style="font-size: 9px; background: rgba(0,0,0,0.25); color: #fff; padding: 1px 6px; border-radius: 4px;">${spot.country}</span>
            </div>
            <div style="padding: 8px 10px; border: 1px solid ${color}; border-top: none; border-radius: 0 0 6px 6px; background: white;">
              <strong>Fenómeno Detectado:</strong> ${spot.tipo_tendencia}<br/>
              <strong>Tasa de Cambio Decadal:</strong> <span style="font-weight: bold; color: #b91c1c;">${spot.tasa_cambio_decadal}</span><br/>
              <strong>Temperatura Superficie (LST):</strong> ${spot.lst_superficie_c} °C<br/>
              <strong>Significancia Estadística:</strong> <span style="color: #047857; font-weight: bold;">p = ${spot.p_value} (&lt; 0.05 ✓)</span><br/>
              <span style="font-size: 11px; color: #64748b;">Z-Score Mann-Kendall: ${spot.z_score_mann_kendall}</span>
              ${isPilot ? `
                <div style="margin-top: 8px; padding-top: 6px; border-top: 1px dashed #cbd5e1; text-align: center;">
                  <button id="btn-zoom-pilot" style="background: #7c3aed; color: white; border: none; padding: 5px 12px; border-radius: 6px; font-weight: bold; font-size: 11px; cursor: pointer; width: 100%;">
                    🔍 Ver Caso Piloto Regional (14 Distritos) ↗
                  </button>
                </div>
              ` : ''}
            </div>
          </div>
        `);

        marker.on('click', () => {
          if (onSelectGlobalLocation) {
            onSelectGlobalLocation(spot);
          }
        });

        marker.on('popupopen', () => {
          const btn = document.getElementById('btn-zoom-pilot');
          if (btn && setActiveTab) {
            btn.onclick = () => {
              setActiveTab('microclimas');
            };
          }
        });

        marker.addTo(layersGroupRef.current);
      });

      // Target seleccionado o clic custom
      if (selectedPoint) {
        const lat = selectedPoint.lat || selectedPoint.geometry?.coordinates?.[1];
        const lng = selectedPoint.lon || selectedPoint.lng || selectedPoint.geometry?.coordinates?.[0];
        if (lat !== undefined && lng !== undefined) {
          const targetMarker = L.circleMarker([lat, lng], {
            radius: 12,
            fillColor: '#38bdf8',
            color: '#ffffff',
            weight: 3,
            opacity: 1,
            fillOpacity: 0.9,
          });
          targetMarker.bindPopup(`
            <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; min-width: 200px;">
              <strong style="color: #0284c7;">🎯 Sensor Satelital Activo (NASA POWER)</strong><br/>
              <strong>Latitud:</strong> ${Number(lat).toFixed(4)}<br/>
              <strong>Longitud:</strong> ${Number(lng).toFixed(4)}<br/>
              <span style="color: #059669; font-size: 11px;">Extracción de Telemetría LST y T2M en Vivo</span>
            </div>
          `);
          targetMarker.addTo(layersGroupRef.current);
        }
      }
    }

    // =========================================================================
    // CAPA 2: MICROCLIMAS & RED MÓNICA IA (Caso Piloto Cochabamba)
    // =========================================================================
    if (activeTab === 'microclimas') {
      // 1. Polígonos de Distritos con Gradiente Térmico LST y Métricas GAMC
      distritosData?.features?.forEach((dist) => {
        const p = dist.properties;
        const polyCoords = dist.geometry.coordinates[0].map(([lng, lat]) => [lat, lng]);

        const lstVal = p.lst_nasa_promedio_c || p.lst_temperatura_c || 28.0;
        const color = lstVal > 35 ? '#ef4444' :
                      lstVal > 30 ? '#f59e0b' :
                      lstVal > 26 ? '#3b82f6' : '#10b981';

        const polygon = L.polygon(polyCoords, {
          color,
          weight: 1.5,
          fillColor: color,
          fillOpacity: 0.30,
        });

        polygon.bindPopup(`
          <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; min-width: 230px; line-height: 1.45;">
            <div style="font-weight: bold; font-size: 13px; color: ${color}; border-bottom: 2px solid ${color}; padding-bottom: 4px; margin-bottom: 5px; display: flex; justify-content: space-between; align-items: center;">
              <span>📍 ${p.nombre}</span>
              ${p.nivel_alerta ? `<span style="font-size: 10px; background: rgba(0,0,0,0.06); padding: 1px 5px; border-radius: 4px;">${p.nivel_alerta}</span>` : ''}
            </div>
            <strong>Temperatura LST (NASA):</strong> <span style="font-weight: bold; color: ${color};">${lstVal} °C</span><br/>
            ${p.temp_aire_pred_c ? `<strong>Temp. Aire Estimada:</strong> ${p.temp_aire_pred_c} °C<br/>` : ''}
            ${p.pet_pred_c ? `<strong>Confort Térmico Humano (PET):</strong> <span style="font-weight: bold; color: ${p.pet_pred_c > 35 ? '#b91c1c' : '#047857'};">${p.pet_pred_c} °C</span><br/>` : ''}
            <strong>Índice Vegetación NDVI:</strong> ${p.ndvi_promedio || p.ndvi_vegetacion || '0.25'}<br/>
            ${p.riesgo_termico_hvr ? `<strong>Índice Riesgo HVR:</strong> <span style="font-weight: bold;">${p.riesgo_termico_hvr}</span><br/>` : ''}
            ${p.poblacion_total ? `<strong>Población Expuesta:</strong> ${Number(p.poblacion_total).toLocaleString()} hab. (${p.densidad_hab_km2 || ''} hab/km²)<br/>` : ''}
            ${p.estrategia_recomendada ? `
              <div style="margin-top: 5px; padding: 4px; background: #f8fafc; border-left: 3px solid ${color}; font-size: 11px;">
                <strong>Estrategia GAMC:</strong> ${p.estrategia_recomendada}
              </div>
            ` : ''}
          </div>
        `);
        polygon.addTo(layersGroupRef.current);
      });

      // 1.5. Línea Biofísica Oficial Cota 2750 m s.n.m. (Parque Nacional Tunari)
      if (cota2750Data?.features?.[0]) {
        const cotaCoords = cota2750Data.features[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        const cotaLine = L.polyline(cotaCoords, {
          color: '#10b981',
          weight: 3.5,
          dashArray: '8, 8',
          opacity: 0.95,
        });
        cotaLine.bindPopup(`
          <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; min-width: 220px; line-height: 1.4;">
            <div style="background: #059669; color: white; padding: 4px 8px; border-radius: 4px 4px 0 0; font-weight: bold;">
              🌲 Cota 2750 m s.n.m.
            </div>
            <div style="padding: 6px 8px; border: 1px solid #059669; border-top: none; border-radius: 0 0 4px 4px; background: white;">
              <strong>Parque Nacional Tunari (PNT)</strong><br/>
              <span style="color: #475569; font-size: 11px;">Frontera biofísica y límite de urbanización del GAMC. Reserva bioclimática de aire frío.</span>
            </div>
          </div>
        `);
        cotaLine.addTo(layersGroupRef.current);
      }

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

      // 3. Los 13 Sensores Virtuales IA (XGBoost 3.2.0)
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
              <span style="font-size: 9px; background: rgba(255,255,255,0.3); padding: 1px 5px; border-radius: 3px;">XGBoost (R²=0.95)</span>
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

    // =========================================================================
    // CAPA 3: INCENDIOS TUNARI (Causa Térmica y Plumas de Aerosoles)
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

      // Respaldo Local: Polígono Parque Nacional Tunari
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
          popupTitle = '🔥 Foco Armonizado (NASA FIRMS)';
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

    // Alertas Ciudadanas
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
        const zoom = (activeTab === 'global_nasa') ? 6 : 14;
        mapInstanceRef.current.flyTo([lat, lng], zoom, { duration: 1.5 });
      }
    }
  }, [selectedPoint, activeTab]);

  // Botones de navegación rápida
  const handleQuickFlight = (lat, lon, zoom, tab) => {
    if (setActiveTab && tab) {
      setActiveTab(tab);
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lon], zoom, { duration: 1.6 });
    }
  };

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
      
      {/* 1. Barra Flotante Superior: Navegación Planetaria Directa */}
      <div className="absolute top-2 left-2 right-2 sm:top-4 sm:left-4 sm:right-auto z-[400] flex items-center gap-1 sm:gap-1.5 rounded-xl sm:rounded-2xl border border-white/10 bg-[#0f172a]/95 p-1 sm:p-1.5 text-[11px] sm:text-xs text-white backdrop-blur-xl shadow-2xl overflow-x-auto no-scrollbar">
        <button
          onClick={() => handleQuickFlight(GLOBAL_CENTER[0], GLOBAL_CENTER[1], GLOBAL_ZOOM, 'global_nasa')}
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl font-bold transition shrink-0 ${
            activeTab === 'global_nasa'
              ? 'bg-blue-600 text-white shadow'
              : 'text-neutral-300 hover:bg-neutral-800'
          }`}
        >
          <span>🌍 <span className="hidden xs:inline">Planeta</span> Tierra</span>
        </button>

        <button
          onClick={() => handleQuickFlight(COCHABAMBA_CENTER[0], COCHABAMBA_CENTER[1], COCHABAMBA_ZOOM, 'microclimas')}
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl font-bold transition shrink-0 ${
            activeTab === 'microclimas'
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow'
              : 'text-neutral-300 hover:bg-neutral-800'
          }`}
        >
          <span>🇧🇴 Cochabamba</span>
        </button>

        <button
          onClick={() => handleQuickFlight(-17.36, -66.16, 12.5, 'incendios')}
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl font-bold transition shrink-0 ${
            activeTab === 'incendios'
              ? 'bg-red-600 text-white shadow'
              : 'text-neutral-300 hover:bg-neutral-800'
          }`}
        >
          <span>🔥 Tunari</span>
        </button>

        {/* Píldoras de Salto Planetario Rápido */}
        <div className="hidden xl:flex items-center gap-1 pl-2 border-l border-white/10 shrink-0">
          <span className="text-[10px] text-neutral-400">Saltar a:</span>
          {[
            { label: 'Amazonia', lat: -15.5989, lon: -56.0949 },
            { label: 'California', lat: 36.7783, lon: -119.4179 },
            { label: 'Mediterráneo', lat: 37.9838, lon: 23.7275 },
            { label: 'Sahel', lat: 14.5000, lon: 15.0000 },
            { label: 'Ártico', lat: 78.2232, lon: 15.6267 }
          ].map((h, i) => (
            <button
              key={i}
              onClick={() => handleQuickFlight(h.lat, h.lon, 6, 'global_nasa')}
              className="text-[10px] bg-neutral-800/80 hover:bg-neutral-700 px-2 py-1 rounded-lg text-neutral-300 transition"
            >
              {h.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Leyenda Flotante Dinámica (Colapsable en Móvil) */}
      <div className="absolute bottom-16 sm:bottom-4 left-2 sm:left-4 z-[400] transition-all duration-200">
        {!isLegendOpen ? (
          <button
            onClick={() => setIsLegendOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-[#0f172a]/95 px-3 py-1.5 text-[11px] font-bold text-cyan-300 shadow-2xl backdrop-blur-xl hover:bg-neutral-800 transition"
          >
            <Info className="h-3.5 w-3.5" />
            <span>Leyenda</span>
          </button>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-[#0f172a]/95 p-3 sm:p-3.5 text-xs text-white backdrop-blur-xl shadow-2xl max-w-[270px] sm:max-w-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2">
              <span className="font-bold text-[10px] text-cyan-400 uppercase tracking-wider truncate mr-2">
                {activeTab === 'global_nasa' && 'EARTH DETECTIVE'}
                {activeTab === 'microclimas' && 'PILOTO COCHABAMBA'}
                {activeTab === 'incendios' && 'HUMO & CALOR TUNARI'}
              </span>
              <button
                onClick={() => setIsLegendOpen(false)}
                className="text-neutral-400 hover:text-white p-0.5 rounded transition"
                title="Cerrar Leyenda"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1.5 text-[10px] sm:text-[11px]">
              {activeTab === 'global_nasa' && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-purple-400 border border-white animate-pulse"></span>
                    <span>Caso Piloto Stevens (Cochabamba)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400 border border-white"></span>
                    <span>Puntos Críticos Térmicos / Fuego</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 border border-white"></span>
                    <span>Criosfera & Amplificación Polar</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 border border-white"></span>
                    <span>Océanos & Barrera Coralina</span>
                  </div>
                  <div className="pt-1 border-t border-white/10 text-[9px] text-cyan-300">
                    💡 Clic en cualquier lugar para medir LST.
                  </div>
                </>
              )}

              {activeTab === 'microclimas' && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 border border-white"></span>
                    <span>🏛️ Red MÓNICA Física (2 est.)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-purple-500 border border-white"></span>
                    <span>🤖 Sensor Virtual IA (13 dist.)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded bg-red-500/80"></span>
                    <span>Isla de Calor (&gt;35°C LST)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded border border-emerald-400"></span>
                    <span>Cota 2750 Tunari (Límite PNT)</span>
                  </div>
                </>
              )}

              {activeTab === 'incendios' && (
                <>
                  {sensorMode === 'HARMONIZED' && (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse"></span>
                        <span>Incendio Armonizado (&gt;50 MW)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                        <span>Foco Moderado en Valle (&lt;35 MW)</span>
                      </div>
                    </>
                  )}
                  {sensorMode === 'MODIS' && (
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-amber-500 border border-white"></span>
                      <span>Footprint MODIS (1 km)</span>
                    </div>
                  )}
                  {sensorMode === 'VIIRS' && (
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-cyan-400 border border-white"></span>
                      <span>Detección VIIRS (375 m)</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                    <span className="h-2.5 w-2.5 rounded border border-emerald-400 bg-emerald-900/60"></span>
                    <span>Cota 2750 Tunari (Límite PNT)</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
