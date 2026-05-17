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
from app.models.reasoning_logs import ReasoningLog
from app.api.api_v1.endpoints.websocket import manager
from agents import function_tool

@function_tool
async def emit_log(
    agent_name: str,
    log_text: str,
    incident_id: Optional[str] = None,
    log_level: str = "INFO"
) -> str:
    """
    Saves an agent reasoning log to the database and broadcasts it via WebSocket.
    
    Args:
        agent_name: Name of the agent (e.g. 'signal_agent', 'detection_agent')
        log_text: The Markdown content produced by the Logging Agent
        incident_id: UUID of the incident (optional if pre-confirmation)
        log_level: 'INFO', 'WARNING', or 'CRITICAL'
    """
    
    # Try to convert to UUID for database, otherwise use None
    db_incident_id = None
    if incident_id:
        try:
            db_incident_id = UUID(incident_id)
        except ValueError:
            # Not a valid UUID (e.g. 'triage' or malformed string)
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
    # If incident_id is None, we could broadcast to a 'global' or 'triage' channel
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
