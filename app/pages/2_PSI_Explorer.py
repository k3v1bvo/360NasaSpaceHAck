"""
Página 2: PSI Explorer — Explorador de Investigaciones NASA PSI
Flame in Freefall — NASA Space Apps Challenge 2026
"""

import os
import json
import streamlit as st
import pandas as pd

# Custom CSS
css_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "style.css")
if os.path.exists(css_path):
    with open(css_path, "r", encoding="utf-8") as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

st.title("🔬 Explorador de Investigaciones NASA PSI")
st.markdown("Navega, filtra e inspecciona las **24 investigaciones de combustión** del repositorio oficial **Physical Sciences Informatics** de la NASA.")

# Load PSI data
psi_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "psi_investigations.json")
if os.path.exists(psi_path):
    with open(psi_path, "r", encoding="utf-8") as f:
        psi_data = json.load(f)
else:
    psi_data = []

if not psi_data:
    st.error("No se encontró la base de datos PSI en `app/data/psi_investigations.json`.")
    st.stop()

# Filter Controls Row
col_search, col_plat, col_type = st.columns([1.5, 1, 1])

with col_search:
    search_query = st.text_input("🔍 Búsqueda por palabra clave o material:", placeholder="ej. PMMA, cool flames, SoFIE, hollín...")

with col_plat:
    all_platforms = ["Todas"] + sorted(list(set(item.get("platform", "ISS") for item in psi_data)))
    selected_plat = st.selectbox("Plataforma de Vuelo:", all_platforms)

with col_type:
    all_types = ["Todos"] + sorted(list(set(item.get("experiment_type", "General") for item in psi_data)))
    selected_type = st.selectbox("Tipo de Experimento:", all_types)

# Filter logic
filtered = []
for inv in psi_data:
    # Text match
    match_text = True
    if search_query:
        query = search_query.lower()
        searchable = " ".join([
            inv.get("name", ""),
            inv.get("description", ""),
            " ".join(inv.get("materials", [])),
            " ".join(inv.get("key_findings", [])),
            inv.get("category", "")
        ]).lower()
        match_text = query in searchable
        
    # Platform match
    match_plat = (selected_plat == "Todas") or (inv.get("platform") == selected_plat)
    
    # Type match
    match_type = (selected_type == "Todos") or (inv.get("experiment_type") == selected_type)
    
    if match_text and match_plat and match_type:
        filtered.append(inv)

st.markdown(f"**Mostrando {len(filtered)} de {len(psi_data)} investigaciones indexadas.**")

# Table view
table_rows = []
for item in filtered:
    table_rows.append({
        "ID": item.get("id"),
        "Nombre": item.get("name"),
        "Plataforma": item.get("platform"),
        "Años": item.get("year_range"),
        "Tipo": item.get("experiment_type"),
        "Materiales / Combustibles": ", ".join(item.get("materials", []))[:60] + "..." if len(", ".join(item.get("materials", []))) > 60 else ", ".join(item.get("materials", [])),
    })

df_filtered = pd.DataFrame(table_rows)
st.dataframe(df_filtered, use_container_width=True, hide_index=True)

st.markdown("---")
st.subheader("📋 Ficha Técnica Detallada de Investigación")

# Selection box for deep inspection
selected_id = st.selectbox(
    "Selecciona una investigación para ver sus hallazgos, publicaciones y parámetros:",
    [f"{item['id']} — {item['name']}" for item in filtered]
)

if selected_id:
    curr_id = selected_id.split(" — ")[0]
    inv = next((x for x in filtered if x["id"] == curr_id), None)
    
    if inv:
        c_left, c_right = st.columns([1.2, 0.8])
        
        with c_left:
            st.markdown(f"### {inv['name']} ({inv['id']})")
            st.markdown(f"**Plataforma:** `{inv['platform']}` &nbsp;|&nbsp; **Período:** `{inv['year_range']}` &nbsp;|&nbsp; **Categoría:** `{inv['category']}`")
            st.markdown(f"**Descripción:**\n{inv['description']}")
            
            st.markdown("#### 🎯 Objetivos de la Misión:")
            for obj in inv.get("objectives", []):
                st.markdown(f"- {obj}")
                
            st.markdown("#### 🔑 Hallazgos Clave:")
            for find in inv.get("key_findings", []):
                st.markdown(f"- ✅ **{find}**")
                
        with c_right:
            st.markdown("#### ⚙️ Parámetros Experimentales:")
            params = inv.get("parameters", {})
            df_params = pd.DataFrame(list(params.items()), columns=["Parámetro", "Valor"])
            st.table(df_params)
            
            st.markdown("#### 🧪 Materiales Ensayados:")
            st.write(", ".join(inv.get("materials", [])))
            
            st.markdown("#### 📚 Publicaciones Científicas:")
            for pub in inv.get("publications", []):
                st.markdown(f"- 📄 *{pub}*")
                
            dois = inv.get("doi_links", [])
            if dois:
                st.markdown("#### 🔗 Enlaces DOI:")
                for d in dois:
                    st.markdown(f"[{d}]({d})")
