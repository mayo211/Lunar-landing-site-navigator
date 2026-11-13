"""Tiny JSON file cache, so the demo does not wait for NASA or redo heavy maths."""
import hashlib
import json

from .config import CACHE_DIR


def _path(kind: str, key: str):
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    digest = hashlib.sha1(key.encode()).hexdigest()[:16]
    return CACHE_DIR / f"{kind}_{digest}.json"


def load(kind: str, key: str):
    path = _path(kind, key)
    if path.exists():
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    return None


def save(kind: str, key: str, value) -> None:
    with open(_path(kind, key), "w", encoding="utf-8") as f:
        json.dump(value, f)
