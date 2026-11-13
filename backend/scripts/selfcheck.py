"""Checks the maths without internet and without the real DEM.
Run from the backend folder:  python -m scripts.selfcheck"""
import math
import tempfile
from pathlib import Path

import numpy as np
import rasterio
from rasterio.transform import from_origin

from app.config import MOON_RADIUS_M, OBSERVER_HEIGHT_M
from app.dem import Dem, DemStack
from app.ephemeris import parse_horizons_table
from app.geo import destination, lonlat_to_xy, xy_to_lonlat
from app.horizon import compute_horizon, horizon_at
from app.metrics import compute_metrics
from app.visibility import build_timeline

LAT, LON = -86.0, 3.382
PIXEL = 100.0
HALF = 150_000.0          # synthetic map: 300 km x 300 km around the south pole


def make_dem(folder: Path, name: str, ridge: bool) -> Dem:
    n = int(2 * HALF / PIXEL)
    data = np.zeros((n, n), dtype=np.float32)
    if ridge:             # 3 km high plateau, 2 km radius, 20 km north of the site
        rlat, rlon = destination(LAT, LON, 0.0, 20_000.0)
        rx, ry = lonlat_to_xy(rlon, rlat)
        xs = -HALF + (np.arange(n) + 0.5) * PIXEL
        ys = HALF - (np.arange(n) + 0.5) * PIXEL
        gx, gy = np.meshgrid(xs, ys)
        data[(gx - rx) ** 2 + (gy - ry) ** 2 < 2000.0 ** 2] = 3000.0
    path = folder / name
    with rasterio.open(path, "w", driver="GTiff", height=n, width=n, count=1,
                       dtype="float32", transform=from_origin(-HALF, HALF, PIXEL, PIXEL)) as ds:
        ds.write(data, 1)
    return Dem(path)


def main():
    # 1. projection round trip
    x, y = lonlat_to_xy(LON, LAT)
    lon, lat = xy_to_lonlat(x, y)
    assert abs(lon - LON) < 1e-6 and abs(lat - LAT) < 1e-6
    print("1. projection round trip           OK")

    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)

        # 2. perfectly smooth Moon -> horizon slightly below 0 (dip of a 2 m mast)
        flat = compute_horizon(LAT, LON, DemStack([make_dem(tmp, "flat.tif", False)]))
        dip = -math.degrees(math.sqrt(2 * OBSERVER_HEIGHT_M / MOON_RADIUS_M))
        assert flat["source"] == "dem"
        assert all(abs(e - dip) < 0.02 for e in flat["el"]), (min(flat["el"]), dip)
        print(f"2. smooth sphere horizon {dip:.3f} deg   OK")

        # 3. plateau to the north -> known angle at azimuth 0, nothing to the south
        hor = compute_horizon(LAT, LON, DemStack([make_dem(tmp, "ridge.tif", True)]))
        theta = 18_000.0 / MOON_RADIUS_M
        r = MOON_RADIUS_M + 3000.0
        expected = math.degrees(math.atan2(
            r * math.cos(theta) - (MOON_RADIUS_M + OBSERVER_HEIGHT_M), r * math.sin(theta)))
        got = float(horizon_at(hor, 0.0))
        assert abs(got - expected) < 0.15, (got, expected)
        assert float(horizon_at(hor, 180.0)) < 0.0
        assert float(horizon_at(hor, 90.0)) < 0.0
        print(f"3. plateau north: {got:.2f} deg (expected {expected:.2f})  OK")

    # 4. Horizons text parser (simulated response)
    text = ("header\n$$SOE\n"
            " 2026-Nov-14 00:00, , ,  10.5000,   1.2000,\n"
            " 2026-Nov-14 01:00,*,m, 11.0000,  -0.3000,\n"
            "$$EOE\nfooter")
    rows = parse_horizons_table(text)
    assert rows == [{"t": "2026-11-14T00:00Z", "az": 10.5, "el": 1.2},
                    {"t": "2026-11-14T01:00Z", "az": 11.0, "el": -0.3}]
    print("4. Horizons parser                 OK")

    # 5. visibility + metrics on a hand-made case
    horizon = {"az": [0.0, 90.0, 180.0, 270.0], "el": [5.0, 0.0, 0.0, 0.0]}
    sun = [{"t": f"2026-11-14T0{i}:00Z", "az": az, "el": 1.0}
           for i, az in enumerate([0.0, 0.0, 90.0, 90.0])]      # behind the hill twice
    earth = [{"t": s["t"], "az": 180.0, "el": el}
             for s, el in zip(sun, [3.0, 3.0, 1.0, 3.0])]
    timeline = build_timeline(sun, earth, horizon, earth_mask_deg=2.0)
    assert [r["sun_visible"] for r in timeline] == [False, False, True, True]
    assert [r["earth_visible"] for r in timeline] == [True, True, False, True]
    m = compute_metrics(timeline, 60)
    assert m["sunlight_pct"] == 50.0 and m["comm_hours"] == 3.0
    assert m["next_sun_change"] == {"event": "rise", "t": "2026-11-14T02:00Z"}
    assert m["next_earth_change"] == {"event": "set", "t": "2026-11-14T02:00Z"}
    assert m["longest_darkness_hours"] == 2.0 and len(m["comm_windows"]) == 2
    print("5. visibility + metrics            OK")
    print("\nAll checks passed.")


if __name__ == "__main__":
    main()
