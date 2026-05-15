"""
app/models/schemas.py
──────────────────────
Pydantic V2 schemas for API requests and responses.
"""

from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class SignalCreate(BaseModel):
    """Payload for POST /api/v1/signals"""
    source: str = Field(..., example="user_gps")
    lat: float = Field(..., example=33.6844)
    lng: float = Field(..., example=73.0479)
    type: str = Field(..., example="flood")
    raw_payload: Optional[Dict[str, Any]] = None


class SignalRead(BaseModel):
    """Response schema for signal data"""
    id: Any
    source: str
    lat: float
    lng: float
    location: Optional[str] = None
    credibility_score: Optional[float] = None
    created_at: Any

    class Config:
        from_attributes = True
