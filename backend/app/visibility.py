"""Combines the sky (Sun/Earth positions) with the ground (horizon profile)."""
import numpy as np

from .config import SUN_RADIUS_DEG
from .horizon import horizon_at


def build_timeline(sun_rows: list[dict], earth_rows: list[dict],
                   horizon: dict, earth_mask_deg: float) -> list[dict]:
    n = min(len(sun_rows), len(earth_rows))
    sun_az = np.array([r["az"] for r in sun_rows[:n]])
    sun_el = np.array([r["el"] for r in sun_rows[:n]])
    earth_az = np.array([r["az"] for r in earth_rows[:n]])
    earth_el = np.array([r["el"] for r in earth_rows[:n]])

    sun_clearance = sun_el - horizon_at(horizon, sun_az)       # degrees above terrain
    earth_clearance = earth_el - horizon_at(horizon, earth_az)

    # Share of the Sun's disk above the terrain (simple linear estimate).
    sun_disk = np.clip((sun_clearance + SUN_RADIUS_DEG) / (2 * SUN_RADIUS_DEG), 0, 1)

    timeline = []
    for i in range(n):
        timeline.append({
            "t": sun_rows[i]["t"],
            "sun_az": round(float(sun_az[i]), 3),
            "sun_el": round(float(sun_el[i]), 3),
            "sun_visible": bool(sun_clearance[i] > 0),
            "sun_disk_pct": round(float(sun_disk[i]) * 100, 1),
            "earth_az": round(float(earth_az[i]), 3),
            "earth_el": round(float(earth_el[i]), 3),
            "earth_visible": bool(earth_clearance[i] > earth_mask_deg),
        })
    return timeline
