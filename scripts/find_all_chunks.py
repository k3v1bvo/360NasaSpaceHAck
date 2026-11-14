import re

with open("d:/ProyectosCode/Nasa/data/main_gamc.js", "r", encoding="utf-8") as f:
    text = f.read()

chunks = re.findall(r'chunk-[a-zA-Z0-9_\-]+\.js', text)
print("Chunks in main_gamc:", set(chunks))

with open("d:/ProyectosCode/Nasa/data/chunk-HB4GU6KB.js", "r", encoding="utf-8") as f:
    text2 = f.read()

chunks2 = re.findall(r'chunk-[a-zA-Z0-9_\-]+\.js', text2)
print("Chunks in chunk-HB4GU6KB:", set(chunks2))
