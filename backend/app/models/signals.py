"""
app/models/signals.py
──────────────────────
SQLModel ORM model for the 'signals' table.
Captures all incoming data from GPS, Weather, and Traffic APIs.
"""

import uuid
from datetime import datetime
from typing import Optional, Dict, Any
from sqlmodel import SQLModel, Field, Column, JSON


class Signal(SQLModel, table=True):
    """
    Table 1: All incoming raw signals (with credibility score)
    """
    __tablename__ = "signals"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
        nullable=False
    )
    source: str = Field(description="'user_gps', 'weather_api', 'traffic_api', 'social_mock'")
    lat: float
    lng: float
    location: Optional[str] = Field(default=None, description="Reverse-geocoded area name")
    
    # Store the raw incoming JSON for audit/debug
    raw_payload: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        sa_column=Column(JSON)
    )
    
    credibility_score: Optional[float] = Field(default=None, description="0.0 to 1.0 assigned by Signal Agent")
    conflict_flag: bool = Field(default=False)
    
    # Normalized JSON output from Signal Agent
    structured_json: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        sa_column=Column(JSON)
    )
    
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False
    )
