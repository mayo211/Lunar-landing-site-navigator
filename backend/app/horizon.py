"""Horizon profile: the highest terrain angle in every direction around a site.
This is ray casting over the elevation map, with the Moon's curvature included."""
import numpy as np

from .config import (HORIZON_AZ_STEP_DEG, HORIZON_MAX_RANGE_KM, MOON_RADIUS_M,
                     OBSERVER_HEIGHT_M)
from .dem import DemStack
from .geo import destination


def _distances(pixel_m: float) -> np.ndarray:
    """Sample distances along each ray: dense near the site, sparser far away."""
    near = np.arange(pixel_m, 5000.0, pixel_m)
    far = [5000.0]
    while far[-1] < HORIZON_MAX_RANGE_KM * 1000.0:
        far.append(far[-1] * 1.01)
    return np.concatenate([near, np.array(far)])


def flat_horizon() -> dict:
    az = np.arange(0.0, 360.0, HORIZON_AZ_STEP_DEG)
    return {"az": az.tolist(), "el": [0.0] * len(az), "site_height_m": None,
            "source": "flat_horizon"}


def compute_horizon(lat_deg: float, lon_deg: float, dems: DemStack) -> dict:
    """Returns {"az": [...], "el": [...], "site_height_m": h, "source": "dem"}.
    Falls back to a flat horizon if the site is outside the DEM."""
    if not dems.available:
        return flat_horizon()

    ground = float(dems.sample_lonlat(lon_deg, lat_deg))
    if np.isnan(ground):
        return flat_horizon()
    eye = MOON_RADIUS_M + ground + OBSERVER_HEIGHT_M

    az = np.arange(0.0, 360.0, HORIZON_AZ_STEP_DEG)
    dist = _distances(dems.finest_pixel_m)
    az_grid, dist_grid = np.meshgrid(az, dist, indexing="ij")     # (n_az, n_dist)

    lat, lon = destination(lat_deg, lon_deg, az_grid, dist_grid)
    height = dems.sample_lonlat(lon, lat)

    # Exact geometry on a sphere: angle of each terrain point above the
    # observer's local horizontal plane.
    angle_at_centre = dist_grid / MOON_RADIUS_M
    radius = MOON_RADIUS_M + height
    up = radius * np.cos(angle_at_centre) - eye
    along = radius * np.sin(angle_at_centre)
    elevation = np.degrees(np.arctan2(up, along))

    elevation = np.where(np.isnan(elevation), -90.0, elevation)   # no data = no block
    el = elevation.max(axis=1)
    el = np.where(el <= -89.0, 0.0, el)

    return {"az": az.tolist(), "el": np.round(el, 4).tolist(),
            "site_height_m": round(ground, 1), "source": "dem"}


def horizon_at(horizon: dict, azimuth_deg) -> np.ndarray:
    """Horizon elevation at any azimuth (interpolated, wraps at 360)."""
    az = np.asarray(horizon["az"])
    el = np.asarray(horizon["el"])
    return np.interp(np.asarray(azimuth_deg) % 360.0, az, el, period=360.0)
