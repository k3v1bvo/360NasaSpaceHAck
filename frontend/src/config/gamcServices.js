/**
 * CONFIGURACIÓN CENTRALIZADA DE SERVICIOS GEOESPACIALES GAMC
 * Gobierno Autónomo Municipal de Cochabamba - Portal GAMCSPACE / Recursos GAMC
 * 
 * Reto NASA Space Apps 2026: Be An Earth System Trend Detective!
 * - Proyecto 01: Microclimas Urbanos con Inteligencia Artificial (4 servicios autorizados)
 * - Proyecto 05: Visualizador de Datos Satelitales para Gestión Distrital (3 servicios autorizados)
 */

export const GAMC_CONFIG = {
  // Proxy oficial que entrega las capas GeoServer autorizadas
  proxyUrl: 'https://serviciosgamc.cochabamba.bo/api/gs/wms',
  fallbackProxyUrl: 'https://recursosgamc.cochabamba.bo/proxy',
  
  // Llaves de API oficiales proporcionadas por el GAMC
  apiKey01: '1a3d2d9c6e1d6a94062d11a9021a48b24ae0e05e8183e9d8', // Proyecto 01
  apiKey05: '8da30122933ced2174ebe3e8b03198731d9cae6dc3230d32', // Proyecto 03/05
};

export const GAMC_LAYERS = {
  distritos: {
    id: 'distritos',
    name: 'Límites Distritales GAMC',
    project: '01',
    apiKey: GAMC_CONFIG.apiKey01,
    serviceId: '7eb13092-bf0e-493b-aae6-03c43eedda2c',
    description: 'Polígonos oficiales de los 15 distritos de Cercado, Cochabamba',
    defaultOpacity: 0.85,
    zIndex: 350,
  },
  cota2750: {
    id: 'cota2750',
    name: 'Cota 2.750 msnm (Parque Tunari)',
    project: '01',
    apiKey: GAMC_CONFIG.apiKey01,
    serviceId: '297cefa4-0832-42bb-a98e-2cbea989fd9d',
    description: 'Límite altimétrico de protección ecológica del Parque Nacional Tunari',
    defaultOpacity: 0.9,
    zIndex: 360,
  },
  periurbanos: {
    id: 'periurbanos',
    name: 'Zonas Periurbanas y Asentamientos',
    project: '05',
    apiKey: GAMC_CONFIG.apiKey05,
    serviceId: 'c52066a1-32fd-4925-81e0-c2dcb8f4238f',
    description: 'Manchas urbanas no consolidadas expuestas a microclimas extremos',
    defaultOpacity: 0.75,
    zIndex: 340,
  },
  limiteUrbano: {
    id: 'limiteUrbano',
    name: 'Límite Urbano Oficial',
    project: '01',
    apiKey: GAMC_CONFIG.apiKey01,
    serviceId: 'fd77d463-9729-4c66-b686-23dccbb4ab8f',
    description: 'Perímetro urbano consolidado del municipio de Cochabamba',
    defaultOpacity: 0.8,
    zIndex: 330,
  },
  areasVerdes: {
    id: 'areasVerdes',
    name: 'Áreas Verdes y Cobertura Vegetal',
    project: '01',
    apiKey: GAMC_CONFIG.apiKey01,
    serviceId: '47360ddc-e35f-4ece-a995-59e90eb79cc6',
    description: 'Parques, arboledas y reservas biológicas que reducen el calor',
    defaultOpacity: 0.7,
    zIndex: 345,
  },
  poblacion: {
    id: 'poblacion',
    name: 'Población por Manzanas',
    project: '01',
    apiKey: GAMC_CONFIG.apiKey01,
    serviceId: '194a02a0-a73a-48c1-a260-82847c5c905d',
    description: 'Densidad censal y vulnerabilidad sociodemográfica de Cercado',
    defaultOpacity: 0.65,
    zIndex: 320,
  }
};

/**
 * Genera la URL de Leaflet TileLayer WMS para el proxy de la alcaldía
 */
export function getGamcWmsOptions(layerKey) {
  const layer = GAMC_LAYERS[layerKey];
  if (!layer) return null;

  return {
    url: GAMC_CONFIG.proxyUrl,
    options: {
      key: layer.apiKey,
      service_id: layer.serviceId,
      layers: '', // El proxy municipal requiere layers vacío
      format: 'image/png',
      transparent: true,
      version: '1.1.1',
      maxZoom: 19,
      zIndex: layer.zIndex,
      opacity: layer.defaultOpacity,
    }
  };
}

/**
 * Genera la URL de la leyenda oficial (GetLegendGraphic)
 */
export function getGamcLegendUrl(layerKey) {
  const layer = GAMC_LAYERS[layerKey];
  if (!layer) return null;

  const params = new URLSearchParams({
    key: layer.apiKey,
    service_id: layer.serviceId,
    REQUEST: 'GetLegendGraphic',
    VERSION: '1.0.0',
    FORMAT: 'image/png',
    LAYER: '',
  });

  return `${GAMC_CONFIG.proxyUrl}?${params.toString()}`;
}

/**
 * Construye la solicitud GetFeatureInfo para consultar atributos al hacer clic
 */
export function buildGamcFeatureInfoUrl({ x, y, width, height, bbox, layerKey }) {
  const layer = GAMC_LAYERS[layerKey];
  if (!layer) return null;

  const params = new URLSearchParams({
    key: layer.apiKey,
    service_id: layer.serviceId,
    REQUEST: 'GetFeatureInfo',
    SERVICE: 'WMS',
    VERSION: '1.1.1',
    LAYERS: '',
    QUERY_LAYERS: '',
    INFO_FORMAT: 'application/json',
    SRS: 'EPSG:4326',
    BBOX: bbox,
    WIDTH: String(width),
    HEIGHT: String(height),
    X: String(Math.round(x)),
    Y: String(Math.round(y)),
    FEATURE_COUNT: '5'
  });

  return `${GAMC_CONFIG.proxyUrl}?${params.toString()}`;
}
