import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Endpoint oficial con CORS abierto habilitado por la Alcaldía de Cochabamba
const GAMC_PROXY = 'https://serviciosgamc.cochabamba.bo/api/gs/wms';
const GAMC_KEY = '1a3d2d9c6e1d6a94062d11a9021a48b24ae0e05e8183e9d8';

// Validador estricto para evitar que Leaflet pida capas con UUIDs inválidos
const isValidUUID = (uuid) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);

// Los 3 UUIDs REALES del GAMC ya configurados
const INITIAL_LAYERS = [
  {
    id: 'periurbanos',
    name: 'Zonas Periurbanas',
    moduleCode: '05',
    serviceId: 'c52066a1-32fd-4925-81e0-c2dcb8f4238f',
    opacity: 0.85,
  },
  {
    id: 'cota_2750',
    name: 'Cota 2750 - Parque Tunari',
    moduleCode: '05',
    serviceId: '297cefa4-0832-42bb-a98e-2cbea989fd9d',
    opacity: 0.9,
  },
  {
    id: 'limites_distritales',
    name: 'Límites Distritales (15 Distritos)',
    moduleCode: '05',
    serviceId: '7eb13092-bf0e-493b-aae6-03c43eedda2c',
    opacity: 0.7,
  },
];

export default function GamcExactMap({ onClose }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const wmsRefs = useRef({});
  const clickMarkerRef = useRef(null);

  const [layers, setLayers] = useState(INITIAL_LAYERS);
  const [activeIds, setActiveIds] = useState({
    periurbanos: true, // Inicia encendida
    cota_2750: true,
    limites_distritales: true,
  });

  const [selectedLayerForQuery, setSelectedLayerForQuery] = useState('limites_distritales');
  const [clickData, setClickData] = useState(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [-17.3895, -66.1568],
      zoom: 12,
      minZoom: 9,
      maxZoom: 19,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap · © CARTO · IDE GAMC Cochabamba',
      maxZoom: 19,
    }).addTo(map);

    layers.forEach((item) => {
      if (!isValidUUID(item.serviceId)) return;

      const authenticatedWmsUrl = `${GAMC_PROXY}?key=${encodeURIComponent(GAMC_KEY)}&service_id=${encodeURIComponent(item.serviceId)}`;

      const wmsLayer = L.tileLayer.wms(authenticatedWmsUrl, {
        layers: '',
        styles: '',
        format: 'image/png',
        transparent: true,
        version: '1.1.1',
        crs: L.CRS.EPSG4326,
        opacity: item.opacity,
        tileSize: 256,
      });

      wmsRefs.current[item.id] = wmsLayer;

      if (activeIds[item.id]) {
        wmsLayer.addTo(map);
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleMapClick = async (e) => {
      const { lat, lng } = e.latlng;

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

      setClickData({ lat, lng, properties: null, trendDecade: null, loading: true });

      const targetLayer = layers.find((l) => l.id === selectedLayerForQuery);
      let fetchedProps = null;

      if (targetLayer && isValidUUID(targetLayer.serviceId)) {
        const size = map.getSize();
        const bounds = map.getBounds();
        const containerPoint = map.latLngToContainerPoint(e.latlng, map.getZoom());
        const bbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;

        const params = new URLSearchParams({
          key: GAMC_KEY,
          service_id: targetLayer.serviceId,
          SERVICE: 'WMS',
          VERSION: '1.1.1',
          REQUEST: 'GetFeatureInfo',
          LAYERS: '',
          QUERY_LAYERS: '',
          SRS: 'EPSG:4326',
          BBOX: bbox,
          WIDTH: Math.round(size.x).toString(),
          HEIGHT: Math.round(size.y).toString(),
          X: Math.round(containerPoint.x).toString(),
          Y: Math.round(containerPoint.y).toString(),
          INFO_FORMAT: 'application/json',
        });

        try {
          // Primero intentamos la ruta serverless anti-CORS y si no, directo al proxy
          let res = await fetch(`/api/gamc-feature-info?${params.toString()}`).catch(() => null);
          if (!res || !res.ok) {
            res = await fetch(`${GAMC_PROXY}?${params.toString()}`);
          }
          if (res.ok) {
            const data = await res.json();
            if (data?.features && data.features.length > 0) {
              fetchedProps = data.features[0].properties;
            }
          }
        } catch (err) {
          console.error('Error en GetFeatureInfo:', err);
        }
      }

      let calculatedTrend = null;
      try {
        const nasaUrl = `https://power.larc.nasa.gov/api/temporal/annual/point?parameters=TS&community=SB&longitude=${lng}&latitude=${lat}&start=2005&end=2024&format=JSON`;
        const nasaRes = await fetch(nasaUrl);
        if (nasaRes.ok) {
          const nasaJson = await nasaRes.json();
          const tsObj = nasaJson?.properties?.parameter?.TS || {};
          const pts = Object.entries(tsObj)
            .filter(([yr, val]) => Number(yr) >= 2005 && Number(yr) <= 2024 && val !== -999)
            .map(([yr, val]) => ({ x: Number(yr), y: Number(val) }));

          if (pts.length > 5) {
            const n = pts.length;
            const meanX = pts.reduce((a, b) => a + b.x, 0) / n;
            const meanY = pts.reduce((a, b) => a + b.y, 0) / n;
            const num = pts.reduce((acc, p) => acc + (p.x - meanX) * (p.y - meanY), 0);
            const den = pts.reduce((acc, p) => acc + Math.pow(p.x - meanX, 2), 0);
            calculatedTrend = Number(((num / den) * 10).toFixed(2));
          }
        }
      } catch (err) {
        console.error('Error consultando NASA POWER:', err);
      }

      setClickData({
        lat,
        lng,
        properties: fetchedProps,
        trendDecade: calculatedTrend,
        loading: false,
      });
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [selectedLayerForQuery, layers]);

  const handleToggleLayer = (layerItem) => {
    if (!isValidUUID(layerItem.serviceId)) return;
    const map = mapRef.current;
    const wmsLayer = wmsRefs.current[layerItem.id];
    if (!map || !wmsLayer) return;

    const nextActive = !activeIds[layerItem.id];
    if (nextActive) {
      wmsLayer.addTo(map);
    } else {
      map.removeLayer(wmsLayer);
    }
    setActiveIds((prev) => ({ ...prev, [layerItem.id]: nextActive }));
    setSelectedLayerForQuery(layerItem.id);
  };

  const handleOpacityChange = (id, newOpacity) => {
    const wmsLayer = wmsRefs.current[id];
    if (wmsLayer) {
      wmsLayer.setOpacity(newOpacity);
    }
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, opacity: newOpacity } : l)));
  };

  return (
    <div className="flex h-full w-full bg-slate-950 text-slate-100 relative">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[1000] rounded-xl bg-neutral-900/90 border border-neutral-700 px-3 py-1.5 text-xs font-bold text-white shadow-xl hover:bg-neutral-800"
        >
          ✕ Volver al Sistema Principal
        </button>
      )}

      <aside className="w-96 flex-shrink-0 border-r border-slate-800 bg-slate-900 p-5 overflow-y-auto">
        <div className="mb-5">
          <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[11px] font-bold text-indigo-300">
            WMS 1.1.1 · EPSG:4326 Verificado
          </span>
          <h1 className="mt-2 text-lg font-bold text-white">
            Visor Cartográfico GAMC + NASA
          </h1>
          <p className="text-xs text-slate-400">
            Be An Earth System Trend Detective!
          </p>
        </div>

        <div className="space-y-3">
          {layers.map((layer) => {
            const valid = isValidUUID(layer.serviceId);
            const active = !!activeIds[layer.id];
            const legendUrl = `${GAMC_PROXY}?key=${encodeURIComponent(GAMC_KEY)}&service_id=${encodeURIComponent(layer.serviceId)}&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetLegendGraphic&LAYER=&FORMAT=image/png`;

            return (
              <div
                key={layer.id}
                className={`rounded-xl border p-3.5 transition ${
                  active ? 'border-indigo-500 bg-indigo-950/30' : 'border-slate-800 bg-slate-950/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-indigo-400 mr-1.5">
                      [{layer.moduleCode}]
                    </span>
                    <span className="text-sm font-semibold text-white">{layer.name}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => handleToggleLayer(layer)}
                    className="h-4 w-4 accent-indigo-500 cursor-pointer"
                  />
                </div>

                {active && valid && (
                  <div className="mt-3 space-y-2 border-t border-slate-800/80 pt-2.5">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>Opacidad: {Math.round(layer.opacity * 100)}%</span>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={layer.opacity}
                        onChange={(e) => handleOpacityChange(layer.id, parseFloat(e.target.value))}
                        className="w-32 accent-indigo-500"
                      />
                    </div>
                    <div className="rounded bg-white p-2 text-slate-900">
                      <span className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                        Leyenda Oficial GAMC:
                      </span>
                      <img src={legendUrl} alt={`Leyenda ${layer.name}`} className="max-h-24 object-contain" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 border-t border-slate-800 pt-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Inspección Puntual (Clic en el Mapa)
          </h2>

          {!clickData && (
            <p className="rounded-lg border border-dashed border-slate-700 p-3 text-xs text-slate-400">
              Haz clic sobre cualquier polígono para extraer sus atributos del GAMC y la tendencia de la NASA.
            </p>
          )}

          {clickData?.loading && (
            <div className="rounded-lg bg-slate-950 p-4 text-xs text-indigo-400 animate-pulse">
              Consultando GeoServer del GAMC y satélite NASA...
            </div>
          )}

          {clickData && !clickData.loading && (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-3">
              <div className="text-xs text-slate-400 font-mono">
                Lat: {clickData.lat.toFixed(5)} | Lng: {clickData.lng.toFixed(5)}
              </div>

              {clickData.trendDecade !== null && (
                <div className="rounded-lg bg-indigo-950/50 border border-indigo-500/30 p-2.5">
                  <span className="block text-[10px] uppercase text-indigo-300 font-semibold">
                    Tendencia Superficial NASA (2005–2024)
                  </span>
                  <span className="text-lg font-bold text-white">
                    {clickData.trendDecade > 0 ? `+${clickData.trendDecade}` : clickData.trendDecade} °C / década
                  </span>
                </div>
              )}

              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Atributos del Polígono (GAMC):
                </span>
                {clickData.properties ? (
                  <pre className="max-h-40 overflow-auto rounded bg-slate-900 p-2 text-[11px] text-emerald-300">
                    {JSON.stringify(clickData.properties, null, 2)}
                  </pre>
                ) : (
                  <p className="text-xs text-slate-500">Sin polígono o atributos en esta coordenada.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>

      <main className="relative flex-1 h-full">
        <div ref={mapContainerRef} className="h-full w-full" />
      </main>
    </div>
  );
}
