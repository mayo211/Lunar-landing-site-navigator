"""One function that runs the whole pipeline for one site."""
from datetime import date

from . import cache
from .dem import get_dem_stack
from .ephemeris import fetch_az_el
from .horizon import compute_horizon
from .metrics import compute_metrics
from .visibility import build_timeline


def get_horizon(lat: float, lon: float) -> dict:
    """Horizon profile for a site (computed once, then read from the cache)."""
    key = f"{lat:.5f}|{lon:.5f}"
    horizon = cache.load("horizon", key)
    if horizon is None:
        horizon = compute_horizon(lat, lon, get_dem_stack())
        if horizon["source"] == "dem":          # do not cache the flat fallback
            cache.save("horizon", key, horizon)
    return horizon


def analyze_site(site: dict, start: date, end: date,
                 step_minutes: int, earth_mask_deg: float) -> dict:
    lat, lon = site["lat"], site["lon"]
    horizon = get_horizon(lat, lon)
    height_km = (horizon["site_height_m"] or 0.0) / 1000.0

    sun = fetch_az_el("sun", lat, lon, height_km, start, end, step_minutes)
    earth = fetch_az_el("earth", lat, lon, height_km, start, end, step_minutes)

    timeline = build_timeline(sun, earth, horizon, earth_mask_deg)
    return {
        "id": site.get("id"),
        "name": site.get("name", "Custom site"),
        "lat": lat,
        "lon": lon,
        "source": horizon["source"],            # "dem" or "flat_horizon"
        "site_height_m": horizon["site_height_m"],
        "horizon": [{"az": a, "el": e} for a, e in zip(horizon["az"], horizon["el"])],
        "timeline": timeline,
        "metrics": compute_metrics(timeline, step_minutes),
    }
