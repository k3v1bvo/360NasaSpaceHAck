# 📄 DOCUMENTACIÓN TÉCNICA: MONITOREO Y ARMONIZACIÓN DE INCENDIOS EN EL PARQUE NACIONAL TUNARI
**Desafío Global NASA:** *Harmonization of MODIS and VIIRS Hot Spots*  
**Desafío Local GAMC:** *Monitoreo de Focos de Calor e Incendios Forestales (Tunari) & Módulo 05: Visualizador Satelital para Gestión Distrital*  
**Sede:** Feria Exposición de Cochabamba (FEXCO 2026) • Cochabamba, Bolivia  
**Líder Técnico:** Kevin (`k3v1bvo`) — Team Stevens  
**Despliegue Oficial en Producción:** [https://nasa-trend-detective.vercel.app](https://nasa-trend-detective.vercel.app)  

---

## 1. Resumen Ejecutivo y Contexto Territorial

El **Parque Nacional Tunari (PNT)** es el principal cinturón ecológico, reserva de recarga acuífera y barrera bioclimática para los más de 1.2 millones de habitantes del Área Metropolitana de Cochabamba. 

Cada año, durante la estación seca (julio a noviembre), la ladera sur del Tunari experimenta incendios forestales recurrentes provocados por actividades antrópicas y quemas agrícolas que escapan de control. La geografía de valle cerrado de Cochabamba agrava este fenómeno: el humo denso desciende durante la noche y queda atrapado bajo la **Cota 2750 m s.n.m.** por el fenómeno meteorológico de **inversión térmica**, elevando las concentraciones de partículas respirables ($PM_{10}$ y $PM_{2.5}$) a niveles peligrosos según la OMS.

Este proyecto resuelve este desafío integrando **algoritmos de armonización satelital (MODIS + VIIRS)**, una **línea de tiempo multitemporal interactiva (2020–2026)**, análisis de **espesor óptico de aerosoles (AOD MODIS Aqua)** y **predicción de corredores de riesgo por IA para 2026**.

---

## 2. El Problema Científico: Disparidad de Sensores MODIS y VIIRS

Durante más de dos décadas, el monitoreo satelital de incendios se sustentó en el sensor **MODIS** (satélites Terra y Aqua). Desde 2012, el sensor **VIIRS** (Suomi-NPP, NOAA-20 y NOAA-21) introdujo una resolución espacial significativamente mayor:

| Parámetro Comparativo | MODIS (MCD14DL) | VIIRS (VNP14IMGTDL / VJ114IMGTDL) |
| :--- | :--- | :--- |
| **Resolución en Nadir** | **1,000 m (1 km)** | **375 m** (Bandas I de alta resolución) |
| **Área del píxel en superficie** | $1.0\text{ km}^2$ | $\approx 0.14\text{ km}^2$ (~7 veces menor área) |
| **Canales Térmicos** | Banda 21/22 ($4\,\mu\text{m}$) y Banda 31 ($11\,\mu\text{m}$) | Banda I4 ($3.75\,\mu\text{m}$) y Banda I5 ($11.5\,\mu\text{m}$) |
| **Sensibilidad a fuegos incipientes** | Detecta incendios medianos a grandes | Detecta fuegos pequeños de hasta $0.01\text{ ha}$ en quebradas |
| **Serie Histórica Continua** | 2000 a la fecha (> 24 años) | 2012 a la fecha (~14 años) |

### ⚠️ El Sesgo de Detección Resuelto:
Si una entidad municipal compara el número bruto de detecciones satelitales a lo largo del tiempo, observará un aparente "salto" artificial de más del **280%** a partir de 2012. Este incremento no refleja necesariamente más incendios, sino la fragmentación de un mismo frente de fuego en múltiples píxeles de 375 m por parte de VIIRS.

---

## 3. Algoritmo de Armonización Espaciotemporal

Para construir una serie temporal físicamente consistente, el sistema ejecuta un pipeline de fusión:

```
  [NASA FIRMS MODIS (1km)]                [NASA FIRMS VIIRS (375m)]
             │                                       │
             └───────────────────┬───────────────────┘
                                 │
                                 ▼
              ┌─────────────────────────────────────┐
              │ 1. Filtro Espacial Valle Cochabamba │
              │    Lat: [-17.65, -17.05]            │
              │    Lon: [-66.55, -65.85]            │
              └──────────────────┬──────────────────┘
                                 │
                                 ▼
              ┌─────────────────────────────────────┐
              │ 2. Agrupamiento Espaciotemporal     │
              │    Radio euclidiano: d <= 1.2 km    │
              │    Ventana temporal: Mismo día (Dt) │
              └──────────────────┬──────────────────┘
                                 │
                                 ▼
              ┌─────────────────────────────────────┐
              │ 3. Centroide Ponderado por Energía  │
              │    Lat_c = Σ(Lat_i * FRP_i) / Σ FRP │
              │    Lon_c = Σ(Lon_i * FRP_i) / Σ FRP │
              │    FRP_total = Σ FRP_i (Megawatts)  │
              └──────────────────┬──────────────────┘
                                 │
                                 ▼
              ┌─────────────────────────────────────┐
              │ 4. Cruce con Polígono Cota 2750     │
              │    Ray-casting sobre Capa WMS GAMC  │
              └──────────────────┬──────────────────┘
                                 │
                                 ▼
              ┌─────────────────────────────────────┐
              │ 5. Clasificación de Severidad       │
              │    Moderado (<20MW) | Alto (20-50MW)│
              │    Crítico (>50MW)                  │
              └─────────────────────────────────────┘
```

---

## 4. Patrón Estacional y Línea de Tiempo Satelital (2020–2026)

### A. Hallazgo Estacional Validado:
El análisis de 353 focos armonizados históricos demuestra una concentración temporal crítica:
* **Agosto y Septiembre concentran el 79.8% de todos los incendios forestales** en la cordillera del Tunari.
* Durante este bimestre confluyen tres factores detonantes:
  1. Desecación extrema de la biomasa vegetal (humedad relativa $<15\%$).
  2. Ráfagas de viento seco descendentes de ladera (foehn).
  3. Prácticas agrícolas tradicionales no reguladas en el pie de monte.

### B. Reproductor Multitemporal Interactivo (Línea de Tiempo Satelital):
El visor incorpora un reproductor dinámico de línea de tiempo con:
* **Selector independiente de Años (2020 a 2026)** y **Meses (Ene a Dic)**, con botones de acceso rápido por temporada (🔥 Incendios, ❄️ Inversión, ☀️ Olas de Calor, 🌧️ Lluvias).
* **Modo "Play" Dinámico:** Al pulsar Play, el mapa recorre automáticamente la serie histórica, recalculando en vivo la temperatura LST de los 15 distritos según su tasa decadal y proyectando sobre la ladera del Tunari los focos de calor satelitales registrados en ese período exacto.
* **Banner de Telemetría Flotante:** Informa en tiempo real el año proyectado, el conteo de focos activos, el contraste térmico y la condición de la calidad del aire.

---

## 5. El Nexo Fuego–Atmósfera: Tendencia de Aerosoles (MODIS Aqua AOD) y Red MÓNICA

Para demostrar científicamente el impacto de los incendios en la salud urbana, se procesó la serie multianual de **Espesor Óptico de Aerosoles (AOD a 550 nm)** de MODIS Aqua (2002–2024):

$$\text{Regresión OLS AOD: } \text{Pendiente} = +0.042 / \text{década},\quad R^2 = 0.412,\quad p = 0.0008 < 0.05$$

### Validación Ground-Truth con la Red MÓNICA del GAMC:
* **Estación Kanata (Zona Sur):** Registra picos de $PM_{10} > 160\,\mu g/m^3$ durante los días de incendios en el Tunari, a pesar de encontrarse a más de 12 km de distancia de las llamas.
* **Mecanismo Físico:** El aire frío nocturno que desciende de la cordillera empuja la masa de humo hacia el fondo de la cuenca, donde la capa de inversión térmica (situada entre los 2,550 y 2,750 msnm) impide su dispersión vertical, asfixiando los distritos 5, 8, 9, 14 y 15.

---

## 6. Predicción de Corredores de Riesgo de Fuego por IA para 2026

A partir del análisis espacial de recurrencia histórica, pendiente del terreno (DEM SRTM $>35^\circ$), cercanía a la Cota 2750 y déficit de humedad foliar, el sistema proyecta los **5 corredores de máxima probabilidad de ignición para la temporada 2026**:

1. **Cuenca Taquiña / Tirani (Cota 2750):** Máxima vulnerabilidad por interfaz urbano-forestal densa.
2. **Laderas de Tiquipaya Norte:** Pendiente escarpada que acelera la propagación vertical del fuego.
3. **Andrada y Parque Metropolitano Este:** Alta carga de combustible herbáceo fino seco.
4. **Liriuni / Quillacollo:** Zona crítica de recarga de acuíferos con bosques relictos de Polylepis (kewiña).
5. **Pico Tunari / Ladera Central:** Dificultad extrema de acceso terrestre para brigadas de bomberos.

---

## 7. Interfaz de Usuario y Experiencia en Vivo

* **Diseño Libre de Solapamientos:** La barra de línea de tiempo organiza los selectores en dos filas con ancho máximo (`max-w-4xl`), eliminando colisiones de texto.
* **Control de Zoom Leaflet Independiente:** Ubicado de forma dedicada en la esquina inferior derecha (`bottomright`) con estilo Glassmorphism oscuro, sin interferir con las herramientas cartográficas superiores.
* **Modal de Tendencias y Gráficas IA:** Visualización de 5 paneles de análisis (Ciclo Estacional, Incendios Anuales, Inversión Térmica & PM2.5, Calentamiento Decadal y Matriz de Alerta GAMC), con transiciones estables y ranura de altura reservada para eliminar parpadeos de renderizado.
