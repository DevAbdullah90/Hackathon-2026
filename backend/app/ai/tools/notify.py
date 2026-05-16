import uuid
from typing import Dict, Any
from agents import function_tool
from app.tools.notify import send_notification as real_send_notification

@function_tool
async def send_notification(stakeholder: str, message: str, incident_id: str) -> Dict[str, Any]:
    """
    Sends a tailored notification message to a specific stakeholder.

    Use this when you need to alert a stakeholder about a confirmed flood incident.
    You must generate a specific message for each stakeholder as per your instructions.

    Args:
        stakeholder: One of 'public', 'hospital', 'utility', 'traffic_auth', 'emergency_services', 'command_center'.
        message: The tailored text for that stakeholder.
        incident_id: The UUID of the flood incident.
    """
    try:
        inc_uuid = uuid.UUID(incident_id)
        return await real_send_notification(
            stakeholder=stakeholder,
            message=message,
            incident_id=inc_uuid
        )
    except Exception as e:
        return {"status": "error", "message": f"Tool error: {str(e)}"}
