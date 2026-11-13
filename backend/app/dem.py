"""Loads the LOLA elevation maps (DEM) and reads heights from them."""
import numpy as np
import rasterio

from .config import DEM_DIR, DEM_FILES
from .geo import lonlat_to_xy


class Dem:
    """One elevation map held in memory."""

    def __init__(self, path):
        with rasterio.open(path) as ds:
            self.name = path.name
            self.data = ds.read(1).astype(np.float32)
            if ds.nodata is not None:
                self.data[self.data == ds.nodata] = np.nan
            self.inverse = ~ds.transform          # map x,y -> pixel col,row
            self.pixel_m = abs(ds.transform.a)
            self.height, self.width = self.data.shape

    def sample_xy(self, x, y):
        """Heights (m) at map coordinates, bilinear. NaN outside the map."""
        col, row = self.inverse * (np.asarray(x, dtype=float), np.asarray(y, dtype=float))
        col = col - 0.5                           # pixel centre convention
        row = row - 0.5
        c0 = np.floor(col).astype(int)
        r0 = np.floor(row).astype(int)
        ok = (c0 >= 0) & (r0 >= 0) & (c0 < self.width - 1) & (r0 < self.height - 1)
        c0s = np.where(ok, c0, 0)
        r0s = np.where(ok, r0, 0)
        fc = col - c0
        fr = row - r0
        d = self.data
        top = d[r0s, c0s] * (1 - fc) + d[r0s, c0s + 1] * fc
        bottom = d[r0s + 1, c0s] * (1 - fc) + d[r0s + 1, c0s + 1] * fc
        return np.where(ok, top * (1 - fr) + bottom * fr, np.nan)


class DemStack:
    """Several DEMs: uses the finest one that covers each point."""

    def __init__(self, dems: list[Dem]):
        self.dems = dems

    @property
    def available(self) -> bool:
        return len(self.dems) > 0

    @property
    def finest_pixel_m(self) -> float:
        return min(d.pixel_m for d in self.dems)

    def sample_lonlat(self, lon_deg, lat_deg):
        x, y = lonlat_to_xy(lon_deg, lat_deg)
        heights = np.full(np.shape(x), np.nan)
        for dem in self.dems:
            missing = np.isnan(heights)
            if not missing.any():
                break
            heights = np.where(missing, dem.sample_xy(x, y), heights)
        return heights


_stack: DemStack | None = None


def get_dem_stack() -> DemStack:
    """Loads the DEM files once and keeps them in memory."""
    global _stack
    if _stack is None:
        dems = []
        for filename in DEM_FILES:
            path = DEM_DIR / filename
            if path.exists():
                print(f"[dem] loading {filename} ...")
                dems.append(Dem(path))
        if not dems:
            print("[dem] no DEM files found -> flat horizon will be used")
        _stack = DemStack(dems)
    return _stack
