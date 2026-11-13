"""Moon geometry helpers: map projection and great-circle steps."""
import numpy as np
from pyproj import Proj

from .config import MOON_RADIUS_M

# South polar stereographic on the Moon sphere (same as the LOLA polar DEMs).
_SOUTH_POLE = Proj(
    f"+proj=stere +lat_0=-90 +lon_0=0 +k=1 +x_0=0 +y_0=0 +R={MOON_RADIUS_M} +units=m"
)


def lonlat_to_xy(lon_deg, lat_deg):
    """Longitude/latitude (degrees) -> map x, y (metres)."""
    return _SOUTH_POLE(lon_deg, lat_deg)


def xy_to_lonlat(x, y):
    """Map x, y (metres) -> longitude, latitude (degrees)."""
    return _SOUTH_POLE(x, y, inverse=True)


def destination(lat_deg, lon_deg, azimuth_deg, distance_m):
    """Walk `distance_m` from a point in direction `azimuth_deg`
    (clockwise from north). Works with numpy arrays. Returns lat, lon in degrees."""
    lat1 = np.radians(lat_deg)
    lon1 = np.radians(lon_deg)
    az = np.radians(azimuth_deg)
    ang = np.asarray(distance_m) / MOON_RADIUS_M

    sin_lat2 = np.sin(lat1) * np.cos(ang) + np.cos(lat1) * np.sin(ang) * np.cos(az)
    lat2 = np.arcsin(np.clip(sin_lat2, -1.0, 1.0))
    lon2 = lon1 + np.arctan2(
        np.sin(az) * np.sin(ang) * np.cos(lat1),
        np.cos(ang) - np.sin(lat1) * sin_lat2,
    )
    return np.degrees(lat2), np.degrees(lon2)


def east_longitude_360(lon_deg: float) -> float:
    """-180..180 -> 0..360 (what JPL Horizons expects)."""
    return lon_deg % 360.0
