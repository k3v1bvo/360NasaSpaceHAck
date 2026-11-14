/**
 * config/servicesConfig.js
 * ============================================================================
 * Catálogo Maestro de APIs y Servicios Oficiales (GAMC Cochabamba + NASA)
 * Documentación Técnica y Credenciales Autorizadas
 * NASA Space Apps Challenge 2026 • Sede FEXCO Cochabamba
 * ============================================================================
 */

export const GAMC_CONFIG = {
  portal: 'https://recursosgamc.cochabamba.bo/api-doc',
  proxyUrl: 'https://recursosgamc.cochabamba.bo/proxy',
  wmsUrl: 'https://serviciosgamc.cochabamba.bo/api/gs/wms',
  
  // Cobertura Geográfica Oficial (WGS84 EPSG:4326)
  bbox: {
    minLon: -66.275711,
    minLat: -17.525117,
    maxLon: -66.072201,
    maxLat: -17.326109,
    asString: '-66.275711,-17.525117,-66.072201,-17.326109'
  },

  // Proyectos Autorizados en el Portal GAMC
  proyectos: {
    '01_microclimas_ia': {
      id: '01',
      nombre: 'Be An Earth System Trend Detective! - Microclimas Urbanos con IA',
      totalServicios: 4,
      protocolo: 'WMS 1.1.1 / GetLegendGraphic 1.0.0 / GetFeatureInfo',
      descripcion: 'Predicción de islas de calor urbanas y calidad del aire en los 14 distritos con IA calibrada sobre Red MÓNICA.'
    },
    '02_cuencas_riesgo': {
      id: '02',
      nombre: 'Dancing with the SARs - Alerta Temprana de Riesgos en Cuencas',
      totalServicios: 6,
      protocolo: 'WMS 1.1.1',
      descripcion: 'Monitoreo de 60 puntos de inundación y torrenteras de la Cordillera del Tunari.'
    },
    '03_incendios_tunari': {
      id: '03',
      nombre: 'Harmonization of MODIS and VIIRS - Armonización Satelital para Monitoreo de Incendios',
      serviceKey: '8da30122933ced2174ebe3e8b03198731d9cae6dc3230d32',
      totalServicios: 3,
      protocolo: 'WMS 1.1.1 / GetLegendGraphic 1.0.0',
      capas: {
        periurbanos: {
          nombre: 'Periurbanos',
          serviceId: 'c52066a1-32fd-4925-81e0-c2dcb8f4238f',
          tipo: 'Categorizado (Clases por categoría)',
          acceso: 'Solo lectura'
        },
        cota_2750: {
          nombre: 'Cota 2750',
          serviceId: '297cefa4-0832-42bb-a98e-2cbea989fd9d',
          tipo: 'Categorizado (Límite legal del Parque Nacional Tunari)',
          acceso: 'Solo lectura'
        },
        limite_distritos: {
          nombre: 'Limite Distritos',
          serviceId: '7eb13092-bf0e-493b-aae6-03c43eedda2c',
          tipo: 'Simple (Estilo único)',
          acceso: 'Solo lectura'
        }
      }
    },
    '04_agrotech': {
      id: '04',
      nombre: 'Adapting Farms with NASA Data - Agrotecnología y Gestión del Agua',
      totalServicios: 3,
      protocolo: 'WMS 1.1.1',
      descripcion: 'Monitoreo de estrés hídrico y calendarios de siembra en el valle agrícola.'
    },
    '05_gestion_distrital': {
      id: '05',
      nombre: 'Be An Earth System Trend Detective! - Visualizador de Datos Satelitales para Gestión Distrital',
      totalServicios: 3,
      protocolo: 'WMS 1.1.1',
      descripcion: 'Tablero de toma de decisiones distritales para mitigación bioclimática.'
    }
  },

  // Red MÓNICA (Ground-Truth de la Alcaldía de Cochabamba)
  redMonica: {
    estacionesFisicas: [
      {
        id: 'MONICA-01',
        nombre: 'Estación Sur / Parque del Maestro (Av. 6 de Agosto)',
        distrito: 'Distrito 5',
        lat: -17.4085,
        lon: -66.1528,
        elevacion: 2558,
        sensores: ['PM2.5', 'PM10', 'O3', 'NO2', 'Temperatura', 'Humedad'],
        tipo: 'Estación Física Municipal'
      },
      {
        id: 'MONICA-02',
        nombre: 'Estación Norte / SEMAPA (Av. Circunvalación)',
        distrito: 'Distrito 2',
        lat: -17.3621,
        lon: -66.1685,
        elevacion: 2640,
        sensores: ['PM2.5', 'PM10', 'Temperatura', 'Humedad'],
        tipo: 'Estación Física Municipal'
      }
    ]
  }
};

export const NASA_CONFIG = {
  // 1. NASA POWER API (Series Climatológicas Diarias Globales - Sin API Key requerida)
  powerApi: {
    baseUrl: 'https://power.larc.nasa.gov/api/temporal/daily/point',
    parametros: ['TS', 'T2M', 'PRECTOTCORR', 'RH2M', 'GWETTOP'],
    comunidad: 'AG',
    formato: 'JSON',
    buildUrl: (lat, lon, start = '20240101', end = '20240930') => 
      `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=TS,T2M,PRECTOTCORR,RH2M&community=AG&longitude=${lon}&latitude=${lat}&start=${start}&end=${end}&format=JSON`
  },

  // 2. NASA FIRMS API (Focos de Calor MODIS y VIIRS en Tiempo Real)
  firmsApi: {
    baseUrl: 'https://firms.modaps.eosdis.nasa.gov/api/area/csv',
    sensores: {
      modis: 'MODIS_NRT',
      viirs_snpp: 'VIIRS_SNPP_NRT',
      viirs_noaa20: 'VIIRS_NOAA20_NRT'
    },
    bboxTunari: '-66.35,-17.55,-65.95,-17.20',
    buildUrl: (apiKey, sensor = 'VIIRS_SNPP_NRT', days = 10) =>
      `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${apiKey}/${sensor}/-66.35,-17.55,-65.95,-17.20/${days}`
  },

  // 3. NASA GIBS WMTS (Capas Ráster Satelitales en Vivo)
  gibsWmts: {
    baseUrl: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best',
    capas: {
      trueColor: 'MODIS_Terra_CorrectedReflectance_TrueColor',
      surfaceTempDay: 'MODIS_Terra_Land_Surface_Temp_Day',
      vegetationNdvi: 'MODIS_Terra_NDVI_8Day',
      aerosolsAod: 'MODIS_Combined_Value_Added_AOD'
    },
    buildTileUrl: (capa, fecha = '2024-09-15') =>
      `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${capa}/default/${fecha}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`
  }
};
