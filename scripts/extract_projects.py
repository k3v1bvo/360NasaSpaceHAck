with open("d:/ProyectosCode/Nasa/data/chunk-HSJDSVYG.js", "r", encoding="utf-8") as f:
    text = f.read()

import re

# Let's search around Q, Y, q, W, $
pos = text.find('var Q="1a3d2d9c')
if pos != -1:
    print(text[pos-1000:pos+8000])
