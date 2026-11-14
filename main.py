"""
Punto de Entrada del Backend de Microclimas Urbanos & Tendencias Planetarias
Proyecto: NASA TREND DETECTIVE - NASA Space Apps Cochabamba 2026 (FEXCO)
"""

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.routes import router as api_router

app = FastAPI(
    title="NASA TREND DETECTIVE — API Microclimas Urbanos & Tendencias",
    description=(
        "Sistema Predictivo de Confort Térmico y Detección de Tendencias Planetarias "
        "para el Reto Oficial Be An Earth System Trend Detective (Cota 2750 / Tunari / GAMC)."
    ),
    version="2.0.0"
)

# Permitir CORS para desarrollo local y conexión con el dashboard React del equipo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/")
def root():
    return {
        "sistema": "NASA TREND DETECTIVE - Planetary Intelligence & Microclimas Urbanos con IA",
        "evento": "NASA Space Apps Challenge 2026 - Sede FEXCO",
        "modulo": "Be An Earth System Trend Detective! - Microclimas Urbanos con IA",
        "docs": "/docs",
        "api_distritos": "/api/distritos",
        "api_cota_2750": "/api/cota-2750",
        "api_contraste": "/api/contrast-analysis",
        "api_simulacion": "/api/simulate-intervention"
    }


if __name__ == "__main__":
    print("🚀 Iniciando Servidor NASA TREND DETECTIVE en http://127.0.0.1:8000...")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
