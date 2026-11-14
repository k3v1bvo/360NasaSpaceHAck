"""
Página 4: AI Assistant — Asistente de Consultas con Atribución de Fuentes NASA
Flame in Freefall — NASA Space Apps Challenge 2026
"""

import os
import json
import streamlit as st
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Custom CSS
css_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "style.css")
if os.path.exists(css_path):
    with open(css_path, "r", encoding="utf-8") as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

st.title("🤖 Asistente Inteligente de Seguridad contra Incendios")
st.markdown("Consulta en lenguaje natural sobre combustión en microgravedad, experimentos del **NASA PSI**, normas de supresión y accidentes históricos. **Todas las respuestas citan fuentes científicas verificadas**.")

# Load Knowledge Base
kb_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "knowledge_base.json")
if os.path.exists(kb_path):
    with open(kb_path, "r", encoding="utf-8") as f:
        kb_content = json.load(f)
        kb_entries = kb_content.get("entries", [])
else:
    kb_entries = []

if not kb_entries:
    st.error("No se pudo cargar la base de conocimientos.")
    st.stop()

# Build TF-IDF search index
questions = [e["question"] + " " + " ".join(e.get("keywords", [])) + " " + e.get("answer", "") for e in kb_entries]
vectorizer = TfidfVectorizer(stop_words=None, ngram_range=(1, 2))
tfidf_matrix = vectorizer.fit_transform(questions)

def search_kb(query, threshold=0.15):
    query_vec = vectorizer.transform([query])
    similarities = cosine_similarity(query_vec, tfidf_matrix).flatten()
    best_idx = similarities.argmax()
    best_score = similarities[best_idx]
    
    if best_score < threshold:
        return None, best_score
    return kb_entries[best_idx], best_score

# Sample Query Chips
st.markdown("##### 💡 Preguntas Rápidas Frecuentes:")
chip_cols = st.columns(3)

with chip_cols[0]:
    if st.button("🔥 ¿Cómo cambian las llamas en micro-g?"):
        st.session_state["query_input"] = "¿Cómo se comporta una llama en microgravedad?"
with chip_cols[1]:
    if st.button("❄️ ¿Qué son las Cool Flames y su riesgo?"):
        st.session_state["query_input"] = "¿Qué son las llamas frías o cool flames y por qué son peligrosas?"
with chip_cols[2]:
    if st.button("💧 ¿Por qué niebla de agua (NFPA 750)?"):
        st.session_state["query_input"] = "¿Por qué usar niebla de agua en lugar de CO2 o nitrógeno?"

user_query = st.text_input(
    "Escribe tu pregunta sobre combustión espacial:",
    value=st.session_state.get("query_input", ""),
    placeholder="ej. ¿Por qué fallan los detectores ópticos en la ISS? ¿Qué aprendimos de Apollo 1?"
)

if user_query:
    result, score = search_kb(user_query)
    
    if result:
        st.markdown(f"""
        <div style="background: rgba(17, 24, 39, 0.9); border: 1px solid #00d4ff; border-radius: 12px; padding: 22px; margin-top: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span style="font-weight: 700; color: #00d4ff; font-size: 1.1rem;">
                    🎯 Respuesta del Asistente (Confianza: {score*100:.1f}%)
                </span>
                <span class="badge-safe">FUENTE NASA VERIFICADA</span>
            </div>
            <p style="font-size: 1rem; color: #f8fafc; line-height: 1.6; margin-bottom: 16px;">
                {result['answer']}
            </p>
            <div style="border-top: 1px solid #1e293b; padding-top: 10px; font-size: 0.85rem; color: #94a3b8;">
                <b>📚 Fuente Oficial:</b> {result['source']}<br/>
                <b>🏷️ Categoría:</b> <code>{result.get('category', 'General')}</code> &nbsp;|&nbsp; <b>ID:</b> <code>{result['id']}</code>
            </div>
        </div>
        """, unsafe_allow_html=True)
    else:
        st.warning(f"⚠️ **Información no disponible en el subconjunto actual de NASA PSI.** (Similitud máxima: {score*100:.1f}% menor al umbral de confianza requerido). Se requiere consultar el repositorio completo en `science.nasa.gov/physical-sciences-informatics-psi/`.")

st.markdown("---")
st.markdown("### 🔍 Temas Cubiertos en la Base de Conocimiento:")
cat_cols = st.columns(4)
with cat_cols[0]:
    st.markdown("- **Física Microgravedad**\n- Difusión pura\n- Soot Shells\n- Flujo de Stefan")
with cat_cols[1]:
    st.markdown("- **Llamas Frías (LTC)**\n- Experimentos FLEX\n- Cinética H₂O₂ y CH₂O\n- Reencendido súbito")
with cat_cols[2]:
    st.markdown("- **Normativa & Detección**\n- Límites de NASA-STD-6001B\n- Proyecto FLARE (ISO)\n- Sensor Brunswick / MPASS")
with cat_cols[3]:
    st.markdown("- **Supresión & Accidentes**\n- Niebla de Agua NFPA 750\n- Apollo 1, 13 y Mir\n- Trajes de bomberos (Spinoff)")
