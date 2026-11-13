"""Downloads NASA data for the demo scenarios in advance, so the demo is instant.
Covers each site for the base month plus the "1 week earlier/later" buttons.
Run from the backend folder:  python -m scripts.warmup"""
from datetime import date, timedelta

from app.service import analyze_site
from app.sites import find_site

SITES = ["MMA02", "MMP02", "SP01", "PCB01", "IM2", "A11"]   # what we show in the demo
START = date(2026, 11, 14)          # same default dates as the app
DAYS = 30
WEEK_SHIFTS = [-7, 0, 7, 14]        # matches the app's week buttons
STEP_MINUTES = 60                   # same default time step as the app

for site_id in SITES:
    site = find_site(site_id)
    for shift in WEEK_SHIFTS:
        start = START + timedelta(days=shift)
        end = start + timedelta(days=DAYS)
        result = analyze_site(site, start, end, STEP_MINUTES, 2.0)
        m = result["metrics"]
        print(f"{site_id:6s} {start} -> {end}   sun {m['sunlight_pct']:5.1f}%   "
              f"earth {m['comm_pct']:5.1f}%   horizon: {result['source']}")

print("\nDone. These scenarios now load instantly in the app (no internet needed).")
