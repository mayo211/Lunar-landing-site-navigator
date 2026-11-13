"""Where are the Sun and Earth in the sky of a lunar site?
Asks NASA JPL Horizons and returns azimuth/elevation for each time step."""
from datetime import date, datetime

import requests

from . import cache
from .config import BODY_IDS, HORIZONS_TIMEOUT_S, HORIZONS_URL
from .geo import east_longitude_360


class EphemerisError(RuntimeError):
    pass


def _to_float(text: str):
    try:
        return float(text)
    except ValueError:
        return None


def parse_horizons_table(result_text: str) -> list[dict]:
    """Reads the rows between $$SOE and $$EOE (CSV format).
    Each row: date, optional flag columns, azimuth, elevation."""
    if "$$SOE" not in result_text or "$$EOE" not in result_text:
        raise EphemerisError("Horizons returned no table:\n" + result_text[-1500:])
    table = result_text.split("$$SOE")[1].split("$$EOE")[0]

    rows = []
    for line in table.strip().splitlines():
        parts = [p.strip() for p in line.split(",")]
        numbers = [n for n in (_to_float(p) for p in parts[1:]) if n is not None]
        if len(numbers) < 2:
            continue
        stamp = datetime.strptime(parts[0][:17].strip(), "%Y-%b-%d %H:%M")
        rows.append({"t": stamp.strftime("%Y-%m-%dT%H:%MZ"),
                     "az": numbers[0], "el": numbers[1]})
    if not rows:
        raise EphemerisError("Could not read any rows from Horizons:\n" + table[:500])
    return rows


def fetch_az_el(body: str, lat: float, lon: float, height_km: float,
                start: date, end: date, step_minutes: int) -> list[dict]:
    """body = "sun" or "earth". Returns [{"t", "az", "el"}, ...]. Cached on disk."""
    key = f"{body}|{lat:.5f}|{lon:.5f}|{height_km:.3f}|{start}|{end}|{step_minutes}"
    cached = cache.load("ephem", key)
    if cached is not None:
        return cached

    params = {
        "format": "json",
        "COMMAND": f"'{BODY_IDS[body]}'",
        "OBJ_DATA": "'NO'",
        "MAKE_EPHEM": "'YES'",
        "EPHEM_TYPE": "'OBSERVER'",
        "CENTER": "'coord@301'",                       # a point on the Moon
        "COORD_TYPE": "'GEODETIC'",
        "SITE_COORD": f"'{east_longitude_360(lon):.5f},{lat:.5f},{height_km:.3f}'",
        "START_TIME": f"'{start.isoformat()}'",
        "STOP_TIME": f"'{end.isoformat()}'",
        "STEP_SIZE": f"'{step_minutes} m'",            # m = minutes
        "QUANTITIES": "'4'",                           # 4 = azimuth & elevation
        "ANG_FORMAT": "'DEG'",
        "CSV_FORMAT": "'YES'",
    }
    try:
        response = requests.get(HORIZONS_URL, params=params, timeout=HORIZONS_TIMEOUT_S)
        response.raise_for_status()
        payload = response.json()
    except (requests.RequestException, ValueError) as exc:
        raise EphemerisError(f"Could not reach JPL Horizons: {exc}") from exc

    if "result" not in payload:
        raise EphemerisError(f"Horizons error: {payload}")
    rows = parse_horizons_table(payload["result"])
    cache.save("ephem", key, rows)
    return rows
