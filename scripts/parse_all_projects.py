with open("d:/ProyectosCode/Nasa/data/gamc_services_full.txt", "r", encoding="utf-8") as f:
    text = f.read()

import re

# Find all projects
project_matches = re.split(r'id:\"project-', text)
print(f"Total projects found: {len(project_matches)-1}")

for i, pm in enumerate(project_matches[1:]):
    print("="*60)
    print(f"PROYECTO {i+1}")
    name_m = re.search(r'name:\"([^\"]+)\"', pm)
    gamc_m = re.search(r'nameGamc:\"([^\"]+)\"', pm)
    key_m = re.search(r'key:\"([^\"]+)\"', pm)
    endpoint_m = re.search(r'endpoint:\"([^\"]+)\"', pm)
    print("Name:", name_m.group(1) if name_m else "N/A")
    print("GAMC Name:", gamc_m.group(1) if gamc_m else "N/A")
    print("Key:", key_m.group(1) if key_m else "N/A")
    print("Endpoint:", endpoint_m.group(1) if endpoint_m else "N/A")
    
    # find all services inside this project
    services = re.findall(r'name:\"([^\"]+)\",kind:\"([^\"]+)\"[^}]*id:\"([a-f0-9\-]+)\"', pm)
    print(f"Services ({len(services)}):")
    for s_name, s_kind, s_id in services:
        print(f"  - [{s_kind}] {s_name} -> UUID: {s_id}")
