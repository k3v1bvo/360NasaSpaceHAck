with open("d:/ProyectosCode/Nasa/data/chunk-HSJDSVYG.js", "r", encoding="utf-8") as f:
    text = f.read()

pos = text.find('projects=[{')
print("pos:", pos)
if pos != -1:
    snippet = text[pos:pos+15000]
    with open("d:/ProyectosCode/Nasa/data/gamc_services_full.txt", "w", encoding="utf-8") as f:
        f.write(snippet)
    print("Saved 15000 chars of projects data")
