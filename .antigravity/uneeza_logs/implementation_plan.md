================================================================================
  CIRO — Phase 2 Intelligence Layer
  Implementation Plan — Uneeza Ismail
  Agent Engineer & Prompt Tuning
================================================================================

Owner           : Uneeza Ismail (Agent Engineer & Prompt Tuning)
Phase           : 2 — Intelligence Layer
Created At      : 2026-05-15T16:54:00Z
Last Updated    : 2026-05-15T17:05:00Z
Log Directory   : d:\Hackathon-2026\.antigravity\uneeza_logs\

================================================================================
SCOPE CLARIFICATION
================================================================================

Abdullah has already defined all 5 specialist agents correctly in
backend/app/ai/agent_definitions.py with the correct system prompts
(imported from prompts.py) and the correct tool registrations.

  signal_agent       → tools: [reverse_geocode]
  detection_agent    → tools: [search_local_news, get_traffic_matrix]
  severity_agent     → tools: [get_weather_alerts, get_traffic_matrix]
  verification_agent → tools: [search_local_news, get_traffic_matrix]
  logging_agent      → tools: (none)

NO new agent files need to be created. The agents are correct as-is.

Current State (Phase 1 output, by Abdullah):
  [✅] FastAPI project structure initialized
  [✅] POST /api/v1/signals endpoint with deduplication
  [✅] Signal ORM model + Pydantic schemas
  [✅] All 5 agent system prompts written (prompts.py)
  [✅] All 5 Uneeza agents defined in agent_definitions.py (correct)
  [✅] Tool function stubs created (geo, news, traffic, weather) — all `pass`

Remaining Work (Uneeza Phase 2):
  [ ] Implement geo.py + news.py (Uneeza's tools)
  [ ] Create 3 missing DB models (incidents, reasoning_logs, actions)
  [ ] Fix 2 bugs in existing Signal model + schemas
  [ ] Connect agent pipeline to signals endpoint

================================================================================
PHASE 1 — FOUNDATION (3 agents run in parallel)
================================================================================

--------------------------------------------------------------------------------
Workstream A — Tool Implementation
Log: .antigravity/uneeza_logs/task-001-geo-news-tools.log
--------------------------------------------------------------------------------

STATUS: [x] Done — 2026-05-15T17:27:24Z

  [x] TASK A1 — backend/app/ai/tools/geo.py
      Function : reverse_geocode(lat: float, lng: float) -> str
      API      : Google Geocoding API
      Key      : settings.GOOGLE_MAPS_SERVER_KEY (from app.core.config)
      URL      : https://maps.googleapis.com/maps/api/geocode/json
      Extract  : results[0]["formatted_address"]
      Library  : httpx.AsyncClient (v0.28.0, already installed)
      Timeout  : 10 seconds
      On Fail  : return "UNKNOWN — manual review required" (never raise)
      Used By  : signal_agent (already registered in agent_definitions.py)

  [x] TASK A2 — backend/app/ai/tools/news.py
      Function : search_local_news(query: str) -> list
      API      : SerpApi (Google Search wrapper)
      Key      : settings.SERP_API_KEY (from app.core.config)
      URL      : https://serpapi.com/search.json
      Params   : num=5, hl=en, gl=pk
      Extract  : response_json.get("organic_results", [])
      Returns  : list of {"title": ..., "snippet": ..., "link": ...}
      Timeout  : 10 seconds
      On Fail  : return [] (empty list, never raise)
      Used By  : detection_agent, verification_agent (already registered)

--------------------------------------------------------------------------------
Workstream B — Database Models
Log: .antigravity/uneeza_logs/task-002-db-models.log
--------------------------------------------------------------------------------

STATUS: [x] COMPLETED — 2026-05-15T17:27:10Z

Pattern: Follow backend/app/models/signals.py exactly.
         Use SQLModel, Field, Column(JSON), uuid, datetime.

  [x] TASK B1 — backend/app/models/incidents.py
      Model    : Incident   |   Table: "incidents"
      Purpose  : Stores every confirmed flood cluster

      id                   : uuid.UUID        PK, default_factory=uuid.uuid4
      location             : str              e.g. "G-10 Sector, Islamabad"
      lat                  : float            centroid latitude
      lng                  : float            centroid longitude
      severity_score       : Optional[float]  default None — Severity Agent
      confidence           : Optional[float]  default None — Detection Agent
      affected_radius_km   : Optional[float]  default None
      estimated_population : Optional[int]    default None — backend computes,
                                              NOT the agent (agent outputs null)
      peak_impact_eta      : Optional[str]    e.g. "45 mins"
      status               : str              default "monitoring"
                                              "monitoring"|"confirmed"|
                                              "resolved"|"retracted"
      risk_factors         : Optional[Dict]   sa_column=Column(JSON)
      created_at           : datetime         default_factory=datetime.utcnow

  [x] TASK B2 — backend/app/models/reasoning_logs.py
      Model    : ReasoningLog   |   Table: "reasoning_logs"
      Purpose  : Stores Logging Agent Markdown for the Reasoning Console

      id          : uuid.UUID          PK, default_factory=uuid.uuid4
      incident_id : Optional[uuid.UUID] default None (null before confirmation)
      agent_name  : str                 e.g. "signal_agent", "detection_agent"
      log_text    : str                 full Markdown string from Logging Agent
      log_level   : str                 default "INFO"
                                        Backend inference rule (NOT agent):
                                          severity >= 8 OR verdict=RETRACT → CRITICAL
                                          severity >= 5 OR confidence < 0.75 → WARNING
                                          else → INFO
      created_at  : datetime            default_factory=datetime.utcnow

  [x] TASK B3 — backend/app/models/actions.py
      Model    : Action   |   Table: "actions"
      Purpose  : Stores response actions created by Planning Agent

      id                    : uuid.UUID        PK, default_factory=uuid.uuid4
      incident_id           : uuid.UUID        non-optional FK to incidents
      type                  : str              "ALERT_CITIZENS" |
                                               "REROUTE_TRAFFIC" |
                                               "DISPATCH_DRAINAGE"
      status                : str              default "PENDING"
                                               "PENDING"|"SENT"|"ACTIVE"|
                                               "ON_SITE"|"COMPLETED"
      predicted_side_effects: Optional[str]    free text from Planning Agent
      metadata              : Optional[Dict]   sa_column=Column(JSON)
      updated_at            : datetime         default_factory=datetime.utcnow

--------------------------------------------------------------------------------
Workstream C — Model Bug Fixes
Log: .antigravity/uneeza_logs/task-003-model-fixes.log
--------------------------------------------------------------------------------

STATUS: [x] COMPLETE — 2026-05-15T17:26:11Z

  [x] TASK C1 — Fix backend/app/models/signals.py (2 bugs)

      Bug 1 — Missing 'type' column:
        Problem: Signal ORM model has no 'type' field but SignalCreate sends
                 one. The signal type is silently dropped on every insert.
        Fix    : Add field →
                 type: Optional[str] = Field(default=None,
                     description="flood | flood_risk | traffic_blockage |
                                  non_flood | UNKNOWN")

      Bug 2 — Non-nullable lat/lng:
        Problem: Weather and Traffic signals have no GPS coordinates. The
                 current float (non-nullable) columns cause a DB insert error
                 for every non-GPS signal type.
        Fix    : Change to →
                 lat: Optional[float] = Field(default=None)
                 lng: Optional[float] = Field(default=None)

  [x] TASK C2 — Fix backend/app/models/schemas.py

      Problem: SignalRead uses id: Any and created_at: Any — unsafe types
               that will cause serialization issues downstream. The new
               'type' field added to the ORM model is also missing.
      Fix    : Replace SignalRead with:
               id: uuid.UUID
               source: str
               lat: Optional[float] = None
               lng: Optional[float] = None
               type: Optional[str] = None
               location: Optional[str] = None
               credibility_score: Optional[float] = None
               created_at: datetime

================================================================================
PHASE 2 — PIPELINE WIRING (1 agent)
================================================================================

--------------------------------------------------------------------------------
Workstream A — Connect Agent Pipeline to API
Log: .antigravity/uneeza_logs/task-004-pipeline-wiring.log
--------------------------------------------------------------------------------

STATUS: [x] COMPLETE — 2026-05-15T17:31:42Z

  [x] TASK A1 — Fix duplicate signal response bug
      File   : backend/app/api/api_v1/endpoints/signals.py
      Problem: Duplicate detection block returns ORM object with HTTP 201.
               Spec requires HTTP 200 with {"status": "DUPLICATE", ...}.
      Fix    :
        from fastapi.responses import JSONResponse
        if existing_signal:
            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={"status": "DUPLICATE", "action": "DISCARDED",
                         "signal_id": str(existing_signal.id)}
            )

  [x] TASK A2 — Connect Triage Agent to signals endpoint
      File   : backend/app/api/api_v1/endpoints/signals.py
      Problem: Lines 71–73 contain a TODO comment — the pipeline is never
               triggered after a signal is saved to the DB.
      Fix    :
        import asyncio, json
        from agents import Runner
        from app.ai.agent_definitions import triage_agent
        from app.ai.connection import config

        signal_payload = signal_in.model_dump()
        asyncio.create_task(
            Runner.run(triage_agent, json.dumps(signal_payload),
                       run_config=config)
        )
      Pattern: asyncio.create_task() — non-blocking, API returns 201
               immediately while agent runs in background.

  [x] TASK A3 — Verify import chain for circular dependency
      Check  : app.api → imports → app.ai is safe (one direction only).
               If risk detected, move imports inside the function body.

================================================================================
FILE CHECKLIST
================================================================================

Phase 1 (3 parallel workstreams):
  [x] backend/app/ai/tools/geo.py           ← implement reverse_geocode()
  [x] backend/app/ai/tools/news.py          ← implement search_local_news()
  [x] backend/app/models/incidents.py       ← Incident SQLModel table
  [x] backend/app/models/reasoning_logs.py  ← ReasoningLog SQLModel table
  [x] backend/app/models/actions.py         ← Action SQLModel table
  [x] backend/app/models/signals.py         ← add type col + Optional lat/lng
  [x] backend/app/models/schemas.py         ← proper types on SignalRead

Phase 2 (1 workstream):
  [x] backend/app/api/api_v1/endpoints/signals.py  ← bug fix + agent connect

================================================================================
NOT IN UNEEZA'S SCOPE
================================================================================

  backend/app/ai/tools/traffic.py      ← Quratulain — get_traffic_matrix()
  backend/app/ai/tools/weather.py      ← Quratulain — get_weather_alerts()
  backend/app/ai/agent_definitions.py  ← Abdullah — Triage Agent (CORRECT, LEAVE UNTOUCHED)
  backend/app/ai/prompts.py            ← Abdullah — All prompts (CORRECT, LEAVE UNTOUCHED)
  backend/app/simulation/engine.py     ← Quratulain — Simulation Engine
  backend/app/ai/agents/ (directory)   ← NOT NEEDED — agents already in agent_definitions.py

================================================================================
LOG FILES TO BE CREATED BY AGENTS
================================================================================

  .antigravity/uneeza_logs/task-001-geo-news-tools.log   ← Phase 1, Agent 1
  .antigravity/uneeza_logs/task-002-db-models.log        ← Phase 1, Agent 2
  .antigravity/uneeza_logs/task-003-model-fixes.log      ← Phase 1, Agent 3
  .antigravity/uneeza_logs/task-004-pipeline-wiring.log  ← Phase 2, Agent 1

================================================================================
END OF IMPLEMENTATION PLAN
================================================================================
