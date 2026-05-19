# CIRO Multi-Crisis Expansion Report

> **Session Date:** May 19, 2026  
> **Author:** Uneeza (Backend Intelligence Lead)  
> **Status:** ✅ All 9/9 E2E Tests Passing — Pipeline Stable

---

## 1. Executive Summary

This report documents the expansion of the CIRO (Crisis Intelligence & Response Orchestrator) backend from a **single-crisis flood-only** system to a **multi-crisis platform** supporting both **Flood** and **Heatwave** disaster types. All changes have been validated through a comprehensive end-to-end live test suite against the production PostgreSQL database.

---

## 2. What Changed — File-by-File Breakdown

### 2.1 Database Schema

#### `backend/app/models/incidents.py`
**Change:** Added a new `disaster_type` column to the `Incident` ORM model.

```python
disaster_type: str = Field(
    default="flood",
    description="'flood' | 'heatwave' — extensible for future crisis types",
)
```

- Default value is `"flood"` to maintain backward compatibility with existing data.
- The column was injected into the live Neon PostgreSQL database using a migration script (`app/db/alter_db.py`) — zero downtime, no data loss.

#### `backend/app/models/schemas.py`
**Change:** Added `disaster_type` to the `IncidentRead` Pydantic response schema so the field is exposed via all API responses.

```python
class IncidentRead(BaseModel):
    ...
    disaster_type: str = "flood"
    ...
```

---

### 2.2 Weather Telemetry Tool

#### `backend/app/ai/tools/weather.py`
**Change:** Completely rewritten to return **dual-crisis weather data** — both rainfall metrics (for floods) and heat-specific metrics (for heatwaves).

**Before:** Returned only `intensity_mm_per_hr` and `duration_hrs` (flood only).

**After:** Returns a comprehensive weather payload based on geographic coordinates:

| Region | Mock Response | Key Fields |
|--------|--------------|------------|
| **Karachi** (lat 24.5–25.5) | Extreme Heat Advisory | `temperature_c: 46.2`, `heat_index_c: 54.1`, `humidity_pct: 74`, `power_outage_reported: true` |
| **Lahore** (lat 31.0–32.0) | Extreme Heat Warning | `temperature_c: 47.8`, `heat_index_c: 51.3`, `humidity_pct: 42` |
| **Islamabad** (default) | Heavy Rainfall Warning | `intensity_mm_per_hr: 28.4`, `duration_hrs: 2.5` |

This allows the Severity Agent to dynamically pick the correct fields based on the disaster type — rainfall for floods, Heat Index for heatwaves.

---

### 2.3 AI Agent Prompts (All 8 Agents)

#### `backend/app/ai/prompts.py`
**Change:** All 8 specialist agent system prompts were rewritten to include **dual-crisis branching logic**. Every agent now explicitly handles both `"flood"` and `"heatwave"` types.

#### Signal Agent (Step 1)
- Added **Type Identification** logic — automatically infers `"heatwave"` from `temperature_c > 40` or `heat_index_c > 45`.
- New heatwave input contract example added for weather API signals.

#### Detection Agent (Step 2)
- **Flood detection** uses 500m spatial clustering with GPS signals.
- **Heatwave detection** uses city-scale detection (5km radius) — heatwaves affect entire sectors, not point clusters.
- A single `weather_api` heatwave signal auto-confirms the incident.

#### Severity Agent (Step 3)
- Implemented **separate scoring rubrics** per disaster type:

| Flood Scoring Factor | Heatwave Scoring Factor |
|---------------------|------------------------|
| Rainfall intensity (mm/hr) | Heat Index (°C) |
| Road blockages | Power outage status |
| Drainage infrastructure | Vulnerable population exposure |
| Water depth estimates | UV Index severity |

- Heatwave critical threshold: Heat Index ≥ 50°C → Score 8–10.
- Flood critical threshold: Rainfall ≥ 30 mm/hr + road blockages → Score 8–10.

#### Resource Agent (Step 4)
- **Flood resources:** Ambulances, rescue boats, water pumps, sandbags.
- **Heatwave resources:** Hydration camps, cooling centers, mobile medical units, electrolyte kits.

#### Planning Agent (Step 5)
- **Flood actions:** `DISPATCH_RESCUE_TEAM`, `DEPLOY_WATER_PUMPS`, `REROUTE_TRAFFIC`, `EVACUATE_ZONE`.
- **Heatwave actions:** `OPEN_COOLING_CENTERS`, `DEPLOY_HYDRATION_CAMPS`, `ACTIVATE_HEAT_STROKE_TRIAGE`, `REQUEST_POWER_RESTORATION`.

#### Notification Agent (Step 6)
- **Flood notifications:** Flood alerts, evacuation orders, road closure notices.
- **Heatwave notifications:** Extreme heat alerts, power grid warnings, hospital heat stroke protocols.

#### Logging Agent (Step 7)
- Logs now include the `disaster_type` context so all reasoning traces are tagged.

#### Verification Agent (Step 8)
- Handles false alarm retraction for both crisis types.

---

### 2.4 Signal Ingestion Pipeline

#### `backend/app/api/api_v1/endpoints/signals.py`
**Changes:**

1. **Incident creation** now passes `disaster_type` from the signal payload:
   ```python
   db_incident = Incident(
       ...
       disaster_type=signal_payload.get("type", "flood"),
       ...
   )
   ```

2. **Mock signal injector** (`POST /api/v1/signals/mock`) expanded with 5 scenarios:
   - 2 Flood scenarios (Karachi Block 18, Islamabad G-10)
   - 3 Heatwave scenarios (Karachi Saddar, Lahore Anarkali, Karachi Burns Garden)
   - Each scenario includes type-specific telemetry in `raw_payload`.

---

### 2.5 Test Environment Fixes

#### `backend/pytest.ini` (NEW)
**Problem:** Running the async E2E test suite caused `RuntimeError: Event loop is closed` after the first test, crashing all subsequent tests.

**Root Cause:** Each test was creating and destroying its own asyncio event loop, but the shared PostgreSQL connection pool references the first loop. When that loop closes, all DB sessions fail.

**Fix:**
```ini
[pytest]
asyncio_mode = auto
asyncio_default_test_loop_scope = session
asyncio_default_fixture_loop_scope = session
```

This forces all tests to share a single event loop for the entire session — matching the real-world behavior of FastAPI's production server.

#### UTF-8 Encoding Fix
**Problem:** On Windows, the test runner crashed with `UnicodeEncodeError` when printing heatwave risk factors containing symbols like `≥`.

**Fix:** Tests must be run with:
```bash
$env:PYTHONIOENCODING='utf-8'; uv run pytest app/tests/test_full_pipeline_live.py -v
```

---

### 2.6 Database Migration Script

#### `backend/app/db/alter_db.py` (NEW)
A standalone async script that adds the `disaster_type` column to the live `incidents` table:

```python
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS disaster_type VARCHAR DEFAULT 'flood';
```

Safe to run multiple times (idempotent via `IF NOT EXISTS`).

---

### 2.7 File Organization Cleanup

**Moved to `app/tests/`:**
- `test_dashboard_apis.py`, `test_gemini.py`, `test_geocoding.py`
- `test_logging_agent.py`, `test_production_pipeline.py`
- `test_triage_run.py`, `test_user_signal.py`

**Moved to `app/db/`:**
- `alter_db.py`, `clear_db.py`, `check_db.py`, `print_tables.py`

**Removed (temporary scratch files):**
- `query_logs_output.txt`, `query_logs.py`, `query_signal.py`
- `check_active.py`, `check_logs.py`, `run_e2e_tests.py`, `run_triage_sync.py`

---

## 3. How It Works Now

### Complete Pipeline Flow (Multi-Crisis)

```
Signal Received (Flood or Heatwave)
        │
        ▼
┌─────────────────────┐
│   Signal Agent       │  Normalize → Assign credibility → Detect disaster type
│   (reverse_geocode)  │  GPS → "Saddar, Karachi" / type → "heatwave"
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│   Detection Agent    │  Flood: 500m clustering  │  Heatwave: city-scale (5km)
│   (news, traffic)    │  Confirm/Deny incident    │  Auto-confirm from weather_api
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│   Severity Agent     │  Flood: rainfall + road blockage scoring
│   (weather, traffic) │  Heatwave: Heat Index + UV + power outage scoring
│                      │  Output: severity_score (1-10), risk_factors[]
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│   Incident Created   │  disaster_type = "flood" | "heatwave"
│   (PostgreSQL)       │  severity_score, risk_factors, location, status
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│   Resource Agent     │  Flood: ambulances, boats, pumps
│   (allocate_resource)│  Heatwave: hydration camps, cooling centers, med units
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│   Planning Agent     │  Flood: DISPATCH_RESCUE, DEPLOY_PUMPS, EVACUATE_ZONE
│   (create_action)    │  Heatwave: OPEN_COOLING_CENTERS, DEPLOY_HYDRATION_CAMPS
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│   Notification Agent │  Flood: "FLOOD ALERT — Evacuate immediately"
│   (send_notification)│  Heatwave: "EXTREME HEAT ALERT — Seek shade and hydrate"
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│   Logging Agent      │  Persists full chain-of-thought to DB
│   (emit_log, CoT)    │  Broadcasts via WebSocket in real-time
└─────────────────────┘
```

---

## 4. Test Results

### E2E Live Pipeline Test (`app/tests/test_full_pipeline_live.py`)

**Command:**
```bash
$env:PYTHONIOENCODING='utf-8'; uv run pytest app/tests/test_full_pipeline_live.py -v
```

**Result: 9 Passed / 0 Failed ✅**

| # | Test Name | Status | Duration |
|---|-----------|--------|----------|
| 1 | `test_mock_signal_integrity` | ✅ PASSED | 0.02s |
| 2 | `test_geocoding_api` | ✅ PASSED | 1.23s |
| 3 | `test_traffic_api` | ✅ PASSED | 0.89s |
| 4 | `test_news_api` | ✅ PASSED | 1.44s |
| 5 | `test_signal_agent_live` | ✅ PASSED | 8.12s |
| 6 | `test_full_karachi_pipeline` | ✅ PASSED | ~135s |
| 7 | `test_verification_agent_retraction` | ✅ PASSED | ~12s |
| 8 | `test_lahore_edge_case_pipeline` | ✅ PASSED | ~90s |
| 9 | `test_simulation_engine` | ✅ PASSED | 6.05s |

**Total Execution Time:** ~260.58 seconds

### Key Heatwave Validations from Karachi Scenario:
- **Severity Score:** 8.8/10 (Critical) — correctly identified Heat Index > 50°C
- **Risk Factors:** Active power outage, Heat Index ≥ 50°C, Schools open during peak hours
- **Resource Allocation:** Hydration camps and cooling centers (not rescue boats)
- **Notifications:** 6 heatwave-specific messages including "EXTREME HEAT ALERT" and "Heat stroke triage protocol"
- **Simulation Engine:** Lifecycle transitions SENT → ACTIVE → ON_SITE → COMPLETED verified

---

## 5. Known Issues & Future Work

| Issue | Priority | Notes |
|-------|----------|-------|
| `datetime.utcnow()` deprecation warnings | Low | Replace with `datetime.now(datetime.UTC)` post-hackathon |
| Weather tool uses mock data | Expected | Production would integrate OpenWeatherMap API |
| Frontend `disaster_type` rendering | Next | Dashboard needs dynamic color coding (red=heatwave, blue=flood) |

---

## 6. API Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/signals/` | Ingest raw signal → triggers pipeline |
| `POST` | `/api/v1/signals/mock` | One-click mock signal (random flood/heatwave) |
| `POST` | `/api/v1/signals/inject` | Custom signal with city and comment |
| `GET` | `/api/v1/incidents/active` | All confirmed incidents |
| `GET` | `/api/v1/incidents/{id}` | Single incident detail (includes `disaster_type`) |
| `GET` | `/api/v1/incidents/{id}/logs` | AI reasoning logs |
| `GET` | `/api/v1/incidents/{id}/cot` | Chain-of-thought traces |
| `GET` | `/api/v1/incidents/{id}/actions` | Tactical actions per incident |
| `GET` | `/api/v1/dashboard/stats` | KPI counters |
| `GET` | `/api/v1/dashboard/agent-workforce` | Live agent states |
| `GET` | `/api/v1/dashboard/global-timeline` | Cross-incident log feed |
| `GET` | `/api/v1/resources/` | Emergency resource pool |
| `POST` | `/api/v1/simulation/trigger/{id}` | Trigger action lifecycle |
| `GET` | `/api/v1/simulation/state/{id}` | Current action statuses |
| `WS` | `/api/v1/ws/{incident_id}` | Real-time log streaming |

---

> **Conclusion:** The CIRO backend is now a fully functional multi-crisis orchestration engine. The pipeline correctly identifies, triages, and responds to both flood and heatwave emergencies with crisis-specific logic at every agent step. All 9 E2E tests pass with zero failures.
