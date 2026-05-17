"""
app/api/api_v1/endpoints/signals.py
───────────────────────────────────
Endpoint for ingesting raw signals from various sources.
Implements deduplication and database persistence.

Fixes & Wiring (Uneeza — Phase 2):
  - Duplicate response: now returns HTTP 200 + DISCARDED JSON (was 201 + ORM obj).
  - Deduplication: guarded for non-GPS signals (lat/lng may be None).
  - Pipeline: Triage Agent triggered via FastAPI BackgroundTasks after every
    new signal is saved. API returns 201 immediately; agent runs after response.
"""

import json
from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, BackgroundTasks, Depends, status
from fastapi.responses import JSONResponse
from sqlmodel import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from agents import Runner

from app.models.signals import Signal
from app.models.schemas import SignalCreate, SignalRead
from app.db.session import get_session
from app.ai.orchestrator import triage_agent
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


async def _run_triage_pipeline(signal_payload: dict) -> None:
    """Background coroutine: runs the Triage Agent after the HTTP response is sent.
    Uses the unified config driven by the LLM_PROVIDER env variable.
    """
    payload_str = json.dumps(signal_payload)
    try:
        await Runner.run(triage_agent, payload_str)
    except Exception as e:
        logger.error(f"Pipeline execution failed: {e}")


@router.post("/", response_model=SignalRead, status_code=status.HTTP_201_CREATED)
async def create_signal(
    *,
    session: AsyncSession = Depends(get_session),
    background_tasks: BackgroundTasks,
    signal_in: SignalCreate
):
    """
    Ingest a new signal.
    Performs GPS-based deduplication (5 mins / 50m) before saving.
    Non-GPS signals (weather, traffic) skip deduplication and are always saved.
    Triggers the Triage Agent asynchronously after saving.
    """

    # 1. Deduplication Check — GPS signals only (lat/lng may be None)
    if signal_in.lat is not None and signal_in.lng is not None:
        time_threshold = datetime.utcnow() - timedelta(minutes=5)

        # Simple bounding box for ~50m (0.00045 degrees ≈ 50m at equatorial scale)
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
            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={
                    "status": "DUPLICATE",
                    "action": "DISCARDED",
                    "signal_id": str(existing_signal.id)
                }
            )

    # 2. Create new signal record
    db_signal = Signal(
        source=signal_in.source,
        type=signal_in.type,
        lat=signal_in.lat,
        lng=signal_in.lng,
        raw_payload=signal_in.raw_payload
    )

    session.add(db_signal)
    await session.commit()
    await session.refresh(db_signal)

    # 3. Trigger Triage Agent — runs after HTTP 201 is returned to the client
    signal_payload = signal_in.model_dump()
    signal_payload["signal_id"] = str(db_signal.id)
    background_tasks.add_task(_run_triage_pipeline, signal_payload)

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
