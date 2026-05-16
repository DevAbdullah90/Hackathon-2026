"""
app/models/actions.py
---------------------
SQLModel ORM model for the actions table.
"""

import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from sqlmodel import Column, Field, JSON, SQLModel


class Action(SQLModel, table=True):
    __tablename__ = "actions"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
        nullable=False,
    )
    incident_id: uuid.UUID = Field(
        foreign_key="incidents.id",
        index=True,
        nullable=False,
    )
    type: str = Field(
        description="'ALERT_CITIZENS' | 'REROUTE_TRAFFIC' | 'DISPATCH_DRAINAGE'",
    )
    status: str = Field(
        default="PENDING",
        description="'PENDING' | 'SENT' | 'ACTIVE' | 'ON_SITE' | 'COMPLETED'",
    )
    predicted_side_effects: Optional[str] = Field(
        default=None,
        description="Free-text side-effect prediction from the Planning Agent",
    )
    action_metadata: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        sa_column=Column(JSON),
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
    )
