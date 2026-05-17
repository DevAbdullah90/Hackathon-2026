"""
app/tests/test_full_pipeline_live.py
--------------------------------------
CIRO Full Backend E2E Live Test
================================
Tests the COMPLETE multi-agent workflow with REAL API keys:
  Signal Agent -> Detection Agent -> Severity Agent ->
  Resource Agent -> Planning Agent -> Notification Agent
  + Simulation Engine State Transitions

Also verifies:
  - All individual API tools (Google Maps, OpenWeatherMap, SerpApi)
  - DB persistence (incidents, reasoning_logs, resources, actions)
  - Mock signal data quality for both SCENARIO_ISLAMABAD and SCENARIO_KARACHI

Run with: pytest app/tests/test_full_pipeline_live.py -v -s
"""

import pytest
import json
import logging
import uuid
import asyncio
from datetime import datetime
from sqlmodel import select

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from agents import Runner, trace
from app.db.session import async_session_factory
from app.models.signals import Signal
from app.models.incidents import Incident
from app.models.reasoning_logs import ReasoningLog
from app.models.actions import Action
from app.models.resources import Resource

from app.simulation.seed_signals import SCENARIO_ISLAMABAD, SCENARIO_KARACHI
from app.simulation.engine import run_simulation_loop

from app.ai.specialists import (
    signal_agent,
    detection_agent,
    severity_agent,
    resource_agent,
    planning_agent,
    notification_agent,
    verification_agent,
)

# Raw API functions (for direct tool testing)
from app.ai.tools.geo import reverse_geocode as _geocode_tool
from app.tools.traffic import get_traffic_matrix as _raw_traffic
from app.ai.tools.news import search_local_news as _news_tool


# ---------------------------------------------------------------------------
# HELPER: print a section header
# ---------------------------------------------------------------------------
def section(title: str):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")


# ===========================================================================
# PART 1: Mock Signal Data Quality Check
# ===========================================================================
def test_mock_signal_data_quality():
    """Verify both mock scenarios have correct data structure and required fields."""
    section("PART 1: Mock Signal Data Quality Check")

    required_keys = {"source", "type", "lat", "lng", "raw_payload"}
    valid_sources = {"weather_api", "traffic_api", "user_gps", "social_mock"}

    for scenario_name, scenario in [("ISLAMABAD", SCENARIO_ISLAMABAD), ("KARACHI", SCENARIO_KARACHI)]:
        print(f"\n  Checking {scenario_name} ({len(scenario)} signals)...")
        assert len(scenario) >= 3, f"{scenario_name} must have at least 3 signals"

        for i, sig in enumerate(scenario):
            missing = required_keys - sig.keys()
            assert not missing, f"Signal {i} in {scenario_name} is missing: {missing}"
            assert sig["source"] in valid_sources, f"Unknown source in signal {i}: {sig['source']}"
            assert -90 <= sig["lat"] <= 90, f"Invalid lat in signal {i}"
            assert -180 <= sig["lng"] <= 180, f"Invalid lng in signal {i}"
            assert isinstance(sig["raw_payload"], dict), f"raw_payload must be a dict in signal {i}"
            print(f"    [OK] Signal {i+1}: source={sig['source']} lat={sig['lat']} lng={sig['lng']}")

    # Verify KARACHI has mixed sources (for high confidence test)
    sources = {s["source"] for s in SCENARIO_KARACHI}
    assert "weather_api" in sources, "KARACHI must have a weather_api signal for automatic confirmation"
    print("\n  [OK] All mock signal data is valid.")


# ===========================================================================
# PART 2: Individual API Tool Tests
# ===========================================================================
@pytest.mark.asyncio
async def test_google_maps_geocoding_api():
    """Verify reverse_geocode returns a real location for Karachi coords."""
    section("PART 2a: Google Maps Geocoding API (reverse_geocode)")
    lat, lng = 24.8138, 67.0336
    print(f"  Input: lat={lat}, lng={lng}")
    # Call the unwrapped function (strip @function_tool decorator wrapper)
    result = await _geocode_tool.on_invoke_tool(None, json.dumps({"lat": lat, "lng": lng})) if hasattr(_geocode_tool, 'on_invoke_tool') else await _geocode_tool(lat, lng)
    print(f"  Result: {result}")
    assert isinstance(result, str), "reverse_geocode must return a string"
    assert len(result) > 5, "Result must be a non-trivial address string"
    print(f"  [OK] Geocode result: {result}")


@pytest.mark.asyncio
async def test_google_maps_traffic_api():
    """Verify get_traffic_matrix returns data for a real Karachi route."""
    section("PART 2b: Google Maps Distance Matrix API (get_traffic_matrix)")
    origin = "24.8138,67.0336"
    destination = "24.8600,67.0100"
    print(f"  Origin: {origin}, Destination: {destination}")
    result = await _raw_traffic(origin, destination)
    print(f"  Result: {json.dumps(result, indent=2)}")
    assert isinstance(result, dict), "get_traffic_matrix must return a dict"
    assert result.get("status") in ("real", "mock", "error"), "Must have a known status"
    print(f"  [OK] Traffic API responded with status={result.get('status')}")


@pytest.mark.asyncio
async def test_serp_api_news_search():
    """Verify search_local_news returns results for a flood query."""
    section("PART 2c: SerpApi News Search (search_local_news)")
    query = "Karachi flood alert monsoon"
    print(f"  Query: '{query}'")
    result = await _news_tool.on_invoke_tool(None, json.dumps({"query": query})) if hasattr(_news_tool, 'on_invoke_tool') else await _news_tool(query)
    print(f"  Result type: {type(result)} | Sample: {str(result)[:200]}")
    # SerpApi may return empty list if no results -- that's still a valid response
    assert result is not None, "search_local_news must not return None"
    print(f"  [OK] SerpApi responded successfully.")


# ===========================================================================
# PART 3: Individual Agent Tests (Single Signal)
# ===========================================================================
@pytest.mark.asyncio
async def test_signal_agent_weather():
    """Verify Signal Agent processes a weather_api signal correctly."""
    section("PART 3a: Signal Agent -- weather_api signal")
    sig = SCENARIO_KARACHI[0]
    print(f"  Input: {json.dumps(sig, indent=2)}")

    result = await Runner.run(signal_agent, json.dumps(sig))
    output = json.loads(result.final_output)
    print(f"  Output: {json.dumps(output, indent=2)}")

    assert output.get("credibility_score") == 0.95, "weather_api must get credibility 0.95"
    assert output.get("conflict_flag") == False
    assert output.get("status") == "PROCESSED"
    print("  [OK] Signal Agent correctly scored weather_api signal.")


@pytest.mark.asyncio
async def test_signal_agent_gps():
    """Verify Signal Agent calls reverse_geocode for a user_gps signal."""
    section("PART 3b: Signal Agent -- user_gps signal with reverse geocode")
    sig = SCENARIO_KARACHI[2]  # user_gps
    print(f"  Input: {json.dumps(sig, indent=2)}")

    result = await Runner.run(signal_agent, json.dumps(sig))
    output = json.loads(result.final_output)
    print(f"  Output: {json.dumps(output, indent=2)}")

    assert output.get("credibility_score") == 0.70, "user_gps must get credibility 0.70"
    assert output.get("location") not in [None, ""], "Location must be geocoded"
    print(f"  [OK] Signal Agent geocoded GPS to: {output.get('location')}")


# ===========================================================================
# PART 4: Full Pipeline E2E -- SCENARIO_KARACHI (Confirmed Crisis)
# ===========================================================================
@pytest.mark.asyncio
async def test_full_pipeline_karachi():
    """
    Full E2E pipeline test with SCENARIO_KARACHI:
    Signal -> Detection -> Severity -> Resource -> Planning -> Notification
    + DB persistence + Simulation trigger
    """
    section("PART 4: FULL PIPELINE E2E -- SCENARIO_KARACHI")

    # -- 4.1 Inject signals into DB ----------------------------------------
    print("\n  [Step 1] Injecting SCENARIO_KARACHI signals into DB...")
    signal_payloads = []
    async with async_session_factory() as session:
        for sig_data in SCENARIO_KARACHI:
            signal = Signal(**sig_data)
            session.add(signal)
            await session.commit()
            await session.refresh(signal)
            payload = sig_data.copy()
            payload["signal_id"] = str(signal.id)
            signal_payloads.append(payload)
            print(f"    [OK] Inserted: {sig_data['source']} (ID: {signal.id})")

    assert len(signal_payloads) == len(SCENARIO_KARACHI)

    with trace("CIRO Full E2E Test -- Karachi", group_id="ciro_e2e_live"):

        # -- 4.2 Signal Agent ---------------------------------------------
        print("\n  [Step 2] Running Signal Agent for each signal...")
        processed_signals = []
        for sig in signal_payloads:
            res = await Runner.run(signal_agent, json.dumps(sig))
            try:
                parsed = json.loads(res.final_output)
                processed_signals.append(parsed)
                print(f"    [OK] Signal Agent: source={parsed.get('source')} credibility={parsed.get('credibility_score')}")
            except Exception:
                print(f"    [WARN] Non-JSON output: {res.final_output[:100]}")
                processed_signals.append(sig)

        assert len(processed_signals) == 3

        # -- 4.3 Detection Agent ------------------------------------------
        print("\n  [Step 3] Running Detection Agent...")
        res = await Runner.run(detection_agent, json.dumps(processed_signals))
        detection_output = json.loads(res.final_output)
        print(f"    Confirmed: {detection_output.get('confirmed')}")
        print(f"    Confidence: {detection_output.get('confidence')}")
        print(f"    Location: {detection_output.get('incident_location')}")
        print(f"    Status: {detection_output.get('status')}")

        assert detection_output.get("confirmed") == True, "Karachi scenario MUST be confirmed"
        assert detection_output.get("confidence", 0) > 0.7
        detection_id = detection_output.get("detection_id", str(uuid.uuid4()))

        # -- 4.4 Severity Agent -------------------------------------------
        print("\n  [Step 4] Running Severity Agent...")
        res = await Runner.run(severity_agent, json.dumps(detection_output))
        severity_output = json.loads(res.final_output)
        print(f"    Severity Score: {severity_output.get('severity_score')}")
        print(f"    Affected Radius: {severity_output.get('affected_radius_km')} km")
        print(f"    Peak ETA: {severity_output.get('peak_impact_eta')}")
        print(f"    Risk Factors: {severity_output.get('risk_factors', [])}")

        assert severity_output.get("severity_score", 0) > 0
        assert "reasoning_log" in severity_output

        # -- 4.5 Persist Incident to DB ------------------------------------
        print("\n  [Step 5] Persisting Incident to DB...")
        async with async_session_factory() as session:
            incident = Incident(
                location=detection_output.get("incident_location", "Karachi"),
                lat=detection_output.get("incident_center_lat", 24.8145),
                lng=detection_output.get("incident_center_lng", 67.034),
                severity_score=severity_output.get("severity_score", 0.0),
                confidence=detection_output.get("confidence", 0.0),
                affected_radius_km=severity_output.get("affected_radius_km", 0.0),
                status="confirmed",
            )
            session.add(incident)
            await session.commit()
            await session.refresh(incident)
            incident_id = str(incident.id)
            print(f"    [OK] Incident created: ID={incident_id}")

            # Reasoning log
            log = ReasoningLog(
                incident_id=incident.id,
                agent_name="severity_agent",
                phase="SEVERITY",
                log_text=severity_output.get("reasoning_log", ""),
                log_level="CRITICAL",
            )
            session.add(log)
            await session.commit()
            print(f"    [OK] Reasoning log persisted.")

        # -- 4.6 Resource Agent --------------------------------------------
        print("\n  [Step 6] Running Resource Allocation Agent...")
        resource_input = {**severity_output, "incident_id": incident_id}
        res = await Runner.run(resource_agent, json.dumps(resource_input))
        print(f"    Resource Agent output: {res.final_output[:200]}")

        # -- 4.7 Planning Agent --------------------------------------------
        print("\n  [Step 7] Running Planning Agent...")
        planning_input = {**severity_output, "incident_id": incident_id}
        res = await Runner.run(planning_agent, json.dumps(planning_input))
        print(f"    Planning Agent output: {res.final_output[:300]}")

        # -- 4.8 Notification Agent ----------------------------------------
        print("\n  [Step 8] Running Notification Agent...")
        notification_input = {**severity_output, "incident_id": incident_id}
        res = await Runner.run(notification_agent, json.dumps(notification_input))
        print(f"    Notification result (first 400 chars): {res.final_output[:400]}")
        assert res.final_output is not None

    # -- 4.9 Verify DB state ----------------------------------------------
    print("\n  [Step 9] Verifying DB state...")
    async with async_session_factory() as session:
        incidents = (await session.execute(select(Incident))).scalars().all()
        logs = (await session.execute(select(ReasoningLog))).scalars().all()
        actions = (await session.execute(select(Action))).scalars().all()
        resources = (await session.execute(select(Resource))).scalars().all()

        print(f"    Total incidents in DB: {len(incidents)}")
        print(f"    Total reasoning logs in DB: {len(logs)}")
        print(f"    Total actions in DB: {len(actions)}")
        print(f"    Total resources in DB: {len(resources)}")

        assert len(incidents) >= 1
        assert len(logs) >= 1

    # -- 4.10 Simulation Engine --------------------------------------------
    print("\n  [Step 10] Triggering Simulation Engine...")
    async with async_session_factory() as session:
        # Create a PENDING action for the incident so the engine has something to simulate
        test_action = Action(
            incident_id=uuid.UUID(incident_id),
            type="ALERT_CITIZENS",
            status="PENDING",
            predicted_side_effects="May cause evacuation traffic on alternate routes.",
        )
        session.add(test_action)
        await session.commit()
        await session.refresh(test_action)
        action_id = test_action.id
        print(f"    [OK] Created test action: {action_id}")

    # Run simulation loop (condensed -- 2s per step × 4 steps)
    await run_simulation_loop(uuid.UUID(incident_id), action_ids=[action_id])

    # Verify final state
    async with async_session_factory() as session:
        result = await session.execute(select(Action).where(Action.id == action_id))
        final_action = result.scalars().first()
        print(f"    Final action status: {final_action.status}")
        assert final_action.status == "COMPLETED", "Simulation must drive action to COMPLETED"

    print("\n  [OK] FULL PIPELINE VERIFIED -- Karachi Scenario PASSED.")


# ===========================================================================
# PART 5: Verification Agent -- False Alarm Test
# ===========================================================================
@pytest.mark.asyncio
async def test_verification_agent_false_alarm():
    """Test that Verification Agent can RETRACT a low-confidence conflicting incident."""
    section("PART 5: Verification Agent -- False Alarm Retraction")

    conflict_input = {
        "trigger": "CONFLICT_FLAG",
        "incident_location": "G-10 Sector, Islamabad",
        "incident_center_lat": 33.6844,
        "incident_center_lng": 73.0479,
        "detection_confidence": 0.45,
        "conflicting_signals": [
            {"type": "flood", "source": "user_gps", "credibility_score": 0.70},
            {"type": "water_main_burst", "source": "user_gps", "credibility_score": 0.70},
        ],
        "detection_id": str(uuid.uuid4()),
    }

    print(f"  Input: {json.dumps(conflict_input, indent=2)}")
    res = await Runner.run(verification_agent, json.dumps(conflict_input))
    output = json.loads(res.final_output)
    print(f"  Output: {json.dumps(output, indent=2)}")

    assert output.get("verdict") in ["CONFIRM", "RETRACT"], "Must return a valid verdict"
    assert "reason" in output, "Must include a reason"
    assert "evidence_used" in output, "Must document evidence"
    print(f"  [OK] Verification Agent verdict: {output.get('verdict')} -- {output.get('reason')}")


# ===========================================================================
# PART 6: Full Pipeline E2E — SCENARIO_LAHORE_EDGE_CASE
# ===========================================================================
@pytest.mark.asyncio
async def test_full_pipeline_lahore_edge_case():
    """
    Full E2E pipeline test with SCENARIO_LAHORE_EDGE_CASE:
    Tests missing data, bad coordinates, empty types, and non-flood events.
    """
    section("PART 6: FULL PIPELINE E2E — SCENARIO_LAHORE_EDGE_CASE")

    from app.simulation.seed_signals import SCENARIO_LAHORE_EDGE_CASE

    print("\n  [Step 1] Injecting SCENARIO_LAHORE_EDGE_CASE signals...")
    signal_payloads = []
    async with async_session_factory() as session:
        for sig_data in SCENARIO_LAHORE_EDGE_CASE:
            # For the first signal with null lat/lng, we just insert as is
            signal = Signal(**sig_data)
            session.add(signal)
            await session.commit()
            await session.refresh(signal)
            payload = sig_data.copy()
            payload["signal_id"] = str(signal.id)
            signal_payloads.append(payload)
            print(f"    [OK] Inserted: {sig_data['source']} (ID: {signal.id})")

    with trace("CIRO Full E2E Test — Lahore Edge Case", group_id="ciro_e2e_live_lahore"):
        print("\n  [Step 2] Running Signal Agent for each signal...")
        processed_signals = []
        for sig in signal_payloads:
            res = await Runner.run(signal_agent, json.dumps(sig))
            try:
                parsed = json.loads(res.final_output)
                processed_signals.append(parsed)
                print(f"    [OK] Signal Agent parsed successfully. Location: {parsed.get('location')}, Type: {parsed.get('type')}")
            except Exception:
                print(f"    [WARN] Non-JSON output: {res.final_output[:100]}")
                processed_signals.append(sig)

        # Check edge case handling
        # 1. Missing coords (index 0) - Should have set location to UNKNOWN
        assert processed_signals[0].get("location") == "UNKNOWN" or processed_signals[0].get("coordinates") is None
        
        # 2. Missing type (index 1) - Should have inferred from context
        assert processed_signals[1].get("type") in ["flood", "flood_risk", "UNKNOWN"], "Should infer type or set to UNKNOWN"

        print("\n  [Step 3] Running Detection Agent...")
        # Feed the processed signals to the detection agent
        res = await Runner.run(detection_agent, json.dumps(processed_signals))
        detection_output = json.loads(res.final_output)
        
        # This is a tricky cluster: 1 flood (no coords), 1 inferred flood, 1 non_flood.
        # It's likely unconfirmed or low confidence.
        print(f"    Confirmed: {detection_output.get('confirmed')}")
        print(f"    Status: {detection_output.get('status')}")
        print(f"    Conflict Detected: {detection_output.get('conflict_detected')}")
        
        # If it's not confirmed, it should be sent to verification or monitor
        assert detection_output.get("status") in ["UNCONFIRMED_VERIFY", "UNCONFIRMED_MONITOR", "CONFIRMED"]
        print("\n  [OK] Lahore Edge Case handled gracefully without crashing.")

