import uuid
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_session
from app.models.actions import Action
from app.simulation.engine import run_simulation_loop

router = APIRouter()

@router.post("/trigger/{incident_id}", response_model=Dict[str, Any])
async def trigger_simulation(
    incident_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session)
):
    """
    Trigger the lifecycle simulation for all actions associated with an incident.
    This simulates real-world execution by advancing action states over time.
    """
    # Verify the incident has pending actions
    query = select(Action).where(Action.incident_id == incident_id)
    result = await session.execute(query)
    actions = result.scalars().all()
    
    if not actions:
        raise HTTPException(status_code=404, detail="No actions found for this incident.")
        
    # Start the simulation loop in the background
    background_tasks.add_task(run_simulation_loop, incident_id=incident_id)
    
    return {
        "status": "success",
        "message": f"Simulation triggered for incident {incident_id}",
        "action_count": len(actions)
    }

@router.get("/state/{incident_id}", response_model=List[Dict[str, Any]])
async def get_simulation_state(
    incident_id: uuid.UUID,
    session: AsyncSession = Depends(get_session)
):
    """
    Get the current status of all actions for a specific incident.
    """
    query = select(Action).where(Action.incident_id == incident_id)
    result = await session.execute(query)
    actions = result.scalars().all()
    
    return [
        {
            "id": str(action.id),
            "type": action.type,
            "status": action.status,
            "predicted_side_effects": action.predicted_side_effects,
            "updated_at": action.updated_at.isoformat()
        }
        for action in actions
    ]
