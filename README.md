# Lunar Landing Site Navigator

NASA Space Apps Challenge 2026 – Team AstraSpace (Cairo, Egypt)

Compare lunar landing sites and dates: when is the Sun above the real terrain
horizon (solar power) and when is Earth in view (direct-to-Earth communication)?

## Quick start (Windows)
Double-click `start.bat`. It starts the backend and the frontend and opens
http://localhost:5173

## First-time setup
Backend (PowerShell):

    cd backend
    py -3.13 -m venv .venv
    .venv\Scripts\Activate.ps1
    pip install -r requirements.txt
    python -m scripts.selfcheck

Frontend:

    cd frontend
    npm install

Terrain data (not in the repo, too large): download into `backend/data/dem/`
- https://pgda.gsfc.nasa.gov/data/LOLA_20mpp/LDEM_80S_80MPP_ADJ.TIF
- https://pgda.gsfc.nasa.gov/data/LOLA_20mpp/LDEM_60S_240MPP_ADJ.TIF

Without them the app still runs with a flat horizon. Precomputed results for the
curated sites are included in `backend/data/cache/`.

## How it works
1. NASA JPL Horizons gives the Sun's and Earth's azimuth/elevation from the site.
2. NASA LOLA elevation data gives the terrain horizon in 360 directions
   (ray casting with the Moon's curvature).
3. The app compares them at every time step: sunlight %, Earth contact hours,
   time to sunset/Earthset, and side-by-side site and date comparison.

## Data and tools used
- NASA/JPL Horizons System – Sun and Earth positions: https://ssd.jpl.nasa.gov/horizons/
- NASA LRO LOLA polar DEMs (NASA PGDA product 90): https://pgda.gsfc.nasa.gov/products/90
- Artemis III candidate regions: NASA NTRS 20250011660; representative site
  coordinates from Wueller et al. (2026), JGR Planets, doi:10.1029/2025JE009434
- Apollo coordinates: NASA NSSDC
- Python, FastAPI, NumPy, rasterio, pyproj; React, TypeScript, Vite, three.js

## Use of AI
Parts of the code, documentation and planning were drafted with AI assistants
(Claude by Anthropic, ChatGPT by OpenAI). The team reviewed, ran and tested all
code, and checked the results against NASA data. 