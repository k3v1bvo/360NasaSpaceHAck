# Flame in Freefall - Scientific Backend & ML Engine

## Subsystems
- **`simulation/`**: Physical PDE solvers and analytical microgravity kinetics models (`flame_kinetics.py`). Gold Standard for flame spread rate ($V_f$) and low-temperature chemistry (LTC) cool flame transients.
- **`ml/`**: Machine learning pipelines, Random Forest models (`.joblib`), training scripts (`train_all.py`), and historical dataset generators.
- **`api/`**: FastAPI REST endpoints for real-time simulation calls, materials flammability queries, and PSI investigations retrieval.
- **`data/`**: NASA PSI reference datasets (`materials_flammability.json`, `psi_investigations.json`, `knowledge_base.json`).

## Running the Backend API
```bash
cd backend
pip install -r requirements.txt
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be available at `http://localhost:8000/docs`.
