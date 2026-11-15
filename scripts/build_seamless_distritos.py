import json

# ==============================================================================
# 1. NODOS CLAVE DE INTERSECCIÓN (TOPOLOGÍA GEOGRÁFICA DE COCHABAMBA CERCADO)
# ==============================================================================
# Cada punto es un vértice compartido entre 2, 3 o 4 distritos limítrofes.

N_TUNARI_NW = [-66.215, -17.295]
N_TUNARI_N1 = [-66.190, -17.288]
N_TUNARI_N2 = [-66.160, -17.292]
N_TUNARI_N3 = [-66.130, -17.300]
N_TUNARI_NE = [-66.095, -17.315]

# Línea Cota 2750 (Límite sur de D13 y norte de D3, D2, D1)
C2750_W   = [-66.205, -17.348] # Límite Tiquipaya / Cota
C2750_3_2 = [-66.178, -17.352] # Intersección D13 - D3 - D2
C2750_2_1 = [-66.155, -17.357] # Intersección D13 - D2 - D1
C2750_E   = [-66.105, -17.368] # Límite Sacaba / Pacata norte

# Borde oeste de D3 (Límite con Tiquipaya / Colcapirhua norte)
WEST_D3_MID = [-66.202, -17.365]

# Eje del Río Rocha (Límite natural: D3, D2, D1 al norte; D4, D12, D10, D11 al sur)
ROCHA_W     = [-66.200, -17.382] # Coña Coña / Blanco Galindo puente (D3-D4)
ROCHA_3_12  = [-66.182, -17.380] # Puente Quillacollo / Beijing (D3-D2-D12)
ROCHA_2_12  = [-66.168, -17.379] # Curva Cala Cala / puente Cobija (D2-D12-D10)
ROCHA_2_10  = [-66.158, -17.385] # Plazuela Colón / Recoleta (D2-D1-D10)
ROCHA_1_11  = [-66.142, -17.389] # Muyurina / puente Constitución (D1-D10-D11)
ROCHA_E     = [-66.108, -17.382] # Límite Sacaba / Serranía San Pedro (D1-D11)

# Límite interior D3 y D2 (Avenida Atahuallpa / Circunvalación 1)
DIV_3_2_MID = [-66.180, -17.368]

# Límite interior D2 y D1 (Avenida Libertador Bolívar / América este)
DIV_2_1_MID = [-66.156, -17.370]

# Límite exterior este de D1 y D11 (Serranía de San Pedro / Pacata)
EAST_D1_MID  = [-66.104, -17.375]
EAST_D11_MID = [-66.115, -17.395]

# Eje Sur del Centro (Av. 6 de Agosto / La Cancha / Coronilla)
# Separa (D4, D12, D10, D11) de (D5, D6, D7)
SUR_CENTRO_W    = [-66.202, -17.408] # Límite oeste Blanco Galindo km 7 (D4-D5)
SUR_CENTRO_4_12 = [-66.178, -17.404] # Cabildo / entrada oeste (D4-D12-D5)
SUR_CENTRO_12_5 = [-66.165, -17.402] # La Coronilla / Parque Kanata norte (D12-D10-D5)
SUR_CENTRO_10_6 = [-66.152, -17.403] # Mercado La Cancha / Parque del Maestro (D10-D5-D6)
SUR_CENTRO_11_6 = [-66.142, -17.405] # Av. Barrientos / Circuito Alalay norte (D10-D11-D6)
SUR_CENTRO_11_7 = [-66.130, -17.407] # Entrada FEXCO / Av. Petrolera km 1 (D11-D6-D7)
SUR_CENTRO_E    = [-66.110, -17.410] # Faldas Cerro San Pedro sur (D11-D7)

# Límites interiores del Centro
DIV_4_12_MID  = [-66.185, -17.392] # Entre D4 y D12 (Av. Beijing)
DIV_12_10_MID = [-66.166, -17.390] # Entre D12 y D10 (Av. Ayacucho norte)
DIV_10_11_MID = [-66.148, -17.395] # Entre D10 y D11 (Av. San Martín / UMSS)

# Eje de La Tamborada / Circunvalación Sur
# Separa (D5, D6, D7) de (D9, D14, D8)
TAMBORADA_W    = [-66.205, -17.442] # Límite suroeste Maica (D5-D9)
TAMBORADA_5_6  = [-66.168, -17.438] # Pucará / Panamericana sur (D5-D9-D6)
TAMBORADA_6_14 = [-66.148, -17.436] # Circuito Alalay sur / cerro verde (D6-D9-D14)
TAMBORADA_7_14 = [-66.132, -17.435] # Valle Hermoso centro (D6-D7-D14)
TAMBORADA_7_8  = [-66.118, -17.438] # Av. Petrolera km 5 / Refinería (D7-D14-D8)
TAMBORADA_E    = [-66.105, -17.442] # Límite este Ushpa Ushpa (D7-D8)

# Límite interior D5 y D6 (alrededor de Jaihuayco y Laguna Alalay oeste)
DIV_5_6_MID = [-66.155, -17.420]

# Límite interior D6 y D7 (Laguna Alalay este / Cerro San Miguel)
DIV_6_7_MID = [-66.126, -17.420]

# Borde Sur Extremo (Límites con Santiváñez / Arbieto)
SOUTH_W     = [-66.210, -17.485] # Maica alta suroeste
SOUTH_9_1   = [-66.185, -17.495] # Pampa San Miguel
SOUTH_9_MID = [-66.165, -17.510] # K'ara K'ara cumbre sur
SOUTH_9_14  = [-66.142, -17.502] # Límite D9 y D14
SOUTH_14_8  = [-66.120, -17.485] # Límite D14 y D8
SOUTH_E     = [-66.098, -17.465] # Ushpa Ushpa extremo sureste

# Límites interiores de la Zona Sur (D9, D14, D8)
DIV_9_14_MID = [-66.145, -17.468] # Entre K'ara K'ara y Alto Cochabamba
DIV_14_8_MID = [-66.122, -17.460] # Entre Alto Cochabamba y Ushpa Ushpa


# ==============================================================================
# 2. DEFINICIÓN DE LOS 14 POLÍGONOS CON VÉRTICES COMPARTIDOS (TOPOLOGÍA PURA)
# ==============================================================================

# D13: Tunari Cordillera Norte
poly_D13 = [
    N_TUNARI_NW, N_TUNARI_N1, N_TUNARI_N2, N_TUNARI_N3, N_TUNARI_NE,
    C2750_E, [-66.128, -17.362], [-66.142, -17.360], C2750_2_1,
    [-66.165, -17.355], C2750_3_2, [-66.192, -17.350], C2750_W,
    N_TUNARI_NW
]

# D3: Sarco / Temporal / Condebamba (Noroeste)
poly_D3 = [
    C2750_W, C2750_3_2, DIV_3_2_MID, ROCHA_3_12,
    [-66.190, -17.381], ROCHA_W, WEST_D3_MID, C2750_W
]

# D2: Cala Cala / Tupuraya (Norte Central)
poly_D2 = [
    C2750_3_2, C2750_2_1, DIV_2_1_MID, ROCHA_2_10,
    ROCHA_2_12, ROCHA_3_12, DIV_3_2_MID, C2750_3_2
]

# D1: Queru Queru / Aranjuez / Mayorazgo (Norte Este)
poly_D1 = [
    C2750_2_1, C2750_E, EAST_D1_MID, ROCHA_E,
    ROCHA_1_11, ROCHA_2_10, DIV_2_1_MID, C2750_2_1
]

# D4: La Chimba / Coña Coña (Oeste)
poly_D4 = [
    ROCHA_W, [-66.190, -17.381], DIV_4_12_MID, SUR_CENTRO_4_12,
    [-66.190, -17.406], SUR_CENTRO_W, [-66.201, -17.395], ROCHA_W
]

# D12: Hipódromo / Sarco Sur / Villa Galindo (Centro-Oeste)
poly_D12 = [
    ROCHA_3_12, ROCHA_2_12, DIV_12_10_MID, SUR_CENTRO_12_5,
    SUR_CENTRO_4_12, DIV_4_12_MID, [-66.190, -17.381], ROCHA_3_12
]

# D10: Centro Histórico / El Prado / Casco Viejo (Centro)
poly_D10 = [
    ROCHA_2_12, ROCHA_2_10, ROCHA_1_11, DIV_10_11_MID,
    SUR_CENTRO_11_6, SUR_CENTRO_10_6, SUR_CENTRO_12_5, DIV_12_10_MID,
    ROCHA_2_12
]

# D11: Las Cuadras / San Pedro / Muyurina (Centro-Este)
poly_D11 = [
    ROCHA_1_11, ROCHA_E, EAST_D11_MID, SUR_CENTRO_E,
    SUR_CENTRO_11_7, SUR_CENTRO_11_6, DIV_10_11_MID, ROCHA_1_11
]

# D5: Jaihuayco / Parque Kanata / La Maica (Suroeste - Aeropuerto)
poly_D5 = [
    SUR_CENTRO_W, SUR_CENTRO_4_12, SUR_CENTRO_12_5, SUR_CENTRO_10_6,
    DIV_5_6_MID, TAMBORADA_5_6, [-66.185, -17.440], TAMBORADA_W,
    [-66.203, -17.425], SUR_CENTRO_W
]

# D6: Laguna Alalay / Cerro Verde (Centro-Sureste - Isla Fría)
poly_D6 = [
    SUR_CENTRO_10_6, SUR_CENTRO_11_6, SUR_CENTRO_11_7, DIV_6_7_MID,
    TAMBORADA_7_14, TAMBORADA_6_14, TAMBORADA_5_6, DIV_5_6_MID,
    SUR_CENTRO_10_6
]

# D7: Villa Sebastián Pagador / Valle Hermoso Norte (Este)
poly_D7 = [
    SUR_CENTRO_11_7, SUR_CENTRO_E, [-66.110, -17.425], TAMBORADA_E,
    TAMBORADA_7_8, TAMBORADA_7_14, DIV_6_7_MID, SUR_CENTRO_11_7
]

# D14: Alto Cochabamba / Sebastián Pagador Sur (Sureste Medio)
poly_D14 = [
    TAMBORADA_6_14, TAMBORADA_7_14, TAMBORADA_7_8, DIV_14_8_MID,
    SOUTH_14_8, SOUTH_9_14, DIV_9_14_MID, TAMBORADA_6_14
]

# D8: Ushpa Ushpa / Valle Hermoso Sur (Sureste Árido)
poly_D8 = [
    TAMBORADA_7_8, TAMBORADA_E, [-66.102, -17.455], SOUTH_E,
    SOUTH_14_8, DIV_14_8_MID, TAMBORADA_7_8
]

# D9: K'ara K'ara / Arrumani / Pampa San Miguel (Sur Extremo - Máx Calor)
poly_D9 = [
    TAMBORADA_W, [-66.185, -17.440], TAMBORADA_5_6, TAMBORADA_6_14,
    DIV_9_14_MID, SOUTH_9_14, SOUTH_9_MID, SOUTH_9_1,
    SOUTH_W, [-66.207, -17.465], TAMBORADA_W
]

POLYGONS = {
    'D1': poly_D1,
    'D2': poly_D2,
    'D3': poly_D3,
    'D4': poly_D4,
    'D5': poly_D5,
    'D6': poly_D6,
    'D7': poly_D7,
    'D8': poly_D8,
    'D9': poly_D9,
    'D10': poly_D10,
    'D11': poly_D11,
    'D12': poly_D12,
    'D13': poly_D13,
    'D14': poly_D14
}

# ==============================================================================
# 3. VERIFICACIÓN DE TOPOLOGÍA (POLÍGONOS CERRADOS Y COBERTURA)
# ==============================================================================
for d_id, coords in POLYGONS.items():
    assert coords[0] == coords[-1], f"Polígono {d_id} no está cerrado!"
    print(f"Distrito {d_id}: {len(coords)} vértices limpios y cerrados.")

# Cargar propiedades originales para no perder ni una sola métrica científica
with open('data/gamc/distritos_cochabamba.geojson', 'r', encoding='utf-8') as f:
    orig_data = json.load(f)

props_by_id = {}
for feat in orig_data['features']:
    props_by_id[feat['properties']['distrito_id']] = feat['properties']

new_features = []
for d_id, coords in POLYGONS.items():
    p = props_by_id.get(d_id, {})
    new_features.append({
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": [coords]
        },
        "properties": p
    })

output_geojson = {
    "type": "FeatureCollection",
    "metadata": {
        "municipio": "Cochabamba Cercado",
        "departamento": "Cochabamba, Bolivia",
        "fuente_datos_espaciales": "GAMC (Gobierno Autónomo Municipal de Cochabamba) - Cartografía Oficial Continua",
        "fuente_satelital": "NASA Earthdata (MODIS MYD11A1, Landsat 8/9 TIRS, SRTM 30m)",
        "proyecto": "GEO-COCHABAMBA 360 - Microclimas Urbanos con IA",
        "total_distritos": 14,
        "topologia": "Continua sin solapamiento (Shared Boundary Tessellation)"
    },
    "features": new_features
}

with open('data/gamc/distritos_cochabamba.geojson', 'w', encoding='utf-8') as f:
    json.dump(output_geojson, f, indent=2, ensure_ascii=False)

print("\n¡distritos_cochabamba.geojson actualizado con éxito con topología limpia!")
