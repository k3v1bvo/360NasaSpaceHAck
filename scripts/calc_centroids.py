import json

with open('data/gamc/distritos_cochabamba.geojson', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Reseñas histórico-biofísicas detalladas y nombres útiles para cada distrito
RESEÑAS = {
    'D1': {
        "resena_historica": "Zona residencial y boscosa del norte (Queru Queru y Aranjuez). Cuenta con quebradas naturales que descienden del Tunari, manteniendo microclimas frescos y buena cobertura de eucaliptos y molles.",
        "hito_urbano": "Av. América Este • Jardín Botánico Martín Cárdenas • Ciclovía del Norte",
        "tendencia_detectada": "Microclima estable y fresco regulado por la cercanía a la Serranía de San Pedro."
    },
    'D2': {
        "resena_historica": "Cala Cala y Tupuraya, tradicional zona de quintas hoy consolidada. Alberga la sede central de SEMAPA y la Estación Norte de la Red MÓNICA (Ground Truth).",
        "hito_urbano": "SEMAPA • Parque Fidel Anze • Av. Circunvalación Norte",
        "tendencia_detectada": "Excelente amortiguamiento térmico natural gracias al arbolado de parques lineales."
    },
    'D3': {
        "resena_historica": "Sarco y Temporal, área de transición con Tiquipaya. Cruce de varias torrenteras menores que bajan de la cordillera hacia el cauce del Río Rocha.",
        "hito_urbano": "Av. Beijing Norte • Parque de la Familia Sarco • Límite Tiquipaya",
        "tendencia_detectada": "Calentamiento moderado por impermeabilización progresiva del suelo en urbanizaciones."
    },
    'D4': {
        "resena_historica": "La Chimba y Coña Coña, sector oeste del valle atravesado por la Av. Blanco Galindo. Alberga el humedal regulador de la Laguna Coña Coña.",
        "hito_urbano": "Laguna Coña Coña • Av. Blanco Galindo km 4-6 • Colcapirhua límite",
        "tendencia_detectada": "Pérdida histórica del espejo de agua de Coña Coña elevó la temperatura local en +1.9 °C."
    },
    'D5': {
        "resena_historica": "Jaihuayco y La Maica, zona suroeste con vocación lechera y agropecuaria. Contiene el Aeropuerto Internacional Jorge Wilstermann y la Estación Sur de la Red MÓNICA.",
        "hito_urbano": "Aeropuerto Wilstermann • Mercado Jaihuayco • Cuenca Lechera Maica",
        "tendencia_detectada": "Fuerte contraste: campiña húmeda al oeste frente a pista de asfalto y cemento caliente al este."
    },
    'D6': {
        "resena_historica": "Entorno de la Laguna Alalay y Cerro Verde. Actúa como el principal pulmón bioclimático del sur, generando un efecto de 'Isla Fría' que amortigua el calor del valle.",
        "hito_urbano": "Laguna Alalay • Recinto Ferial FEXCO • Country Club Cochabamba",
        "tendencia_detectada": "Isla fría comprobada: reduce -1.8 °C en su área de influencia inmediata cuando el espejo tiene agua."
    },
    'D7': {
        "resena_historica": "Valle Hermoso y Villa Sebastián Pagador Norte, ladera este en las faldas de la Serranía de San Pedro. Zona de alta radiación solar sobre pendientes pedregosas.",
        "hito_urbano": "Refinería Gualberto Villarroel • Mercado Campesino • Ladera San Pedro",
        "tendencia_detectada": "Almacenamiento térmico en cerros desprovistos de vegetación, irradiando calor nocturno."
    },
    'D8': {
        "resena_historica": "Ushpa Ushpa y Valle Hermoso Sur, sector árido periurbano del sureste. Zona de asentamientos recientes en lomas secas con escasa cobertura vegetal (NDVI < 0.10).",
        "hito_urbano": "Av. Petrolera km 7 al 10 • Quebrada Ushpa Ushpa • Salida al Valle Alto",
        "tendencia_detectada": "Isla de calor crítica con déficit de arbolado del 82% y estrés hídrico edáfico sostenido."
    },
    'D9': {
        "resena_historica": "Itocta, Pucará y cuenca del Río Tamborada. Histórica zona de cultivos del sur hoy en rápida transición urbana hacia barrios residenciales populares.",
        "hito_urbano": "Río Tamborada • Polideportivo Pucará • Av. Panamericana Sur",
        "tendencia_detectada": "Calor diurno muy elevado (+35.8 °C LST) atenuado parcialmente por la humedad de parcelas de cultivo."
    },
    'D10': {
        "resena_historica": "Casco Viejo, Centro Histórico y La Coronilla. Corazón comercial de la ciudad que alberga el gran mercado La Cancha, una de las áreas comerciales abiertas más grandes de Sudamérica.",
        "hito_urbano": "Plaza 14 de Septiembre • El Prado • Mercado La Cancha • Cerro San Sebastián",
        "tendencia_detectada": "Hotspot urbano extremo en La Cancha (+8.1 °C sobre Tunari) por densidad de calaminas y asfalto."
    },
    'D11': {
        "resena_historica": "Las Cuadras, San Pedro y Muyurina. Alberga el Campus Central de la Universidad Mayor de San Simón (UMSS) y el monumento del Cristo de la Concordia en la cumbre este.",
        "hito_urbano": "Campus Central UMSS • Cristo de la Concordia • Hospital Viedma",
        "tendencia_detectada": "El campus arbolado de la UMSS actúa como 'Isla Verde', bajando hasta 2.5 °C el calor del entorno."
    },
    'D12': {
        "resena_historica": "Hipódromo, Sarco Sur y Villa Galindo. Área residencial central delimitada por las avenidas Gabriel René Moreno y Blanco Galindo.",
        "hito_urbano": "Ex-Hipódromo (Parque Urbano) • Av. Melchor Pérez de Olguín",
        "tendencia_detectada": "Microclima templado-cálido con alto tráfico vehicular pero arbolado urbano moderado."
    },
    'D13': {
        "resena_historica": "Parque Nacional Tunari Alto y Taquiña. Reserva forestal y cuenca hídrica del municipio sobre la Cota 2750. Bosques de pinos, eucaliptos, qeñuas y fuentes de vertientes.",
        "hito_urbano": "Parque Nacional Tunari • Cota 2750 • Cuenca Taquiña • Vertientes Tirani",
        "tendencia_detectada": "Reserva bioclimática de aire frío (20.4 °C LST) y barrera contra vientos secos del altiplano."
    },
    'D14': {
        "resena_historica": "Alto Cochabamba y Sebastián Pagador Sur. Distrito montañoso y árido del este en las serranías que dominan la vista panorámica del valle sur.",
        "hito_urbano": "Mirador Alto Cochabamba • Tanques de agua SEMAPA • Cerros Sur",
        "tendencia_detectada": "Alta amplitud térmica (días sofocantes de 35.2 °C y noches frías por viento catabático)."
    },
    'D15': {
        "resena_historica": "K'ara K'ara, Arrumani y Pampa San Miguel. El distrito más austral de Cochabamba, caracterizado por suelos arcillosos erosionados y el histórico relleno sanitario.",
        "hito_urbano": "Zona K'ara K'ara • Serranía de Canto Grande • Pampa San Miguel",
        "tendencia_detectada": "Máxima isla de calor urbana de Cochabamba: 37.8 °C en superficie, con una brecha térmica de +17.4 °C respecto al Tunari."
    }
}

for feat in data['features']:
    d_id = feat['properties']['distrito_id']
    coords = feat['geometry']['coordinates'][0]
    avg_lon = sum(c[0] for c in coords[:-1]) / (len(coords) - 1)
    avg_lat = sum(c[1] for c in coords[:-1]) / (len(coords) - 1)
    
    # Agregar centroide y reseñas
    feat['properties']['centroide'] = [round(avg_lat, 4), round(avg_lon, 4)]
    if d_id in RESEÑAS:
        feat['properties'].update(RESEÑAS[d_id])

with open('data/gamc/distritos_cochabamba.geojson', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("¡distritos_cochabamba.geojson enriquecido con reseñas históricas, hitos y centroides!")
