"""
app/ai/tools/tracer.py
──────────────────────
Tool for emitting reasoning logs. Saves to DB and broadcasts to WebSocket.
"""

import json
from datetime import datetime
from uuid import UUID
from typing import Optional

from app.db.session import async_session_factory
from app.models.reasoning_logs import ReasoningLog, ChainOfThought
from app.api.api_v1.endpoints.websocket import manager
from agents import function_tool

@function_tool
async def emit_log(
    agent_name: str,
    log_text: str,
    incident_id: Optional[str] = None,
    log_level: str = "INFO"
) -> str:
    """Saves an agent reasoning log to the database and broadcasts it via WebSocket.
    Use this tool to submit user-facing reasoning logs.
    """
    db_incident_id = None
    if incident_id:
        try:
            db_incident_id = UUID(incident_id)
        except ValueError:
            db_incident_id = None

    log_entry = ReasoningLog(
        incident_id=db_incident_id,
        agent_name=agent_name,
        log_text=log_text,
        log_level=log_level
    )
    
    # 1. Save to Database
    async with async_session_factory() as session:
        session.add(log_entry)
        await session.commit()
        await session.refresh(log_entry)
    
    # 2. Broadcast to WebSocket
    target_id = incident_id if incident_id else "triage"
    
    payload = {
        "id": str(log_entry.id),
        "incident_id": incident_id,
        "agent_name": agent_name,
        "log_text": log_text,
        "log_level": log_level,
        "created_at": log_entry.created_at.isoformat()
    }
    
    await manager.broadcast(target_id, payload)
    
    return f"Log emitted for {agent_name} (ID: {log_entry.id})"


@function_tool
async def persist_chain_of_thought(
    agent_name: str,
    cot_steps: str,
    incident_id: Optional[str] = None
) -> str:
    """Saves a detailed LLM chain-of-thought (CoT) step-by-step reasoning trace to the database.
    This is used for detailed deep-dive observability of the agent pipeline.
    """
    db_incident_id = None
    if incident_id:
        try:
            db_incident_id = UUID(incident_id)
        except ValueError:
            db_incident_id = None

    cot_entry = ChainOfThought(
        incident_id=db_incident_id,
        agent_name=agent_name,
        cot_steps=cot_steps
    )
    
    async with async_session_factory() as session:
        session.add(cot_entry)
        await session.commit()
        await session.refresh(cot_entry)
        
    return f"Chain of Thought persisted for {agent_name} (ID: {cot_entry.id})"



