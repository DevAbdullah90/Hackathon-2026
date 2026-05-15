import asyncio
import uuid
from app.db.session import async_session_factory, init_db
from app.models.incidents import Incident
from app.models.actions import Action
from app.simulation.engine import run_simulation_loop
from sqlalchemy import select

async def test_simulation_step_by_step():
    print("\n--- CIRO Simulation Engine Step-by-Step Test ---")
    
    await init_db()
    
    async with async_session_factory() as session:
        # 1. Setup test data
        print("\n1. Preparing test incident and action...")
        incident = Incident(
            location="I-8 Sector, Islamabad",
            lat=33.6681,
            lng=73.0766,
            severity_score=6.5,
            confidence=0.88,
            status="confirmed"
        )
        session.add(incident)
        await session.commit()
        await session.refresh(incident)
        
        action = Action(
            incident_id=incident.id,
            type="DISPATCH_AMBULANCE",
            status="PENDING"
        )
        session.add(action)
        await session.commit()
        await session.refresh(action)
        print(f"   Action ID: {action.id} Initial Status: {action.status}")

        # 2. Run simulation in the background
        print("\n2. Triggering background simulation...")
        sim_task = asyncio.create_task(run_simulation_loop(incident.id, [action.id]))
        
        # 3. Poll for intermediate states
        print("\n3. Polling for state transitions...")
        expected_sequence = ["SENT", "ACTIVE", "ON_SITE", "COMPLETED"]
        observed_states = []
        
        # We'll poll for up to 15 seconds
        for _ in range(15):
            await asyncio.sleep(1.5)
            await session.refresh(action)
            current_status = action.status
            if not observed_states or observed_states[-1] != current_status:
                print(f"   Observed state change: {current_status}")
                observed_states.append(current_status)
            
            if current_status == "COMPLETED":
                break
        
        # Wait for the task to actually finish
        await sim_task
        
        # 4. Final Verification
        print("\n4. Final Verification...")
        print(f"   Sequence of observed states: {observed_states}")
        
        # Filter out PENDING if it was caught
        if "PENDING" in observed_states:
            observed_states.remove("PENDING")
            
        success = True
        for state in expected_sequence:
            if state not in observed_states:
                print(f"❌ Missing expected state: {state}")
                success = False
        
        if success:
            print("\nSimulation Engine verified step-by-step successfully!")
        else:
            print("\nFAILED: Simulation did not follow the expected sequence.")

if __name__ == "__main__":
    asyncio.run(test_simulation_step_by_step())
