"""Shapes of the JSON that the API receives (the API contract)."""
from datetime import date
from typing import Optional

from pydantic import BaseModel, Field


class SiteIn(BaseModel):
    id: Optional[str] = None
    name: str = "Custom site"
    lat: float = Field(ge=-90, le=90)
    lon: float = Field(ge=-180, le=360)


class VisibilityRequest(BaseModel):
    sites: list[SiteIn] = Field(min_length=1)
    start: date
    end: date
    step_minutes: int = Field(default=60, ge=5, le=1440)
    earth_mask_deg: float = Field(default=2.0, ge=0, le=20)
