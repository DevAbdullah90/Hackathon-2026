"""
app/ai/tools/resource_manager.py
--------------------------------
Tool for the Resource Allocation Agent to allocate emergency resources.
"""

import uuid
from typing import Dict, Any
from agents import function_tool

from app.db.session import async_session_factory
from app.models.resources import Resource

@function_tool
async def allocate_resource(incident_id: str, resource_type: str, count: int) -> Dict[str, Any]:
    """
    Allocate a specific number of emergency resources to an incident.
    
    Args:
        incident_id: The UUID of the incident.
        resource_type: The type of resource ('rescue_team', 'ambulance', 'drainage_crew', 'police_unit').
        count: The number of units to allocate.
    """
    try:
        inc_uuid = uuid.UUID(incident_id)
        
        async with async_session_factory() as session:
            # We insert a new Resource row to represent this allocation
            resource = Resource(
                type=resource_type,
                total_count=count,
                available_count=0, # Fully allocated to this incident
                assigned_to_incident=inc_uuid,
                location="En Route"
            )
            session.add(resource)
            await session.commit()
            await session.refresh(resource)
            
            return {
                "status": "success",
                "message": f"Allocated {count} {resource_type}(s)",
                "resource_id": str(resource.id)
            }
    except Exception as e:
        return {"status": "error", "message": f"Failed to allocate resource: {str(e)}"}
