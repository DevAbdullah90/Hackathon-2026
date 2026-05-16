import uuid
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class Resource(SQLModel, table=True):
    """
    Table 3: Constrained resources pool
    """
    __tablename__ = "resources"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
        nullable=False
    )
    type: str = Field(description="'rescue_team', 'ambulance', 'drainage_crew', 'police_unit'")
    total_count: int = Field(default=0)
    available_count: int = Field(default=0)
    
    assigned_to_incident: Optional[uuid.UUID] = Field(
        default=None,
        foreign_key="incidents.id",
        index=True
    )
    
    location: Optional[str] = Field(default=None, description="Current staging area or station")
    
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False
    )
