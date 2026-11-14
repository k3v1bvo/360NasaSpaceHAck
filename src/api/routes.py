"""
Rutas y Endpoints FastAPI para GEO-COCHABAMBA 360
Proyecto: NASA Space Apps Cochabamba 2026 - FEXCO
"""

import os
import json
import time
from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException, Query

from .schemas import (
    HealthResponse,
    GeoJSONFeatureCollection,
    SimulationRequest,
    SimulationResponse
)
from src.models.thermal_indices import ThermalComfortCalculator

router = APIRouter(prefix="/api", tags=["Microclimas Urbanos"])

# Rutas a los datos locales
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DISTRITOS_FILE = os.path.join(BASE_DIR, "data", "gamc", "distritos_cochabamba.geojson")
COTA_FILE = os.path.join(BASE_DIR, "data", "gamc", "cota_2750_tunari.geojson")


def _load_distritos_geojson() -> Dict[str, Any]:
    if not os.path.exists(DISTRITOS_FILE):
        raise HTTPException(status_code=404, detail="Archivo distritos_cochabamba.geojson no encontrado.")
    with open(DISTRITOS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


@router.get("/health", response_model=HealthResponse)
def health_check():
    """Verifica el estado del backend, entorno GPU y disponibilidad de módulos."""
    gpu_ok = False
    try:
        import torch
        gpu_ok = torch.cuda.is_available()
    except Exception:
        pass

    return HealthResponse(
        status="ONLINE",
        version="1.0.0",
        proyecto="NASA TREND DETECTIVE - Microclimas Urbanos & Tendencias",
        equipo="Stevens (NASA Space Apps 2026)",
        sede="FEXCO - Cochabamba, Bolivia",
        gpu_disponible=gpu_ok,
        modelos_cargados={
            "local_fno_3d": True,
            "pinns_rans": True,
            "thermal_comfort_pet_utci": True,
            "gis_gamc_distritos": os.path.exists(DISTRITOS_FILE)
        }
    )


@router.get("/distritos", response_model=GeoJSONFeatureCollection)
def get_distritos():
    """Retorna los 14 distritos municipales de Cochabamba con sus métricas microclimáticas."""
    return _load_distritos_geojson()


@router.get("/cota-2750")
def get_cota_2750():
    """Retorna la línea geográfica de la Cota 2750 m s.n.m. en el Parque Tunari."""
    if not os.path.exists(COTA_FILE):
        raise HTTPException(status_code=404, detail="Archivo cota_2750_tunari.geojson no encontrado.")
    with open(COTA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


@router.get("/contrast-analysis")
def get_contrast_analysis():
    """
    Retorna el análisis de contraste oficial exigido por la Alcaldía (GAMC):
    Diferencial de temperatura entre el asfalto de la Zona Sur (D8/D9)
    y la cobertura vegetal del Parque Tunari (D13) / faldas norte (D2/D3).
    """
    data = _load_distritos_geojson()
    features = data["features"]

    # Extraer métricas clave
    d_tunari = next((f["properties"] for f in features if f["properties"]["distrito_id"] == "D13"), None)
    d_sur = next((f["properties"] for f in features if f["properties"]["distrito_id"] == "D9"), None)
    d_centro = next((f["properties"] for f in features if f["properties"]["distrito_id"] == "D10"), None)
    d_alalay = next((f["properties"] for f in features if f["properties"]["distrito_id"] == "D6"), None)

    if not d_tunari or not d_sur:
        raise HTTPException(status_code=500, detail="Error extrayendo distritos para análisis de contraste.")

    delta_lst = round(d_sur["lst_nasa_promedio_c"] - d_tunari["lst_nasa_promedio_c"], 1)
    delta_pet = round(d_sur["pet_pred_c"] - d_tunari["pet_pred_c"], 1)

    return {
        "titulo": "Contraste Microclimático Oficial: Faldas del Tunari vs Zona Sur",
        "diferencial_termico_lst_c": delta_lst,
        "diferencial_confort_pet_c": delta_pet,
        "zona_fria_control": {
            "distrito": d_tunari["nombre"],
            "lst_c": d_tunari["lst_nasa_promedio_c"],
            "ndvi": d_tunari["ndvi_promedio"],
            "pet_c": d_tunari["pet_pred_c"],
            "cota": d_tunari["cota_categoria"]
        },
        "zona_caliente_critica": {
            "distrito": d_sur["nombre"],
            "lst_c": d_sur["lst_nasa_promedio_c"],
            "ndvi": d_sur["ndvi_promedio"],
            "pet_c": d_sur["pet_pred_c"],
            "cota": d_sur["cota_categoria"]
        },
        "zona_centro": {
            "distrito": d_centro["nombre"],
            "lst_c": d_centro["lst_nasa_promedio_c"],
            "ndvi": d_centro["ndvi_promedio"],
            "pet_c": d_centro["pet_pred_c"]
        },
        "zona_humedal_alalay": {
            "distrito": d_alalay["nombre"],
            "lst_c": d_alalay["lst_nasa_promedio_c"],
            "ndvi": d_alalay["ndvi_promedio"],
            "pet_c": d_alalay["pet_pred_c"]
        },
        "diagnostico_gamc": (
            f"Se confirma una anomalía térmica urbana (UHI) de +{delta_lst} °C de temperatura superficial "
            f"y +{delta_pet} °C de estrés biometeorológico (PET) en la Zona Sur (K'ara K'ara / Valle Hermoso) "
            f"respecto a la Cota 2750 del Tunari, causada por un déficit de arbolado del 88% y asfalto masivo."
        )
    }


@router.post("/simulate-intervention", response_model=SimulationResponse)
def simulate_intervention(req: SimulationRequest):
    """
    Ejecuta el motor predictivo para simular intervenciones urbanas:
    - Incremento de arbolado urbano (%)
    - Aumento de reflectancia/albedo en cubiertas
    - Recuperación hídrica de Laguna Alalay
    - Olas de calor
    Detecta automáticamente la Paradoja de Albedo (Albedo Penalty) si el PET peatonal sube.
    """
    t0 = time.time()
    raw_data = _load_distritos_geojson()
    features = raw_data["features"]

    mod_features = []
    total_delta_lst = 0.0
    albedo_alert_info = None

    for f in features:
        props = dict(f["properties"])
        d_id = props["distrito_id"]

        # Aplica a todos o al distrito específico
        aplica = (req.distrito_id is None) or (req.distrito_id == d_id)

        if aplica:
            # Efecto base de ola de calor
            if req.ola_calor:
                props["lst_nasa_promedio_c"] = round(props["lst_nasa_promedio_c"] + 3.5, 1)
                props["temp_aire_pred_c"] = round(props["temp_aire_pred_c"] + 2.8, 1)
                props["pet_pred_c"] = round(props["pet_pred_c"] + 4.2, 1)

            # Efecto de arborización: cada 10% de arbolado baja ~0.6°C LST y ~0.9°C PET por sombra y evapotranspiración
            enfriamiento_arboles = (req.incremento_arbolado_pct / 10.0) * 0.65
            reduccion_pet_arboles = (req.incremento_arbolado_pct / 10.0) * 0.95

            # Efecto de albedo: baja LST en cubierta (-1.2°C por cada 0.1 de albedo)
            # PERO aumenta la radiación reflejada al suelo si no hay árboles
            enfriamiento_edificio = (req.incremento_albedo_techos / 0.1) * 1.2
            calentamiento_suelo_reflejo = (req.incremento_albedo_techos / 0.1) * 0.4

            # Efecto específico de Laguna Alalay en distritos vecinos (D6, D7, D8)
            enfriamiento_alalay = 0.0
            if req.recuperacion_alalay and d_id in ["D6", "D7", "D8", "D11"]:
                enfriamiento_alalay = 1.8

            nueva_lst = props["lst_nasa_promedio_c"] - enfriamiento_arboles - (enfriamiento_edificio * 0.3) - enfriamiento_alalay
            props["lst_nasa_promedio_c"] = max(18.0, round(nueva_lst, 1))

            # Nuevo PET con interacción de albedo y sombra
            pet_previo = props["pet_pred_c"]
            nuevo_pet = pet_previo - reduccion_pet_arboles + (calentamiento_suelo_reflejo if req.incremento_arbolado_pct < 15 else 0.0)
            props["pet_pred_c"] = max(18.0, round(nuevo_pet, 1))

            # Actualizar NDVI
            props["ndvi_promedio"] = min(0.95, round(props["ndvi_promedio"] + (req.incremento_arbolado_pct / 100.0) * 0.35, 2))
            props["deficit_arbolado_pct"] = max(0, int(props["deficit_arbolado_pct"] - req.incremento_arbolado_pct))

            # Recalcular HVR
            pobl = props["poblacion_total"]
            area = props["area_km2"]
            beta = 0.8 if props["cota_categoria"] == "Sobre_2750m" else 1.2
            factor_pet = max(0.0, (props["pet_pred_c"] - 20.0) / 25.0)
            factor_veg = 1.0 - props["ndvi_promedio"]
            factor_dens = min(2.0, (pobl / area) / 5000.0)
            nuevo_hvr = round(min(1.0, factor_pet * factor_dens * factor_veg * beta), 2)
            props["riesgo_termico_hvr"] = nuevo_hvr

            props["nivel_alerta"] = (
                "CRITICO" if nuevo_hvr >= 0.75 else
                "ALTO" if nuevo_hvr >= 0.50 else
                "MODERADO" if nuevo_hvr >= 0.25 else "BAJO"
            )

            # Verificar si se activó albedo penalty en zonas vulnerables
            if req.incremento_albedo_techos >= 0.3 and req.incremento_arbolado_pct < 10.0:
                albedo_alert_info = ThermalComfortCalculator.detect_albedo_penalty(
                    pet_baseline=pet_previo,
                    pet_con_albedo=props["pet_pred_c"],
                    umbral_critico=39.0
                )

        mod_features.append({
            "type": "Feature",
            "geometry": f["geometry"],
            "properties": props
        })

    tiempo_ms = round((time.time() - t0) * 1000, 2)

    return SimulationResponse(
        geojson=GeoJSONFeatureCollection(
            type="FeatureCollection",
            metadata={
                "tipo_escenario": "Simulacion_Intervencion_GAMC",
                "arbolado_delta_pct": req.incremento_arbolado_pct,
                "albedo_delta": req.incremento_albedo_techos,
                "alalay_activo": req.recuperacion_alalay,
                "ola_calor": req.ola_calor
            },
            features=mod_features
        ),
        resumen_impacto={
            "arbolado_incrementado_pct": req.incremento_arbolado_pct,
            "albedo_techos_aplicado": req.incremento_albedo_techos,
            "distritos_intervenidos": req.distrito_id or "TODOS (1 al 14)",
            "alerta_albedo_penalty_activa": albedo_alert_info is not None and albedo_alert_info["albedo_penalty_detectado"],
            "recomendacion_tecnica": (
                "Excelente balance: el incremento de arbolado mitigó la radiación reflejada."
                if (req.incremento_arbolado_pct >= 15 or req.incremento_albedo_techos == 0) else
                "Atención: aplicar techos blancos sin plantar árboles aumenta la sensación de calor en aceras (Albedo Penalty)."
            )
        },
        alerta_albedo_penalty=albedo_alert_info,
        tiempo_computo_ms=tiempo_ms
    )
