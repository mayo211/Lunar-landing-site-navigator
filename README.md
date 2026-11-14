---
title: Lunar Landing Site Navigator
emoji: 🌙
colorFrom: indigo
colorTo: yellow
sdk: docker
app_port: 7860
pinned: false
---

# Lunar Landing Site Navigator

NASA Space Apps Challenge 2026 – Team AstraSpace (Cairo, Egypt)

Compare lunar landing sites and dates: when is the Sun above the real terrain
horizon (solar power) and when is Earth in view (direct-to-Earth communication)?

**Live app:** [paste the Hugging Face Space link here]

## How to use (online)
1. Open the live app and press **★ Demo comparison** (Malapert vs Slater Plain vs Apollo 11).
2. Read the comparison table; hover a **?** for what each number means.
3. Press **1 week earlier / later** to see how a schedule slip changes the results.
4. Drag the time slider to see the Sun and Earth against the real horizon (panorama and 3D view).
5. Or tick up to 3 sites, or click the south pole map, choose dates and press **Compare sites**.

## Working features, limitations, next steps
- **Works:** Sun/Earth positions from NASA JPL Horizons; terrain horizons from NASA LOLA
  elevation maps (60°S to the pole); sunlight, Earth contact, darkness and countdown metrics;
  site and date comparison; panorama, timeline and 3D views; help text on every metric.
- **Limitations:** sites north of 60°S use a flat horizon; new sites or dates need a live
  connection to NASA Horizons (demo dates are pre-loaded); the Sun-disk percentage is an
  estimate; relay satellites and surface safety are not modelled yet.
- **Next:** validation against NASA Quickmap, relay-satellite contact windows, and a slope
  and roughness safety layer.

## Run it on your own computer (Windows)
First-time setup:

    cd backend
    py -3.13 -m venv .venv
    .venv\Scripts\Activate.ps1
    pip install -r requirements.txt
    cd ..\frontend
    npm install

Then double-click `start.bat` (starts both parts and opens http://localhost:5173).

Terrain data (optional locally, too large for the repo): download into `backend/data/dem/`
- https://pgda.gsfc.nasa.gov/data/LOLA_20mpp/LDEM_80S_80MPP_ADJ.TIF
- https://pgda.gsfc.nasa.gov/data/LOLA_20mpp/LDEM_60S_240MPP_ADJ.TIF

Precomputed results for the curated sites are included in `backend/data/cache/`.
The online version is built from the `Dockerfile`, which downloads the terrain maps from NASA.

## How it works
1. NASA JPL Horizons gives the Sun's and Earth's azimuth/elevation from the site.
2. NASA LOLA elevation data gives the terrain horizon in 360 directions
   (ray casting up to 250 km with the Moon's curvature).
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
