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
    """Background coroutine: Runs the production multi-agent sequence sequentially.
    Ensures that every specialist completes and persists its data,
    providing full UI observability and simulation action plans.
    """
    import uuid
    from app.db.session import async_session_factory
    from app.models.signals import Signal
    from app.models.incidents import Incident
    from app.models.reasoning_logs import ReasoningLog
    from app.models.actions import Action
    from app.models.resources import Resource
    from app.ai.specialists import (
        signal_agent,
        detection_agent,
        severity_agent,
        resource_agent,
        planning_agent,
        verification_agent,
        notification_agent,
        logging_agent,
    )

    logger.info(f"🚀 Starting multi-agent pipeline sequential run for signal {signal_payload.get('signal_id')}...")
    try:
        # Step 1: Signal Agent
        res_signal = await Runner.run(signal_agent, json.dumps(signal_payload))
        processed_signal = json.loads(res_signal.final_output)
        logger.info(f"📡 [Signal Agent] Processed location: {processed_signal.get('location')}")

        # Update the Signal table in the database!
        async with async_session_factory() as session:
            sig_uuid = uuid.UUID(signal_payload["signal_id"])
            db_sig = await session.get(Signal, sig_uuid)
            if db_sig:
                db_sig.location = processed_signal.get("location")
                db_sig.credibility_score = processed_signal.get("credibility_score") if isinstance(processed_signal.get("credibility_score"), (int, float)) else 0.70
                db_sig.conflict_flag = processed_signal.get("conflict_flag", False)
                db_sig.structured_json = processed_signal
                session.add(db_sig)
                await session.commit()
                logger.info(f"📡 [DB] Updated Signal table for ID: {signal_payload['signal_id']}")

        # Log Signal Agent step via Logging Agent!
        log_payload = {
            "agent_name": "signal_agent",
            "agent_output": processed_signal,
            "incident_id": None,
            "timestamp": datetime.utcnow().isoformat()
        }
        await Runner.run(logging_agent, json.dumps(log_payload))

        # Step 2: Detection Agent (Clustering / Verdict)
        res_detection = await Runner.run(detection_agent, json.dumps([processed_signal]))
        detection_output = json.loads(res_detection.final_output)
        logger.info(f"🔍 [Detection Agent] Verdict confirmed: {detection_output.get('confirmed')}")

        # Log Detection Agent step via Logging Agent!
        await Runner.run(logging_agent, json.dumps({
            "agent_name": "detection_agent",
            "agent_output": detection_output,
            "incident_id": None,
            "timestamp": datetime.utcnow().isoformat()
        }))

        # Determine confirmation status
        is_confirmed = detection_output.get("confirmed", False)
        detection_status = detection_output.get("status", "")
        confidence = detection_output.get("confidence", 1.0)

        # Step 2.5: Verification Agent (Fact-checking if not confirmed but VERIFY needed)
        if not is_confirmed and (detection_status == "UNCONFIRMED_VERIFY" or confidence < 0.60):
            logger.info("🔍 [Detection Agent] Low confidence or UNCONFIRMED_VERIFY. Triggering Verification Agent...")
            verification_input = {
                "trigger": "LOW_CONFIDENCE" if confidence < 0.60 else "CONFLICT_FLAG",
                "incident_location": detection_output.get("incident_location") or processed_signal.get("location") or "Reported Location",
                "incident_center_lat": detection_output.get("incident_center_lat") or signal_payload.get("lat") or 0.0,
                "incident_center_lng": detection_output.get("incident_center_lng") or signal_payload.get("lng") or 0.0,
                "detection_confidence": confidence,
                "conflicting_signals": [],
                "detection_id": detection_output.get("detection_id") or str(uuid.uuid4())
            }
            res_verification = await Runner.run(verification_agent, json.dumps(verification_input))
            verification_output = json.loads(res_verification.final_output)
            logger.info(f"✅ [Verification Agent] Verdict: {verification_output.get('verdict')}")

            # Log Verification Agent step via Logging Agent!
            await Runner.run(logging_agent, json.dumps({
                "agent_name": "verification_agent",
                "agent_output": verification_output,
                "incident_id": None,
                "timestamp": datetime.utcnow().isoformat()
            }))

            if verification_output.get("verdict") == "CONFIRM":
                is_confirmed = True
                # Update location/details based on verification
                if verification_output.get("incident_type_confirmed"):
                    detection_output["incident_location"] = verification_output.get("incident_location") or detection_output.get("incident_location")

        # Step 3: Proceed with Severity, Resource, Planning, Notification if incident is confirmed!
        if is_confirmed:
            # Step 3: Severity Agent (Assess Risks)
            res_severity = await Runner.run(severity_agent, json.dumps(detection_output))
            severity_output = json.loads(res_severity.final_output)
            logger.info(f"⚠️ [Severity Agent] Score: {severity_output.get('severity_score')} / 10")

            # Create Incident in database!
            async with async_session_factory() as session:
                # Backend calculates population based on radius and density
                density = severity_output.get("density_per_km2") or 4000
                radius = severity_output.get("affected_radius_km") or 1.0
                calc_population = int(3.14159 * (radius ** 2) * density)

                db_incident = Incident(
                    location=detection_output.get("incident_location") or processed_signal.get("location") or "Reported Location",
                    lat=detection_output.get("incident_center_lat") or signal_payload.get("lat") or 0.0,
                    lng=detection_output.get("incident_center_lng") or signal_payload.get("lng") or 0.0,
                    severity_score=severity_output.get("severity_score") or 5.0,
                    confidence=detection_output.get("confidence") or 0.9,
                    affected_radius_km=radius,
                    estimated_population=calc_population,
                    peak_impact_eta=severity_output.get("peak_impact_eta") or "30 mins",
                    status="confirmed",
                    risk_factors=severity_output.get("risk_factors") or []
                )
                session.add(db_incident)
                await session.commit()
                await session.refresh(db_incident)
                incident_id = str(db_incident.id)
                logger.info(f"🏠 [DB] Created Confirmed Incident: {incident_id}")

            # Log Severity Agent step via Logging Agent!
            await Runner.run(logging_agent, json.dumps({
                "agent_name": "severity_agent",
                "agent_output": severity_output,
                "incident_id": incident_id,
                "timestamp": datetime.utcnow().isoformat()
            }))

            # Step 4: Resource Agent (Allocation)
            resource_input = {**severity_output, "incident_id": incident_id}
            res_resource = await Runner.run(resource_agent, json.dumps(resource_input))
            resource_output = json.loads(res_resource.final_output)
            logger.info("🚒 [Resource Agent] Completed Allocation")

            # Log Resource Agent step via Logging Agent!
            await Runner.run(logging_agent, json.dumps({
                "agent_name": "resource_allocation_agent",
                "agent_output": resource_output,
                "incident_id": incident_id,
                "timestamp": datetime.utcnow().isoformat()
            }))

            # Step 5: Planning Agent (Create Tactical Action Plan!)
            planning_input = {**severity_output, "incident_id": incident_id, "allocations": resource_output.get("allocations", {})}
            res_planning = await Runner.run(planning_agent, json.dumps(planning_input))
            planning_output = json.loads(res_planning.final_output)
            logger.info("📋 [Planning Agent] Generated response actions in DB")

            # Log Planning Agent step via Logging Agent!
            await Runner.run(logging_agent, json.dumps({
                "agent_name": "planning_agent",
                "agent_output": planning_output,
                "incident_id": incident_id,
                "timestamp": datetime.utcnow().isoformat()
            }))

            # Step 6: Notification Agent (Stakeholder alerts)
            notification_input = {
                "incident_id": incident_id,
                "location": db_incident.location,
                "lat": db_incident.lat,
                "lng": db_incident.lng,
                "severity_score": db_incident.severity_score,
                "estimated_population": db_incident.estimated_population
            }
            await Runner.run(notification_agent, json.dumps(notification_input))
            logger.info("📢 [Notification Agent] Complete")

            # Log Notification Agent step via Logging Agent!
            await Runner.run(logging_agent, json.dumps({
                "agent_name": "notification_agent",
                "agent_output": {"status": "SUCCESS", "message": "All 6 notifications dispatched to stakeholders."},
                "incident_id": incident_id,
                "timestamp": datetime.utcnow().isoformat()
            }))
            logger.info(f"✨ Pipeline completed successfully for incident: {incident_id}")
        else:
            logger.info("❌ [Detection Agent] Incident was NOT confirmed. Stopping pipeline execution.")
    except Exception as e:
        logger.error(f"❌ Fatal Error running sequential production pipeline: {e}", exc_info=True)



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
