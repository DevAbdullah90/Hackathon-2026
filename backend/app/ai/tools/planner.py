"""
app/ai/tools/planner.py
-----------------------
Tool for the Planning Agent to create response actions.
"""

import uuid
from typing import Dict, Any, Optional
from agents import function_tool

from app.db.session import async_session_factory
from app.models.actions import Action

@function_tool
async def create_action(incident_id: str, action_type: str, predicted_side_effects: str = "") -> Dict[str, Any]:
    """
    Create a planned response action for an incident.
    
    Args:
        incident_id: The UUID of the incident.
        action_type: The type of action ('ALERT_CITIZENS', 'REROUTE_TRAFFIC', 'DISPATCH_DRAINAGE', 'DISPATCH_RESCUE').
        predicted_side_effects: Optional prediction of side effects.
    """
    try:
        inc_uuid = uuid.UUID(incident_id)
        
        async with async_session_factory() as session:
            action = Action(
                incident_id=inc_uuid,
                type=action_type,
                status="PENDING",
                predicted_side_effects=predicted_side_effects,
                action_metadata={}
            )
            session.add(action)
            await session.commit()
            await session.refresh(action)
            
            return {
                "status": "success",
                "message": f"Created action: {action_type}",
                "action_id": str(action.id)
            }
    except Exception as e:
        return {"status": "error", "message": f"Failed to create action: {str(e)}"}
