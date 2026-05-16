"""
app/models/incidents.py
────────────────────────
SQLModel ORM model for the 'incidents' table.
Stores every confirmed flood cluster assembled from correlated signals.
Populated by the Detection Agent; severity enriched by Severity Agent.
"""

import uuid
from datetime import datetime
from typing import Optional, Dict, Any
from sqlmodel import SQLModel, Field, Column, JSON


class Incident(SQLModel, table=True):
    """
    Table 2: Confirmed flood incidents (clustered from correlated signals).

    lifecycle: monitoring → confirmed → resolved | retracted
    """
    __tablename__ = "incidents"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
        nullable=False
    )

    # ── Location ──────────────────────────────────────────────────────────────
    location: str = Field(
        description="Reverse-geocoded human-readable area, e.g. 'G-10 Sector, Islamabad'"
    )
    lat: float = Field(description="Centroid latitude of the incident cluster")
    lng: float = Field(description="Centroid longitude of the incident cluster")

    # ── Agent-populated scores ─────────────────────────────────────────────────
    severity_score: Optional[float] = Field(
        default=None,
        description="0.0–10.0 assigned by Severity Agent"
    )
    confidence: Optional[float] = Field(
        default=None,
        description="0.0–1.0 detection confidence from Detection Agent"
    )
    affected_radius_km: Optional[float] = Field(
        default=None,
        description="Estimated flood spread radius in kilometres"
    )

    # ── Backend-computed fields (NOT set by agents) ────────────────────────────
    estimated_population: Optional[int] = Field(
        default=None,
        description="Population within affected_radius_km — computed by backend, not agent"
    )
    peak_impact_eta: Optional[str] = Field(
        default=None,
        description="Estimated time to peak impact, e.g. '45 mins'"
    )

    # ── Status lifecycle ───────────────────────────────────────────────────────
    status: str = Field(
        default="monitoring",
        description="'monitoring' | 'confirmed' | 'resolved' | 'retracted'"
    )

    # ── Structured JSON from Severity Agent ───────────────────────────────────
    risk_factors: Optional[Dict[str, Any]] = Field(
        default=None,
        sa_column=Column(JSON)
    )

    # ── Timestamps ────────────────────────────────────────────────────────────
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False
    )
