import pytest
import json
import uuid
from agents import Runner
from sqlalchemy import select
from app.db.session import async_session_factory
from app.models.reasoning_logs import ReasoningLog
from app.ai.specialists import logging_agent

@pytest.mark.asyncio
async def test_logging_agent_emit_log():
    """Verify that the Logging Agent can successfully invoke the emit_log tool and save to DB."""
    
    test_incident_id = str(uuid.uuid4())
    payload = {
        "agent_name": "TestSeverityAgent",
        "log_text": "This is an automated test verifying the emit_log function tool.",
        "incident_id": test_incident_id,
        "log_level": "INFO"
    }
    
    print(f"\n[INFO] Running Logging Agent for incident {test_incident_id}...")
    res = await Runner.run(logging_agent, json.dumps(payload))
    print(f"[OK] Agent Run Completed. Output: {res.final_output}")
    
    print("[INFO] Checking Database for the log...")
    async with async_session_factory() as session:
        # Check if the log was inserted
        query = select(ReasoningLog).where(ReasoningLog.incident_id == uuid.UUID(test_incident_id))
        result = await session.execute(query)
        logs = result.scalars().all()
        
        assert len(logs) == 1, "Failed: Log was not found in the database!"
        assert logs[0].agent_name == "TestSeverityAgent"
        assert logs[0].log_level == "INFO"
        print(f"[SUCCESS] Found 1 log in DB matching incident {test_incident_id}! emit_log tool works perfectly.")
