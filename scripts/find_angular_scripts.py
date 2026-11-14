import re

with open("d:/ProyectosCode/Nasa/data/gamc_api_doc.html", "r", encoding="utf-8") as f:
    text = f.read()

scripts = re.findall(r'<script[^>]*src=\"([^\"]+)\"', text)
print("Scripts found:", scripts)
