with open("d:/ProyectosCode/Nasa/data/chunk-HSJDSVYG.js", "r", encoding="utf-8") as f:
    text = f.read()

import re

# find leafletExample
pos = text.find('leafletExample')
if pos != -1:
    print("Found leafletExample at pos:", pos)
    print(text[pos-200:pos+1500])

pos2 = text.find('https://serviciosgamc.cochabamba.bo/api/gs/wms?')
if pos2 != -1:
    print("URL with params:")
    print(text[pos2-100:pos2+500])
