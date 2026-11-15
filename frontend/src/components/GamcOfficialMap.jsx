import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const WMS_ENDPOINT = 'https://serviciosgamc.cochabamba.bo/api/gs/wms';
const SERVICE_KEY = '1a3d2d9c6e1d6a94062d11a9021a48b24ae0e05e8183e9d8';

// Las 4 fichas técnicas oficiales del Reto 01 (Microclimas Urbanos con IA)
const OFFICIAL_LAYERS = [
  {
    id: 'limite_distritos',
    name: 'Límite Distritos',
    styleType: 'Simple',
    description: 'Delimitación oficial de los 15 distritos de Cercado.',
    serviceId: '7eb13092-bf0e-493b-aae6-03c43eedda2c',
    defaultActive: true,
    opacity: 0.85,
  },
  {
    id: 'cota_2750',
    name: 'Cota 2750 (Parque Tunari)',
    styleType: 'Categorizado',
    description: 'Cada elemento se colorea según su categoría ecológica; la leyenda muestra las clases.',
    serviceId: '297cefa4-0832-42bb-a98e-2cbea989fd9d',
    defaultActive: true,
    opacity: 0.9,
  },
  {
    id: 'areas_verdes',
    name: 'Áreas Verdes',
    styleType: 'Simple',
    description: 'Cobertura vegetal, parques y plazuelas mitigadoras de calor.',
    serviceId: '47360ddc-e35f-4ece-a995-59e90eb79cc6',
    defaultActive: true,
    opacity: 0.85,
  },
  {
    id: 'poblacion_manzanas',
    name: 'Población por Manzanas',
    styleType: 'Simple',
    description: 'Densidad censal y manzanas con vulnerabilidad al calor urbano.',
    serviceId: '194a02a0-a73a-48c1-a260-82847c5c905d',
    defaultActive: false,
    opacity: 0.75,
  },
];

// Estaciones físicas de la Red MÓNICA (del Excel oficial descargable)
const ESTACIONES_MONICA = [
  { 
    nombre: 'Estación Red MÓNICA - Av. 6 de Agosto (Zona Sur)', 
    lat: -17.4083, 
    lng: -66.1525,
    datos: '54.711 mediciones • PM10 medio: 67.1 µg/m³ • +36% polución por inversión térmica'
  },
  { 
    nombre: 'Estación Red MÓNICA - Av. Circunvalación (SEMAPA Norte)', 
    lat: -17.3661, 
    lng: -66.1422,
    datos: '71.154 mediciones • PM10 medio: 49.3 µg/m³ • Aire de ladera oxigenado'
  },
];

export default function GamcOfficialMap({ onClose }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const wmsLayersRef = useRef({});
  const transportLayerRef = useRef(null);
  const clickMarkerRef = useRef(null);

  const [layers, setLayers] = useState(OFFICIAL_LAYERS);
  const [activeLayers, setActiveLayers] = useState(() =>
    OFFICIAL_LAYERS.reduce((acc, l) => ({ ...acc, [l.id]: l.defaultActive }), {})
  );
  const [queryLayerId, setQueryLayerId] = useState('cota_2750');
  const [featureResult, setFeatureResult] = useState(null);

  // 1. Inicializar Mapa y Capas según el bloque "02 · JAVASCRIPT / LEAFLET WMS"
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [-17.3895, -66.1568], // Centro de Cochabamba
      zoom: 12.8,
      maxZoom: 19,
    });

    // Mapa base limpio en Web Mercator (EPSG:3857)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap · © CARTO · GAMC Cochabamba',
      maxZoom: 19,
    }).addTo(map);

    // Instanciar las 4 capas WMS exactamente como indica la guía oficial
    OFFICIAL_LAYERS.forEach((cfg, index) => {
      const capa = L.tileLayer.wms(WMS_ENDPOINT, {
        key: SERVICE_KEY,
        service_id: cfg.serviceId,
        layers: '',
        format: 'image/png',
        transparent: true,
        version: '1.1.1',
        maxZoom: 19,
        opacity: cfg.opacity,
        zIndex: 10 + index,
      });

      wmsLayersRef.current[cfg.id] = capa;

      if (cfg.defaultActive) {
        capa.addTo(map);
      }
    });

    // Dibujar los 2 puntos de referencia de las estaciones físicas de la Red MÓNICA
    ESTACIONES_MONICA.forEach((est) => {
      L.circleMarker([est.lat, est.lng], {
        radius: 9,
        color: '#ffffff',
        weight: 2.5,
        fillColor: '#e11d48',
        fillOpacity: 1,
      })
        .bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4; color: #0f172a;">
            <strong style="color: #e11d48; font-size: 13px;">${est.nombre}</strong><br/>
            <span style="font-size: 11px; color: #475569;">Ground-Truth Físico Certificado (Red MÓNICA)</span>
            <div style="margin-top: 6px; padding: 6px; background: #fff1f2; border-radius: 4px; border: 1px solid #fecdd3; font-size: 11px;">
              ${est.datos}
            </div>
          </div>
        `)
        .addTo(map);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. Implementar "04 · GETFEATUREINFO" con conversión exacta de BBOX a metros EPSG:3857
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleMapClick = async (e) => {
      // Marcador donde se hizo clic
      if (clickMarkerRef.current) {
        clickMarkerRef.current.setLatLng(e.latlng);
      } else {
        clickMarkerRef.current = L.circleMarker(e.latlng, {
          radius: 7,
          color: '#ffffff',
          weight: 2,
          fillColor: '#4f46e5',
          fillOpacity: 1,
        }).addTo(map);
      }

      const size = map.getSize();
      const bounds = map.getBounds();
      const containerPoint = map.latLngToContainerPoint(e.latlng, map.getZoom());

      // Conversión obligatoria a metros EPSG:3857 como exige la guía técnica oficial:
      const swMeters = L.CRS.EPSG3857.project(bounds.getSouthWest());
      const neMeters = L.CRS.EPSG3857.project(bounds.getNorthEast());
      const bbox3857 = `${swMeters.x.toFixed(2)},${swMeters.y.toFixed(2)},${neMeters.x.toFixed(2)},${neMeters.y.toFixed(2)}`;

      if (queryLayerId === 'ALL') {
        const activeLayerList = layers.filter((l) => activeLayers[l.id]);
        setFeatureResult({
          layerName: 'Inspección Multidimensional (Capas Activas)',
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          features: [],
          loading: true,
        });

        try {
          const results = await Promise.all(
            activeLayerList.map(async (layer) => {
              const params = new URLSearchParams({
                key: SERVICE_KEY,
                service_id: layer.serviceId,
                SERVICE: 'WMS',
                VERSION: '1.1.1',
                REQUEST: 'GetFeatureInfo',
                SRS: 'EPSG:3857',
                BBOX: bbox3857,
                WIDTH: String(Math.round(size.x)),
                HEIGHT: String(Math.round(size.y)),
                X: String(Math.round(containerPoint.x)),
                Y: String(Math.round(containerPoint.y)),
                INFO_FORMAT: 'application/json',
                FEATURE_COUNT: '5',
              });
              const response = await fetch(`${WMS_ENDPOINT}?${params.toString()}`);
              const geojson = await response.json();
              return (geojson?.features || []).map((f) => ({
                ...f,
                properties: { ...f.properties, _capa_origen: layer.name },
              }));
            })
          );

          setFeatureResult({
            layerName: 'Inspección Multidimensional (Capas Activas)',
            lat: e.latlng.lat,
            lng: e.latlng.lng,
            features: results.flat(),
            loading: false,
          });
        } catch (error) {
          console.error('Error en GetFeatureInfo simultáneo:', error);
          setFeatureResult({
            layerName: 'Inspección Multidimensional',
            lat: e.latlng.lat,
            lng: e.latlng.lng,
            features: [],
            loading: false,
          });
        }
        return;
      }

      const targetLayer = layers.find((l) => l.id === queryLayerId);
      if (!targetLayer) return;

      setFeatureResult({
        layerName: targetLayer.name,
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        features: [],
        loading: true,
      });

      const params = new URLSearchParams({
        key: SERVICE_KEY,
        service_id: targetLayer.serviceId,
        SERVICE: 'WMS',
        VERSION: '1.1.1',
        REQUEST: 'GetFeatureInfo',
        SRS: 'EPSG:3857',
        BBOX: bbox3857,
        WIDTH: String(Math.round(size.x)),
        HEIGHT: String(Math.round(size.y)),
        X: String(Math.round(containerPoint.x)),
        Y: String(Math.round(containerPoint.y)),
        INFO_FORMAT: 'application/json',
        FEATURE_COUNT: '5',
      });

      try {
        const response = await fetch(`${WMS_ENDPOINT}?${params.toString()}`);
        const geojson = await response.json();
        setFeatureResult({
          layerName: targetLayer.name,
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          features: geojson?.features || [],
          loading: false,
        });
      } catch (error) {
        console.error('Error consultando GetFeatureInfo:', error);
        setFeatureResult({
          layerName: targetLayer.name,
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          features: [],
          loading: false,
        });
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [queryLayerId, layers]);

  // Encender / apagar capa WMS
  const toggleLayer = (id) => {
    const map = mapRef.current;
    const wmsLayer = wmsLayersRef.current[id];
    if (!map || !wmsLayer) return;

    const nextState = !activeLayers[id];
    if (nextState) {
      wmsLayer.addTo(map);
    } else {
      map.removeLayer(wmsLayer);
    }
    setActiveLayers((prev) => ({ ...prev, [id]: nextState }));
  };

  // Cambiar opacidad
  const changeOpacity = (id, opacity) => {
    const wmsLayer = wmsLayersRef.current[id];
    if (wmsLayer) {
      wmsLayer.setOpacity(opacity);
    }
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, opacity } : l)));
  };

  // Cargar el archivo GeoJSON de Líneas de Transporte descargado del portal
  const handleTransportGeoJsonUpload = (e) => {
    const file = e.target.files?.[0];
    const map = mapRef.current;
    if (!file || !map) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const geojson = JSON.parse(event.target?.result);
        if (transportLayerRef.current) {
          map.removeLayer(transportLayerRef.current);
        }
        transportLayerRef.current = L.geoJSON(geojson, {
          style: {
            color: '#f59e0b',
            weight: 2.5,
            opacity: 0.85,
          },
          onEachFeature: (feature, layer) => {
            if (feature.properties) {
              layer.bindPopup(
                `<pre class="text-xs p-1 bg-slate-900 text-white rounded">${JSON.stringify(feature.properties, null, 2)}</pre>`
              );
            }
          },
        }).addTo(map);
      } catch (err) {
        alert('El archivo seleccionado no es un GeoJSON válido.');
      }
    };
    reader.readAsText(file);
  };

  // 3. Generador oficial de URL para "03 · GETLEGENDGRAPHIC"
  const getOfficialLegendUrl = (serviceId) => {
    const params = new URLSearchParams({
      key: SERVICE_KEY,
      service_id: serviceId,
      REQUEST: 'GetLegendGraphic',
      VERSION: '1.0.0',
      FORMAT: 'image/png',
    });
    return `${WMS_ENDPOINT}?${params.toString()}`;
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 relative">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[1000] rounded-xl bg-neutral-900/90 border border-neutral-700 px-3.5 py-2 text-xs font-bold text-white shadow-xl hover:bg-neutral-800 transition"
        >
          ✕ Volver al Sistema Principal
        </button>
      )}

      {/* PANEL DE CONTROL */}
      <aside className="w-96 flex-shrink-0 border-r border-slate-800 bg-slate-900 p-5 overflow-y-auto space-y-5">
        <div>
          <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-300">
            serviciosgamc.cochabamba.bo · EPSG:3857
          </span>
          <h1 className="mt-1.5 text-lg font-bold text-white">
            Microclimas Urbanos con IA
          </h1>
          <p className="text-xs text-slate-400">
            Visor Oficial con las 4 Capas WMS + Red MÓNICA + Transporte
          </p>
        </div>

        {/* Selector de las 4 Capas WMS */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Servicios WMS del Proyecto (4 Capas)
          </h2>

          {layers.map((layer) => {
            const isActive = !!activeLayers[layer.id];
            return (
              <div
                key={layer.id}
                className={`rounded-xl border p-3.5 transition ${
                  isActive
                    ? 'border-indigo-500 bg-indigo-950/25'
                    : 'border-slate-800 bg-slate-950/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span
                      className={`mr-2 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        layer.styleType === 'Categorizado'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-indigo-500/20 text-indigo-300'
                      }`}
                    >
                      {layer.styleType}
                    </span>
                    <span className="text-sm font-bold text-white">{layer.name}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => toggleLayer(layer.id)}
                    className="h-4 w-4 accent-indigo-500 cursor-pointer"
                  />
                </div>

                <p className="mt-1 text-[11px] text-slate-400">{layer.description}</p>
                <div className="mt-1 font-mono text-[10px] text-slate-500 truncate">
                  UUID: {layer.serviceId}
                </div>

                {isActive && (
                  <div className="mt-3 space-y-2 border-t border-slate-800 pt-2.5">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>Opacidad: {Math.round(layer.opacity * 100)}%</span>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={layer.opacity}
                        onChange={(e) => changeOpacity(layer.id, parseFloat(e.target.value))}
                        className="w-28 accent-indigo-500"
                      />
                    </div>

                    {/* 03 · GETLEGENDGRAPHIC */}
                    <div className="rounded bg-white p-2 text-slate-900">
                      <span className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                        Leyenda Oficial ({layer.name}):
                      </span>
                      <img
                        src={getOfficialLegendUrl(layer.serviceId)}
                        alt={`Leyenda ${layer.name}`}
                        className="max-h-32 object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Cargador directo para el GeoJSON de Líneas de Transporte */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-2">
          <span className="block text-xs font-bold text-amber-400">
            Recurso Descargable: Líneas de Transporte (GeoJSON)
          </span>
          <p className="text-[11px] text-slate-400">
            Superpón las 142 rutas de transporte público para demostrar cómo los corredores de micros y trufis concentran el calor antropogénico y los picos de PM10.
          </p>
          <input
            type="file"
            accept=".geojson,.json"
            onChange={handleTransportGeoJsonUpload}
            className="block w-full text-xs text-slate-300 file:mr-2 file:rounded file:border-0 file:bg-indigo-600 file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-white hover:file:bg-indigo-500 cursor-pointer"
          />
        </div>

        {/* Selector de Capa para Consulta GetFeatureInfo */}
        <div className="border-t border-slate-800 pt-4 space-y-3">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
              Capa a inspeccionar al hacer clic (GetFeatureInfo):
            </label>
            <select
              value={queryLayerId}
              onChange={(e) => setQueryLayerId(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
            >
              <option value="ALL">🔍 Inspección Simultánea (Todas las Capas Activas)</option>
              {layers.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {featureResult && (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
              <div className="text-[11px] font-bold text-indigo-400">
                Resultado en {featureResult.layerName}
              </div>
              {featureResult.loading ? (
                <p className="text-xs text-slate-400 animate-pulse mt-1">
                  Consultando atributos en EPSG:3857...
                </p>
              ) : featureResult.features.length > 0 ? (
                <pre className="mt-2 max-h-44 overflow-auto rounded bg-slate-900 p-2 text-[11px] text-emerald-300">
                  {JSON.stringify(featureResult.features[0].properties, null, 2)}
                </pre>
              ) : (
                <p className="mt-1 text-xs text-slate-500">
                  No hay elementos de "{featureResult.layerName}" en el punto consultado.
                </p>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* MAPA INTERACTIVO */}
      <main className="relative flex-1 h-full">
        <div ref={mapContainerRef} className="h-full w-full" />
      </main>
    </div>
  );
}
