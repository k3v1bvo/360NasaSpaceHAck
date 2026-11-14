import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

chunks = ['chunk-X36UUQET.js', 'chunk-HB4GU6KB.js']
for ch in chunks:
    url = f"https://recursosgamc.cochabamba.bo/{ch}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
            data = resp.read().decode('utf-8', errors='ignore')
            print(f"Downloaded {ch}: {len(data)} bytes")
            with open(f"d:/ProyectosCode/Nasa/data/{ch}", "w", encoding="utf-8") as f:
                f.write(data)
    except Exception as e:
        print(f"Error {ch}: {e}")
