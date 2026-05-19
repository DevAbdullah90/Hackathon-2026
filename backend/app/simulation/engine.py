import asyncio
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy import select
from app.db.session import async_session_factory
from app.models.actions import Action
from app.models.incidents import Incident

# Explicit State Machine Definition
STATES = {
    "PENDING": "SENT",
    "SENT": "ACTIVE",
    "ACTIVE": "ON_SITE",
    "ON_SITE": "COMPLETED",
    "COMPLETED": None  # Final state
}

# Progressive metrics mapping for before vs after impact simulation
METRICS_MAP = {
    "flood": {
        "PENDING": {"congestion_index": 90, "evacuation_rate": 5, "road_blockage": 100},
        "SENT": {"congestion_index": 75, "evacuation_rate": 25, "road_blockage": 80},
        "ACTIVE": {"congestion_index": 50, "evacuation_rate": 60, "road_blockage": 40},
        "ON_SITE": {"congestion_index": 35, "evacuation_rate": 80, "road_blockage": 15},
        "COMPLETED": {"congestion_index": 20, "evacuation_rate": 98, "road_blockage": 0},
    },
    "heatwave": {
        "PENDING": {"cooling_coverage": 0, "safety_rate": 10, "grid_relief": 0},
        "SENT": {"cooling_coverage": 25, "safety_rate": 35, "grid_relief": 20},
        "ACTIVE": {"cooling_coverage": 60, "safety_rate": 65, "grid_relief": 50},
        "ON_SITE": {"cooling_coverage": 85, "safety_rate": 85, "grid_relief": 75},
        "COMPLETED": {"cooling_coverage": 100, "safety_rate": 98, "grid_relief": 95},
    }
}

async def broadcast_status_update(incident_id: uuid.UUID, state: str, action_ids: List[uuid.UUID], disaster_type: str = "flood"):
    """
    Broadcasts real-time action simulation updates to specific incident
    listeners and global listeners via WebSockets.
    """
    from app.api.api_v1.endpoints.websocket import manager
    
    timestamp = datetime.now(timezone.utc).replace(tzinfo=None).isoformat()
    
    # Map progressive metrics based on disaster type and state
    metrics = METRICS_MAP.get(disaster_type, METRICS_MAP["flood"]).get(state, {})
    
    message = {
        "event": "simulation_progress",
        "incident_id": str(incident_id),
        "status": state,
        "disaster_type": disaster_type,
        "action_ids": [str(aid) for aid in action_ids],
        "metrics": metrics,
        "timestamp": timestamp
    }
    
    # Broadcast to incident-specific listeners
    await manager.broadcast(str(incident_id), message)
    # Broadcast to global stream listeners
    await manager.broadcast_global(message)
    print(f"EVENT_BROADCAST: [{timestamp}] Incident {incident_id} -> {state} for actions {action_ids}")

async def run_simulation_loop(incident_id: uuid.UUID, action_ids: Optional[List[uuid.UUID]] = None):
    """
    Refined State Machine: Transitions response actions through their lifecycle.
    If action_ids is provided, only those specific actions are simulated.
    """
    print(f"INFO: [SIM] Starting lifecycle simulation for incident {incident_id}")
    
    async with async_session_factory() as session:
        # Resolve incident's disaster_type
        incident = await session.get(Incident, incident_id)
        disaster_type = incident.disaster_type if incident and incident.disaster_type else "flood"

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
                action.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
                session.add(action)
                ids_to_broadcast.append(action.id)
            
            await session.commit()
            
            # Trigger the broadcast hook
            await broadcast_status_update(incident_id, next_state, ids_to_broadcast, disaster_type)
            
            # Move to next state in the loop
            current_state = next_state

    print(f"INFO: [SIM] Lifecycle simulation for incident {incident_id} has reached COMPLETED state.")
