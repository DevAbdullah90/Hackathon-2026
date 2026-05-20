import asyncio
import uuid
from app.db.session import init_db, async_session_factory
from app.models.incidents import Incident
from app.models.actions import Action
from app.simulation.engine import run_simulation_loop

async def main():
    print("Initializing DB tables...")
    await init_db()
    
    incident_id = uuid.uuid4()
    print(f"Creating mock incident {incident_id}...")
    
    async with async_session_factory() as session:
        incident = Incident(
            id=incident_id,
            location="Test Isolated Sector",
            lat=33.6844,
            lng=73.0479,
            severity_score=5.0,
            confidence=0.8,
            affected_radius_km=1.0,
            status="confirmed"
        )
        session.add(incident)
        await session.commit()
        print("Mock incident saved.")
        
    async with async_session_factory() as session:
        action = Action(
            incident_id=incident_id,
            type="ALERT_CITIZENS",
            status="PENDING",
            predicted_side_effects="Test alert side effects"
        )
        session.add(action)
        await session.commit()
        print("Mock action saved.")
        
    print("Running simulation loop...")
    try:
        await run_simulation_loop(incident_id)
        print("Simulation loop finished successfully!")
    except Exception as e:
        import traceback
        print("Simulation loop failed with exception:")
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
