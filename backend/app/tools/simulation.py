import uuid
from typing import List, Dict, Any, Optional
from fastapi import BackgroundTasks
from app.simulation.engine import run_simulation_loop

async def trigger_simulation(
    incident_id: uuid.UUID, 
    actions: List[Dict[str, Any]], 
    background_tasks: Optional[BackgroundTasks] = None
) -> Dict[str, str]:
    """
    Starts the background simulation loop for a confirmed flood incident.
    """
    if background_tasks:
        background_tasks.add_task(run_simulation_loop, incident_id, actions)
        return {"status": "started", "mode": "background"}
    else:
        # For testing purposes when background_tasks is not available
        import asyncio
        asyncio.create_task(run_simulation_loop(incident_id, actions))
        return {"status": "started", "mode": "asyncio_task"}
