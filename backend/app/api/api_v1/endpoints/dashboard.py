"""
app/api/api_v1/endpoints/dashboard.py
─────────────────────────────────────
Endpoints for the CIRO Web Dashboard to provide a global view of the multi-agent pipeline.
"""

from datetime import datetime, timedelta
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlmodel import select, or_, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.models.signals import Signal
from app.models.incidents import Incident
from app.models.reasoning_logs import ReasoningLog
from app.models.resources import Resource

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(*, session: AsyncSession = Depends(get_session)) -> Dict[str, int]:
    """
    Overview Counters
    Returns high-level statistics to populate a "tactical counters bar" at the top of the dashboard.
    """
    # Total Signals
    total_signals_query = select(func.count(Signal.id))
    total_signals_res = await session.execute(total_signals_query)
    total_signals = total_signals_res.scalar_one()

    # Active Crisis Sectors
    active_incidents_query = select(func.count(Incident.id)).where(
        or_(
            Incident.status == "confirmed",
            Incident.status == "CONFIRMED",
            Incident.status == "monitoring",
            Incident.status == "MONITORING",
        )
    )
    active_incidents_res = await session.execute(active_incidents_query)
    active_crisis_sectors = active_incidents_res.scalar_one()

    # Total Agent Decisions
    total_decisions_query = select(func.count(ReasoningLog.id))
    total_decisions_res = await session.execute(total_decisions_query)
    total_agent_decisions = total_decisions_res.scalar_one()

    # Allocated Resources
    resources_query = select(Resource)
    resources_res = await session.execute(resources_query)
    resources = resources_res.scalars().all()

    allocated_ambulances = sum(
        (r.total_count - r.available_count) for r in resources if r.type == 'ambulance'
    )
    allocated_rescue_crews = sum(
        (r.total_count - r.available_count) for r in resources if r.type == 'rescue_team'
    )

    return {
        "total_signals": total_signals,
        "active_crisis_sectors": active_crisis_sectors,
        "total_agent_decisions": total_agent_decisions,
        "allocated_ambulances": allocated_ambulances,
        "allocated_rescue_crews": allocated_rescue_crews,
    }

@router.get("/agent-workforce")
async def get_agent_workforce(*, session: AsyncSession = Depends(get_session)) -> List[Dict[str, Any]]:
    """
    Agent State Grid
    Returns the live operational state of our 8 specialist agents.
    If the agent's last log is within 15 seconds, it's considered PROCESSING.
    """
    agents = [
        "signal_agent",
        "detection_agent",
        "severity_agent",
        "verification_agent",
        "logging_agent",
        "resource_allocation_agent",
        "planning_agent",
        "notification_agent",
    ]

    agent_states = []
    now = datetime.utcnow()
    cutoff_time = now - timedelta(seconds=15)

    # Single-Query Optimization using Window Function row_number()
    from sqlalchemy import func

    subq = (
        select(
            ReasoningLog.id.label("log_id"),
            ReasoningLog.agent_name.label("agent_name"),
            ReasoningLog.created_at.label("created_at"),
            ReasoningLog.incident_id.label("incident_id"),
            func.row_number().over(
                partition_by=ReasoningLog.agent_name,
                order_by=ReasoningLog.created_at.desc()
            ).label("rn")
        )
        .where(ReasoningLog.agent_name.in_(agents))
        .subquery()
    )

    query = select(subq).where(subq.c.rn == 1)
    res = await session.execute(query)
    rows = res.all()

    # Map results by agent name
    log_map = {row.agent_name: row for row in rows}

    for agent in agents:
        latest_log = log_map.get(agent)
        status = "IDLE"
        active_incident = None

        if latest_log:
            # SQLite stores datetime naive, so we just compare them
            if latest_log.created_at and latest_log.created_at >= cutoff_time:
                status = "PROCESSING"
                if latest_log.incident_id:
                    active_incident = str(latest_log.incident_id)

        # Make agent name pretty
        pretty_name = agent.replace("_", " ").title()
        
        agent_states.append({
            "agent": pretty_name,
            "status": status,
            "active_incident": active_incident
        })

    return agent_states

@router.get("/global-timeline")
async def get_global_timeline(*, session: AsyncSession = Depends(get_session)) -> List[Dict[str, Any]]:
    """
    Global System Log
    A unified feed of the last 15 actions/logs taken across all incidents.
    """
    query = (
        select(ReasoningLog)
        .order_by(ReasoningLog.created_at.desc())
        .limit(15)
    )
    res = await session.execute(query)
    logs = res.scalars().all()

    timeline = []
    for log in logs:
        timeline.append({
            "id": str(log.id),
            "incident_id": str(log.incident_id) if log.incident_id else None,
            "agent_name": log.agent_name,
            "log_text": log.log_text,
            "log_level": log.log_level,
            "created_at": log.created_at.isoformat() + "Z" if log.created_at else None
        })

    return timeline
