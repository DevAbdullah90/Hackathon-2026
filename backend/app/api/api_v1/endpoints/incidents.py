"""
app/api/api_v1/endpoints/incidents.py
─────────────────────────────────────
Endpoint for retrieving processed flood incidents.
Used by the Frontend Dashboard to display the map and active alerts.
"""

from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.incidents import Incident
from app.models.reasoning_logs import ReasoningLog, ChainOfThought
from app.models.schemas import IncidentRead, ReasoningLogRead, ChainOfThoughtRead
from app.db.session import get_session

router = APIRouter()


@router.get("/active", response_model=List[IncidentRead])
async def read_active_incidents(
    *,
    session: AsyncSession = Depends(get_session),
    offset: int = 0,
    limit: int = 100
):
    """
    Retrieve all confirmed or monitoring flood incidents.
    Excludes 'resolved' or 'retracted' incidents.
    """
    query = (
        select(Incident)
        .where(or_(
            Incident.status == "confirmed",
            Incident.status == "CONFIRMED",
            Incident.status == "monitoring",
            Incident.status == "MONITORING",
        ))
        .offset(offset)
        .limit(limit)
        .order_by(Incident.created_at.desc())
    )
    result = await session.execute(query)
    incidents = result.scalars().all()
    return incidents


@router.get("/{incident_id}", response_model=IncidentRead)
async def read_incident(
    *,
    session: AsyncSession = Depends(get_session),
    incident_id: UUID
):
    """
    Get detailed information for a specific incident.
    """
    incident = await session.get(Incident, incident_id)
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Incident not found"
        )
    return incident


@router.get("/{incident_id}/logs", response_model=List[ReasoningLogRead])
async def read_incident_logs(
    *,
    session: AsyncSession = Depends(get_session),
    incident_id: UUID
):
    """
    Retrieve all AI reasoning logs associated with a specific incident.
    """
    query = (
        select(ReasoningLog)
        .where(ReasoningLog.incident_id == incident_id)
        .order_by(ReasoningLog.created_at.asc())
    )
    result = await session.execute(query)
    logs = result.scalars().all()
    return logs


@router.get("/{incident_id}/cot", response_model=List[ChainOfThoughtRead])
async def read_incident_cot(
    *,
    session: AsyncSession = Depends(get_session),
    incident_id: UUID
):
    """
    Retrieve all detailed AI Chain of Thought (CoT) steps associated with a specific incident.
    """
    query = (
        select(ChainOfThought)
        .where(ChainOfThought.incident_id == incident_id)
        .order_by(ChainOfThought.created_at.asc())
    )
    result = await session.execute(query)
    cots = result.scalars().all()
    return cots


