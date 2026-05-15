import asyncio
import uuid
from app.ai.agent_definitions import notification_agent
from app.ai.connection import config
from agents import Runner
from app.db.session import init_db

async def test_sdk_notification():
    print("\n--- SDK Notification Agent Test ---")
    await init_db()
    
    # Mock Incident Data
    incident_id = str(uuid.uuid4())
    incident_data = {
        "incident_id": incident_id,
        "location": "G-10 Sector, Islamabad",
        "lat": 33.6844,
        "lng": 73.0479,
        "severity_score": 8.5,
        "estimated_population": 5000,
        "peak_impact_eta": "20-40 mins"
    }
    
    print(f"Running SDK Agent for Incident: {incident_id}")
    
    try:
        # Initialize the Runner
        runner = Runner()
        
        # Run the agent
        messages = [{"role": "user", "content": f"Process notifications for this incident: {incident_data}"}]
        
        result = await runner.run(
            starting_agent=notification_agent,
            input=messages,
            run_config=config
        )
        
        print("\nAgent Execution Completed.")
        if result and result.messages:
            last_msg = result.messages[-1]
            print("Final Result Content:", last_msg.content if hasattr(last_msg, 'content') else last_msg)
        else:
            print("No result messages found.")
        
    except Exception as e:
        print(f"\nError running SDK Agent: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_sdk_notification())
