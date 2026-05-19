"""
app/models/vehicle_locations.py
-------------------------------
SQLModel ORM model for the vehicle_locations table.
"""

import uuid
from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel


class VehicleLocation(SQLModel, table=True):
    __tablename__ = "vehicle_locations"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
        nullable=False
    )
    vehicle_id: str = Field(description="e.g. 'Rescue Boat 04'")
    vehicle_type: str = Field(description="'rescue_boat' | 'ambulance' | 'utility_crew'")
    incident_id: uuid.UUID = Field(foreign_key="incidents.id", index=True, nullable=False)
    
    start_lat: float
    start_lng: float
    target_lat: float
    target_lng: float
    current_lat: float
    current_lng: float
    
    dispatch_time: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    duration_seconds: float = Field(default=60.0, description="Total duration of simulated travel")
    status: str = Field(default="en_route", description="'en_route' | 'arrived'")
