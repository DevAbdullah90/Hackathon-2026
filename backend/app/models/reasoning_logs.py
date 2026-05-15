"""
app/models/reasoning_logs.py
──────────────────────────────
SQLModel ORM model for the 'reasoning_logs' table.
Stores the Logging Agent's full Markdown output for each agent step,
displayed verbatim in the CIRO Reasoning Console (frontend).

log_level inference rule (applied by backend — NOT by the agent):
  severity >= 8  OR  verdict == RETRACT  →  CRITICAL
  severity >= 5  OR  confidence < 0.75   →  WARNING
  else                                   →  INFO
"""

import uuid
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class ReasoningLog(SQLModel, table=True):
    """
    Table 3: Reasoning trace entries from every agent step.

    Each row is one Markdown block produced by the Logging Agent,
    attributed to a specific specialist agent by name.
    incident_id is null until the Detection Agent confirms a cluster.
    """
    __tablename__ = "reasoning_logs"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
        nullable=False
    )

    # ── Foreign key (nullable before confirmation) ─────────────────────────────
    incident_id: Optional[uuid.UUID] = Field(
        default=None,
        index=True,
        description="FK to incidents.id — null until Detection Agent confirms a cluster"
    )

    # ── Attribution ────────────────────────────────────────────────────────────
    agent_name: str = Field(
        description="Originating agent, e.g. 'signal_agent', 'detection_agent'"
    )

    # ── Content ───────────────────────────────────────────────────────────────
    log_text: str = Field(
        description="Full Markdown string produced by the Logging Agent for this step"
    )

    # ── Backend-inferred severity level ───────────────────────────────────────
    log_level: str = Field(
        default="INFO",
        description="'INFO' | 'WARNING' | 'CRITICAL' — inferred by backend, not agent"
    )

    # ── Timestamps ────────────────────────────────────────────────────────────
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False
    )
