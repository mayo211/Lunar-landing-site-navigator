"""All settings in one place. Change values here, not inside the other files."""
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BACKEND_DIR / "data"
DEM_DIR = DATA_DIR / "dem"
CACHE_DIR = DATA_DIR / "cache"
SITES_FILE = DATA_DIR / "sites.json"

# DEM files, best (finest) first. Missing files are skipped.
# If none exist, the app still runs with a flat horizon.
DEM_FILES = [
    "LDEM_80S_80MPP_ADJ.TIF",   # 80 m/px, covers 80S-90S  (main file)
    "LDEM_60S_240MPP_ADJ.TIF",  # 240 m/px, covers 60S-90S (optional, far terrain)
]

MOON_RADIUS_M = 1_737_400.0     # reference sphere of the LOLA heights
OBSERVER_HEIGHT_M = 2.0         # antenna / solar panel height above ground
HORIZON_MAX_RANGE_KM = 250.0    # how far we look for terrain that blocks the view
HORIZON_AZ_STEP_DEG = 1.0       # 360 directions
SUN_RADIUS_DEG = 0.266          # angular radius of the Sun seen from the Moon

HORIZONS_URL = "https://ssd.jpl.nasa.gov/api/horizons.api"
HORIZONS_TIMEOUT_S = 60
BODY_IDS = {"sun": "10", "earth": "399"}

MAX_TIME_STEPS = 6000           # protects the server from huge requests
MAX_SITES = 4
