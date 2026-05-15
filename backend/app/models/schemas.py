"""
app/models/schemas.py
──────────────────────
Pydantic V2 schemas for API requests and responses.

Fixes (Uneeza — Phase 2):
  - SignalRead: id typed as uuid.UUID (was Any).
  - SignalRead: created_at typed as datetime (was Any).
  - SignalRead: lat/lng made Optional[float] to match ORM fix.
  - SignalRead: type field added (was missing, now present on ORM model).
"""

import uuid
from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class SignalCreate(BaseModel):
    """Payload for POST /api/v1/signals"""
    source: str = Field(..., example="user_gps")
    lat: Optional[float] = Field(default=None, example=33.6844)
    lng: Optional[float] = Field(default=None, example=73.0479)
    type: str = Field(..., example="flood")
    raw_payload: Optional[Dict[str, Any]] = None


class SignalRead(BaseModel):
    """Response schema for signal data"""
    id: uuid.UUID
    source: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    type: Optional[str] = None
    location: Optional[str] = None
    credibility_score: Optional[float] = None
    created_at: datetime

    model_config = {"from_attributes": True}
