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
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

from fastapi import APIRouter, BackgroundTasks, Depends, status, HTTPException
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

# Real-time multi-agent pipeline status cache for live dashboard tracking
pipeline_status_tracker: Dict[str, Dict[str, Any]] = {}

def update_pipeline_progress(
    signal_id: str,
    status_str: str,
    stage: str,
    stage_index: int,
    stage_status: str,
    message: str,
    incident_id: Optional[str] = None
):
    pipeline_status_tracker[signal_id] = {
        "signal_id": signal_id,
        "incident_id": incident_id,
        "status": status_str,
        "stage": stage,
        "stage_index": stage_index,
        "stage_status": stage_status,
        "message": message,
        "updated_at": datetime.utcnow().isoformat()
    }
    logger.info(f"📊 [Pipeline Progress] Signal {signal_id} -> Stage {stage} ({stage_index}/6): {stage_status} - {message}")


async def _run_triage_pipeline(signal_payload: dict) -> None:
    """Background coroutine: Runs the production multi-agent sequence sequentially.
    Ensures that every specialist completes and persists its data,
    providing full UI observability and simulation action plans.
    """
    import uuid
    from app.db.session import async_session_factory
    from app.models.signals import Signal
    from app.models.incidents import Incident
    from app.models.reasoning_logs import ReasoningLog, ChainOfThought
    from app.models.actions import Action
    from app.models.resources import Resource
    from app.ai.tools.tracer import active_signal_id
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

    sig_id_str = signal_payload.get("signal_id")
    pipeline_start_time = datetime.utcnow() - timedelta(seconds=5)

    # 1. Bind ContextVar for pre-incident telemetry log routing
    active_signal_id.set(sig_id_str)
    
    logger.info(f"🚀 Starting multi-agent pipeline sequential run for signal {sig_id_str}...")
    
    try:
        # Step 1: Signal Agent
        update_pipeline_progress(sig_id_str, "PROCESSING", "signal_agent", 1, "RUNNING", "Signal Processor analyzing raw telemetry feeds...")
        res_signal = await Runner.run(signal_agent, json.dumps(signal_payload))
        processed_signal = json.loads(res_signal.final_output)
        logger.info(f"📡 [Signal Agent] Processed location: {processed_signal.get('location')}")
        update_pipeline_progress(sig_id_str, "PROCESSING", "signal_agent", 1, "COMPLETED", "Signal parsed and categorized.")

        # Update the Signal table in the database!
        async with async_session_factory() as session:
            sig_uuid = uuid.UUID(sig_id_str)
            db_sig = await session.get(Signal, sig_uuid)
            if db_sig:
                db_sig.location = processed_signal.get("location")
                db_sig.credibility_score = processed_signal.get("credibility_score") if isinstance(processed_signal.get("credibility_score"), (int, float)) else 0.70
                db_sig.conflict_flag = processed_signal.get("conflict_flag", False)
                db_sig.structured_json = processed_signal
                session.add(db_sig)
                await session.commit()
                logger.info(f"📡 [DB] Updated Signal table for ID: {sig_id_str}")

        # Log Signal Agent step via Logging Agent!
        log_payload = {
            "agent_name": "signal_agent",
            "agent_output": processed_signal,
            "incident_id": None,
            "timestamp": datetime.utcnow().isoformat()
        }
        await Runner.run(logging_agent, json.dumps(log_payload))

        # Step 2: Detection Agent (Clustering / Verdict)
        update_pipeline_progress(sig_id_str, "PROCESSING", "detection_agent", 2, "RUNNING", "Deduplicating and running clustering algorithm...")
        res_detection = await Runner.run(detection_agent, json.dumps([processed_signal]))
        detection_output = json.loads(res_detection.final_output)
        logger.info(f"🔍 [Detection Agent] Verdict confirmed: {detection_output.get('confirmed')}")
        update_pipeline_progress(sig_id_str, "PROCESSING", "detection_agent", 2, "COMPLETED", "Verdict clustering run completed.")

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
            update_pipeline_progress(sig_id_str, "PROCESSING", "verification_agent", 3, "RUNNING", "Triggering verification sequence for low-confidence telemetry...")
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
            update_pipeline_progress(sig_id_str, "PROCESSING", "verification_agent", 3, "COMPLETED", "Verification sequence completed.")

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
            update_pipeline_progress(sig_id_str, "PROCESSING", "severity_agent", 4, "RUNNING", "Assessing structural threat levels and affected radius...")
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

            update_pipeline_progress(sig_id_str, "PROCESSING", "severity_agent", 4, "COMPLETED", "Crisis threat model established.", incident_id=incident_id)

            # ── Retroactive database correlation for pre-incident logs ──
            try:
                async with async_session_factory() as session:
                    # Reasoning logs
                    log_query = select(ReasoningLog).where(
                        ReasoningLog.incident_id == None,
                        ReasoningLog.created_at >= pipeline_start_time
                    )
                    res_logs = await session.execute(log_query)
                    logs_to_update = res_logs.scalars().all()
                    for log in logs_to_update:
                        log.incident_id = uuid.UUID(incident_id)
                        session.add(log)

                    # Chain of Thought logs
                    cot_query = select(ChainOfThought).where(
                        ChainOfThought.incident_id == None,
                        ChainOfThought.created_at >= pipeline_start_time
                    )
                    res_cots = await session.execute(cot_query)
                    cots_to_update = res_cots.scalars().all()
                    for cot in cots_to_update:
                        cot.incident_id = uuid.UUID(incident_id)
                        session.add(cot)

                    await session.commit()
                    logger.info(f"✨ Retroactively associated {len(logs_to_update)} logs and {len(cots_to_update)} CoT traces with incident {incident_id}")
            except Exception as correl_err:
                logger.error(f"⚠️ Failed to retroactively correlate logs: {correl_err}", exc_info=True)

            # Log Severity Agent step via Logging Agent!
            await Runner.run(logging_agent, json.dumps({
                "agent_name": "severity_agent",
                "agent_output": severity_output,
                "incident_id": incident_id,
                "timestamp": datetime.utcnow().isoformat()
            }))

            # Step 4: Resource Agent (Allocation)
            update_pipeline_progress(sig_id_str, "PROCESSING", "resource_allocation_agent", 5, "RUNNING", "Analyzing emergency pool resource availability...", incident_id=incident_id)
            resource_input = {**severity_output, "incident_id": incident_id}
            res_resource = await Runner.run(resource_agent, json.dumps(resource_input))
            resource_output = json.loads(res_resource.final_output)
            logger.info("🚒 [Resource Agent] Completed Allocation")
            update_pipeline_progress(sig_id_str, "PROCESSING", "resource_allocation_agent", 5, "COMPLETED", "Optimal resource allocation mapped.", incident_id=incident_id)

            # Log Resource Agent step via Logging Agent!
            await Runner.run(logging_agent, json.dumps({
                "agent_name": "resource_allocation_agent",
                "agent_output": resource_output,
                "incident_id": incident_id,
                "timestamp": datetime.utcnow().isoformat()
            }))

            # Step 5: Planning Agent (Create Tactical Action Plan!)
            update_pipeline_progress(sig_id_str, "PROCESSING", "planning_agent", 6, "RUNNING", "Formulating tactical action response steps...", incident_id=incident_id)
            planning_input = {**severity_output, "incident_id": incident_id, "allocations": resource_output.get("allocations", {})}
            res_planning = await Runner.run(planning_agent, json.dumps(planning_input))
            planning_output = json.loads(res_planning.final_output)
            logger.info("📋 [Planning Agent] Generated response actions in DB")
            update_pipeline_progress(sig_id_str, "PROCESSING", "planning_agent", 6, "COMPLETED", "Synchronized response action timeline saved.", incident_id=incident_id)

            # Log Planning Agent step via Logging Agent!
            await Runner.run(logging_agent, json.dumps({
                "agent_name": "planning_agent",
                "agent_output": planning_output,
                "incident_id": incident_id,
                "timestamp": datetime.utcnow().isoformat()
            }))

            # Step 6: Notification Agent (Stakeholder alerts)
            update_pipeline_progress(sig_id_str, "PROCESSING", "notification_agent", 6, "RUNNING", "Dispatching alert notifications to regional crisis networks...", incident_id=incident_id)
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
                "agent_output": {"status": "SUCCESS", "message": "All notifications dispatched to stakeholders."},
                "incident_id": incident_id,
                "timestamp": datetime.utcnow().isoformat()
            }))
            
            # 6. Mark as fully completed and confirmed!
            update_pipeline_progress(sig_id_str, "CONFIRMED", "notification_agent", 6, "COMPLETED", "Tactical plan complete. Public and local teams notified!", incident_id=incident_id)
            logger.info(f"✨ Pipeline completed successfully for incident: {incident_id}")
        else:
            logger.info("❌ [Detection Agent] Incident was NOT confirmed. Stopping pipeline execution.")
            update_pipeline_progress(sig_id_str, "REJECTED", "detection_agent", 2, "FAILED", "Telemetry was not confirmed as active flood hazard.")
    except Exception as e:
        logger.error(f"❌ Fatal Error running sequential production pipeline: {e}", exc_info=True)
        update_pipeline_progress(sig_id_str, "REJECTED", "signal_agent", 1, "FAILED", f"Orchestrator pipeline failed: {str(e)}")


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


@router.post("/mock", response_model=SignalRead, status_code=status.HTTP_201_CREATED)
async def trigger_mock_signal(
    *,
    session: AsyncSession = Depends(get_session),
    background_tasks: BackgroundTasks
):
    """
    Generate and ingest a highly realistic simulated mock signal in Islamabad.
    This enables seamless single-click live demonstrations without needing multiple physical devices!
    Triggers the sequential multi-agent orchestration pipeline instantly.
    """
    import random
    
    mock_locations = [
        {"location": "Block 18 Jauhar, Gulistan-e-Jauhar, Karachi", "lat": 24.9088, "lng": 67.1282, "comment": "Severe street inundation on Block 18 Main Road near Jauhar Chowrangi. Water entering ground floors!"},
    ]
    
    sources = ["weather_api", "traffic_api"]
    chosen_loc = random.choice(mock_locations)
    chosen_source = random.choice(sources)
    
    db_signal = Signal(
        source=chosen_source,
        type="flood",
        lat=chosen_loc["lat"],
        lng=chosen_loc["lng"],
        raw_payload={"comment": chosen_loc["comment"], "location_name": chosen_loc["location"]}
    )

    session.add(db_signal)
    await session.commit()
    await session.refresh(db_signal)
    
    # Trigger Triage Agent in background tasks
    signal_payload = {
        "source": db_signal.source,
        "type": db_signal.type,
        "lat": db_signal.lat,
        "lng": db_signal.lng,
        "raw_payload": db_signal.raw_payload,
        "signal_id": str(db_signal.id)
    }
    background_tasks.add_task(_run_triage_pipeline, signal_payload)
    
    return db_signal


@router.get("/{signal_id}/status")
async def get_signal_pipeline_status(
    signal_id: uuid.UUID,
    session: AsyncSession = Depends(get_session)
):
    """
    Get the real-time processing status and current stage of the multi-agent pipeline for a given signal.
    """
    sig_str = str(signal_id)
    if sig_str in pipeline_status_tracker:
        return pipeline_status_tracker[sig_str]

    # Graceful fallback: If in-memory state is missing (e.g. server restarted or old signal),
    # query the database to reconstruct the final state!
    db_sig = await session.get(Signal, signal_id)
    if not db_sig:
        raise HTTPException(
            status_code=404,
            detail="Signal not found"
        )

    # Reconstruct state: check if an incident exists
    from app.models.reasoning_logs import ReasoningLog
    query = select(ReasoningLog).where(
        ReasoningLog.agent_name == "signal_agent",
        ReasoningLog.incident_id != None
    ).order_by(ReasoningLog.created_at.desc()).limit(20)
    result = await session.execute(query)
    logs = result.scalars().all()
    
    if logs:
        for log in logs:
            if abs((log.created_at - db_sig.created_at).total_seconds()) < 600:
                return {
                    "signal_id": sig_str,
                    "incident_id": str(log.incident_id),
                    "status": "CONFIRMED",
                    "stage": "notification_agent",
                    "stage_index": 6,
                    "stage_status": "COMPLETED",
                    "message": "Tactical plan complete. Public and local teams notified! (Restored)",
                    "updated_at": log.created_at.isoformat()
                }

    # If it is older than 2 minutes and not confirmed, it was likely discarded/rejected.
    if (datetime.utcnow() - db_sig.created_at).total_seconds() > 120:
        return {
            "signal_id": sig_str,
            "incident_id": None,
            "status": "REJECTED",
            "stage": "detection_agent",
            "stage_index": 2,
            "stage_status": "FAILED",
            "message": "Telemetry not confirmed as active flood hazard.",
            "updated_at": db_sig.created_at.isoformat()
        }

    # Otherwise, return default PROCESSING state
    return {
        "signal_id": sig_str,
        "incident_id": None,
        "status": "PROCESSING",
        "stage": "signal_agent",
        "stage_index": 1,
        "stage_status": "RUNNING",
        "message": "Initializing multi-agent response team...",
        "updated_at": db_sig.created_at.isoformat()
    }


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

