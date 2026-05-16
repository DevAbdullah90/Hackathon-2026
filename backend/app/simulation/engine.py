import asyncio
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy import select
from app.db.session import async_session_factory
from app.models.actions import Action

# Explicit State Machine Definition
STATES = {
    "PENDING": "SENT",
    "SENT": "ACTIVE",
    "ACTIVE": "ON_SITE",
    "ON_SITE": "COMPLETED",
    "COMPLETED": None  # Final state
}

async def broadcast_status_update(incident_id: uuid.UUID, state: str, action_ids: List[uuid.UUID]):
    """
    STUB: Placeholder for WebSocket/Event broadcast logic.
    This will eventually push updates to the frontend in real-time.
    """
    timestamp = datetime.utcnow().isoformat()
    print(f"EVENT_BROADCAST: [{timestamp}] Incident {incident_id} -> {state} for actions {action_ids}")

async def run_simulation_loop(incident_id: uuid.UUID, action_ids: Optional[List[uuid.UUID]] = None):
    """
    Refined State Machine: Transitions response actions through their lifecycle.
    If action_ids is provided, only those specific actions are simulated.
    """
    print(f"INFO: [SIM] Starting lifecycle simulation for incident {incident_id}")
    
    async with async_session_factory() as session:
        # 1. Resolve which actions to simulate
        query = select(Action).where(Action.incident_id == incident_id)
        if action_ids:
            query = query.where(Action.id.in_(action_ids))
            
        result = await session.execute(query)
        db_actions = list(result.scalars().all())
        
        if not db_actions:
            print(f"WARN: [SIM] No valid actions found for simulation on incident {incident_id}.")
            return

        # 2. Iterate through transitions
        current_state = "PENDING"
        
        while current_state in STATES and STATES[current_state] is not None:
            # Simulate real-world delay
            await asyncio.sleep(2) 
            
            # Transition to next state
            next_state = STATES[current_state]
            print(f"INFO: [SIM] Transitioning {len(db_actions)} actions to: {next_state}")
            
            ids_to_broadcast = []
            for action in db_actions:
                action.status = next_state
                action.updated_at = datetime.utcnow()
                session.add(action)
                ids_to_broadcast.append(action.id)
            
            await session.commit()
            
            # Trigger the broadcast hook
            await broadcast_status_update(incident_id, next_state, ids_to_broadcast)
            
            # Move to next state in the loop
            current_state = next_state

    print(f"INFO: [SIM] Lifecycle simulation for incident {incident_id} has reached COMPLETED state.")
