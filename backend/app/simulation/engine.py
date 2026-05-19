import asyncio
import uuid
from datetime import datetime, timezone
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
    timestamp = datetime.now(timezone.utc).replace(tzinfo=None).isoformat()
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

        # Fetch incident for target coordinates
        from app.models.incidents import Incident
        incident_query = select(Incident).where(Incident.id == incident_id)
        incident_result = await session.execute(incident_query)
        incident = incident_result.scalar_one_or_none()

        # Auto-seed vehicle locations for dispatch actions
        from app.models.vehicle_locations import VehicleLocation
        
        veh_check_query = select(VehicleLocation).where(VehicleLocation.incident_id == incident_id)
        veh_check_result = await session.execute(veh_check_query)
        existing_vehicles = list(veh_check_result.scalars().all())
        
        if not existing_vehicles and incident:
            stations = [
                {"lat": incident.lat + 0.015, "lng": incident.lng + 0.015},
                {"lat": incident.lat - 0.015, "lng": incident.lng + 0.010},
                {"lat": incident.lat + 0.010, "lng": incident.lng - 0.015},
            ]
            
            dispatch_actions = [act for act in db_actions if any(kw in act.type.upper() for kw in ["DISPATCH", "DEPLOY", "RESCUE", "AMBULANCE", "CREW"])]
            
            for idx, act in enumerate(dispatch_actions):
                station = stations[idx % len(stations)]
                
                v_type = "utility_crew"
                v_id = f"Utility Crew {idx + 1:02d}"
                
                if "RESCUE" in act.type.upper() or "BOAT" in act.type.upper():
                    v_type = "rescue_boat"
                    v_id = f"Rescue Boat {idx + 1:02d}"
                elif "AMBULANCE" in act.type.upper() or "MEDICAL" in act.type.upper():
                    v_type = "ambulance"
                    v_id = f"Ambulance {idx + 1:02d}"
                elif "DRAINAGE" in act.type.upper() or "PUMP" in act.type.upper():
                    v_type = "utility_crew"
                    v_id = f"Drainage Crew {idx + 1:02d}"
                    
                v_loc = VehicleLocation(
                    vehicle_id=v_id,
                    vehicle_type=v_type,
                    incident_id=incident_id,
                    start_lat=station["lat"],
                    start_lng=station["lng"],
                    target_lat=incident.lat,
                    target_lng=incident.lng,
                    current_lat=station["lat"],
                    current_lng=station["lng"],
                    dispatch_time=datetime.now(timezone.utc).replace(tzinfo=None),
                    duration_seconds=60.0,
                    status="en_route"
                )
                session.add(v_loc)
            await session.commit()

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
            
            # If the next state is ON_SITE or COMPLETED, mark the incident's vehicles as arrived
            if next_state in ["ON_SITE", "COMPLETED"]:
                veh_query = select(VehicleLocation).where(VehicleLocation.incident_id == incident_id)
                veh_result = await session.execute(veh_query)
                vehicles = list(veh_result.scalars().all())
                for v in vehicles:
                    v.current_lat = v.target_lat
                    v.current_lng = v.target_lng
                    v.status = "arrived"
                    session.add(v)
            
            await session.commit()
            
            # Trigger the broadcast hook
            await broadcast_status_update(incident_id, next_state, ids_to_broadcast)
            
            # Move to next state in the loop
            current_state = next_state

    print(f"INFO: [SIM] Lifecycle simulation for incident {incident_id} has reached COMPLETED state.")
