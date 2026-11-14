# 🛰️ NASA TREND DETECTIVE (NASA Space Apps Challenge 2026)
### *Planetary Earth System Climate Anomaly & Regional AI Microclimate Sensing*

> **Reto Oficial:** [*Be An Earth System Trend Detective!*](https://www.spaceappschallenge.org/2026/challenges/earth-system-trend-detective/?tab=resources)  
> **Equipo:** Stevens • **Líder:** Kevin (`k3v1bvo`)  
> **Sede:** FEXCO (Feria Exposición de Cochabamba, Bolivia)  
> **Repositorio Oficial:** [https://github.com/k3v1bvo/360NasaSpaceHAck.git](https://github.com/k3v1bvo/360NasaSpaceHAck.git)  
> **Rama de Integración:** `feature/earth-system-trend-detective`

---

## 🎯 El Desafío Científico de la NASA

El sistema ambiental interconectado de la Tierra se encuentra en constante cambio. Este proyecto responde rigurosamente a las **4 preguntas científicas obligatorias de la NASA**:

1. **¿Qué está cambiando?** (*What is changing?*)  
   $\rightarrow$ Temperatura de Superficie Terrestre (LST), Temperatura de Aire a 2m (T2M), Cobertura Vegetal (NDVI/EVI), Espesor Óptico de Aerosoles (AOD por incendios) y Estrés Térmico Humano (PET/UTCI).
2. **¿Dónde está cambiando?** (*Where is it changing?*)  
   $\rightarrow$ A escala planetaria en 7 puntos críticos mundiales (Amazonía, California, Mediterráneo, Sahel, Ártico, Gran Barrera) y a escala regional en el **Valle de Cochabamba y Cordillera del Tunari**.
3. **¿Cuánto está cambiando?** (*How much is it changing?*)  
   $\rightarrow$ Pendientes decadales cuantificadas ($+0.65\ ^\circ\text{C}/\text{década}$ en zonas urbanas densas vs $-0.08\ ^\circ\text{C}/\text{década}$ en la reserva forestal del Tunari; brecha intraurbana extrema de $+17.4\ ^\circ\text{C}$).
4. **¿Es un cambio estadísticamente significativo?** (*Is it statistically significant?*)  
   $\rightarrow$ Validado mediante la **Prueba No Paramétrica de Mann-Kendall**, **Estimador de Pendiente de Sen** y **Regresión Lineal OLS** con un nivel de confianza $\ge 95\%$ ($p < 0.05$), eliminando el ruido estacional de verano/invierno con **Descomposición STL** siguiendo el paper oficial de la NASA (SeaWiFS time-series).

---

## 🏛️ Los 3 Pilares del Sistema

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NASA TREND DETECTIVE                            │
│           (Planetary Earth System Science & Regional Pilot)            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
       ┌────────────────────────────┼────────────────────────────┐
       ▼                            ▼                            ▼
┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────────────┐
│  1. EXPLORADOR GLOBAL  │  │  2. CASO PILOTO LOCAL  │  │  3. CAUSA TÉRMICA:     │
│     PLANETARIO         │  │     COCHABAMBA & TUNARI│  │     INCENDIOS TUNARI   │
├────────────────────────┤  ├────────────────────────┤  ├────────────────────────┤
│• 7 Hotspots mundiales  │  │• 14 Distritos urbanos  │  │• Motor NASA FIRMS      │
│• NASA POWER API Stream │  │• 2 Estaciones MÓNICA   │  │• MODIS + VIIRS Armoniz.│
│• Portales oficiales:   │  │• 13 Sensores IA XGBoost│  │• WMS Oficial GAMC (03) │
│  Giovanni, AppEEARS,   │  │• Cota 2750 P.N. Tunari │  │• Plumas AOD y Humo     │
│  GES DISC, NOAA CDO    │  │• Confort Humano (PET)  │  │• Capa NASA GIBS World. │
│• Consulta libre Lat/Lon│  │• R² = 0.9457, p < 0.05 │  │• Detección Anom. Forest│
└────────────────────────┘  └────────────────────────┘  └────────────────────────┘
```

---

## 🤖 Modelo de Inteligencia Artificial (Red MÓNICA + NASA POWER)

- **Algoritmo:** XGBoost Regressor 3.2.0 calibrado con validación temporal (`TimeSeriesSplit`).
- **Muestras de Entrenamiento:** **2,497 días continuos** descargados de la API de NASA POWER (2020–2026).
- **Métricas Oficiales Obtenidas:**
  - $R^2$ (Coeficiente de Determinación): **0.9457**
  - $\text{RMSE}$ (Error Cuadrático Medio): **0.5496 °C**
  - $\text{MAE}$ (Error Absoluto Medio): **0.4362 °C**
  - $p$-value: **$0.0000 < 0.05$** (Altamente significativo al $99.9\%$ de confianza)
- **Importancia de Variables:**
  - Temperatura Superficial NASA (LST): **68.9%**
  - Índice de Vegetación MODIS (NDVI): **18.6%**
  - Aerosoles / Humo de Incendios (AOD): **9.8%**
  - Altitud / Topografía (msnm): **2.7%**

---

## 💻 Instalación y Ejecución

```bash
# 1. Clonar el repositorio
git clone https://github.com/k3v1bvo/360NasaSpaceHAck.git
cd 360NasaSpaceHAck

# 2. Cambiarte a la rama del reto
git checkout feature/earth-system-trend-detective

# 3. Levantar la aplicación web
cd frontend
npm install
npm run dev
```

Abre en tu navegador: `http://localhost:5173`
