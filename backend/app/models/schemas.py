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


class CustomSignalPayload(BaseModel):
    """Payload for POST /api/v1/signals/inject"""
    city: str = Field(..., example="Karachi")
    source: str = Field(..., example="user_gps")
    type: str = Field(default="flood", example="flood")
    comment: str = Field(..., example="Severe flooding on University Road.")
    lat: Optional[float] = None
    lng: Optional[float] = None



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
    """Response schema for confirmed incidents"""
    id: uuid.UUID
    location: str
    disaster_type: str = "flood"
    lat: float
    lng: float
    severity_score: Optional[float] = None
    confidence: Optional[float] = None
    affected_radius_km: Optional[float] = None
    estimated_population: Optional[int] = None
    peak_impact_eta: Optional[str] = None
    status: str
    risk_factors: Optional[List[str]] = None
    confirmations_count: Optional[int] = None
    refutations_count: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class VerificationRequest(BaseModel):
    """Request schema for POST /api/v1/incidents/{incident_id}/verify"""
    vote: str = Field(..., description="'confirm' | 'refute'", example="confirm")


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


# ── Chain of Thought Logs ──────────────────────────────────────────────────────

class ChainOfThoughtCreate(BaseModel):
    """Payload to save Chain of Thought reasoning"""
    incident_id: Optional[uuid.UUID] = None
    agent_name: str
    cot_steps: str


class ChainOfThoughtRead(BaseModel):
    """Response schema for Chain of Thought reasoning traces"""
    id: uuid.UUID
    incident_id: Optional[uuid.UUID] = None
    agent_name: str
    cot_steps: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Actions ───────────────────────────────────────────────────────────────────

class ActionRead(BaseModel):
    id: uuid.UUID
    incident_id: uuid.UUID
    type: str
    status: str
    predicted_side_effects: Optional[str] = None
    action_metadata: Optional[Dict[str, Any]] = None
    updated_at: datetime

    model_config = {"from_attributes": True}


# -- Notifications ------------------------------------------------------------

class NotificationRead(BaseModel):
    id: uuid.UUID
    incident_id: uuid.UUID
    stakeholder: str
    message: str
    sent_at: datetime

    model_config = {"from_attributes": True}



# ── Resources ─────────────────────────────────────────────────────────────────

class ResourceRead(BaseModel):
    id: uuid.UUID
    type: str
    total_count: int
    available_count: int
    assigned_to_incident: Optional[uuid.UUID] = None
    location: Optional[str] = None
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── Safe Havens ───────────────────────────────────────────────────────────────

class SafeHavenRead(BaseModel):
    id: uuid.UUID
    name: str
    lat: float
    lng: float
    capacity: int
    current_occupancy: int
    created_at: datetime

    model_config = {"from_attributes": True}


class RouteCoordinate(BaseModel):
    lat: float
    lng: float


class SafeHavenRouteResponse(BaseModel):
    safe_haven: SafeHavenRead
    path: List[RouteCoordinate]
    distance_km: float
    avoided_flooded_zones_count: int



