"""Draws the horizon panorama of one site to a PNG.
Run from the backend folder:  python -m scripts.plot_horizon MMA02"""
import sys

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from app.service import get_horizon
from app.sites import find_site

site_id = sys.argv[1] if len(sys.argv) > 1 else "MMA02"
site = find_site(site_id)
if site is None:
    sys.exit(f"Unknown site id: {site_id}")

horizon = get_horizon(site["lat"], site["lon"])
plt.figure(figsize=(11, 3.5))
plt.fill_between(horizon["az"], horizon["el"], min(horizon["el"]) - 1, color="0.6")
plt.axhline(0, color="k", lw=0.5)
plt.xlim(0, 360)
plt.xlabel("Azimuth (deg, 0 = north, 90 = east)")
plt.ylabel("Horizon elevation (deg)")
plt.title(f"{site['name']} ({site_id}) - source: {horizon['source']}")
plt.tight_layout()
out = f"horizon_{site_id}.png"
plt.savefig(out, dpi=130)
print("saved", out)
