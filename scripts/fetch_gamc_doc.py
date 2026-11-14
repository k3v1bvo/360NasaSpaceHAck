import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://recursosgamc.cochabamba.bo/api-doc"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
        print("Length:", len(html))
        with open("d:/ProyectosCode/Nasa/data/gamc_api_doc.html", "w", encoding="utf-8") as f:
            f.write(html)
        print("First 500 chars:", html[:500])
except Exception as e:
    print("Error fetching:", e)
