import json

with open('data/gamc/distritos_cochabamba.geojson', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Ray casting point in polygon
def point_in_poly(x, y, poly):
    n = len(poly)
    inside = False
    p1x, p1y = poly[0]
    for i in range(n + 1):
        p2x, p2y = poly[i % n]
        if y > min(p1y, p2y):
            if y <= max(p1y, p2y):
                if x <= max(p1x, p2x):
                    if p1y != p2y:
                        xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                    if p1x == p2x or x <= xinters:
                        inside = not inside
        p1x, p1y = p2x, p2y
    return inside

# Approximate polygon area (Shoelace formula)
def poly_area(poly):
    n = len(poly)
    area = 0.0
    for i in range(n):
        j = (i + 1) % n
        area += poly[i][0] * poly[j][1]
        area -= poly[j][0] * poly[i][1]
    return abs(area) / 2.0

features = data['features']
print(f"Total distritos cargados: {len(features)}")

# Check areas
total_area = 0
for feat in features:
    p = feat['properties']
    coords = feat['geometry']['coordinates'][0]
    area = poly_area(coords)
    total_area += area
    print(f"{p['distrito_id']} ({p['nombre'][:25]}): {len(coords)} pts, Área rel: {area:.6f}")

print(f"Área total cubierta: {total_area:.6f} grados cuadrados")

# Check sensors
with open('frontend/src/data/monica_virtual_sensors.json', 'r', encoding='utf-8') as f:
    m_data = json.load(f)

all_sensors = []
all_sensors.extend(m_data.get('estaciones_fisicas', []))
all_sensors.extend(m_data.get('sensores_virtuales_ia', []))
all_sensors.extend(m_data.get('micro_nodos_hotspots', []))

print(f"\nVerificando asignación de {len(all_sensors)} sensores en los 14 distritos:")
for s in all_sensors:
    lon, lat = s['lon'], s['lat']
    found = []
    for feat in features:
        d_id = feat['properties']['distrito_id']
        coords = feat['geometry']['coordinates'][0]
        if point_in_poly(lon, lat, coords):
            found.append(d_id)
    print(f"  {s['id']} ({s['nombre'][:30]}): lat={lat}, lon={lon} -> Distritos encontrados: {found}")
