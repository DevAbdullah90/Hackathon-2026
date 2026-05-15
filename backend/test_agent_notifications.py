import asyncio
import uuid
from app.db.session import async_session_factory, init_db
from app.models.incidents import Incident
from app.agents.notification_agent import process_notifications
from sqlalchemy import text

async def test_notification_agent():
    print("\n--- CIRO Notification Agent Flow Test ---")
    
    # 1. Initialize DB
    await init_db()
    
    async with async_session_factory() as session:
        # 2. Create a Mock Incident (Required for Foreign Key)
        print("\n1. Creating Mock Incident...")
        mock_incident = Incident(
            location="G-10 Sector, Islamabad",
            lat=33.6844,
            lng=73.0479,
            severity_score=8.5,
            confidence=0.92,
            estimated_population=4500,
            peak_impact_eta="45 mins",
            status="confirmed"
        )
        session.add(mock_incident)
        await session.commit()
        await session.refresh(mock_incident)
        print(f"SUCCESS: Mock Incident Created: {mock_incident.id}")
        
        # 3. Run Notification Agent
        print("\n2. Running Notification Agent...")
        results = await process_notifications(mock_incident)
        print(f"SUCCESS: Agent generated and persisted {len(results)} notifications.")
        
        # 4. Verify in DB
        print("\n3. Verifying Persistence in Database...")
        query = text("SELECT stakeholder, message FROM notifications WHERE incident_id = :inc_id")
        db_results = await session.execute(query, {"inc_id": mock_incident.id})
        rows = db_results.fetchall()
        
        print(f"   Found {len(rows)} records in 'notifications' table:")
        for row in rows:
            print(f"   - [{row[0]}]: {row[1][:50]}...")
            
        if len(rows) == 6:
            print("\nNotification Agent Flow is fully verified!")
        else:
            print(f"\nERROR: Expected 6 notifications, found {len(rows)}.")

if __name__ == "__main__":
    asyncio.run(test_notification_agent())
