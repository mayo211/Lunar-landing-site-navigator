"""Computes and caches the horizon of every curated site (run before the demo).
Run from the backend folder:  python -m scripts.precompute"""
import time

from app.service import get_horizon
from app.sites import load_sites

for site in load_sites():
    t0 = time.time()
    horizon = get_horizon(site["lat"], site["lon"])
    el = horizon["el"]
    print(f"{site['id']:7s} source={horizon['source']:12s} "
          f"height={horizon['site_height_m']} m  "
          f"horizon min/max = {min(el):6.2f} / {max(el):6.2f} deg  "
          f"({time.time() - t0:.1f} s)")
