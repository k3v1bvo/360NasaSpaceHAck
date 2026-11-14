import re

for filename in ["d:/ProyectosCode/Nasa/data/chunk-HB4GU6KB.js", "d:/ProyectosCode/Nasa/data/chunk-X36UUQET.js"]:
    with open(filename, "r", encoding="utf-8") as f:
        text = f.read()
    
    print(f"Checking {filename} (length {len(text)})...")
    if "8da30122" in text:
        print("  FOUND API KEY in", filename)
        pos = text.find("8da30122")
        print(text[max(0, pos-200):min(len(text), pos+1500)])
    
    # Search for all URLs
    for u in set(re.findall(r'https?://[a-zA-Z0-9\.\-_/:]+', text)):
        if any(k in u for k in ['wms', 'geoserver', 'gamc', 'cochabamba', 'api', 'proxy']):
            print("  URL found:", u)
