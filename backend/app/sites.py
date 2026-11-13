"""Curated landing sites (read from data/sites.json)."""
import json

from .config import SITES_FILE


def load_sites() -> list[dict]:
    with open(SITES_FILE, encoding="utf-8") as f:
        return json.load(f)


def find_site(site_id: str) -> dict | None:
    for site in load_sites():
        if site["id"] == site_id:
            return site
    return None
