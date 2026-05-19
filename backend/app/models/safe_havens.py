"""
app/models/safe_havens.py
-------------------------
SQLModel ORM model for the safe_havens table.
"""

import uuid
from datetime import datetime
from sqlmodel import Field, SQLModel


class SafeHaven(SQLModel, table=True):
    __tablename__ = "safe_havens"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
        nullable=False
    )
    name: str = Field(index=True)
    lat: float
    lng: float
    capacity: int = Field(default=100)
    current_occupancy: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
