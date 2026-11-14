import urllib.request
import csv
import io
import json

# Coordenadas ampliadas de Cochabamba y Parque Nacional Tunari
BBOX = {
    'min_lat': -17.65,
    'max_lat': -17.05,
    'min_lon': -66.65,
    'max_lon': -65.85
}

def is_in_cocha(lat, lon):
    return (BBOX['min_lat'] <= lat <= BBOX['max_lat']) and (BBOX['min_lon'] <= lon <= BBOX['max_lon'])

urls = {
    'MODIS_7d': 'https://firms.modaps.eosdis.nasa.gov/data/active_fire/modis-c6.1/csv/MODIS_C6_1_South_America_7d.csv',
    'VIIRS_SNPP_7d': 'https://firms.modaps.eosdis.nasa.gov/data/active_fire/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_South_America_7d.csv'
}

for name, url in urls.items():
    print(f"Descargando y filtrando {name}...")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=30) as resp:
        content = resp.read().decode('utf-8')
        reader = csv.DictReader(io.StringIO(content))
        matches = []
        for row in reader:
            try:
                lat = float(row['latitude'])
                lon = float(row['longitude'])
                if is_in_cocha(lat, lon):
                    matches.append(row)
            except:
                pass
        print(f"  -> Total filas en Sudamérica: {reader.line_num}")
        print(f"  -> Focos encontrados en Cochabamba/Tunari (últimos 7 días): {len(matches)}")
        if matches:
            print("  Ejemplo de foco:", matches[0])
