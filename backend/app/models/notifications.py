import uuid
from datetime import datetime
from sqlmodel import SQLModel, Field


class Notification(SQLModel, table=True):
    """
    Table 5: Stakeholder notifications
    """
    __tablename__ = "notifications"

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
    
    stakeholder: str = Field(description="'public', 'hospital', 'utility', 'traffic_auth', etc.")
    message: str
    
    sent_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False
    )
