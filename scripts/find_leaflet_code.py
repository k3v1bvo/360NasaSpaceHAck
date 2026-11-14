with open("d:/ProyectosCode/Nasa/data/chunk-HSJDSVYG.js", "r", encoding="utf-8") as f:
    text = f.read()

import re

# find get leafletExample
pos = text.find('leafletExample')
while pos != -1:
    snippet = text[max(0, pos-100):min(len(text), pos+600)]
    if 'get leafletExample' in snippet or 'L.tileLayer.wms' in snippet:
        print("--- MATCH ---")
        print(snippet)
    pos = text.find('leafletExample', pos+1)
