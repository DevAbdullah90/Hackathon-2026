import uuid
from datetime import datetime
from app.db.session import async_session_factory
from app.models.notifications import Notification

async def send_notification(stakeholder: str, message: str, incident_id: uuid.UUID):
    """
    Saves a stakeholder notification to the database.
    In a real app, this might also trigger SMS, Email, or Push via Firebase.
    """
    async with async_session_factory() as session:
        notification = Notification(
            incident_id=incident_id,
            stakeholder=stakeholder,
            message=message
        )
        session.add(notification)
        await session.commit()
        return {"status": "sent", "id": str(notification.id)}
