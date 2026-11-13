# Lunar Landing Site Navigator

Compare lunar landing sites and dates: when is the Sun above the terrain
horizon (power) and when is Earth in view (direct communication)?

## Run the backend (terminal 1)
    cd backend
    python -m venv .venv
    .venv\Scripts\activate          (Windows)   |   source .venv/bin/activate   (Linux/Mac)
    pip install -r requirements.txt
    python -m scripts.selfcheck     (maths check, no internet needed)
    python -m scripts.test_horizons (NASA JPL Horizons check, needs internet)
    uvicorn app.main:app --reload   (API on http://localhost:8000, docs at /docs)

## Run the frontend (terminal 2)
    cd frontend
    npm install
    npm run dev                     (open http://localhost:5173)

## Terrain data
Put LDEM_80S_80MPP_ADJ.TIF in backend/data/dem/ (from https://pgda.gsfc.nasa.gov/products/90).
Without it the app still works, with a flat horizon.
Then run:  python -m scripts.precompute
