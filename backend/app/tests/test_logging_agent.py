import pytest
import uuid
from sqlalchemy import select
from app.db.session import async_session_factory
from app.models.reasoning_logs import ReasoningLog, ChainOfThought
from app.ai.tools.tracer import _emit_log, _persist_chain_of_thought

@pytest.mark.asyncio
async def test_logging_agent_emit_and_persist():
    """Verify that both _emit_log and _persist_chain_of_thought successfully insert records into the DB."""
    
    # 1. Test _emit_log
    test_incident_id_1 = str(uuid.uuid4())
    log_text = "This is an automated test verifying the emit_log function tool."
    
    print(f"\n[INFO] Running _emit_log directly for incident {test_incident_id_1}...")
    res_emit = await _emit_log(
        agent_name="TestSeverityAgent",
        log_text=log_text,
        incident_id=test_incident_id_1,
        log_level="INFO"
    )
    print(f"[OK] Tool Invocation Output: {res_emit}")
    
    # 2. Test _persist_chain_of_thought
    test_incident_id_2 = str(uuid.uuid4())
    cot_steps = "1. Hospital nearby detected. 2. School nearby detected. 3. Final score: 7.5."
    
    print(f"\n[INFO] Running _persist_chain_of_thought directly for incident {test_incident_id_2}...")
    res_persist = await _persist_chain_of_thought(
        agent_name="TestSeverityAgent",
        cot_steps=cot_steps,
        incident_id=test_incident_id_2
    )
    print(f"[OK] Tool Invocation Output: {res_persist}")
    
    # 3. Assertions
    print("[INFO] Checking Database for the log...")
    async with async_session_factory() as session:
        # Check emit_log
        query_log = select(ReasoningLog).where(ReasoningLog.incident_id == uuid.UUID(test_incident_id_1))
        res_log = await session.execute(query_log)
        logs = res_log.scalars().all()
        assert len(logs) == 1, "Failed: Log was not found in the database!"
        assert logs[0].agent_name == "TestSeverityAgent"
        assert logs[0].log_text == log_text
        print("[SUCCESS] emit_log test passed!")
        
        # Check persist_chain_of_thought
        query_cot = select(ChainOfThought).where(ChainOfThought.incident_id == uuid.UUID(test_incident_id_2))
        res_cot = await session.execute(query_cot)
        cots = res_cot.scalars().all()
        assert len(cots) == 1, "Failed: Chain of Thought was not found in the database!"
        assert cots[0].agent_name == "TestSeverityAgent"
        assert cots[0].cot_steps == cot_steps
        print("[SUCCESS] persist_chain_of_thought test passed!")




