"""
app/models/incidents.py
-----------------------
SQLModel ORM model for the incidents table.
"""

import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from sqlmodel import Column, Field, JSON, SQLModel


class Incident(SQLModel, table=True):
    __tablename__ = "incidents"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
        nullable=False,
    )
    location: str = Field(description="Human-readable area name, e.g. G-10 Sector")
    lat: float
    lng: float
    severity_score: float = Field(description="Scored 1-10 by the Severity Agent")
    confidence: float = Field(description="Confidence score from the Detection Agent")
    affected_radius_km: float = Field(
        default=0.0,
        description="Predicted by the Severity Agent",
    )
    estimated_population: int = Field(
        default=0,
        description="Predicted by the Severity Agent",
    )
    peak_impact_eta: Optional[str] = Field(default=None, description="e.g. '45 mins'")
    status: str = Field(
        default="monitoring",
        description="'monitoring' | 'confirmed' | 'resolved' | 'retracted'",
    )
    risk_factors: Optional[List[str]] = Field(
        default=None,
        sa_column=Column(JSON),
    )
    confirmations_count: int = Field(
        default=0,
        description="Crowdsourced confirmations count",
    )
    refutations_count: int = Field(
        default=0,
        description="Crowdsourced refutations count",
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        index=True,
        nullable=False,
    )
