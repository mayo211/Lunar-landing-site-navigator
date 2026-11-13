"""Step 1 test: can we get Sun and Earth positions from NASA?
Run from the backend folder:  python -m scripts.test_horizons"""
from datetime import date

from app.ephemeris import fetch_az_el

LAT, LON = -86.0150, 3.3820          # MMA02, Malapert Massif

for body in ("sun", "earth"):
    rows = fetch_az_el(body, LAT, LON, 0.0, date(2026, 11, 14), date(2026, 11, 15), 60)
    print(f"\n{body.upper()}: {len(rows)} rows")
    for row in rows[:5]:
        print(f"  {row['t']}  az={row['az']:8.3f}  el={row['el']:7.3f}")

print("\nExpected at the south pole: Sun elevation within a few degrees of 0,")
print("Earth elevation small (a few degrees above or below 0).")
