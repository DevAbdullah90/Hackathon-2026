import uuid
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class ReasoningLog(SQLModel, table=True):
    """
    Table 6: Agent reasoning logs
    """
    __tablename__ = "reasoning_logs"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
        nullable=False
    )
    incident_id: uuid.UUID = Field(
        foreign_key="incidents.id",
        index=True,
        nullable=False
    )
    
    agent_name: str = Field(index=True)
    phase: Optional[str] = Field(default=None, description="OBSERVE, REASON, DECIDE, ACT, EVALUATE")
    log_text: str
    
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        index=True,
        nullable=False
    )
