import re

for filename in ["d:/ProyectosCode/Nasa/data/chunk-SCTJTHGW.js", "d:/ProyectosCode/Nasa/data/chunk-HSJDSVYG.js"]:
    with open(filename, "r", encoding="utf-8") as f:
        text = f.read()
    
    print(f"Checking {filename} (length {len(text)})...")
    if "8da30122" in text:
        print("  FOUND API KEY in", filename)
        pos = text.find("8da30122")
        print(text[max(0, pos-200):min(len(text), pos+2000)])
    
    # Check for endpoints
    for u in set(re.findall(r'https?://[a-zA-Z0-9\.\-_/:]+', text)):
        print("  URL found:", u)
