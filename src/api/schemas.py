"""
Esquemas Pydantic v2 para validación de API y Contratos de Datos GeoJSON
Proyecto: GEO-COCHABAMBA 360 - Microclimas Urbanos con IA
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class DistritoProperties(BaseModel):
    distrito_id: str = Field(..., description="Identificador único del distrito (ej. D1, D9)")
    numero: int = Field(..., description="Número de distrito (1-14)")
    nombre: str = Field(..., description="Nombre toponímico del distrito")
    zona_geografica: str = Field(..., description="Zona urbana (Norte, Sur, Centro, etc.)")
    cota_media_msnm: float = Field(..., description="Altitud media sobre el nivel del mar")
    cota_categoria: str = Field(..., description="Categoría respecto a Cota 2750: 'Sobre_2750m' o 'Bajo_2750m'")
    poblacion_total: int = Field(..., description="Población estimada del distrito")
    area_km2: float = Field(..., description="Área territorial en km²")
    densidad_hab_km2: float = Field(..., description="Densidad poblacional")
    lst_nasa_promedio_c: float = Field(..., description="LST superficial satelital promedio en °C")
    lst_nasa_max_c: float = Field(..., description="LST máxima registrada en °C")
    ndvi_promedio: float = Field(..., description="Índice de vegetación NDVI promedio (-1 a 1)")
    deficit_arbolado_pct: float = Field(..., description="Porcentaje de déficit de cobertura arbórea")
    temp_aire_pred_c: float = Field(..., description="Temperatura ambiente del aire predicha en °C")
    viento_pred_ms: float = Field(..., description="Velocidad del viento predicha en m/s")
    pet_pred_c: float = Field(..., description="Índice biometeorológico PET predicho en °C")
    utci_pred_c: float = Field(..., description="Índice Universal de Clima Térmico UTCI en °C")
    riesgo_termico_hvr: float = Field(..., description="Índice sintético HVR de 0.0 a 1.0")
    nivel_alerta: str = Field(..., description="Nivel de alerta: BAJO, MODERADO, ALTO, CRITICO")
    diferencial_isla_calor_c: float = Field(..., description="Diferencia de temperatura respecto al Tunari D13")
    estrategia_recomendada: str = Field(..., description="Estrategia bioclimática recomendada por el GAMC")


class GeoJSONGeometry(BaseModel):
    type: str = Field("Polygon", description="Tipo geométrico (Polygon / MultiPolygon)")
    coordinates: List[Any] = Field(..., description="Coordenadas GeoJSON [longitud, latitud]")


class GeoJSONFeature(BaseModel):
    type: str = Field("Feature", description="Tipo GeoJSON Feature")
    geometry: GeoJSONGeometry
    properties: Dict[str, Any]


class GeoJSONFeatureCollection(BaseModel):
    type: str = Field("FeatureCollection", description="Colección de características GeoJSON")
    metadata: Optional[Dict[str, Any]] = None
    features: List[GeoJSONFeature]


class SimulationRequest(BaseModel):
    distrito_id: Optional[str] = Field(None, description="Distrito a simular (ej. 'D9'), o None para todos")
    incremento_arbolado_pct: float = Field(0.0, ge=0.0, le=100.0, description="Incremento de cobertura vegetal en %")
    incremento_albedo_techos: float = Field(0.0, ge=0.0, le=0.8, description="Aumento de reflectancia en cubiertas (0.0 a 0.8)")
    recuperacion_alalay: bool = Field(False, description="Activa escenario de recarga hídrica en Laguna Alalay")
    ola_calor: bool = Field(False, description="Simula condición meteorológica extrema (+4°C de radiación solar)")


class SimulationResponse(BaseModel):
    geojson: GeoJSONFeatureCollection
    resumen_impacto: Dict[str, Any]
    alerta_albedo_penalty: Optional[Dict[str, Any]] = None
    tiempo_computo_ms: float


class HealthResponse(BaseModel):
    status: str
    version: str
    proyecto: str
    equipo: str
    sede: str
    gpu_disponible: bool
    modelos_cargados: Dict[str, bool]
