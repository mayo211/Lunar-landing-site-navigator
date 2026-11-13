"""The web API. Run from the backend folder:  uvicorn app.main:app --reload"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .config import MAX_SITES, MAX_TIME_STEPS
from .dem import get_dem_stack
from .ephemeris import EphemerisError
from .models import VisibilityRequest
from .service import analyze_site
from .sites import load_sites

app = FastAPI(title="Lunar Landing Site Navigator API")
app.add_middleware(CORSMiddleware, allow_origins=["*"],
                   allow_methods=["*"], allow_headers=["*"])


@app.get("/api/health")
def health():
    dems = get_dem_stack()
    return {"status": "ok", "dem_files": [d.name for d in dems.dems]}


@app.get("/api/sites")
def sites():
    return load_sites()


@app.post("/api/visibility")
def visibility(request: VisibilityRequest):
    if request.end <= request.start:
        raise HTTPException(400, "end must be after start")
    if len(request.sites) > MAX_SITES:
        raise HTTPException(400, f"at most {MAX_SITES} sites per request")
    steps = (request.end - request.start).days * 1440 / request.step_minutes
    if steps > MAX_TIME_STEPS:
        raise HTTPException(400, "too many time steps: use a shorter range or bigger step")

    try:
        results = [
            analyze_site(site.model_dump(), request.start, request.end,
                         request.step_minutes, request.earth_mask_deg)
            for site in request.sites
        ]
    except EphemerisError as exc:
        raise HTTPException(502, str(exc)) from exc

    return {"start": request.start, "end": request.end,
            "step_minutes": request.step_minutes,
            "earth_mask_deg": request.earth_mask_deg, "sites": results}
