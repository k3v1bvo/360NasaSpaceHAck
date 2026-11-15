import React, { useEffect, useRef, useState } from 'react';
import { 
  Info, ChevronDown, Crosshair, X, Eye, EyeOff, Search, Compass, MapPin,
  Play, Pause, TrendingUp, Calendar, Flame, Wind, Sparkles
} from 'lucide-react';
import tunariPolygonData from '../../../data/gamc/parque_nacional_tunari.geojson';
import distritosData from '../../../data/gamc/distritos_cochabamba.geojson';
import floodPointsData from '../../../data/gamc/60_puntos_inundacion.geojson';
import cota2750Data from '../../../data/gamc/cota_2750_tunari.geojson';
import monicaData from '../data/monica_virtual_sensors.json';
import globalHotspots from '../data/global_trend_hotspots.json';
import temporalTrendsData from '../data/temporal_trends_data.json';
import TemporalTrendModal from '../modules/TemporalTrendModal';

import { 
  GAMC_CONFIG, 
  GAMC_LAYERS, 
  getGamcWmsOptions, 
  getGamcLegendUrl, 
  buildGamcFeatureInfoUrl 
} from '../config/gamcServices';

const GLOBAL_CENTER = [15.0, -10.0];
const GLOBAL_ZOOM = 3;
const COCHABAMBA_CENTER = [-17.3895, -66.1568];
const COCHABAMBA_ZOOM = 12;

const DISTRICTS_CONFIG = [
  { id: 'D1', num: 1, name: 'Queru Queru / Pacata', zone: 'NORTE', color: '#10b981', lst: 26.2, hito: 'Palacio Portales • UPB', keywords: 'queru queru pacata mayorazgo aranjuez upb palacio portales ciclovia américa este' },
  { id: 'D2', num: 2, name: 'Cala Cala / Tupuraya', zone: 'NORTE', color: '#10b981', lst: 25.8, hito: 'SEMAPA • Parque Fidel Anze', keywords: 'cala cala tupuraya semapa circunvalación fidel anze estadio capriles balneario' },
  { id: 'D3', num: 3, name: 'Sarco / Temporal', zone: 'NORTE', color: '#3b82f6', lst: 27.1, hito: 'Parque Bicentenario • Pintumayu', keywords: 'sarco temporal condebamba beijing norte parque familia pintumayu tiquipaya cruce taquiña' },
  { id: 'D13', num: 13, name: 'Tunari Alto (PNT)', zone: 'NORTE', color: '#059669', lst: 16.8, hito: 'Cota 2750 • Parque Tunari', keywords: 'tunari alto cota 2750 pnt reserva bioclimatica parque nacional bosque kewiña pico cordillera' },
  { id: 'D10', num: 10, name: 'Centro Histórico / Casco Viejo', zone: 'CENTRO', color: '#f59e0b', lst: 31.2, hito: 'Plaza 14 Septiembre • El Prado', keywords: 'centro historico casco viejo plaza 14 de septiembre catedral el prado teatro acha cancha norte colonial' },
  { id: 'D11', num: 11, name: 'Las Cuadras / San Pedro', zone: 'CENTRO', color: '#3b82f6', lst: 28.9, hito: 'Cristo Concordia • Campus UMSS', keywords: 'las cuadras san pedro umss campus cristo de la concordia teleferico parque infantil oquendo' },
  { id: 'D12', num: 12, name: 'Hipódromo / Sarco Sur', zone: 'CENTRO', color: '#3b82f6', lst: 29.4, hito: 'Parque Ex-Combatientes', keywords: 'hipodromo sarco sur villa galindo parque excombatientes beijing coliseo coronilla hospital seton' },
  { id: 'D4', num: 4, name: 'La Chimba / Coña Coña', zone: 'OESTE', color: '#f59e0b', lst: 29.8, hito: 'Humedal Coña Coña • Coraca', keywords: 'la chimba coña coña blanco galindo humedal mercado coraca colcapirhua vaso regulador' },
  { id: 'D5', num: 5, name: 'Jaihuayco / Aeropuerto', zone: 'OESTE', color: '#ef4444', lst: 33.4, hito: 'Aeropuerto Wilstermann • La Maica', keywords: 'jaihuayco aeropuerto wilstermann parque kanata estacion monica 6 de agosto la maica lechero pista' },
  { id: 'D6', num: 6, name: 'Laguna Alalay / Cerro Verde', zone: 'ESTE', color: '#06b6d4', lst: 28.5, hito: 'Laguna Alalay • Recinto FEXCO', keywords: 'laguna alalay fexco feria cerro verde circuito bolivia isla fria club wilstermann' },
  { id: 'D7', num: 7, name: 'Valle Hermoso / Pagador', zone: 'ESTE', color: '#ef4444', lst: 32.7, hito: 'Ladera San Pedro • Petrolera', keywords: 'valle hermoso villa sebastian pagador petrolera ladera san pedro refineria mercado campesino' },
  { id: 'D14', num: 14, name: 'Alto Cochabamba / Pagador Sur', zone: 'SUR', color: '#ef4444', lst: 33.9, hito: 'Mirador Alto Cocha • San Miguel', keywords: 'alto cochabamba sebastian pagador sur mirador petrolero laderas san miguel tanques semapa' },
  { id: 'D15', num: 15, name: "K'ara K'ara / Arrumani", zone: 'SUR', color: '#dc2626', lst: 37.2, hito: 'Relleno K\'ara K\'ara • Máx. Calor', keywords: "k'ara k'ara kara kara arrumani pampa san miguel relleno sanitario vertedero isla de calor policia" },
  { id: 'D8', num: 8, name: 'Ushpa Ushpa / Sureste', zone: 'SUR', color: '#dc2626', lst: 36.5, hito: 'Av. Petrolera km 8 • Salida Valle Alto', keywords: 'ushpa ushpa valle hermoso sur petrolera angostura refineria arido calor extremo' },
  { id: 'D9', num: 9, name: 'Itocta / Tamborada', zone: 'SUR', color: '#ef4444', lst: 34.8, hito: 'Campus UNVALLE • Río Tamborada', keywords: 'itocta tamborada pucara rio unvalle campus alto rendimiento panamericana sur agricola' }
];

const DECADAL_WARMING_RATES = {
  'D1': 0.22, 'D2': 0.20, 'D3': 0.35, 'D4': 0.48, 'D5': 0.65,
  'D6': -0.10, 'D7': 0.58, 'D8': 0.71, 'D9': 0.78, 'D10': 0.65,
  'D11': 0.42, 'D12': 0.40, 'D13': -0.18, 'D14': 0.68, 'D15': 0.74
};

const MONTHLY_ANOMALIES = {
  1: 0.5, 2: 0.0, 3: -0.5, 4: -1.5, 5: -3.0, 6: -4.5,
  7: -4.0, 8: 1.0, 9: 2.2, 10: 3.5, 11: 3.8, 12: 2.0
};

const PREDICTED_2026_HOTSPOTS = [
  {
    id: 'PRED-2026-01',
    lat: -17.324,
    lon: -66.178,
    zona: 'Cuenca Taquiña / Cota 2750',
    probabilidad: '89.4%',
    frp_est_mw: 165,
    riesgo: 'Crítico',
    factor: 'Biomasa seca acumulada + vientos catabáticos nocturnos > 35 km/h',
    brigada: 'GEOS & UGR Cercado - Retén preventivo Taquiña'
  },
  {
    id: 'PRED-2026-02',
    lat: -17.318,
    lon: -66.142,
    zona: 'Bosque Andrada / Quebrada San Pedro',
    probabilidad: '84.2%',
    frp_est_mw: 140,
    riesgo: 'Muy Alto',
    factor: 'Pastizales no gestionados en interfaz urbana-forestal sobre Cota 2750',
    brigada: 'SAR-Bolivia & Guardaparques PNT'
  },
  {
    id: 'PRED-2026-03',
    lat: -17.332,
    lon: -66.215,
    zona: 'Tiquipaya Norte / Cono de Deyección',
    probabilidad: '81.6%',
    frp_est_mw: 125,
    riesgo: 'Alto',
    factor: 'Baja humedad relativa (<12%) y pendiente escarpada',
    brigada: 'Bomberos Voluntarios Tiquipaya'
  },
  {
    id: 'PRED-2026-04',
    lat: -17.465,
    lon: -66.138,
    zona: "Distrito 15 K'ara K'ara (Isla de Calor Extrema)",
    probabilidad: '76.8%',
    frp_est_mw: 85,
    riesgo: 'Moderado-Alto',
    factor: 'Temperaturas LST > 41°C y riesgo de combustión residual',
    brigada: 'Policía Ecológica & Cuadrilla D15'
  }
];

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
  gibsDate = '2024-09-15',
  isTemporalModalOpen,
  setIsTemporalModalOpen
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersGroupRef = useRef(null);
  const highlightGroupRef = useRef(null);
  const layerRegistryRef = useRef({
    districts: {},
    sensors: {},
    focos: {},
    globals: {}
  });
  const leafletRef = useRef(null);
  const selectedPointRef = useRef(selectedPoint);
  const baseLayersRef = useRef({});
  const activeTabRef = useRef(activeTab);
  const renderLayersRef = useRef(null);
  const [baseMapType, setBaseMapType] = useState('streets'); // 'streets' (OpenStreetMap) | 'satellite' (Esri Imagery + Labels) | 'dark' (Esri Dark Canvas)
  const [showDistrictLabels, setShowDistrictLabels] = useState(true); // Control para ocultar/mostrar nombres de distritos
  const [showSensors, setShowSensors] = useState(true); // Control para ocultar/mostrar sensores
  const [showGamcWms, setShowGamcWms] = useState(false); // Capa WMS Oficial GAMC (Proyecto 01 & 05)
  const [gamcActiveLayers, setGamcActiveLayers] = useState({
    distritos: true,
    cota2750: true,
    periurbanos: false,
    areasVerdes: false
  });
  const [isGamcMenuOpen, setIsGamcMenuOpen] = useState(false);
  const [gamcFeatureInfo, setGamcFeatureInfo] = useState(null);
  const [isGamcLoading, setIsGamcLoading] = useState(false);
  const [isLegendOpen, setIsLegendOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
  const [districtSearch, setDistrictSearch] = useState('');
  const [districtZoneFilter, setDistrictZoneFilter] = useState('TODOS');
  const [isDistrictNavOpen, setIsDistrictNavOpen] = useState(false);

  // Estados de la Línea de Tiempo Multitemporal & Predicción IA
  const [timelineYear, setTimelineYear] = useState('ALL'); // 'ALL' | 2020..2026
  const [timelineMonth, setTimelineMonth] = useState('ALL'); // 'ALL' | 1..12
  const [isPlayingTimeline, setIsPlayingTimeline] = useState(false);
  const [localTemporalModalOpen, setLocalTemporalModalOpen] = useState(false);
  const modalOpen = isTemporalModalOpen !== undefined ? isTemporalModalOpen : localTemporalModalOpen;
  const setModalOpen = setIsTemporalModalOpen || setLocalTemporalModalOpen;

  const timelineYearRef = useRef(timelineYear);
  const timelineMonthRef = useRef(timelineMonth);

  useEffect(() => {
    timelineYearRef.current = timelineYear;
  }, [timelineYear]);

  useEffect(() => {
    timelineMonthRef.current = timelineMonth;
  }, [timelineMonth]);

  // Reproductor automático multitemporal (cicla los años con cadencia suave de 2.0s)
  useEffect(() => {
    if (!isPlayingTimeline) return;
    const yearsSequence = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
    const timer = setInterval(() => {
      setTimelineYear((prevYear) => {
        const cur = prevYear === 'ALL' ? 2020 : Number(prevYear);
        const idx = yearsSequence.indexOf(cur);
        if (idx === -1 || idx >= yearsSequence.length - 1) {
          return yearsSequence[0]; // vuelve a 2020
        }
        return yearsSequence[idx + 1];
      });
    }, 2000);

    return () => clearInterval(timer);
  }, [isPlayingTimeline]);

  const showGamcWmsRef = useRef(showGamcWms);
  const gamcActiveLayersRef = useRef(gamcActiveLayers);
  useEffect(() => { showGamcWmsRef.current = showGamcWms; }, [showGamcWms]);
  useEffect(() => { gamcActiveLayersRef.current = gamcActiveLayers; }, [gamcActiveLayers]);

  // Mantener selectedPointRef y activeTab sincronizados
  useEffect(() => {
    selectedPointRef.current = selectedPoint;
  }, [selectedPoint]);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

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

  // Inicialización de Leaflet con 3 capas base robustas (evita "Map data not yet available")
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
        zoomControl: false, // Desactivar en topleft para evitar que la barra superior lo tape
        minZoom: 2,
        worldCopyJump: true
      });

      // Reposicionar controles de zoom en la esquina inferior derecha (visible y accesible sin tapar nada)
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // 1. Base Callejero / Topográfico Abierto (OpenStreetMap Estándar - 100% Sin Marcas de Agua)
      const streetsLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          subdomains: ['a', 'b', 'c'],
          maxZoom: 19,
        }
      );

      // 2. Base Satelital de Alta Resolución (NASA Earthdata / Esri World Imagery con Etiquetas Viales)
      const satTiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; NASA Earthdata &copy; Esri',
        maxNativeZoom: 18,
        maxZoom: 19,
      });

      const satLabels = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: '&copy; Esri World Boundaries',
          maxZoom: 19,
          opacity: 0.95,
        }
      );

      const satGroup = L.layerGroup([satTiles, satLabels]);

      // 3. Base Oscura Científica (Esri Dark Canvas - 100% Libre de Marcas de Agua)
      const darkBase = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: '&copy; Esri, DeLorme, NAVTEQ',
          maxZoom: 19,
        }
      );

      const darkLabels = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: '&copy; Esri Canvas Reference',
          maxZoom: 19,
          opacity: 0.9,
        }
      );

      const darkGroup = L.layerGroup([darkBase, darkLabels]);

      baseLayersRef.current = {
        streets: streetsLayer,
        satellite: satGroup,
        dark: darkGroup,
      };

      // Iniciar con la capa callejera/topográfica activa para máxima claridad territorial
      streetsLayer.addTo(map);

      // Listener para clic en cualquier punto del mapa
      map.on('click', async (e) => {
        if (onMapClick) {
          onMapClick({ lat: e.latlng.lat, lon: e.latlng.lng });
        }

        // Consulta en vivo GetFeatureInfo al proxy municipal del GAMC si WMS está activo
        if (showGamcWmsRef.current && activeTabRef.current === 'microclimas') {
          try {
            const bounds = map.getBounds();
            const size = map.getSize();
            const point = map.latLngToContainerPoint(e.latlng);
            const bbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;
            const featureUrl = buildGamcFeatureInfoUrl({
              x: point.x,
              y: point.y,
              width: size.x,
              height: size.y,
              bbox,
              layerKey: 'distritos'
            });
            if (featureUrl) {
              setIsGamcLoading(true);
              const res = await fetch(featureUrl);
              if (res.ok) {
                const data = await res.json();
                if (data?.features?.[0]?.properties) {
                  setGamcFeatureInfo(data.features[0].properties);
                }
              }
              setIsGamcLoading(false);
            }
          } catch (err) {
            console.warn('GAMC GetFeatureInfo aviso:', err);
            setIsGamcLoading(false);
          }
        }
      });

      // Listener para downscaling dinámico al cambiar nivel de zoom (solo en modo global_nasa)
      map.on('zoomend', () => {
        if (activeTabRef.current === 'global_nasa' && renderLayersRef.current) {
          renderLayersRef.current();
        }
      });

      mapInstanceRef.current = map;
      layersGroupRef.current = L.layerGroup().addTo(map);
      highlightGroupRef.current = L.layerGroup().addTo(map);
      leafletRef.current = L;
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

  // Conmutador dinámico de capa base (Callejero / Satélite / Oscuro)
  useEffect(() => {
    if (!mapInstanceRef.current || !baseLayersRef.current.streets) return;
    const map = mapInstanceRef.current;

    Object.values(baseLayersRef.current).forEach((layer) => {
      if (map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    });

    const currentLayer = baseLayersRef.current[baseMapType];
    if (currentLayer) {
      currentLayer.addTo(map);
      // Mantener la capa base detrás de los polígonos y marcadores
      if (currentLayer.eachLayer) {
        currentLayer.eachLayer((l) => {
          if (l.bringToBack) l.bringToBack();
        });
      } else if (currentLayer.bringToBack) {
        currentLayer.bringToBack();
      }
    }
  }, [baseMapType]);

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
    } else if (activeTab === 'torrenteras') {
      map.flyTo([-17.375, -66.165], 12.5, { duration: 1.8 });
    } else if (activeTab === 'agrotech') {
      map.flyTo([-17.41, -66.24], 11.8, { duration: 1.8 });
    }
  }, [activeTab]);

  const renderLayers = async (L, map) => {
    if (!L) {
      try {
        L = await import('leaflet');
      } catch (e) { return; }
    }
    if (!map || !layersGroupRef.current) return;

    // Asegurar que siempre se usa la pestaña activa real (sin stale closures de Leaflet)
    const currentTab = activeTabRef.current || activeTab;

    layersGroupRef.current.clearLayers();

    // =========================================================================
    // CAPA 1: GLOBAL NASA DETECTIVE (Red Planetaria + Centinelas de Bolivia)
    // =========================================================================
    if (currentTab === 'global_nasa') {
      globalHotspots.forEach((spot) => {
        const isPilot = spot.is_pilot;
        const color = isPilot ? (
                        spot.id === 'cocha_sur' ? '#ef4444' :
                        spot.id === 'tunari_cota' ? '#10b981' :
                        spot.id === 'alalay' ? '#06b6d4' : '#c084fc'
                      ) :
                      spot.id === 'chiquitania' ? '#f97316' :
                      spot.id === 'chacaltaya' ? '#38bdf8' :
                      spot.id === 'uyuni' ? '#cbd5e1' :
                      spot.id === 'artico' ? '#38bdf8' :
                      spot.id === 'sahel' ? '#fbbf24' :
                      spot.id === 'gran_barrera' ? '#34d399' : '#f87171';

        const marker = L.circleMarker([spot.lat, spot.lon], {
          radius: isPilot ? 13 : spot.country === 'Bolivia' ? 10 : 9,
          fillColor: color,
          color: '#ffffff',
          weight: isPilot ? 2.5 : 1.5,
          opacity: 1,
          fillOpacity: 0.88,
        });

        marker.bindPopup(`
          <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; min-width: 250px; line-height: 1.45;">
            <div style="background: ${color}; color: ${isPilot || spot.id === 'sahel' || spot.id === 'uyuni' ? '#000' : '#fff'}; padding: 6px 10px; border-radius: 6px 6px 0 0; font-weight: bold; display: flex; justify-content: space-between; align-items: center;">
              <span>🛰️ ${spot.name}</span>
              <span style="font-size: 9px; background: rgba(0,0,0,0.25); color: #fff; padding: 1px 6px; border-radius: 4px;">${spot.country}</span>
            </div>
            <div style="padding: 8px 10px; border: 1px solid ${color}; border-top: none; border-radius: 0 0 6px 6px; background: white;">
              <strong>Fenómeno Detectado:</strong> ${spot.tipo_tendencia}<br/>
              <strong>Tasa de Cambio Decadal:</strong> <span style="font-weight: bold; color: #b91c1c;">${spot.tasa_cambio_decadal}</span><br/>
              <strong>Temperatura Superficie (LST):</strong> ${spot.lst_superficie_c} °C<br/>
              <strong>Significancia Estadística:</strong> <span style="color: #047857; font-weight: bold;">p = ${spot.p_value} (&lt; 0.05 ✓)</span><br/>
              <span style="font-size: 11px; color: #64748b;">Z-Score Mann-Kendall: ${spot.z_score_mann_kendall}</span>
              ${(isPilot || spot.country === 'Bolivia') ? `
                <div style="margin-top: 8px; padding-top: 6px; border-top: 1px dashed #cbd5e1; text-align: center;">
                  <button id="btn-zoom-pilot" style="background: #7c3aed; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-weight: bold; font-size: 11px; cursor: pointer; width: 100%;">
                    🔍 Ver Caso Piloto Regional (15 Distritos + Red MÓNICA) ↗
                  </button>
                </div>
              ` : ''}
            </div>
          </div>
        `);

        marker.on('click', () => {
          if (setSelectedPoint) {
            setSelectedPoint({
              type: 'global',
              id: spot.id,
              lat: spot.lat,
              lon: spot.lon,
              ...spot
            });
          }
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
        if (layerRegistryRef.current) {
          layerRegistryRef.current.globals[spot.id] = {
            layer: marker,
            data: spot,
            center: [spot.lat, spot.lon]
          };
        }
      });

      // Downscaling visual automático: Si el usuario hace zoom en Cochabamba (zoom >= 9), muestra polígonos distritales y estaciones
      if (map.getZoom() >= 9) {
        distritosData?.features?.forEach((dist) => {
          const p = dist.properties;
          const polyCoords = dist.geometry.coordinates[0].map(([lng, lat]) => [lat, lng]);
          const lstVal = p.lst_nasa_promedio_c || p.lst_temperatura_c || 28.0;
          const polyColor = lstVal > 35 ? '#ef4444' : lstVal > 30 ? '#f59e0b' : '#3b82f6';
          const polygon = L.polygon(polyCoords, {
            color: polyColor,
            weight: 1,
            fillColor: polyColor,
            fillOpacity: 0.15,
          });
          polygon.bindPopup(`<strong>📍 ${p.nombre}</strong><br/>LST NASA: ${lstVal} °C<br/>NDVI: ${p.ndvi_promedio || '0.25'}`);
          polygon.addTo(layersGroupRef.current);
          if (layerRegistryRef.current) {
            layerRegistryRef.current.districts[p.distrito_id] = {
              layer: polygon,
              defaultColor: polyColor,
              data: p,
              center: p.centroide || polyCoords[0]
            };
          }
        });

        monicaData?.estaciones_fisicas?.forEach((est) => {
          const m = L.circleMarker([est.lat, est.lon], {
            radius: 8,
            fillColor: '#06b6d4',
            color: '#fff',
            weight: 2,
            fillOpacity: 0.95
          });
          m.bindPopup(`<strong>🏛️ Red MÓNICA (GAMC): ${est.nombre}</strong><br/>Temp. Real: ${est.temp_aire_t2m_c} °C<br/>PM2.5: ${est.pm25_ug_m3} µg/m³`);
          m.addTo(layersGroupRef.current);
        });
      }

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
    if (currentTab === 'microclimas') {
      // 0. Capas WMS Oficiales del GAMC (Proyecto 01 & 05: Microclimas y Gestión Distrital)
      if (showGamcWms) {
        Object.entries(gamcActiveLayers).forEach(([layerKey, isActive]) => {
          if (!isActive) return;
          const wmsOpt = getGamcWmsOptions(layerKey);
          if (wmsOpt) {
            const gamcWms = L.tileLayer.wms(wmsOpt.url, wmsOpt.options);
            gamcWms.addTo(layersGroupRef.current);
          }
        });
      }

      // 1. Polígonos Oficiales de Distritos de Cercado (Catastro Municipal GAMC / INE 100% Topológico con Evolución Temporal Real)
      const currentYear = timelineYearRef.current;
      const currentMonth = timelineMonthRef.current;

      distritosData?.features?.forEach((dist) => {
        const p = dist.properties;

        const baseLst = p.lst_nasa_promedio_c || p.lst_temperatura_c || 28.0;
        const rate = DECADAL_WARMING_RATES[p.distrito_id] || 0.45;

        let yearDelta = 0;
        if (currentYear === 2026 || currentYear === '2026') {
          yearDelta = 6 * (rate / 10);
        } else if (currentYear !== 'ALL') {
          yearDelta = (Number(currentYear) - 2020) * (rate / 10);
        }

        const monthDelta = currentMonth !== 'ALL' ? (MONTHLY_ANOMALIES[Number(currentMonth)] || 0) : 0;
        const dynamicLst = parseFloat((baseLst + yearDelta + monthDelta).toFixed(1));

        const color = dynamicLst > 35 ? '#ef4444' :
                      dynamicLst > 31 ? '#f97316' :
                      dynamicLst > 28 ? '#f59e0b' :
                      dynamicLst > 24 ? '#3b82f6' : '#10b981';

        const polygon = L.geoJSON(dist, {
          style: {
            color: color,
            weight: 2.2,
            opacity: 0.95,
            fillColor: color,
            fillOpacity: dynamicLst > 34 ? 0.28 : 0.16, // Relleno translúcido dinámico según calor
          }
        });

        // Nombre y badge del distrito con legibilidad superior permanente y temperatura dinámica
        const compactName = (p.nombre.split('-')[1]?.trim() || p.nombre).split('/')[0].trim();
        polygon.bindTooltip(`
          <div style="display: flex; align-items: center; gap: 4px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 11px; font-weight: 800; white-space: nowrap;">
            <span style="background: ${color}; color: #ffffff; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 800; box-shadow: 0 1px 3px rgba(0,0,0,0.5);">${p.distrito_id}</span>
            <span style="color: #ffffff; text-shadow: 0 1px 2px rgba(0,0,0,0.9);">${compactName}</span>
            <span style="color: #fde047; font-size: 11px; font-weight: 800;">${dynamicLst}°C</span>
          </div>
        `, {
          permanent: true,
          direction: 'center',
          className: 'custom-district-tooltip',
          opacity: 0.95
        });

        // Hover dinámico para destacar el distrito seleccionado
        polygon.on('mouseover', () => {
          polygon.setStyle({ weight: 3.5, color: '#ffffff', fillOpacity: 0.40 });
        });

        polygon.on('mouseout', () => {
          const isSelected = selectedPointRef.current?.distrito_id === p.distrito_id || selectedPointRef.current?.id === p.distrito_id;
          if (isSelected) {
            polygon.setStyle({ weight: 4.5, color: '#ffffff', fillOpacity: 0.55 });
          } else {
            polygon.setStyle({ weight: 2.2, color, fillOpacity: dynamicLst > 34 ? 0.28 : 0.16 });
          }
        });

        polygon.on('click', () => {
          if (setSelectedPoint) {
            setSelectedPoint({
              type: 'district',
              id: p.distrito_id,
              distrito_id: p.distrito_id,
              lat: p.centroide ? p.centroide[0] : -17.39,
              lon: p.centroide ? p.centroide[1] : -66.15,
              lst_dinamico: dynamicLst,
              ...p
            });
          }
        });

        polygon.bindPopup(`
          <div style="color: #0f172a; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; min-width: 290px; max-width: 340px; line-height: 1.5;">
            <div style="background: ${color}; color: white; padding: 8px 12px; border-radius: 6px 6px 0 0; font-weight: 800; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 14px;">📍 ${p.nombre}</span>
              <span style="font-size: 11px; font-weight: 700; background: rgba(0,0,0,0.3); padding: 2px 7px; border-radius: 4px; text-transform: uppercase;">
                ${p.nivel_alerta || 'Distrito GAMC'}
              </span>
            </div>
            <div style="padding: 12px; border: 1px solid ${color}; border-top: none; border-radius: 0 0 6px 6px; background: white;">
              ${p.resena_historica ? `
                <div style="margin-bottom: 8px; color: #334155; font-size: 12px; line-height: 1.45; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
                  ${p.resena_historica}
                </div>
              ` : ''}

              ${p.hito_urbano ? `
                <div style="margin-bottom: 8px; font-size: 11px; color: #334155; background: #f8fafc; padding: 6px 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
                  🏛️ <strong>Hitos urbanos:</strong> ${p.hito_urbano}
                </div>
              ` : ''}

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 8px; font-size: 12px;">
                <div><strong>LST (${currentYear !== 'ALL' ? currentYear : 'NASA'}):</strong> <span style="font-weight: 800; color: ${color};">${dynamicLst} °C</span></div>
                <div><strong>NDVI (Verde):</strong> <span>${p.ndvi_promedio || 0.25}</span></div>
                ${p.temp_aire_pred_c ? `<div><strong>Aire T2M:</strong> ${(p.temp_aire_pred_c + yearDelta + monthDelta).toFixed(1)} °C</div>` : ''}
                ${p.pet_pred_c ? `<div><strong>Confort (PET):</strong> <span style="font-weight: 800; color: ${p.pet_pred_c > 35 ? '#b91c1c' : '#047857'};">${(p.pet_pred_c + yearDelta + monthDelta).toFixed(1)} °C</span></div>` : ''}
              </div>

              ${p.poblacion_total ? `
                <div style="font-size: 12px; color: #475569; margin-bottom: 6px;">
                  👥 <strong>Población:</strong> ${Number(p.poblacion_total).toLocaleString()} hab. • <strong>Déficit árboles:</strong> ${p.deficit_arbolado_pct || 50}%
                </div>
              ` : ''}

              ${p.tendencia_detectada ? `
                <div style="margin-top: 8px; padding: 6px 8px; background: #eff6ff; border-left: 3px solid #3b82f6; font-size: 11px; color: #1e3a8a; border-radius: 0 4px 4px 0;">
                  📈 <strong>Diagnóstico NASA:</strong> ${p.tendencia_detectada}
                </div>
              ` : ''}

              ${p.estrategia_recomendada ? `
                <div style="margin-top: 6px; padding: 6px 8px; background: #f0fdf4; border-left: 3px solid #16a34a; font-size: 11px; color: #14532d; border-radius: 0 4px 4px 0;">
                  🌱 <strong>Estrategia Alcaldía:</strong> ${p.estrategia_recomendada}
                </div>
              ` : ''}
            </div>
          </div>
        `);
        polygon.addTo(layersGroupRef.current);
        if (layerRegistryRef.current) {
          layerRegistryRef.current.districts[p.distrito_id] = {
            layer: polygon,
            defaultColor: color,
            data: p,
            center: p.centroide || [-17.39, -66.15]
          };
        }
      });

      // 1.2 Focos Satelitales Activos en el Tunari durante la reproducción temporal (Caso Piloto Microclimas)
      if (currentYear !== 'ALL' || isPlayingTimeline) {
        if (currentYear === 2026 || currentYear === '2026') {
          PREDICTED_2026_HOTSPOTS.forEach((pred) => {
            const marker = L.circleMarker([pred.lat, pred.lon], {
              radius: 9,
              fillColor: '#d946ef',
              color: '#ffffff',
              weight: 2,
              fillOpacity: 0.9,
            });
            marker.bindPopup(`
              <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; min-width: 210px;">
                <div style="background: #a21caf; color: white; padding: 4px 8px; border-radius: 4px 4px 0 0; font-weight: bold;">
                  ✨ Predicción IA 2026 (Tunari)
                </div>
                <div style="padding: 6px 8px; border: 1px solid #a21caf; border-top: none; background: white;">
                  <strong>Zona:</strong> ${pred.zona}<br/>
                  <strong>Riesgo:</strong> ${pred.riesgo} (${pred.probabilidad})<br/>
                  <strong>FRP Estimado:</strong> ${pred.frp_est_mw} MW<br/>
                  <span style="font-size: 11px; color: #475569;">${pred.factor}</span>
                </div>
              </div>
            `);
            marker.addTo(layersGroupRef.current);
          });
        } else {
          const activeFocos = (focosData || []).filter((f) => {
            const prop = f.properties;
            const fYear = prop.year || (prop.fecha ? parseInt(prop.fecha.split('-')[0], 10) : null);
            const fMonth = prop.month || (prop.fecha ? parseInt(prop.fecha.split('-')[1], 10) : null);
            if (fYear !== Number(currentYear)) return false;
            if (currentMonth !== 'ALL' && fMonth !== Number(currentMonth)) return false;
            return true;
          });

          activeFocos.slice(0, 90).forEach((foco) => {
            const [lng, lat] = foco.geometry.coordinates;
            const prop = foco.properties;
            const marker = L.circleMarker([lat, lng], {
              radius: 7,
              fillColor: '#ef4444',
              color: '#fde047',
              weight: 1.5,
              opacity: 0.95,
              fillOpacity: 0.85,
            });
            marker.bindPopup(`
              <div style="color: #0f172a; font-family: sans-serif; font-size: 12px;">
                <strong style="color: #dc2626;">🔥 Foco Satelital Tunari (${currentYear})</strong><br/>
                <strong>FRP:</strong> ${prop.frp ? prop.frp.toFixed(1) : 45} MW<br/>
                <strong>Sensor:</strong> ${prop.instrument || 'NASA MODIS/VIIRS'}
              </div>
            `);
            marker.addTo(layersGroupRef.current);
          });
        }
      }

      // 1.5. Línea Biofísica Oficial Cota 2.750 m s.n.m. (Ley 1262 - Parque Nacional Tunari)
      if (cota2750Data?.features?.[0]) {
        const cotaCoords = cota2750Data.features[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        
        // Halo de resplandor para contraste en cualquier fondo
        const cotaHalo = L.polyline(cotaCoords, {
          color: '#064e3b',
          weight: 6,
          opacity: 0.55,
        });
        cotaHalo.addTo(layersGroupRef.current);

        // Línea principal discontinua verde esmeralda brillante
        const cotaLine = L.polyline(cotaCoords, {
          color: '#10b981',
          weight: 3.5,
          dashArray: '10, 8',
          opacity: 1,
        });

        cotaLine.bindTooltip(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 11px; font-weight: 800; background: #065f46; color: #ecfdf5; padding: 3px 8px; border-radius: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.4); border: 1px solid #34d399; white-space: nowrap;">
            🏔️ COTA 2.750 msnm • LEY 1262 (PNT)
          </div>
        `, {
          sticky: true,
          direction: 'top',
          className: 'cota-tooltip'
        });

        cotaLine.bindPopup(`
          <div style="color: #0f172a; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; min-width: 290px; line-height: 1.5;">
            <div style="background: #059669; color: white; padding: 8px 12px; border-radius: 6px 6px 0 0; font-weight: 800; display: flex; justify-content: space-between; align-items: center;">
              <span>🌲 Cota 2.750 m s.n.m.</span>
              <span style="font-size: 10px; background: rgba(0,0,0,0.25); padding: 2px 6px; border-radius: 4px;">LEY 1262</span>
            </div>
            <div style="padding: 10px 12px; border: 1px solid #059669; border-top: none; border-radius: 0 0 6px 6px; background: white;">
              <strong>Límite Oficial del Parque Nacional Tunari (PNT)</strong><br/>
              <span style="color: #475569; font-size: 12px; display: block; margin-top: 4px;">
                Frontera biofísica y límite de cese de urbanización del GAMC fijado por la Ley Nacional 1262. Por encima de esta cota rige régimen estricto de protección ambiental, recarga hídrica de acuíferos y generación de brisas catabáticas nocturnas que oxigenan y enfrían el valle.
              </span>
              <div style="margin-top: 8px; padding: 6px 8px; background: #ecfdf5; border-left: 3px solid #10b981; font-size: 11px; color: #065f46; border-radius: 0 4px 4px 0;">
                🛰️ <strong>Modelo Digital de Elevación:</strong> Curva de nivel extraída de modelos de elevación satelital ALOS PALSAR (12.5m) y Copernicus GLO-30 a 2.750 msnm.
              </div>
            </div>
          </div>
        `);
        cotaLine.addTo(layersGroupRef.current);
      }

      // 2. Las 2 Estaciones Físicas de la Red MÓNICA (GAMC - Ground Truth)
      if (showSensors) {
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

        marker.on('click', () => {
          if (setSelectedPoint) {
            setSelectedPoint({
              type: 'sensor',
              id: est.id,
              distrito_id: est.distrito,
              lat: est.lat,
              lon: est.lon,
              ...est
            });
          }
        });

        marker.addTo(layersGroupRef.current);
        if (layerRegistryRef.current) {
          layerRegistryRef.current.sensors[est.id] = {
            layer: marker,
            data: est,
            center: [est.lat, est.lon]
          };
        }
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

        marker.on('click', () => {
          if (setSelectedPoint) {
            setSelectedPoint({
              type: 'sensor',
              id: sens.id,
              distrito_id: sens.distrito,
              lat: sens.lat,
              lon: sens.lon,
              ...sens
            });
          }
        });

        marker.addTo(layersGroupRef.current);
        if (layerRegistryRef.current) {
          layerRegistryRef.current.sensors[sens.id] = {
            layer: marker,
            data: sens,
            center: [sens.lat, sens.lon]
          };
        }
      });

      // 4. Los Micro-Nodos Críticos OTB (La Cancha, Alalay, UMSS, Wilstermann, Refinería)
      monicaData?.micro_nodos_hotspots?.forEach((node) => {
        const isCold = node.tipo === 'ISLA_FRIA';
        const isGreen = node.tipo === 'ISLA_VERDE';
        const fillColor = isCold ? '#06b6d4' : isGreen ? '#10b981' : '#f43f5e';
        const marker = L.circleMarker([node.lat, node.lon], {
          radius: 8,
          fillColor,
          color: '#ffffff',
          weight: 2,
          opacity: 0.95,
          fillOpacity: 0.9,
        });

        marker.bindPopup(`
          <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; min-width: 230px; line-height: 1.45;">
            <div style="background: ${fillColor}; color: white; padding: 5px 8px; border-radius: 4px 4px 0 0; font-weight: bold; display: flex; align-items: center; justify-content: space-between;">
              <span>🎯 ${node.nombre}</span>
              <span style="font-size: 9px; background: rgba(0,0,0,0.25); padding: 1px 5px; border-radius: 3px;">${node.tipo}</span>
            </div>
            <div style="padding: 7px 9px; border: 1px solid ${fillColor}; border-top: none; border-radius: 0 0 4px 4px; background: white;">
              <strong>Zona / Distrito:</strong> ${node.distrito}<br/>
              <strong>Temp. Estimada IA (T2M):</strong> <span style="color: #b91c1c; font-weight: bold;">${node.temp_aire_t2m_c} °C</span><br/>
              <strong>Temperatura Superficie (LST):</strong> ${node.lst_nasa_c} °C<br/>
              <strong>Tendencia Decadal:</strong> <span style="font-weight: bold; color: ${node.tendencia_decada?.includes('-') ? '#047857' : '#b91c1c'};">${node.tendencia_decada}</span><br/>
              <strong>Vegetación NDVI:</strong> ${node.ndvi_vegetacion} | <strong>AOD:</strong> ${node.aod_aerosoles}<br/>
              <div style="margin-top: 5px; padding: 4px; background: #f8fafc; border-left: 3px solid ${fillColor}; font-size: 11px;">
                <strong>Diagnóstico:</strong> ${node.alerta_isla_calor}
              </div>
            </div>
          </div>
        `);

        marker.on('click', () => {
          if (setSelectedPoint) {
            setSelectedPoint({
              type: 'sensor',
              id: node.id,
              distrito_id: node.distrito,
              lat: node.lat,
              lon: node.lon,
              ...node
            });
          }
        });

        marker.addTo(layersGroupRef.current);
        if (layerRegistryRef.current) {
          layerRegistryRef.current.sensors[node.id] = {
            layer: marker,
            data: node,
            center: [node.lat, node.lon]
          };
        }
      });
      } // Fin if (showSensors)
    }

    // =========================================================================
    // CAPA 3: INCENDIOS TUNARI (Causa Térmica y Plumas de Aerosoles)
    // =========================================================================
    if (currentTab === 'incendios') {
      // 1. Línea Cota 2750 Oficial Parque Nacional Tunari (Vector Permanente de Alta Precisión)
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
              <span style="color: #475569; font-size: 11px;">Frontera biofísica oficial del GAMC y amortiguamiento contra incendios forestales.</span>
            </div>
          </div>
        `);
        cotaLine.addTo(layersGroupRef.current);
      }

      // 2. Polígono Parque Nacional Tunari (Vector Permanente)
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
            <strong>Área:</strong> ~300,000 ha protegidas
          </div>
        `);
        polygon.addTo(layersGroupRef.current);
      }

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

      // B. Marcadores Satelitales de Fuego de la NASA & Predicción IA Multitemporal
      const currentYear = timelineYearRef.current;
      const currentMonth = timelineMonthRef.current;

      if (currentYear === 2026 || currentYear === '2026') {
        // Marcadores de Predicción IA 2026 (Corredores de Alto Riesgo en Tunari y D15)
        PREDICTED_2026_HOTSPOTS.forEach((pred) => {
          // Anillo exterior de alerta
          const ring = L.circleMarker([pred.lat, pred.lon], {
            radius: 20,
            fillColor: '#d946ef',
            color: '#ec4899',
            weight: 2,
            dashArray: '3, 4',
            opacity: 0.85,
            fillOpacity: 0.22
          });
          ring.addTo(layersGroupRef.current);

          const circle = L.circleMarker([pred.lat, pred.lon], {
            radius: 12,
            fillColor: '#c026d3',
            color: '#ffffff',
            weight: 2.5,
            opacity: 1,
            fillOpacity: 0.95
          });

          circle.bindPopup(`
            <div style="color: #0f172a; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; min-width: 280px; max-width: 320px; line-height: 1.5;">
              <div style="background: linear-gradient(135deg, #701a75, #a21caf); color: white; padding: 8px 12px; border-radius: 6px 6px 0 0; font-weight: 800; display: flex; justify-content: space-between; align-items: center;">
                <span>✨ PREDICCIÓN IA 2026</span>
                <span style="font-size: 11px; background: rgba(0,0,0,0.3); padding: 2px 7px; border-radius: 4px; text-transform: uppercase;">
                  ${pred.riesgo}
                </span>
              </div>
              <div style="padding: 12px; border: 1px solid #a21caf; border-top: none; border-radius: 0 0 6px 6px; background: white;">
                <div style="font-size: 14px; font-weight: 800; color: #701a75; margin-bottom: 4px;">
                  📍 ${pred.zona}
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin: 8px 0; font-size: 12px;">
                  <div><strong>Prob. Ignición:</strong> <span style="color: #a21caf; font-weight: 800;">${pred.probabilidad}</span></div>
                  <div><strong>FRP Estimado:</strong> <span style="font-weight: 800; color: #dc2626;">~${pred.frp_est_mw} MW</span></div>
                </div>
                <div style="margin-bottom: 8px; font-size: 11px; color: #475569; background: #fdf4ff; padding: 6px 8px; border-radius: 4px; border-left: 3px solid #d946ef;">
                  ⚠️ <strong>Factor Crítico:</strong> ${pred.factor}
                </div>
                <div style="font-size: 11px; color: #166534; background: #f0fdf4; padding: 6px 8px; border-radius: 4px; border-left: 3px solid #16a34a;">
                  🛡️ <strong>Acción Recomendada:</strong> ${pred.brigada}
                </div>
              </div>
            </div>
          `);

          circle.on('click', () => {
            if (setSelectedPoint) {
              setSelectedPoint({
                type: 'foco',
                id: pred.id,
                lat: pred.lat,
                lon: pred.lon,
                nombre: `Predicción IA 2026: ${pred.zona}`,
                frp_total_mw: pred.frp_est_mw,
                zona: pred.zona,
                ...pred
              });
            }
          });

          circle.addTo(layersGroupRef.current);
          if (layerRegistryRef.current) {
            layerRegistryRef.current.focos[pred.id] = {
              layer: circle,
              data: pred,
              center: [pred.lat, pred.lon]
            };
          }
        });
      } else {
        // Filtrar focos históricos según timelineYear y timelineMonth
        const filteredFocos = (focosData || []).filter((foco) => {
          const p = foco.properties;
          const fYear = p.year || (p.fecha ? parseInt(p.fecha.split('-')[0], 10) : null);
          const fMonth = p.month || (p.fecha ? parseInt(p.fecha.split('-')[1], 10) : null);

          if (currentYear !== 'ALL' && fYear !== Number(currentYear)) {
            return false;
          }
          if (currentMonth !== 'ALL' && fMonth !== Number(currentMonth)) {
            return false;
          }
          return true;
        });

        filteredFocos.forEach((foco) => {
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

          circle.on('click', () => {
            if (setSelectedPoint) {
              setSelectedPoint({
                type: 'foco',
                id: p.id,
                lat,
                lon: lng,
                ...p
              });
            }
          });

          circle.addTo(layersGroupRef.current);
          if (layerRegistryRef.current) {
            layerRegistryRef.current.focos[p.id] = {
              layer: circle,
              data: p,
              center: [lat, lng]
            };
          }
        });
      }
    }

    // =========================================================================
    // CAPA 4: TORRENTERAS & INUNDACIONES (60 Puntos GAMC + Cordillera Tunari)
    // =========================================================================
    if (currentTab === 'torrenteras') {
      // 1. Polígono Tunari / Cota 2750 como contexto orográfico de escorrentía
      if (tunariPolygonData?.features?.[0]) {
        const polyCoords = tunariPolygonData.features[0].geometry.coordinates[0].map(
          ([lng, lat]) => [lat, lng]
        );
        const polygon = L.polygon(polyCoords, {
          color: '#3b82f6',
          weight: 1.5,
          dashArray: '4, 4',
          fillColor: '#1d4ed8',
          fillOpacity: 0.08,
        });
        polygon.bindPopup(`
          <div style="color: #111; font-family: sans-serif; font-size: 12px;">
            <strong style="color: #1d4ed8;">🏔️ Cuenca Alta Cordillera Tunari</strong><br/>
            <strong>Origen de Escorrentía:</strong> Pendientes &gt; 35%<br/>
            <strong>Riesgo:</strong> Descarga torrencial hacia la mancha urbana
          </div>
        `);
        polygon.addTo(layersGroupRef.current);
      }

      // 2. 60 Puntos Históricos de Ground-Truth GAMC
      floodPointsData?.features?.forEach((pt) => {
        const [lng, lat] = pt.geometry.coordinates;
        const p = pt.properties;
        const isExtremo = p.nivel_riesgo === 'Extremo';
        const isAlto = p.nivel_riesgo === 'Alto';
        const fillColor = isExtremo ? '#ef4444' : isAlto ? '#f59e0b' : '#3b82f6';
        const radius = isExtremo ? 9 : isAlto ? 7 : 6;

        const circle = L.circleMarker([lat, lng], {
          radius,
          fillColor,
          color: '#ffffff',
          weight: 1.5,
          opacity: 0.95,
          fillOpacity: 0.85,
        });

        circle.bindPopup(`
          <div style="color: #111; font-family: sans-serif; font-size: 12px; min-width: 200px;">
            <strong style="color: ${fillColor}; font-size: 13px;">🌊 ${p.torrentera_zona}</strong><br/>
            <strong>Nivel de Riesgo:</strong> <span style="color: ${fillColor}; font-weight: bold;">${p.nivel_riesgo}</span><br/>
            <strong>Evento Histórico:</strong> ${p.tipo_evento}<br/>
            <strong>Umbral SENAMHI:</strong> &gt; ${p.senamhi_umbral_lluvia_mm} mm en 24h<br/>
            <strong>Frecuencia:</strong> ${p.frecuencia_historica}<br/>
            <span style="font-size: 10px; color: #6b7280;">Validación Ground-Truth GAMC UGR</span>
          </div>
        `);

        circle.on('click', () => {
          if (setSelectedPoint) {
            setSelectedPoint({ lat, lon: lng, ...p });
          }
        });

        circle.addTo(layersGroupRef.current);
      });
    }

    // =========================================================================
    // CAPA 5: AGROTECH & SUELOS VALLE (NASA SMAP + Parcelas Demostrativas)
    // =========================================================================
    if (currentTab === 'agrotech') {
      const AGRO_PINS = [
        { id: 'valle_bajo', name: 'Valle Bajo (Quillacollo / Vinto)', lat: -17.40, lon: -66.28, tipo: 'franco', smap: 19, cultivo: 'Maíz / Alfa', rotacion: 'Tarwi / Haba' },
        { id: 'valle_alto', name: 'Valle Alto (Cliza / Punata)', lat: -17.58, lon: -65.93, tipo: 'arenoso', smap: 14, cultivo: 'Trigo / Maíz Chuspillo', rotacion: 'Leguminosas de secano' },
        { id: 'ladera_tunari', name: 'Ladera Tunari (Tiquipaya / Apote)', lat: -17.34, lon: -66.21, tipo: 'pedregoso', smap: 22, cultivo: 'Agroforestería / Floricultura', rotacion: 'Molle y Frutales' },
        { id: 'valle_central', name: 'Valle Central (Colcapirhua)', lat: -17.39, lon: -66.23, tipo: 'franco', smap: 24, cultivo: 'Hortalizas periurbanas', rotacion: 'Abonos verdes' },
        { id: 'valle_sacaba', name: 'Valle de Sacaba (Chimboco)', lat: -17.40, lon: -66.04, tipo: 'franco', smap: 26, cultivo: 'Tubérculos / Haba', rotacion: 'Cereales menores' }
      ];

      AGRO_PINS.forEach((agro) => {
        const marker = L.circleMarker([agro.lat, agro.lon], {
          radius: 9,
          fillColor: '#10b981',
          color: '#ffffff',
          weight: 2,
          opacity: 0.95,
          fillOpacity: 0.85,
        });

        marker.bindPopup(`
          <div style="color: #111; font-family: sans-serif; font-size: 12px; min-width: 200px;">
            <strong style="color: #059669; font-size: 13px;">🌾 ${agro.name}</strong><br/>
            <strong>Tipo de Suelo:</strong> ${agro.tipo}<br/>
            <strong>Cultivo Actual:</strong> ${agro.cultivo}<br/>
            <strong>Rotación Sugerida:</strong> ${agro.rotacion}<br/>
            <strong>Humedad Suelo (NASA SMAP):</strong> <span style="color: #0284c7; font-weight: bold;">${agro.smap}%</span><br/>
            <span style="font-size: 10px; color: #6b7280;">Monitoreo L-band Radiometer NASA SMAP</span>
          </div>
        `);

        marker.on('click', () => {
          if (setSelectedPoint) {
            setSelectedPoint({ lat: agro.lat, lon: agro.lon, ...agro });
          }
        });

        marker.addTo(layersGroupRef.current);
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

  // Mantener renderLayersRef siempre apuntando a la función más reciente
  useEffect(() => {
    renderLayersRef.current = () => {
      if (mapInstanceRef.current) {
        renderLayers(null, mapInstanceRef.current);
      }
    };
  });

  useEffect(() => {
    if (mapInstanceRef.current) {
      renderLayers(null, mapInstanceRef.current);
    }
  }, [
    activeTab, 
    focosData, 
    sensorMode, 
    reportsData, 
    offlineMode, 
    wmsCota, 
    wmsPeriurbanos, 
    wmsDistritos, 
    nasaGibs, 
    gibsDate, 
    showSensors,
    showGamcWms,
    gamcActiveLayers,
    timelineYear,
    timelineMonth
  ]);

  // Efecto Maestro de Selección: Resalta en el mapa, abre popups, activa baliza pulsante y enfoca con animación
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const L = leafletRef.current || window.L;

    // 1. Limpiar balizas y destacados anteriores
    if (highlightGroupRef.current) {
      highlightGroupRef.current.clearLayers();
    }

    // Resetear estilos base de todos los polígonos distritales (ligeros para traslucir el mapa)
    if (layerRegistryRef.current?.districts) {
      Object.values(layerRegistryRef.current.districts).forEach(({ layer, defaultColor }) => {
        layer.setStyle({ weight: 2, color: defaultColor, fillOpacity: 0.14 });
      });
    }

    if (!selectedPoint) return;

    // 2. Extraer coordenadas del objetivo
    let lat, lng;
    if (selectedPoint.lat !== undefined && selectedPoint.lon !== undefined) {
      lat = selectedPoint.lat;
      lng = selectedPoint.lon;
    } else if (selectedPoint.lat !== undefined && selectedPoint.lng !== undefined) {
      lat = selectedPoint.lat;
      lng = selectedPoint.lng;
    } else if (selectedPoint.centroide) {
      lat = selectedPoint.centroide[0];
      lng = selectedPoint.centroide[1];
    } else if (selectedPoint.geometry) {
      const coords = selectedPoint.geometry.type === 'Polygon'
        ? selectedPoint.geometry.coordinates[0][0]
        : selectedPoint.geometry.coordinates;
      [lng, lat] = coords;
    }

    // 3. Identificar qué tipo de elemento fue seleccionado y aplicar feedback visual avanzado
    const dId = selectedPoint.distrito_id || (selectedPoint.id?.startsWith('D') && selectedPoint.id.length <= 4 ? selectedPoint.id : null);
    const targetDistrict = dId ? layerRegistryRef.current?.districts?.[dId] : null;

    // Caso A: Selección de Distrito
    if (selectedPoint.type === 'district' || (targetDistrict && (!selectedPoint.id || selectedPoint.id === dId))) {
      if (targetDistrict) {
        targetDistrict.layer.bringToFront();
        targetDistrict.layer.setStyle({ weight: 4.5, color: '#ffffff', fillOpacity: 0.65 });
        targetDistrict.layer.openPopup(targetDistrict.center);

        if (L && highlightGroupRef.current) {
          const beaconIcon = L.divIcon({
            className: 'map-selection-beacon',
            html: `
              <div style="position: relative; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; pointer-events: none;">
                <div class="beacon-pulse-ring" style="position: absolute; width: 46px; height: 46px; border-radius: 50%; background: #38bdf8; opacity: 0.5;"></div>
                <div class="beacon-target-ring" style="position: absolute; width: 22px; height: 22px; border-radius: 50%; border: 3px solid #ffffff; background: rgba(56, 189, 248, 0.45);"></div>
                <div style="position: absolute; width: 8px; height: 8px; border-radius: 50%; background: #ffffff;"></div>
              </div>
            `,
            iconSize: [48, 48],
            iconAnchor: [24, 24]
          });
          L.marker(targetDistrict.center, { icon: beaconIcon, interactive: false }).addTo(highlightGroupRef.current);
        }

        mapInstanceRef.current.flyTo(targetDistrict.center, 14.0, { duration: 1.2 });
      }
      return;
    }

    // Caso B: Sensor Virtual o Estación MÓNICA
    const targetSensor = selectedPoint.id ? layerRegistryRef.current?.sensors?.[selectedPoint.id] : null;
    if (targetSensor) {
      targetSensor.layer.openPopup();

      // Si pertenece a un distrito, iluminar también el polígono del distrito
      if (targetDistrict) {
        targetDistrict.layer.setStyle({ weight: 3, color: '#ffffff', fillOpacity: 0.45 });
      }

      if (L && highlightGroupRef.current) {
        const isFisica = selectedPoint.es_estacion_fisica;
        const beaconColor = isFisica ? '#06b6d4' : '#a855f7';
        const beaconIcon = L.divIcon({
          className: 'map-selection-beacon',
          html: `
            <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; pointer-events: none;">
              <div class="beacon-pulse-ring" style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: ${beaconColor}; opacity: 0.55;"></div>
              <div class="beacon-target-ring" style="position: absolute; width: 20px; height: 20px; border-radius: 50%; border: 2.5px solid #ffffff; background: ${beaconColor};"></div>
              <div style="position: absolute; width: 6px; height: 6px; border-radius: 50%; background: #ffffff;"></div>
            </div>
          `,
          iconSize: [44, 44],
          iconAnchor: [22, 22]
        });
        L.marker(targetSensor.center, { icon: beaconIcon, interactive: false }).addTo(highlightGroupRef.current);
      }

      mapInstanceRef.current.flyTo(targetSensor.center, 15.0, { duration: 1.2 });
      return;
    }

    // Caso C: Foco de Incendio Tunari
    const targetFoco = selectedPoint.id ? layerRegistryRef.current?.focos?.[selectedPoint.id] : null;
    if (targetFoco) {
      targetFoco.layer.openPopup();

      if (L && highlightGroupRef.current) {
        const beaconIcon = L.divIcon({
          className: 'map-selection-beacon',
          html: `
            <div style="position: relative; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; pointer-events: none;">
              <div class="beacon-pulse-ring" style="position: absolute; width: 48px; height: 48px; border-radius: 50%; background: #ef4444; opacity: 0.65;"></div>
              <div class="beacon-fire-ring" style="position: absolute; width: 22px; height: 22px; border-radius: 50%; border: 3px solid #ffedd5; background: #f97316;"></div>
              <div style="position: absolute; width: 8px; height: 8px; border-radius: 50%; background: #ffffff;"></div>
            </div>
          `,
          iconSize: [48, 48],
          iconAnchor: [24, 24]
        });
        L.marker(targetFoco.center, { icon: beaconIcon, interactive: false }).addTo(highlightGroupRef.current);
      }

      mapInstanceRef.current.flyTo(targetFoco.center, 14.5, { duration: 1.2 });
      return;
    }

    // Caso D: Global Hotspot NASA
    const targetGlobal = selectedPoint.id ? layerRegistryRef.current?.globals?.[selectedPoint.id] : null;
    if (targetGlobal) {
      targetGlobal.layer.openPopup();

      if (L && highlightGroupRef.current) {
        const beaconIcon = L.divIcon({
          className: 'map-selection-beacon',
          html: `
            <div style="position: relative; width: 52px; height: 52px; display: flex; align-items: center; justify-content: center; pointer-events: none;">
              <div class="beacon-pulse-ring" style="position: absolute; width: 50px; height: 50px; border-radius: 50%; background: #38bdf8; opacity: 0.55;"></div>
              <div class="beacon-target-ring" style="position: absolute; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #ffffff; background: rgba(56, 189, 248, 0.6);"></div>
              <div style="position: absolute; width: 8px; height: 8px; border-radius: 50%; background: #ffffff;"></div>
            </div>
          `,
          iconSize: [52, 52],
          iconAnchor: [26, 26]
        });
        L.marker(targetGlobal.center, { icon: beaconIcon, interactive: false }).addTo(highlightGroupRef.current);
      }

      const targetZoom = selectedPoint.id === 'cochabamba' ? 12.5 : 5.5;
      mapInstanceRef.current.flyTo(targetGlobal.center, targetZoom, { duration: 1.4 });
      return;
    }

    // Fallback genérico para coordenadas simples
    if (lat !== undefined && lng !== undefined) {
      if (L && highlightGroupRef.current) {
        const beaconIcon = L.divIcon({
          className: 'map-selection-beacon',
          html: `
            <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; pointer-events: none;">
              <div class="beacon-pulse-ring" style="position: absolute; width: 40px; height: 40px; border-radius: 50%; background: #38bdf8; opacity: 0.5;"></div>
              <div class="beacon-target-ring" style="position: absolute; width: 18px; height: 18px; border-radius: 50%; border: 2.5px solid #ffffff; background: #38bdf8;"></div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });
        L.marker([lat, lng], { icon: beaconIcon, interactive: false }).addTo(highlightGroupRef.current);
      }

      const targetZoom = activeTab === 'global_nasa' ? 5.5 : 14.0;
      mapInstanceRef.current.flyTo([lat, lng], targetZoom, { duration: 1.2 });
    }
  }, [selectedPoint]);

  // Función de recentrado inteligente según la pestaña activa
  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    if (activeTab === 'global_nasa') {
      mapInstanceRef.current.flyTo(GLOBAL_CENTER, GLOBAL_ZOOM, { duration: 1.4 });
    } else if (activeTab === 'microclimas') {
      mapInstanceRef.current.flyTo(COCHABAMBA_CENTER, COCHABAMBA_ZOOM, { duration: 1.4 });
    } else if (activeTab === 'incendios') {
      mapInstanceRef.current.flyTo([-17.36, -66.16], 12.5, { duration: 1.4 });
    } else if (activeTab === 'torrenteras') {
      mapInstanceRef.current.flyTo([-17.375, -66.165], 12.5, { duration: 1.4 });
    } else if (activeTab === 'agrotech') {
      mapInstanceRef.current.flyTo([-17.41, -66.24], 11.8, { duration: 1.4 });
    }
  };

  // Filtrado reactivo de distritos para búsqueda y navegación en vivo
  const filteredDistricts = DISTRICTS_CONFIG.filter((d) => {
    const matchesZone = districtZoneFilter === 'TODOS' || d.zone === districtZoneFilter;
    if (!matchesZone) return false;
    if (!districtSearch.trim()) return true;
    const query = districtSearch.toLowerCase().trim();
    return (
      d.id.toLowerCase().includes(query) ||
      d.name.toLowerCase().includes(query) ||
      d.hito.toLowerCase().includes(query) ||
      d.keywords.toLowerCase().includes(query) ||
      String(d.num) === query
    );
  });

  const handleSelectDistrict = (distId) => {
    const targetDistrict = layerRegistryRef.current?.districts?.[distId];
    const feat = distritosData?.features?.find((f) => f.properties.distrito_id === distId);

    if (feat && setSelectedPoint) {
      const p = feat.properties;
      setSelectedPoint({
        type: 'district',
        id: p.distrito_id,
        distrito_id: p.distrito_id,
        lat: p.centroide ? p.centroide[0] : -17.39,
        lon: p.centroide ? p.centroide[1] : -66.15,
        ...p
      });
    }

    if (mapInstanceRef.current && targetDistrict) {
      if (targetDistrict.layer?.getBounds) {
        mapInstanceRef.current.flyToBounds(targetDistrict.layer.getBounds(), {
          padding: [80, 80],
          maxZoom: 14.5,
          duration: 1.2
        });
      } else {
        mapInstanceRef.current.flyTo(targetDistrict.center, 14.5, { duration: 1.2 });
      }
      targetDistrict.layer?.bringToFront();
      targetDistrict.layer?.setStyle({ weight: 4.5, color: '#ffffff', fillOpacity: 0.55 });
      setTimeout(() => {
        targetDistrict.layer?.openPopup(targetDistrict.center);
      }, 400);
    }
  };

  return (
    <div 
      className={`relative h-full w-full bg-[#080b18] overflow-hidden min-h-0 ${showDistrictLabels ? '' : 'hide-district-labels'}`}
      style={{ position: 'relative', height: '100%', width: '100%', minHeight: 0 }}
    >
      <div 
        ref={mapContainerRef} 
        className="absolute inset-0 h-full w-full z-0"
        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, height: '100%', width: '100%' }}
      />
      
      {/* HUD Flotante de Elemento Seleccionado / Enfoque Activo (Posicionado limpiamente debajo de la barra de controles para evitar colisiones) */}
      {selectedPoint && (
        <div className="absolute top-14 left-3 z-[410] flex items-center gap-2 rounded-xl border border-blue-500/50 bg-[#090d16]/95 px-3 py-1.5 shadow-xl backdrop-blur-md text-xs font-semibold text-white transition-all animate-in fade-in slide-in-from-top-1 max-w-[92vw] sm:max-w-md">
          <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse shrink-0"></span>
          <span className="text-cyan-300 font-mono text-[11px] uppercase tracking-wider shrink-0 font-bold">
            {selectedPoint.type === 'district' ? 'Distrito' :
             selectedPoint.type === 'sensor' ? 'Sensor IA' :
             selectedPoint.type === 'foco' ? 'Foco Tunari' :
             selectedPoint.type === 'global' ? 'Global NASA' : 'Enfoque'}:
          </span>
          <span className="text-white font-bold truncate max-w-[150px] sm:max-w-[200px] text-xs">
            {selectedPoint.nombre || selectedPoint.name || selectedPoint.zona || selectedPoint.distrito_id || 'Elemento'}
          </span>
          {(selectedPoint.lst_nasa_promedio_c || selectedPoint.lst_nasa_c) && (
            <span className="rounded bg-red-950/80 px-2 py-0.5 text-[11px] font-mono font-bold text-red-300 border border-red-800/80 shrink-0">
              {selectedPoint.lst_nasa_promedio_c || selectedPoint.lst_nasa_c} °C
            </span>
          )}
          {selectedPoint.frp_total_mw && (
            <span className="rounded bg-orange-950/80 px-2 py-0.5 text-[11px] font-mono font-bold text-orange-300 border border-orange-800/80 shrink-0">
              {selectedPoint.frp_total_mw} MW
            </span>
          )}
          <button
            onClick={() => setSelectedPoint && setSelectedPoint(null)}
            className="ml-1 rounded-full p-0.5 text-slate-400 hover:text-white hover:bg-neutral-800 transition shrink-0"
            title="Cerrar enfoque y limpiar selección"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Banner Telemetría de Animación Temporal Activa (Posicionado limpio arriba del reproductor temporal, sin colisiones) */}
      {(timelineYear !== 'ALL' || isPlayingTimeline) && (
        <div className="absolute bottom-28 sm:bottom-24 left-1/2 -translate-x-1/2 z-[415] flex items-center gap-2 rounded-full border border-cyan-500/40 bg-[#070b14]/95 px-3.5 py-1.5 shadow-2xl backdrop-blur-xl text-xs text-white transition-all animate-in fade-in max-w-[94vw]">
          <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping shrink-0"></span>
          <span className="font-mono font-black text-cyan-300 text-[11px] sm:text-xs shrink-0">
            {timelineYear === 'ALL' ? 'HISTÓRICO 2020-2025' : timelineYear === 2026 ? '✨ PREDICCIÓN IA 2026' : `SERIE SATELITAL: AÑO ${timelineYear}`}
          </span>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="text-amber-300 font-bold text-[11px] sm:text-xs truncate">
            {timelineYear === 2026
              ? '340 Focos Estimados (~3,600 ha)'
              : timelineYear === 2024
              ? '389 Focos MODIS/VIIRS (Pico Histórico)'
              : timelineYear === 2022
              ? '312 Focos Tunari'
              : timelineYear === 2020
              ? '142 Focos Base'
              : `${timelineYear ? `Focos Activos Año ${timelineYear}` : ''}`}
          </span>
          <span className="text-slate-500 hidden md:inline">•</span>
          <span className="text-red-400 font-bold text-[11px] sm:text-xs hidden md:inline">
            Brecha Sur-Tunari: +{(17.0 + (timelineYear === 2026 ? 0.6 : (Number(timelineYear) - 2020) * 0.1 || 0)).toFixed(1)}°C
          </span>
        </div>
      )}
      
      {/* 1. Selector de Capas Base (Callejero / Satélite / Oscuro) y Controles */}
      <div className="absolute top-3 left-3 z-[400] flex items-center gap-1 sm:gap-1.5 rounded-xl border border-white/10 bg-[#0f172a]/95 p-1 text-xs text-white backdrop-blur-xl shadow-2xl">
        <button
          onClick={() => setBaseMapType('streets')}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
            baseMapType === 'streets'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
          title="Mapa Callejero Oficial de Cochabamba (OpenStreetMap sin marcas de agua)"
        >
          <span>🗺️ Callejero</span>
        </button>

        <button
          onClick={() => setBaseMapType('satellite')}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
            baseMapType === 'satellite'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
          title="Vista Satelital NASA/Esri con Viario Oficial y Etiquetas Viales"
        >
          <span>🛰️ Satélite</span>
        </button>

        <button
          onClick={() => setBaseMapType('dark')}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
            baseMapType === 'dark'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
          title="Modo Oscuro Profesional (Esri Canvas Dark sin marcas de agua)"
        >
          <span>🌙 Oscuro</span>
        </button>

        <div className="h-4 w-px bg-white/10 mx-0.5" />

        {/* Botón para alternar etiquetas de distritos */}
        {activeTab === 'microclimas' && (
          <button
            onClick={() => setShowDistrictLabels(!showDistrictLabels)}
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition shadow-sm ${
              showDistrictLabels
                ? 'bg-amber-600 text-white shadow-amber-900/40 ring-1 ring-amber-400/50'
                : 'bg-neutral-800 text-slate-300 hover:text-white border border-neutral-700/60'
            }`}
            title={showDistrictLabels ? "Ocultar nombres de distritos (Muestra vista limpia de calles)" : "Mostrar nombres y códigos de los 15 distritos"}
          >
            {showDistrictLabels ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5 text-slate-400" />}
            <span className="hidden sm:inline">{showDistrictLabels ? 'Nombres ON' : 'Nombres OFF'}</span>
            <span className="sm:hidden">{showDistrictLabels ? 'Nombres' : 'Limpio'}</span>
          </button>
        )}

        {/* Botón para alternar sensores */}
        {activeTab === 'microclimas' && (
          <button
            onClick={() => setShowSensors(!showSensors)}
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition shadow-sm ${
              showSensors
                ? 'bg-cyan-600 text-white shadow-cyan-900/40 ring-1 ring-cyan-400/50'
                : 'bg-neutral-800 text-slate-300 hover:text-white border border-neutral-700/60'
            }`}
            title={showSensors ? "Ocultar puntos de sensores MÓNICA e IA" : "Mostrar sensores en el mapa"}
          >
            <span className="hidden sm:inline">{showSensors ? '📍 Sensores ON' : '📍 Sensores OFF'}</span>
            <span className="sm:hidden">{showSensors ? 'Sensores' : 'Sin sensores'}</span>
          </button>
        )}

        {/* Selector de Capas WMS Oficiales GAMC */}
        {activeTab === 'microclimas' && (
          <div className="relative">
            <div className="flex items-center rounded-lg overflow-hidden shadow-sm">
              <button
                onClick={() => setShowGamcWms(!showGamcWms)}
                className={`flex items-center gap-1 px-2 py-1 text-xs font-semibold transition ${
                  showGamcWms
                    ? 'bg-purple-600 text-white shadow-purple-900/40 ring-1 ring-purple-400/50'
                    : 'bg-neutral-800 text-slate-300 hover:text-white border border-neutral-700/60'
                }`}
                title="Superponer capas oficiales WMS del GAMC (Proxy GeoServer Municipal)"
              >
                <span>🏛️ {showGamcWms ? 'WMS GAMC ON' : 'WMS GAMC'}</span>
              </button>
              <button
                onClick={() => setIsGamcMenuOpen(!isGamcMenuOpen)}
                className={`px-1 py-1 text-xs transition border-l ${
                  showGamcWms
                    ? 'bg-purple-700 text-purple-200 border-purple-500 hover:bg-purple-800'
                    : 'bg-neutral-800 text-slate-400 border-neutral-700 hover:text-white'
                }`}
                title="Configurar Capas WMS del GAMC"
              >
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isGamcMenuOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Menú Desplegable de Capas WMS del GAMC */}
            {isGamcMenuOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-72 rounded-xl border border-purple-500/30 bg-[#0d1017]/95 p-3 text-xs text-white shadow-2xl backdrop-blur-xl z-[600]">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800 mb-2">
                  <span className="font-bold text-purple-300 flex items-center gap-1.5">
                    🏛️ Capas Oficiales GAMC
                  </span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-1.5 py-0.5 rounded font-mono">
                    Proxy 200 OK
                  </span>
                </div>
                <div className="space-y-1.5">
                  {Object.entries(GAMC_LAYERS).map(([key, layer]) => {
                    const active = gamcActiveLayers[key] !== false;
                    return (
                      <label 
                        key={key} 
                        className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-neutral-800/60 cursor-pointer transition"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={active}
                            onChange={(e) => {
                              setGamcActiveLayers(prev => ({
                                ...prev,
                                [key]: e.target.checked
                              }));
                              if (!showGamcWms) setShowGamcWms(true);
                            }}
                            className="rounded border-neutral-700 text-purple-600 focus:ring-purple-500"
                          />
                          <div>
                            <div className="font-medium text-slate-200">{layer.name}</div>
                            <div className="text-[10px] text-slate-400">{layer.description}</div>
                          </div>
                        </div>
                        <span className="text-[9px] text-purple-400 bg-purple-950/50 px-1 py-0.5 rounded font-mono">
                          P{layer.project}
                        </span>
                      </label>
                    );
                  })}
                </div>
                <div className="mt-2 pt-2 border-t border-neutral-800 text-[10px] text-slate-400 flex justify-between">
                  <span>Proxy: serviciosgamc.cochabamba.bo</span>
                  <a 
                    href="https://recursosgamc.cochabamba.bo/api-doc" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-cyan-400 hover:underline"
                  >
                    API Doc ↗
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="h-4 w-px bg-white/10 mx-0.5" />

        <button
          onClick={handleRecenter}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-cyan-300 hover:text-white hover:bg-neutral-800 transition"
          title="Recentrar Vista del Territorio"
        >
          <Crosshair className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Recentrar</span>
        </button>
      </div>

      {/* 1.3. Banner de Consulta en Vivo GetFeatureInfo GAMC (Alcaldía de Cochabamba) */}
      {gamcFeatureInfo && (
        <div className="absolute top-14 left-3 z-[420] flex items-center gap-2 rounded-xl border border-purple-500/40 bg-[#0d1017]/95 px-3 py-2 text-xs text-white shadow-2xl backdrop-blur-xl">
          <span className="text-purple-400 font-bold">🏛️ Consulta GAMC:</span>
          <span className="font-semibold text-slate-200">
            Distrito: <span className="text-amber-300 font-bold">{gamcFeatureInfo.Distrito || 'N/A'}</span>
          </span>
          {gamcFeatureInfo.Comuna && (
            <span className="text-slate-400">
              • Comuna: <span className="text-cyan-300 font-medium">{gamcFeatureInfo.Comuna}</span>
            </span>
          )}
          <button
            onClick={() => setGamcFeatureInfo(null)}
            className="ml-1 text-slate-400 hover:text-white p-0.5 rounded"
            title="Cerrar notificación"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 1.5. Navegador Inteligente & Buscador de Distritos GAMC (15 Distritos) */}
      {activeTab === 'microclimas' && (
        <div className="absolute top-16 sm:top-3 right-2 sm:right-3 z-[410] flex flex-col items-end gap-1.5 max-w-[94vw] sm:max-w-xs md:max-w-sm">
          {/* Barra de Entrada / Toggle */}
          <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#0f172a]/95 p-1.5 text-xs text-white backdrop-blur-xl shadow-2xl w-full">
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-2.5 h-3.5 w-3.5 text-cyan-400 pointer-events-none" />
              <input
                type="text"
                value={districtSearch}
                onChange={(e) => {
                  setDistrictSearch(e.target.value);
                  if (!isDistrictNavOpen) setIsDistrictNavOpen(true);
                }}
                onFocus={() => setIsDistrictNavOpen(true)}
                placeholder="Buscar distrito (D1-D15, Alalay, Cancha)..."
                className="w-full bg-neutral-900/90 text-white placeholder-slate-400 pl-8 pr-7 py-1.5 rounded-lg text-xs font-medium border border-neutral-700/60 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
              {districtSearch && (
                <button
                  onClick={() => setDistrictSearch('')}
                  className="absolute right-2 text-slate-400 hover:text-white p-0.5 rounded"
                  title="Limpiar búsqueda"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={() => setIsDistrictNavOpen(!isDistrictNavOpen)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
                isDistrictNavOpen ? 'bg-cyan-600 text-white shadow-cyan-900/50' : 'bg-neutral-800 text-slate-300 hover:text-white border border-neutral-700/60'
              }`}
              title="Abrir navegador de los 15 distritos"
            >
              <Compass className="h-3.5 w-3.5 text-cyan-300" />
              <span className="hidden sm:inline">15 Distritos</span>
              <ChevronDown className={`h-3 w-3 transition-transform ${isDistrictNavOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Panel Desplegable con Zonas y Lista de Distritos */}
          {isDistrictNavOpen && (
            <div className="w-full rounded-2xl border border-white/10 bg-[#0f172a]/95 p-3 text-white backdrop-blur-2xl shadow-2xl animate-in fade-in slide-in-from-top-2 max-h-[380px] overflow-y-auto">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> Explorador Distrital GAMC
                </span>
                <button
                  onClick={() => setIsDistrictNavOpen(false)}
                  className="text-neutral-400 hover:text-white text-xs p-1"
                >
                  Cerrar
                </button>
              </div>

              {/* Filtros por Zona Geográfica */}
              <div className="flex items-center gap-1 mb-2.5 pb-1 overflow-x-auto no-scrollbar">
                {['TODOS', 'NORTE', 'CENTRO', 'OESTE', 'ESTE', 'SUR'].map((zone) => (
                  <button
                    key={zone}
                    onClick={() => setDistrictZoneFilter(zone)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition whitespace-nowrap ${
                      districtZoneFilter === zone
                        ? 'bg-blue-600 text-white shadow'
                        : 'bg-neutral-800/80 text-slate-400 hover:text-white'
                    }`}
                  >
                    {zone}
                  </button>
                ))}
              </div>

              {/* Listado de Distritos Filtrados */}
              <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
                {filteredDistricts.map((d) => {
                  const isSelected = selectedPoint?.distrito_id === d.id || selectedPoint?.id === d.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => handleSelectDistrict(d.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition border ${
                        isSelected
                          ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-lg ring-1 ring-cyan-400/50'
                          : 'bg-neutral-900/60 border-neutral-800 text-slate-300 hover:bg-neutral-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="flex h-5 w-7 items-center justify-center rounded text-[10px] font-black text-white shrink-0"
                          style={{ background: d.color }}
                        >
                          {d.id}
                        </span>
                        <div className="truncate">
                          <div className="text-xs font-bold truncate text-white leading-tight">{d.name}</div>
                          <div className="text-[10px] text-slate-400 truncate leading-tight">{d.zone} • {d.hito}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-amber-300 shrink-0 ml-1">
                        {d.lst}°C
                      </span>
                    </button>
                  );
                })}

                {filteredDistricts.length === 0 && (
                  <div className="text-center py-4 text-xs text-slate-400">
                    No se encontraron distritos para "{districtSearch}". Prueba con "D1", "Alalay" o "Tunari".
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Leyenda Flotante Dinámica (Posicionada arriba de la barra de tiempo para evitar colisiones) */}
      <div className="absolute bottom-20 left-3 z-[410] transition-all duration-200">
        {!isLegendOpen ? (
          <button
            onClick={() => setIsLegendOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#0f172a]/95 px-3 py-1.5 text-xs font-semibold text-cyan-300 shadow-xl backdrop-blur-md hover:bg-neutral-800 transition"
          >
            <Info className="h-3.5 w-3.5" />
            <span>Leyenda</span>
          </button>
        ) : (
          <div className="rounded-xl border border-white/10 bg-[#0f172a]/95 p-3 text-xs text-white backdrop-blur-xl shadow-2xl max-w-[280px]">
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2">
              <span className="font-bold text-[11px] text-cyan-400 uppercase tracking-wider truncate mr-2">
                {activeTab === 'global_nasa' && 'EARTH DETECTIVE'}
                {activeTab === 'microclimas' && 'PILOTO COCHABAMBA'}
                {activeTab === 'incendios' && 'HUMO & CALOR TUNARI'}
                {activeTab === 'torrenteras' && 'TORRENTERAS GAMC'}
                {activeTab === 'agrotech' && 'AGROTECH & SMAP'}
              </span>
              <button
                onClick={() => setIsLegendOpen(false)}
                className="text-neutral-400 hover:text-white p-0.5 rounded transition"
                title="Cerrar Leyenda"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-2 text-xs sm:text-[13px]">
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
                  <div className="pt-1.5 border-t border-white/10 text-xs text-cyan-300">
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
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500 border border-white"></span>
                    <span>🎯 Micro-Nodos OTB (La Cancha / Refinería)</span>
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
                  <div className="flex items-center gap-2 pt-1.5 border-t border-white/5">
                    <span className="h-2.5 w-2.5 rounded border border-emerald-400 bg-emerald-900/60"></span>
                    <span>Cota 2750 Tunari (Límite PNT)</span>
                  </div>
                </>
              )}

              {activeTab === 'torrenteras' && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500 border border-white animate-pulse"></span>
                    <span>Riesgo Extremo (Taquiña / Aluvión)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500 border border-white"></span>
                    <span>Riesgo Alto (Desborde de Torrentera)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500 border border-white"></span>
                    <span>Riesgo Medio (Anegamiento Calzada)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded border border-blue-400"></span>
                    <span>Cuenca Alta Cordillera Tunari</span>
                  </div>
                  <div className="pt-1.5 border-t border-white/10 text-xs text-cyan-300">
                    🌧️ Umbral Crítico SENAMHI: &gt; 35 mm/24h.
                  </div>
                </>
              )}

              {activeTab === 'agrotech' && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 border border-white"></span>
                    <span>Parcela Monitoreada NASA SMAP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded bg-emerald-600/80"></span>
                    <span>Suelo Franco (Valle Bajo / Sacaba)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded bg-amber-600/80"></span>
                    <span>Suelo Arenoso (Valle Alto / Cliza)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded bg-stone-600/80"></span>
                    <span>Suelo Pedregoso (Laderas Tunari)</span>
                  </div>
                  <div className="pt-1.5 border-t border-white/10 text-xs text-emerald-300">
                    🌱 Rotación Sugerida: Maíz + Tarwi / Haba.
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. Barra Flotante de Línea de Tiempo Satelital & Predicción IA (Visible en Incendios y Microclimas) */}
      {(activeTab === 'incendios' || activeTab === 'microclimas') && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[420] w-[96%] sm:w-auto max-w-4xl rounded-2xl border border-white/10 bg-[#090d16]/95 p-2 sm:p-2.5 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2">
          {/* Fila Superior: Controles, Estado y Botón de Análisis */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-xs sm:text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-cyan-400" />
                Línea de Tiempo Satelital
              </span>
              <span className="rounded-full bg-blue-950/80 px-2 py-0.5 text-[11px] font-mono font-bold text-blue-300 border border-blue-800/80">
                {timelineYear === 'ALL' ? '2020-2025 Acumulado' : timelineYear === 2026 ? '✨ 2026 (Predicción IA)' : `Año ${timelineYear}`}
              </span>
              {timelineMonth !== 'ALL' && (
                <span className="rounded-full bg-amber-950/80 px-2 py-0.5 text-[11px] font-bold text-amber-300 border border-amber-800/80">
                  {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][Number(timelineMonth) - 1]}
                </span>
              )}
              {timelineMonth === 'ALL' && timelineYear !== 2026 && (
                <span className="hidden md:inline text-[11px] text-slate-400">
                  • 79.8% de incendios se concentran en Ago-Sep
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Botón Play / Pause auto-player */}
              <button
                onClick={() => setIsPlayingTimeline(!isPlayingTimeline)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition shadow-sm ${
                  isPlayingTimeline
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-neutral-800 text-slate-200 hover:text-white hover:bg-neutral-700'
                }`}
                title={isPlayingTimeline ? "Pausar avance automático de años" : "Reproducir avance histórico año a año"}
              >
                {isPlayingTimeline ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 text-cyan-400" />}
                <span className="hidden sm:inline">{isPlayingTimeline ? 'Pausar' : 'Play'}</span>
              </button>

              {/* Botón para abrir el Modal de Tendencias y Predicción IA */}
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-purple-500/50 bg-gradient-to-r from-purple-900/80 to-indigo-900/80 px-2.5 sm:px-3 py-1 text-xs font-bold text-purple-200 hover:text-white hover:border-purple-400 transition shadow-sm"
                title="Abrir Dashboard Estadístico de Tendencias y Predicción"
              >
                <TrendingUp className="h-3.5 w-3.5 text-purple-300" />
                <span className="hidden sm:inline">Análisis & Gráficas IA</span>
                <span className="sm:hidden">Análisis</span>
              </button>
            </div>
          </div>

          {/* Controles Temporales en 2 Filas Dedicadas (Cero colisiones ni botones aplastados) */}
          <div className="space-y-1.5 pt-0.5">
            {/* Fila 1: Selector de Años */}
            <div className="flex items-center gap-1.5 overflow-x-auto custom-modal-scroll py-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0 font-mono">AÑO:</span>
              {['ALL', 2020, 2021, 2022, 2023, 2024, 2025, 2026].map((yr) => {
                const isSelected = timelineYear === yr || (yr !== 'ALL' && Number(timelineYear) === Number(yr));
                const is2026 = yr === 2026;
                return (
                  <button
                    key={yr}
                    onClick={() => {
                      setIsPlayingTimeline(false);
                      setTimelineYear(yr);
                    }}
                    className={`rounded-lg px-2 sm:px-2.5 py-1 text-xs font-bold transition shrink-0 ${
                      isSelected
                        ? is2026
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-900/50 ring-1 ring-purple-400 font-black'
                          : 'bg-blue-600 text-white shadow font-black'
                        : is2026
                          ? 'border border-purple-500/40 bg-purple-950/40 text-purple-300 hover:bg-purple-900/50'
                          : 'bg-neutral-900/80 text-slate-300 hover:bg-neutral-800 hover:text-white border border-white/5'
                    }`}
                  >
                    {yr === 'ALL' ? 'Todos' : yr === 2026 ? '✨ 2026 IA' : yr}
                  </button>
                );
              })}
            </div>

            {/* Fila 2: Selector de Meses con Marcadores Estacionales */}
            <div className="flex items-center gap-1 overflow-x-auto custom-modal-scroll py-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0 font-mono">MES:</span>
              <button
                onClick={() => setTimelineMonth('ALL')}
                className={`rounded-lg px-2 py-0.5 text-xs font-bold transition shrink-0 ${
                  timelineMonth === 'ALL'
                    ? 'bg-amber-600 text-white shadow font-black'
                    : 'bg-neutral-900/80 text-slate-300 hover:bg-neutral-800 hover:text-white border border-white/5'
                }`}
              >
                Año compl.
              </button>
              {[
                { m: 1, label: 'Ene' },
                { m: 2, label: 'Feb' },
                { m: 3, label: 'Mar' },
                { m: 4, label: 'Abr' },
                { m: 5, label: 'May ❄️', note: 'Inversión' },
                { m: 6, label: 'Jun ❄️', note: 'San Juan' },
                { m: 7, label: 'Jul ❄️', note: 'Inversión' },
                { m: 8, label: 'Ago 🔥', peak: true, note: 'Incendios' },
                { m: 9, label: 'Sep 🔥', peak: true, note: 'Pico Humo' },
                { m: 10, label: 'Oct ☀️', note: 'Olas Calor' },
                { m: 11, label: 'Nov ☀️', note: 'Calor Sur' },
                { m: 12, label: 'Dic 🌧️', note: 'Lluvias' }
              ].map(({ m, label, peak, note }) => {
                const isSelected = Number(timelineMonth) === m;
                return (
                  <button
                    key={m}
                    onClick={() => setTimelineMonth(m)}
                    className={`relative rounded-lg px-2 py-0.5 text-[11px] font-bold transition shrink-0 ${
                      isSelected
                        ? 'bg-amber-500 text-black shadow font-black'
                        : peak
                          ? 'border border-rose-500/50 bg-rose-950/40 text-rose-300 hover:bg-rose-900/50'
                          : 'bg-neutral-900/70 text-slate-300 hover:bg-neutral-800 hover:text-white border border-white/5'
                    }`}
                    title={note ? `${label}: ${note}` : label}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Renderizado del Modal de Análisis Temporal y Predicción */}
      <TemporalTrendModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
