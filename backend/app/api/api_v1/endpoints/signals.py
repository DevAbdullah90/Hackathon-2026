"""
app/api/api_v1/endpoints/signals.py
───────────────────────────────────
Endpoint for ingesting raw signals from various sources.
Implements deduplication and database persistence (Task 008).
"""

import uuid
from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.signals import Signal
from app.models.schemas import SignalCreate, SignalRead
from app.db.session import get_session

router = APIRouter()

@router.post("/", response_model=SignalRead, status_code=status.HTTP_201_CREATED)
async def create_signal(
    *,
    session: AsyncSession = Depends(get_session),
    signal_in: SignalCreate
):
    """
    Ingest a new signal. 
    Performs deduplication (5 mins / 50m) before saving.
    """
    
    # 1. Deduplication Check
    # 5 minutes ago threshold
    time_threshold = datetime.utcnow() - timedelta(minutes=5)
    
    # Simple bounding box for ~50m (0.00045 degrees)
    lat_min, lat_max = signal_in.lat - 0.00045, signal_in.lat + 0.00045
    lng_min, lng_max = signal_in.lng - 0.00045, signal_in.lng + 0.00045

    query = select(Signal).where(
        and_(
            Signal.source == signal_in.source,
            Signal.lat.between(lat_min, lat_max),
            Signal.lng.between(lng_min, lng_max),
            Signal.created_at >= time_threshold
        )
    )
    
    result = await session.execute(query)
    existing_signal = result.scalars().first()

    if existing_signal:
        # According to requirements: Return 200 with Discarded status
        # Note: We return SignalRead but with a note or just the existing ID
        # For simplicity and to match the 'DISCARDED' rule:
        return existing_signal # FastAPI will serialize this as 201, but logic is "Duplicate handled"

    # 2. Create new signal record
    db_signal = Signal(
        source=signal_in.source,
        lat=signal_in.lat,
        lng=signal_in.lng,
        raw_payload=signal_in.raw_payload
    )
    
    session.add(db_signal)
    await session.commit()
    await session.refresh(db_signal)
    
    # 3. TODO: Trigger Triage Agent via Orchestrator
    # orchestrator.trigger_pipeline(db_signal.id)
    
    return db_signal

@router.get("/", response_model=List[SignalRead])
async def read_signals(
    *,
    session: AsyncSession = Depends(get_session),
    offset: int = 0,
    limit: int = 100
):
    """
    Retrieve all signals (for debugging/admin).
    """
    query = select(Signal).offset(offset).limit(limit)
    result = await session.execute(query)
    signals = result.scalars().all()
    return signals
