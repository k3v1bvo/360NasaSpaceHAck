import json
import re

with open("d:/ProyectosCode/Nasa/data/main_gamc.js", "r", encoding="utf-8") as f:
    text = f.read()

# Let's search for "Harmonization of MODIS and VIIRS" or "8da30122" or "c52066a1"
pos = text.find("8da30122933ced2174ebe3e8b03198731d9cae6dc3230d32")
print("Found API Key at pos:", pos)
if pos != -1:
    snippet = text[max(0, pos-500):min(len(text), pos+4000)]
    print("--- SNIPPET ---")
    print(snippet[:2000])

# Search for all URLs or endpoints
endpoints = re.findall(r'https?://[a-zA-Z0-9\.\-_/]+', text)
print("Unique endpoints found:")
for ep in set(endpoints):
    if 'cochabamba' in ep or 'wms' in ep or 'gamc' in ep or 'geoserver' in ep or 'proxy' in ep:
        print(" ->", ep)
