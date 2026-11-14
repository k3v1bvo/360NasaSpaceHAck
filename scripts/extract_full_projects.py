with open("d:/ProyectosCode/Nasa/data/chunk-HSJDSVYG.js", "r", encoding="utf-8") as f:
    text = f.read()

pos = text.find('projects=[{')
end_pos = text.find('selectedProject=this.projects[0]')
if pos != -1 and end_pos != -1:
    projects_code = text[pos:end_pos]
    with open("d:/ProyectosCode/Nasa/data/gamc_services_full.js", "w", encoding="utf-8") as f_out:
        f_out.write(projects_code)
    print("Saved projects code, length:", len(projects_code))
else:
    print("Could not find boundaries")
