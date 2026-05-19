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
from app.models.actions import Action
from app.models.notifications import Notification
from app.models.resources import Resource
from app.models.schemas import IncidentRead, ReasoningLogRead, ChainOfThoughtRead, ActionRead, NotificationRead, VerificationRequest
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


@router.get("/{incident_id}/actions", response_model=List[ActionRead])
async def read_incident_actions(
    *,
    session: AsyncSession = Depends(get_session),
    incident_id: UUID
):
    """
    Retrieve all emergency actions planned for a specific incident.
    """
    # Check if the incident exists first
    incident = await session.get(Incident, incident_id)
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found"
        )

    query = (
        select(Action)
        .where(Action.incident_id == incident_id)
        .order_by(Action.updated_at.asc())
    )
    result = await session.execute(query)
    actions = result.scalars().all()
    return actions


@router.get("/{incident_id}/notifications", response_model=List[NotificationRead])
async def read_incident_notifications(
    *,
    session: AsyncSession = Depends(get_session),
    incident_id: UUID
):
    """
    Retrieve all stakeholder notifications generated for a specific incident.
    """
    incident = await session.get(Incident, incident_id)
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found"
        )

    query = (
        select(Notification)
        .where(Notification.incident_id == incident_id)
        .order_by(Notification.sent_at.asc())
    )
    result = await session.execute(query)
    notifications = result.scalars().all()
    return notifications


@router.post("/{incident_id}/verify", response_model=IncidentRead)
async def verify_incident(
    *,
    session: AsyncSession = Depends(get_session),
    incident_id: UUID,
    payload: VerificationRequest
):
    """
    Submit a citizen confirmation or refutation (crowdsourced vote) for an incident.
    If refutations exceed confirmations + 3, the status is set to 'retracted' and resources are freed.
    """
    incident = await session.get(Incident, incident_id)
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found"
        )

    if payload.vote == "confirm":
        incident.confirmations_count = (incident.confirmations_count or 0) + 1
    elif payload.vote == "refute":
        incident.refutations_count = (incident.refutations_count or 0) + 1
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid vote value. Must be 'confirm' or 'refute'"
        )

    # Retraction trigger: If refutations > confirmations + 3, flag as retracted
    if (incident.refutations_count or 0) > (incident.confirmations_count or 0) + 3:
        incident.status = "retracted"
        # Free up resources allocated to this incident by deleting them
        resource_query = select(Resource).where(Resource.assigned_to_incident == incident_id)
        resource_res = await session.execute(resource_query)
        resources_to_free = resource_res.scalars().all()
        for r in resources_to_free:
            await session.delete(r)

    session.add(incident)
    await session.commit()
    await session.refresh(incident)
    return incident




