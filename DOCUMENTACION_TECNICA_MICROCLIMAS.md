# 🛰️ DOCUMENTACIÓN TÉCNICA Y GUÍA CIENTÍFICA
## Reto: *Be An Earth System Trend Detective!* — Microclimas Urbanos con Inteligencia Artificial
**Proyecto:** *GEO-COCHABAMBA 360 / NASA TREND DETECTIVE*  
**Hackathon:** NASA Space Apps Challenge Cochabamba 2026 (Sede FEXCO)  
**Módulos Oficiales Integrados:** Módulo 01 (*Microclimas Urbanos con IA*) y Módulo 05 (*Visualizador Satelital para Gestión Distrital*)  
**Líder Técnico:** Kevin (`k3v1bvo`) — Team Stevens  
**Despliegue en Vivo:** [https://nasa-trend-detective.vercel.app](https://nasa-trend-detective.vercel.app)  

---

## 1. Resumen Ejecutivo del Módulo

Este módulo resuelve la problemática microclimática y de justicia ambiental en el municipio de Cochabamba (Cercado) mediante la integración de **25 años de observaciones satelitales de la NASA**, los **servicios WMS oficiales del GAMC en EPSG:3857** y un **modelo de Machine Learning (XGBoost 3.2.0)** calibrado contra las estaciones físicas de la **Red MÓNICA**.

### Diagnóstico Territorial de Cochabamba:
* **Parque Nacional Tunari (Distrito 13 - Cota > 2750 msnm):**  
  Temperatura superficial (LST) promedio de **$20.4^\circ\text{C}$**, cobertura vegetal NDVI de **$0.58$** y confort térmico diurno confortable ($\text{PET } 21.8^\circ\text{C}$). Actúa como el pulmón biológico y regulador hídrico del valle.
* **Zona Sur Urbana (Distritos 8, 9, 14 y 15 - Cota < 2750 msnm):**  
  Superficies de asfalto y suelo árido desprovistas de arbolado con LST de **$37.8^\circ\text{C}$ a $43.5^\circ\text{C}$** y NDVI crítico de **$0.07$**, lo que genera una **brecha térmica urbana de $+17.4^\circ\text{C}$** en menos de 8 km lineales.
* **Efecto Termorregulador de la Laguna Alalay (Distrito 6):**  
  La recarga hídrica del espejo de agua ejerce un efecto de enfriamiento de hasta **$-1.8^\circ\text{C}$** en los distritos circundantes.

---

## 2. Insumos Oficiales y Arquitectura de Datos

### A. Servicios WMS Oficiales del GAMC (`https://serviciosgamc.cochabamba.bo/api/gs/wms` en `EPSG:3857`)
El visor cartográfico consume directamente los servicios OGC WMS de la Alcaldía de Cochabamba:
1. **Límite Distritos** (UUID: `7eb13092-bf0e-493b-aae6-03c43eedda2c`): Geometría vectorial de los 15 distritos.
2. **Población por Manzanas** (UUID: `194a02a0-a73a-48c1-a260-82847c5c905d`): Cruce predial de vulnerabilidad socio-climática.
3. **Áreas Verdes** (UUID: `47360ddc-e35f-4ece-a995-59e90eb79cc6`): Identificación del déficit de parques y masa forestal urbana.
4. **Cota 2750** (UUID: `297cefa4-0832-42bb-a98e-2cbea989fd9d`): Barrera biofísica y legal del Parque Tunari.

Las operaciones implementadas incluyen `GetMap`, `GetLegendGraphic` (`VERSION=1.0.0`) y `GetFeatureInfo` interactivo al hacer clic en cualquier punto del mapa en coordenadas de proyección Web Mercator (`SRS=EPSG:3857`).

### B. Datos Satelitales de la NASA
1. **NASA POWER (2000–2025):** 9,131 registros diarios continuos de temperatura del aire ($T_{2M}$), irradiancia solar ($MJ/m^2/d$), humedad relativa y viento.
2. **NASA MODIS/VIIRS LST & NDVI:** Colecciones MOD11A2, VNP21A2 y MOD13Q1 para el seguimiento multitemporal de islas de calor.
3. **NASA SRTM / NASADEM (30m):** Topografía de alta precisión para el gradiente altimétrico y modelado de inversión térmica.

### C. Ground-Truth: Red MÓNICA GAMC y Transporte Público
* **Red MÓNICA:** 125,865 registros continuos de calidad del aire y temperatura en dos estaciones físicas:
  * **Estación SEMAPA (Norte):** 71,154 registros, $PM_{10}$ promedio de $49.3\,\mu g/m^3$.
  * **Estación Kanata (Sur):** 54,711 registros, $PM_{10}$ promedio de $67.1\,\mu g/m^3$ (+36% mayor debido a la trampa topográfica de inversión térmica).
* **Líneas de Transporte:** GeoJSON con 730 rutas de transporte público que aportan calor antropogénico en corredores viales.

---

## 3. Innovación con IA: 13 Sensores Virtuales Calibrados

Debido a que Cochabamba solo cuenta con 2 estaciones físicas oficiales para monitorear una ciudad de más de 800,000 habitantes, se implementó un modelo de **Machine Learning (XGBoost 3.2.0)** entrenado para extrapolar y predecir condiciones microclimáticas en los **13 distritos ciegos sin sensores físicos**.

```
                   MATRIZ DE PREDICCIÓN CON MACHINE LEARNING
                   
[NASA POWER Clima] ──┐
[LST Satelital]    ──┼─► [ XGBoost 3.2.0 Regressor ] ──► [ 13 Sensores Virtuales IA ]
[NDVI Vegetación]  ──┤     (Calibrado con Red MÓNICA)      (D1-D5, D7-D8, D10-D15)
[DEM Cota/Altitud] ──┤     R² = 0.9457 | MAE = 0.44°C      Temperatura, Humedad,
[Densidad Manzanas]──┤     RMSE = 0.55°C | p < 0.0001      PET y Calidad del Aire
[Líneas Transporte]──┘
```

### Métricas de Evaluación Científica del Modelo:
* **Coeficiente de Determinación ($R^2$):** **0.9457**
* **Root Mean Squared Error ($\text{RMSE}$):** **$0.5496^\circ\text{C}$**
* **Mean Absolute Error ($\text{MAE}$):** **$0.4362^\circ\text{C}$**
* **Significancia Estadística ($p\text{-value}$):** **$0.0000 < 0.05$** (estadísticamente significativo)
* **Dataset de Validación:** 1,460 días independientes de prueba cruzada.

---

## 4. Indicadores de Confort Biometeorológico y Simulación

### A. Temperatura Fisiológica Equivalente (PET)
El sistema calcula el índice PET basado en el balance energético humano de Munich (MEMI):
$$\text{PET} = f(T_{\text{aire}}, T_{\text{mrt}}, v_{\text{viento}}, \text{RH}, \text{Albedo}, \text{SVF})$$
* **Zona Norte (D1, D2, D13):** PET en rango de confort ($21.8^\circ\text{C} - 26.5^\circ\text{C}$).
* **Zona Sur (D8, D9, D15):** PET en estrés térmico extremo ($38.5^\circ\text{C} - 41.2^\circ\text{C}$).

### B. Simulador de Intervención Urbana para el GAMC
El planificador municipal puede simular en tiempo real el impacto de políticas públicas:
1. **Reforestación Urbana (+15% cobertura vegetal):**  
   * Reduce el LST en **$-2.3^\circ\text{C}$**.  
   * Reduce el índice de estrés térmico PET en **$-3.1^\circ\text{C}$**.  
   * Disminuye la demanda de refrigeración y mitiga las partículas en suspensión.
2. **Pavimentos Fríos y Reflectantes:**  
   * Reduce el LST superficial en **$-1.4^\circ\text{C}$**.
3. **Detector de la Paradoja del Albedo:**  
   * Alerta al municipio si se aplican recubrimientos reflectantes (techos o pavimentos blancos) sin sombreado arbóreo, ya que la radiación rebotada hacia los peatones incrementa el PET sobre los $40^\circ\text{C}$.

---

## 5. Cobertura de los 15 Distritos Oficiales de Cochabamba

| Distrito | Nombre / Zona | LST Promedio | NDVI | PET | Tasa Decadal LST | Nivel de Riesgo |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **D1** | Queru Queru | $26.2^\circ\text{C}$ | 0.32 | $25.8^\circ\text{C}$ | $+0.42^\circ\text{C}/\text{década}$ | Moderado |
| **D2** | Cala Cala | $25.8^\circ\text{C}$ | 0.35 | $25.4^\circ\text{C}$ | $+0.38^\circ\text{C}/\text{década}$ | Bajo-Moderado |
| **D3** | Sarco | $27.1^\circ\text{C}$ | 0.28 | $27.0^\circ\text{C}$ | $+0.45^\circ\text{C}/\text{década}$ | Moderado |
| **D4** | La Chimba | $29.4^\circ\text{C}$ | 0.22 | $29.8^\circ\text{C}$ | $+0.51^\circ\text{C}/\text{década}$ | Medio-Alto |
| **D5** | Jaihuayco | $31.8^\circ\text{C}$ | 0.16 | $32.4^\circ\text{C}$ | $+0.58^\circ\text{C}/\text{década}$ | Alto |
| **D6** | Laguna Alalay | $28.5^\circ\text{C}$ | 0.29 | $28.0^\circ\text{C}$ | $+0.34^\circ\text{C}/\text{década}$ | Amortiguador ($-1.8^\circ\text{C}$) |
| **D7** | Villa Sebastián Pagador | $32.7^\circ\text{C}$ | 0.14 | $33.6^\circ\text{C}$ | $+0.58^\circ\text{C}/\text{década}$ | Medio-Alto |
| **D8** | Ushpa Ushpa | $36.5^\circ\text{C}$ | 0.09 | $37.9^\circ\text{C}$ | $+0.64^\circ\text{C}/\text{década}$ | Crítico |
| **D9** | Itocta | $34.8^\circ\text{C}$ | 0.11 | $36.2^\circ\text{C}$ | $+0.61^\circ\text{C}/\text{década}$ | Crítico |
| **D10** | Centro Histórico | $31.2^\circ\text{C}$ | 0.18 | $31.9^\circ\text{C}$ | $+0.52^\circ\text{C}/\text{década}$ | Medio-Alto |
| **D11** | Las Cuadras | $28.9^\circ\text{C}$ | 0.24 | $29.1^\circ\text{C}$ | $+0.46^\circ\text{C}/\text{década}$ | Moderado |
| **D12** | Hipódromo | $29.4^\circ\text{C}$ | 0.21 | $29.7^\circ\text{C}$ | $+0.49^\circ\text{C}/\text{década}$ | Moderado |
| **D13** | Tunari Alto (Cota > 2750m) | $20.4^\circ\text{C}$ | 0.58 | $21.8^\circ\text{C}$ | $+0.28^\circ\text{C}/\text{década}$ | Pulmón Protector |
| **D14** | Sebastián Pagador Sur | $33.9^\circ\text{C}$ | 0.12 | $35.1^\circ\text{C}$ | $+0.59^\circ\text{C}/\text{década}$ | Alto |
| **D15** | K'ara K'ara / Ch'ampa Rancho | $37.8^\circ\text{C}$ | 0.07 | $39.5^\circ\text{C}$ | $+0.67^\circ\text{C}/\text{década}$ | Extremo (Isla de Calor) |

---

## 6. Verificación en Producción y Calidad de Código

* **Frontend:** React 18, Leaflet, Tailwind CSS y Lucide Icons.
* **Componente Central:** `frontend/src/components/MapViewer.jsx` y `frontend/src/modules/TemporalTrendModal.jsx`.
* **Rendimiento:** Cero layout shifts en interacción con gráficas, controles de zoom aislados en esquina inferior derecha (`bottomright`) sin colisión con barras de herramientas superiores.
* **Validación de Compilación:** Compilación sin errores (`npm run build` en Vite) y despliegue continuo en Vercel.
