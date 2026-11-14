import urllib.request
import ssl
import json
import re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://recursosgamc.cochabamba.bo/main-ZYS7EESP.js"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
        content = resp.read().decode('utf-8', errors='ignore')
        print("Downloaded main bundle! Length:", len(content))
        with open("d:/ProyectosCode/Nasa/data/main_gamc.js", "w", encoding="utf-8") as f:
            f.write(content)
except Exception as e:
    print("Error:", e)
