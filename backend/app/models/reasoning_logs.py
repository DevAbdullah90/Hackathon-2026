"""
app/models/reasoning_logs.py
----------------------------
SQLModel ORM model for the reasoning_logs table.
"""

import uuid
from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class ReasoningLog(SQLModel, table=True):
    __tablename__ = "reasoning_logs"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
        nullable=False,
    )
    incident_id: Optional[uuid.UUID] = Field(
        default=None,
        index=True,
        description="FK to incidents.id; null until an incident is confirmed",
    )
    agent_name: str = Field(description="Originating agent name")
    phase: Optional[str] = Field(
        default=None,
        description="OBSERVE | REASON | DECIDE | ACT | EVALUATE",
    )
    log_text: str = Field(description="Markdown log entry from the Logging Agent")
    log_level: str = Field(
        default="INFO",
        description="'INFO' | 'WARNING' | 'CRITICAL'",
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
    )


class ChainOfThought(SQLModel, table=True):
    __tablename__ = "chain_of_thought_logs"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
        nullable=False,
    )
    incident_id: Optional[uuid.UUID] = Field(
        default=None,
        index=True,
        description="FK to incidents.id; null until an incident is confirmed",
    )
    agent_name: str = Field(description="Originating agent name")
    cot_steps: str = Field(description="JSON or raw text storing CoT reasoning chain steps")
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
    )

