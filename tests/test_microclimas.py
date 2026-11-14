import pytest
from fastapi.testclient import TestClient
from main import app
from src.models.thermal_indices import ThermalComfortCalculator

client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ONLINE"
    assert "local_fno_3d" in data["modelos_cargados"]

def test_distritos():
    res = client.get("/api/distritos")
    assert res.status_code == 200
    data = res.json()
    assert data["type"] == "FeatureCollection"
    assert len(data["features"]) == 14
    # Verificar que D13 (Tunari) y D9 (K'ara K'ara) existan
    d_ids = [f["properties"]["distrito_id"] for f in data["features"]]
    assert "D13" in d_ids
    assert "D9" in d_ids

def test_contrast_analysis():
    res = client.get("/api/contrast-analysis")
    assert res.status_code == 200
    data = res.json()
    # Debe existir una diferencia térmica de al menos +10°C
    assert data["diferencial_termico_lst_c"] >= 10.0

def test_thermal_indices():
    tmrt = ThermalComfortCalculator.compute_tmrt(ta=28.0, solar_global_w_m2=850.0)
    assert tmrt > 28.0

    utci = ThermalComfortCalculator.compute_utci(ta=28.0, tmrt=tmrt, va=1.5, rh=40.0)
    assert isinstance(utci, float)

    albedo_test = ThermalComfortCalculator.detect_albedo_penalty(
        pet_baseline=36.0,
        pet_con_albedo=41.5
    )
    assert albedo_test["albedo_penalty_detectado"] is True

def test_simulate_intervention():
    payload = {
        "distrito_id": "D9",
        "incremento_arbolado_pct": 30.0,
        "incremento_albedo_techos": 0.2,
        "recuperacion_alalay": True,
        "ola_calor": False
    }
    res = client.post("/api/simulate-intervention", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "geojson" in data
    assert "resumen_impacto" in data
