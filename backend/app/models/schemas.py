"""
app/models/schemas.py
──────────────────────
Pydantic V2 schemas for API requests and responses.
Includes schemas for Signals, Incidents, and Reasoning Logs.
"""

import uuid
from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


# ── Signals ───────────────────────────────────────────────────────────────────

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


# ── Incidents ─────────────────────────────────────────────────────────────────

class IncidentRead(BaseModel):
    """Response schema for confirmed flood incidents"""
    id: uuid.UUID
    location: str
    lat: float
    lng: float
    severity_score: Optional[float] = None
    confidence: Optional[float] = None
    affected_radius_km: Optional[float] = None
    estimated_population: Optional[int] = None
    peak_impact_eta: Optional[str] = None
    status: str
    risk_factors: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Reasoning Logs ────────────────────────────────────────────────────────────

class ReasoningLogRead(BaseModel):
    """Response schema for AI reasoning traces"""
    id: uuid.UUID
    incident_id: Optional[uuid.UUID] = None
    agent_name: str
    log_text: str
    log_level: str
    created_at: datetime

    model_config = {"from_attributes": True}
