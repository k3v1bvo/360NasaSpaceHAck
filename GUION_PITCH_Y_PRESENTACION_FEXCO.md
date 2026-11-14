# 🎤 GUION DEL PITCH (2:30 MIN) Y PRESENTACIÓN FINAL ANTE EL JURADO FEXCO
**Proyecto:** *NASA TREND DETECTIVE: Planetary Earth System Climate Anomaly & Regional AI Microclimate Sensing*  
**Reto Oficial NASA:** [*Be An Earth System Trend Detective!*](https://www.spaceappschallenge.org/2026/challenges/earth-system-trend-detective/?tab=resources)  
**Sede:** Feria Exposición de Cochabamba (FEXCO) • Cochabamba, Bolivia  
**Equipo:** Stevens • **Líder:** Kevin (`k3v1bvo`)

---

## 🎬 PARTE 1: Guion para el Video Pitch Oficial (Duración: 2 min 30 seg)

> **Instrucciones para Kevin y el equipo:**
> - Pueden grabar la pantalla de la computadora mostrando el prototipo en `http://localhost:5173` mientras alternan con la cámara del presentador.
> - Al abrir la pantalla, se ve el **globo terráqueo interactivo** con los 7 hotspots planetarios y la barra superior con las métricas científicas ($R^2 = 0.9457$, $p < 0.05$).

---

### ⏱️ [00:00 - 00:35] — El Desafío Planetario de la NASA (El Gancho Científico)
* **Visual:** Mapa mundial interactivo en pantalla completa con los 7 puntos críticos pulsando en tiempo real (Amazonía, California, Mediterráneo, Sahel, Ártico, Gran Barrera y Cochabamba).
* **Voz de Kevin / Presentador:**
  > *"El sistema ambiental de la Tierra se encuentra en constante cambio. Pero en ciencia climática, una variación temporal no es necesariamente una tendencia. ¿Cómo distinguimos una oscilación meteorológica transitoria de una transformación sistémica real?*  
  > *El desafío oficial de la NASA **'Be An Earth System Trend Detective'** nos exige responder cuatro preguntas determinantes: **¿Qué está cambiando? ¿Dónde? ¿Cuánto? ¿Y es estadísticamente significativo?***  
  > *Hoy presentamos **NASA TREND DETECTIVE**, una plataforma de inteligencia climática planetaria que rastrea anomalías biofísicas globales y las valida en un caso piloto territorial de máxima resolución: el Valle de Cochabamba."*

---

### ⏱️ [00:35 - 01:15] — Demostración Técnica 1: El Explorador Planetario
* **Visual:** El presentador hace clic en la pestaña *Explorador Global*, selecciona los hotspots (Amazonía, Ártico) y muestra la gráfica multi-decadal de serie temporal con la descomposición estacional STL y la tasa en °C/década. Luego hace clic en cualquier coordenada del mapa mundial para consultar en vivo la API de NASA POWER.
* **Voz de Kevin / Presentador:**
  > *"En el **Explorador Global**, cualquier usuario puede consultar en vivo la API de NASA POWER en cualquier coordenada del planeta.*  
  > *Siguiendo el paper científico de referencia de la NASA sobre series temporales de SeaWiFS, aplicamos **Descomposición STL** para remover el ciclo estacional de verano e invierno, aislando la tendencia de fondo.*  
  > *Con la **Prueba de Mann-Kendall** y el **Estimador de Sen**, cuantificamos la tasa de cambio decadal y exigimos un umbral de significancia de **$p < 0.05$** al 95% de confianza, evitando falsas alarmas tanto a nivel satelital global como en la gestión pública."*

---

### ⏱️ [01:15 - 01:55] — Demostración Técnica 2: Caso Piloto Cochabamba (La Paradoja de Tendencias Opuestas)
* **Visual:** El presentador hace clic en *"Ver Caso Piloto Regional"*. La cámara del mapa hace un vuelo suave (flyTo) y aterriza a zoom 12 sobre el Valle de Cochabamba, desplegando los 14 distritos vectoriales con su gradiente de color, la línea verde discontinua de la **Cota 2750 del Tunari**, las 2 estaciones de la Red MÓNICA y los 13 sensores virtuales IA.
* **Voz de Kevin / Presentador:**
  > *"La NASA destaca un fenómeno fascinante: dos tendencias opuestas pueden coexistir en un mismo sistema climático regional. En Cochabamba lo demostramos matemáticamente.*  
  > *Mientras el **Parque Nacional Tunari (Distrito 13)** sobre la Cota 2750 muestra resiliencia y enfriamiento leve por masa boscosa ($-0.08\ ^\circ\text{C}/\text{década}$), la **Zona Sur (Distritos 8 y 9)** sufre una isla de calor urbana extrema provocada por asfalto y deforestación ($+0.65\ ^\circ\text{C}/\text{década}$).*  
  > *Para salvar el vacío de estaciones físicas de la Alcaldía, entrenamos un modelo de Machine Learning con **XGBoost 3.2.0** sobre **2,497 días continuos de satélites NASA**. Nuestro modelo alcanza un coeficiente de determinación **$R^2 = 0.9457$**, un error cuadrático medio de apenas **$0.55\ ^\circ\text{C}$** y significancia **$p < 0.001$**, desplegando 13 sensores virtuales y calculando el Confort Térmico Humano (PET) en la acera."*

---

### ⏱️ [01:55 - 02:30] — Causalidad Física (Incendios Tunari), Resiliencia y Cierre
* **Visual:** El presentador activa la pestaña de *Causa Térmica: Incendios Tunari*, activando la capa de focos armonizados MODIS/VIIRS, el WMS oficial de la Alcaldía y la pluma de reflectancia NASA GIBS Worldview.
* **Voz de Kevin / Presentador:**
  > *"¿Por qué se calienta el valle? Nuestro tercer pilar analiza la causa física: los incendios forestales en el Tunari. Armonizamos los sensores satelitales MODIS (1 km) y VIIRS (375 m) de NASA FIRMS, midiendo la potencia radiativa del fuego (FRP) y las plumas de aerosoles (AOD > 0.6) que quedan atrapadas por la inversión térmica del valle.*  
  > *NASA TREND DETECTIVE opera con arquitectura resiliente **Offline-First**: si las telecomunicaciones colapsan en una emergencia, el sistema sigue funcionando al 100% en los centros de comando de la Alcaldía y bomberos.*  
  > *Demostramos que la ciencia espacial de la NASA no solo explica el cambio global: aterriza con precisión matemática para proteger las vidas y el microclima de nuestra ciudad. ¡Muchas gracias!"*

---

## 📊 PARTE 2: Estructura de Diapositivas para el Jurado en la FEXCO

| # Diapositiva | Título de la Diapositiva | Mensaje Clave & Métricas de Impacto |
| :---: | :--- | :--- |
| **Slide 1** | **NASA TREND DETECTIVE** | • Logotipo Oficial NASA Space Apps Challenge 2026 + GAMC.<br/>• Reto: *Be An Earth System Trend Detective!*<br/>• Equipo Stevens (Líder: Kevin). |
| **Slide 2** | **Las 4 Preguntas Científicas del Reto** | • **¿Qué cambia?** LST, T2M, NDVI, AOD, PET.<br/>• **¿Dónde?** 7 Hotspots globales + Valle de Cochabamba.<br/>• **¿Cuánto?** $+0.65\ ^\circ\text{C}/\text{década}$ (Sur) vs $-0.08\ ^\circ\text{C}/\text{década}$ (Tunari).<br/>• **¿Significativo?** $p < 0.05$ (Mann-Kendall y Sen's Slope). |
| **Slide 3** | **Explorador Planetario & NASA APIs** | • Conexión en vivo con **NASA POWER Daily Climatology**.<br/>• Descomposición de series temporales STL: $Y(t) = T(t) + S(t) + R(t)$ basada en el paper de la NASA SeaWiFS.<br/>• Integración con portales: NASA Giovanni, AppEEARS, GES DISC, NOAA CDO. |
| **Slide 4** | **Caso Piloto: 14 Distritos & Red MÓNICA** | • **Brecha Térmica Territorial:** $+17.4\ ^\circ\text{C}$ de contraste biofísico entre el Tunari (Cota 2750) y la Zona Sur.<br/>• **Efecto Isla Fría:** Laguna Alalay amortigua hasta $-1.8\ ^\circ\text{C}$.<br/>• **Advertencia GAMC:** Paradoja de Albedo (techos blancos sin árboles elevan PET $>40\ ^\circ\text{C}$). |
| **Slide 5** | **Machine Learning & Sensado Virtual** | • **Modelo:** XGBoost Regressor 3.2.0 validado con `TimeSeriesSplit`.<br/>• **Datos:** 2,497 días reales continuos de NASA POWER + Red MÓNICA.<br/>• **Métricas:** **$R^2 = 0.9457$**, **$\text{RMSE} = 0.55\ ^\circ\text{C}$**, **$\text{MAE} = 0.44\ ^\circ\text{C}$**, **$p = 0.0000$**.<br/>• Fusión espacial: 2 estaciones físicas $\rightarrow$ 13 sensores virtuales IA. |
| **Slide 6** | **Causalidad Física, WMS GAMC y Defensa Civil** | • Motor de Monitoreo de Fuego: NASA FIRMS (MODIS + VIIRS armonizados).<br/>• Capas WMS Oficiales de la Alcaldía (Proyecto 03: Cota 2750 y Periurbanos).<br/>• Arquitectura Offline-First: operabilidad continua sin internet en emergencias. |
