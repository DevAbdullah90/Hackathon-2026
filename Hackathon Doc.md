# 🌊 Urban Flood Response Orchestrator
### Crisis Intelligence & Response Orchestrator (CIRO)
**Built for the Google Antigravity Hackathon — Challenge 3**

---

## 📌 What Is This Project?

Urban flooding in Pakistani metropolitans (Islamabad, Karachi, Lahore) is handled with slow, fragmented, and reactive systems. Emergency responders don't have a unified view of the situation and cannot coordinate in real time.

This project is an **Agentic AI System** — not just a dashboard — that:

1. **Ingests** signals from multiple sources (social media, weather, traffic).
2. **Detects** whether a real flood crisis is forming by clustering signals.
3. **Reasons** about the severity and impact using an AI Multi-Agent pipeline.
4. **Plans** a coordinated response (rerouting, alerts, emergency dispatch).
5. **Simulates** the execution of those actions so judges can see the outcome.
6. **Visualizes** the before-vs-after impact on a live mobile map.

---

## 🌧️ The Two Scenarios We Handle

The system handles **two distinct levels** of urban flooding. Both feed into the same AI pipeline but are triggered differently.

---

### 🟡 Scenario 1 — Local Flooding ("Ghar ke Bahar Pani")
> *"There's water outside my house from a blocked gutter or overflowing drain."*

**How it works (User-triggered):**
- The citizen opens the app and taps the **"Report Flood"** button.
- The app **automatically attaches GPS coordinates** — no typing, no address needed.
- Backend receives: `{ lat: 33.6844, lng: 73.0479, type: "flood", source: "user_gps" }`
- System marks it as a **Signal** and starts monitoring the area.

**Escalation Rule:**
A single report = just a complaint. The AI does NOT act on one person alone.
If **3+ people within 500m** report within 30 minutes → Detection Agent declares a **Confirmed Cluster**.

**What the AI does NOT do here:**
- It does **not** look at satellite imagery to see water (requires NASA/Google infrastructure — not feasible for this hackathon).
- It does **not** monitor street cameras automatically.

> Think of it like Google Maps "Report an accident" — one tap, GPS-based, powerful when multiple people confirm the same spot.

---

### 🔴 Scenario 2 — Major Flood / Selab (City-Wide Crisis)
> *"An entire sector is flooding — this is a full selab."*

**How it works (Fully automatic — no user action needed):**
The system runs **background monitoring** 24/7 and wakes up when:
- **Weather API** → *"Red Alert — Heavy Rainfall in G-10 Islamabad"*
- **Traffic API** → *"Speed = 0 km/h across all G-10 roads"*
- **News/Search API** → *"Flash flood reported in G-10"*

When signals align, the Triage Agent escalates to **Crisis Level** automatically — no citizen needs to tap anything.

---

### 🔁 How Both Scenarios Connect (The Smart Escalation)

Both scenarios feed the same AI pipeline and can **escalate into each other**:

```
[Scenario 1]  3 GPS reports from citizens in G-10
                          +
[Scenario 2]  Weather: Heavy Rain | Traffic: 0 km/h | News: Flood confirmed
                          ↓
Detection Agent: "Combined signals confirmed. Upgrading to CITY-WIDE CRISIS."
                          ↓
Severity Agent: Score = 9/10 (Hospital 200m, Rain continues 2hrs)
                          ↓
Planning Agent: Reroute + Citizen Alerts + Emergency Dispatch
```

| | **Scenario 1 — Local** | **Scenario 2 — Selab** |
|--|----------------------|----------------------|
| **Trigger** | Citizen taps "Report Flood" | Weather + Traffic + News APIs (auto) |
| **Who starts it** | A person | Nobody — background monitoring |
| **Scale** | 1 street / neighborhood | Entire sector or city |
| **Severity Score** | `3–6 / 10` | `7–10 / 10` |
| **AI Response** | Local alert, monitor drainage | Full dispatch: rerouting + emergency + city-wide alert |
| **Can escalate?** | YES → if many reports, upgrades to Selab level | N/A — already at maximum |

---

## 🧑‍💻 Team

| Name | Role | GitHub Handle |
|------|------|---------------|
| **Abdullah (Leader)** | AI Architect & Backend Lead | `DevAbdullah90` |
| **Uneeza Ismail** | Agent Engineer & Prompt Tuning | — |
| **Ayesha Aziz** | Frontend Lead (React Native) | — |
| **Quratulain Shah** | Simulation Engine & Database | — |

---

## 🏗️ High-Level System Architecture

```
[Signal Sources]                [AI Agent Pipeline]            [User Interface]
────────────────────────        ─────────────────────          ────────────────
GPS User Report (App Tap)  ──►  Triage/Orchestrator Agent ──►  Mobile App (Expo)
Weather API (Real)         ──►  Signal Agent                   Live Map View
Traffic API (Mock)         ──►  Detection Agent                Reasoning Console
Mock Social Media (Demo)   ──►  Severity Agent                 Simulation View
                                Planning Agent          ──►  WebSocket Push
                                Simulation Agent        ──►  PostgreSQL (Neon)
                                Logging Agent           ──►  FastAPI Backend
```

### Signal Sources Explained

| Source | How It Works | Text Parsing Needed? |
|--------|-------------|---------------------|
| **GPS User Report** | User taps "Report Flood" in app. GPS coordinates attach automatically. | **No** — coordinates are exact. |
| **Weather API** | Background fetch every 5 mins from OpenWeatherMap. | No — structured JSON. |
| **Traffic API** | Background fetch from Google Maps Distance Matrix. | No — structured JSON. |
| **Mock Social Media** | Pre-written script injects demo signals during presentation. | Optional — for demo realism. |

### How Data Flows End-to-End (GPS-First Approach)

```
Step 1: User opens app → Prompted for Location Permission → GRANTED
         ↓
Step 2: User sees flooding on their street. They tap "Report Flood" button.
        → App automatically attaches GPS: { lat: 33.6844, lng: 73.0479 }
        → No typing required. No language parsing needed.
         ↓
Step 3: FastAPI receives POST /api/v1/signals:
        { "lat": 33.6844, "lng": 73.0479, "type": "flood", "source": "user_report" }
         ↓
Step 4: Triage Agent (Orchestrator) wakes up. Calls Signal Agent.
         ↓
Step 5: Signal Agent structures the GPS signal into a full incident record:
        { "location": "G-10 Sector, Islamabad", "coordinates": [33.6844, 73.0479],
          "type": "flood", "source": "user_gps", "confidence": 0.90 }
        (Reverse geocoding converts GPS → human-readable area name)
         ↓
Step 6: In parallel, background services also send signals automatically:
        → Weather API: "Heavy rainfall alert for G-10 sector"
        → Traffic API: "Speed = 0 km/h on main G-10 road"
         ↓
Step 7: Triage hands off to Detection Agent
         ↓
Step 8: Detection Agent clusters all signals by GPS proximity (500m radius):
        → 3 user GPS reports within 500m + Traffic congestion = CLUSTER FOUND
        → "Are 3+ signals within 500m in the last 30 mins?" → YES
        → Declares CONFIRMED INCIDENT. Stores in `incidents` table.
        → NO: Marks as "Monitoring". Waits for more GPS reports.
         ↓
Step 9: Triage hands off to Severity Agent
         ↓
Step 10: Severity Agent calls get_weather_alerts() and get_traffic_matrix()
         → Queries: "What is within 500m of [33.6844, 73.0479]?"
         → Finds: Hospital 200m away, Primary School 300m away
         → Calculates severity_score: 8.5/10
         → Reasoning Log: "GPS cluster at G-10. Hospital 200m. Rain +2hrs. Score = 8.5"
         ↓
Step 11: Triage hands off to Planning Agent
         ↓
Step 12: Planning Agent calls get_traffic_matrix() and generate_ticket()
         → Uses GPS coordinates to find best alternate routes mathematically
         → Creates 3 actions: ALERT_NEARBY_USERS, REROUTE_TRAFFIC, DISPATCH_DRAINAGE
         → Stores all actions in `actions` table with status = PENDING
         → "Alert all users within 2km GPS radius"
         ↓
Step 13: Simulation Engine (background task) starts the state machine:
         T+0s:  ALERT_NEARBY_USERS  → status = SENT (push notifications)
         T+30s: REROUTE_TRAFFIC     → status = ACTIVE (Map polylines update)
         T+60s: DISPATCH_DRAINAGE   → status = ON_SITE
         ↓
Step 14: WebSocket pushes updates to Ayesha's Mobile App
         → Red flood polygon appears at exact GPS cluster location
         → Reasoning Console scrolls with agent logs
         → Execution Timeline progresses step by step
         ↓
Step 15: Final screen shows OUTCOME:
         "50 vehicles saved. Congestion reduced by 60%. Community SAFE."
```

---

## 🤖 The Multi-Agent System (Detailed)

The system uses the **OpenAI Agents SDK** with the **Triage/Handoff Pattern**. The Orchestrator is the center of a "Star Model" — every specialist reports back to it.

### Agent Registry Overview

| Agent | Owner | Trigger | Key Output |
|-------|-------|---------|------------|
| Triage Agent | Abdullah | Every new signal | Handoff decision |
| Signal Agent | Uneeza | New raw signal | Structured JSON + credibility score |
| Detection Agent | Uneeza | Signal cluster | Confirmed/Unconfirmed + confidence |
| Severity Agent | Uneeza | Confirmed incident | Severity score 1–10 + risk factors |
| Resource Allocation Agent | Abdullah | Severity score | Resource assignment across incidents |
| Planning Agent | Abdullah | Resource assigned | Action list (PENDING) |
| Verification Agent | Uneeza | Conflicting signals | Confirm/retract incident |
| Notification Agent | Quratulain | Plan activated | 6 tailored stakeholder messages |
| Logging Agent | Uneeza | Any agent activity | Human-readable reasoning logs |

---

### Agent 1: Triage Agent (Orchestrator)
- **Owner**: Abdullah
- **Role**: The "Manager." Does not do analysis itself. Reads the current state and decides which specialist to call next. Also manages **multi-crisis prioritization** — compares all active incidents and routes resources accordingly.
- **Handoffs**: `[signal_agent, detection_agent, severity_agent, resource_allocation_agent, planning_agent, verification_agent, notification_agent]`
- **Key Logic**: If `detection_agent` returns `confidence < 0.5` → mark as "Unconfirmed" and call `verification_agent`. If two incidents are active simultaneously → call `resource_allocation_agent` before `planning_agent`.

### Agent 2: Signal Agent (Signal Processor + Credibility Scorer)
- **Owner**: Uneeza
- **Role**: Normalizes all incoming signals into a unified format AND assigns a **credibility score** to each signal based on source reliability.
- **Credibility Scoring Rules**:
  - Official Weather API → `credibility: 0.95`
  - Google Maps Traffic → `credibility: 0.90`
  - GPS citizen report → `credibility: 0.70`
  - Mock social media post → `credibility: 0.50`
  - Contradicting signal (e.g., field report says "water main") → `credibility: FLAGGED_CONFLICT`
- **Input (GPS)**: `{ "lat": 33.6844, "lng": 73.0479, "type": "flood", "source": "user_gps" }`
- **Output**: `{ "location": "G-10 Sector", "coordinates": [33.6844, 73.0479], "type": "flood", "credibility_score": 0.70, "conflict_flag": false }`
- **Tools Used**: `reverse_geocode()`

### Agent 3: Detection Agent (Incident Detector)
- **Owner**: Uneeza
- **Role**: Clusters signals by GPS proximity to confirm a real crisis. Uses weighted credibility scores — a high-credibility Weather API signal counts more than a single citizen tap.
- **Logic**: `weighted_confidence = sum(credibility_scores) / signal_count`. If `weighted_confidence > 0.75` AND 3+ signals within 500m → CONFIRMED.
- **Tools Used**: `search_local_news()`, `get_traffic_matrix()`
- **Output**: `{ "confirmed": true, "confidence": 0.92, "incident_center": "G-10 Sector", "conflict_detected": false }`

### Agent 4: Severity Agent (Risk Analyzer)
- **Owner**: Uneeza
- **Role**: Scores severity 1–10. Also predicts affected radius, population, duration, and peak impact time.
- **Scoring Rubric**: Hospital within 500m = +3pts | School within 300m = +2pts | Rain > 2hrs = +2pts | Traffic fully blocked = +2pts | Residential density high = +1pt
- **Tools Used**: `get_weather_alerts()`, `get_traffic_matrix()`
- **Output**: `{ "severity_score": 8.5, "affected_radius_km": 1.2, "estimated_population": 4500, "peak_impact_eta": "45 mins", "risk_factors": ["Hospital 200m", "Rain +2hrs"] }`

### Agent 5: Resource Allocation Agent (NEW — Multi-Crisis Coordinator)
- **Owner**: Abdullah
- **Role**: The key agent for multi-crisis handling. Checks the `resources` table for available units and allocates them across all active incidents based on severity, urgency, and travel time.
- **Multi-Crisis Logic** (Two Floods Example):
  - G-10 Flood: severity 9.0 → needs 2 rescue teams, 1 ambulance
  - G-13 Flood: severity 6.0 → needs 1 rescue team
  - Available: 2 rescue teams, 1 ambulance
  - Decision: *"G-10 gets both rescue teams and ambulance. G-13 placed on WATCHLIST — drainage crew dispatched only."*
- **Tools Used**: `get_available_resources()`, `get_traffic_matrix()` (for travel time to incident)
- **Output**: `{ "G-10": { "rescue_teams": 2, "ambulance": 1 }, "G-13": { "rescue_teams": 0, "drainage_crew": 1, "status": "WATCHLIST" } }`

### Agent 6: Planning Agent (Response Planner)
- **Owner**: Abdullah
- **Role**: Creates specific action tasks based on the resource allocation decision.
- **Decision Logic**: If `severity >= 8` → full dispatch. If `severity 5–7` → alerts + drainage only. If `severity < 5` → monitoring only.
- **Side Effect Prediction**: For each action, predicts unintended consequences.
  - Action: "Send public alert to 50,000 people" → Side effect: *"May cause evacuation congestion on alternate routes. Recommend staged alerting."*
- **Tools Used**: `get_traffic_matrix()`, `generate_ticket()`, `trigger_simulation()`
- **Output**: Action list with `predicted_side_effects` field per action.

### Agent 7: Verification Agent (False Alarm Handler — NEW)
- **Owner**: Uneeza
- **Role**: Activated when `conflict_flag = true` or `confidence < 0.6`. Attempts to verify or refute the incident using additional signals.
- **Example**: Signal says "flood" but 1 field report says "water main burst."
  - Verification Agent calls `search_local_news()` and `get_traffic_matrix()`.
  - If traffic is flowing normally → *"Reclassify as water main. Retract flood alert. Notify utility company."*
  - If traffic is blocked → *"Maintain flood classification. Ignore conflicting field report."*
- **Output**: `{ "verdict": "RETRACT" | "CONFIRM", "reason": "...", "retract_alert": true }`

### Agent 8: Notification Agent (Stakeholder Communicator — NEW)
- **Owner**: Quratulain
- **Role**: Generates **6 tailored messages** for different stakeholders based on incident type, severity, and location.
- **Message Templates**:
  1. **Public**: *"⚠️ Flood alert in G-10. Avoid main boulevard. Use G-9 alternate route."*
  2. **Hospital (PIMS)**: *"Prepare 5 trauma/hypothermia beds. Flood victims may arrive in 20–40 mins."*
  3. **Utility Company**: *"Water main suspected at G-10 Sector 5 junction. Dispatch inspection team."*
  4. **Traffic Authority**: *"Activate alternate routing: G-10 main boulevard → G-9 service road."*
  5. **Emergency Services (1122)**: *"Deploy 2 rescue teams to GPS: 33.6844, 73.0479. Incident ID: INC-001."*
  6. **Command Center/Media**: *"Crisis Level 9 declared. G-10 Urban Flood. 4,500 residents affected. Response activated."*
- **Tools Used**: `send_notification(stakeholder, message)` (mock function)

### Agent 9: Logging Agent (Explainability Layer)
- **Owner**: Uneeza
- **Role**: Converts every agent's "thinking" into human-readable Markdown logs for the UI Reasoning Console.
- **Output**: Scrollable log entries displayed in real-time in the mobile app.

---

## 🛠️ Agent Tool Functions (Function Calling)

These are Python functions registered as "tools" for the agents:

```python
# tools/weather.py (Owner: Quratulain)
async def get_weather_alerts(location: str) -> dict:
    """Fetches real-time precipitation and weather alerts from OpenWeatherMap."""
    # Calls OpenWeatherMap API for the given location
    pass

# tools/traffic.py (Owner: Quratulain)
async def get_traffic_matrix(origin: str, destination: str) -> dict:
    """Gets travel time and congestion level between two points via Google Maps."""
    # Calls Google Maps Distance Matrix API
    pass

# tools/search.py (Owner: Uneeza)
async def search_local_news(query: str) -> list:
    """Searches for local news about road blockages or floods using SerpApi."""
    # Calls SerpApi (Google Search wrapper)
    pass

# tools/simulation.py (Owner: Quratulain)
async def trigger_simulation(incident_id: str, actions: list) -> str:
    """Starts the background simulation loop for a confirmed flood incident."""
    # Starts a FastAPI BackgroundTask that updates action statuses
    pass

# tools/dispatch.py (Owner: Quratulain)
async def generate_ticket(incident_id: str, type: str) -> dict:
    """Creates a mock emergency service ticket (drainage, ambulance, etc.)."""
    # Inserts into the `tickets` table and returns a ticket ID
    pass
```

---

## 📱 Frontend (Ayesha's Domain — React Native + Expo)

### Screens & Their Purpose

| Screen | File | Purpose |
|--------|------|---------|
| **Home / Dashboard** | `Dashboard.tsx` | Shows active incidents count, severity, and a list of recent alerts. Entry point for the demo. |
| **Live Map** | `FloodMap.tsx` | Google Maps view. Shows Red flood heatmap polygon, Green reroute polylines, and incident markers. |
| **AI Reasoning Center** | `ReasoningCenter.tsx` | Scrollable list of agent logs. Shows the AI's "Chain of Thought" in real-time. |
| **Simulation View** | `SimView.tsx` | Execution timeline showing action statuses (PENDING → ACTIVE → COMPLETED). Includes a "Before vs After" slider. |
| **Outcome Screen** | `OutcomeScreen.tsx` | Final impact card. Shows vehicles saved, congestion reduced, and community status. |

### Key Components

| Component | Purpose |
|-----------|---------|
| `LiveLogStream.tsx` | Auto-scrolling agent log list, updated via WebSocket. |
| `MapOverlay.tsx` | Draws flood polygon and reroute polylines on Google Maps. |
| `SeverityBadge.tsx` | Color-coded badge (Red/Orange/Green) based on `severity_score`. |
| `ExecutionTimeline.tsx` | Step-by-step tracker showing action progress (like a package tracker). |

### Data Connection to Backend
- **Polling**: App fetches `GET /api/v1/incidents/active` every 5 seconds.
- **WebSocket**: When an incident is selected, app opens `WS /api/v1/ws/{incident_id}` to stream live logs.

---

## 🗄️ Database Schema (Quratulain's Domain — PostgreSQL/Neon)

```sql
-- Table 1: All incoming raw signals (with credibility score)
CREATE TABLE signals (
    id UUID PRIMARY KEY,
    source VARCHAR(50),           -- 'user_gps', 'weather_api', 'traffic_api', 'social_mock'
    lat FLOAT,
    lng FLOAT,
    location VARCHAR(100),
    raw_payload JSONB,
    credibility_score FLOAT,      -- 0.0 to 1.0 assigned by Signal Agent
    conflict_flag BOOLEAN DEFAULT FALSE,
    structured_json JSONB,        -- normalized output from Signal Agent
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table 2: Confirmed flood incidents
CREATE TABLE incidents (
    id UUID PRIMARY KEY,
    location VARCHAR(100),
    lat FLOAT,
    lng FLOAT,
    severity_score FLOAT,
    confidence FLOAT,
    affected_radius_km FLOAT,     -- predicted by Severity Agent
    estimated_population INT,     -- predicted by Severity Agent
    peak_impact_eta VARCHAR(50),  -- e.g. '45 mins'
    status VARCHAR(50),           -- 'monitoring', 'confirmed', 'resolved', 'retracted'
    risk_factors JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table 3: Constrained resources pool
CREATE TABLE resources (
    id UUID PRIMARY KEY,
    type VARCHAR(100),            -- 'rescue_team', 'ambulance', 'drainage_crew', 'police_unit'
    total_count INT,
    available_count INT,
    assigned_to_incident UUID REFERENCES incidents(id),
    location VARCHAR(100),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table 4: Response actions per incident
CREATE TABLE actions (
    id UUID PRIMARY KEY,
    incident_id UUID REFERENCES incidents(id),
    type VARCHAR(100),            -- 'ALERT_CITIZENS', 'REROUTE_TRAFFIC', 'DISPATCH_DRAINAGE'
    status VARCHAR(50),           -- 'PENDING', 'SENT', 'ACTIVE', 'ON_SITE', 'COMPLETED'
    predicted_side_effects TEXT,  -- e.g. 'May cause evacuation congestion'
    metadata JSONB,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table 5: Stakeholder notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    incident_id UUID REFERENCES incidents(id),
    stakeholder VARCHAR(100),     -- 'public', 'hospital', 'utility', 'traffic_auth', 'emergency_services', 'command_center'
    message TEXT,
    sent_at TIMESTAMP DEFAULT NOW()
);

-- Table 6: Agent reasoning logs
CREATE TABLE reasoning_logs (
    id UUID PRIMARY KEY,
    incident_id UUID REFERENCES incidents(id),
    agent_name VARCHAR(100),
    log_text TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🌐 API Reference (FastAPI Backend)

### Signal Ingestion
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/signals` | Submit a new raw signal (tweet, weather alert, traffic spike). Triggers the agent pipeline. |
| `GET` | `/api/v1/signals` | List all received signals. |

### Incidents
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/incidents/active` | Get all confirmed, active flood incidents. |
| `GET` | `/api/v1/incidents/{id}` | Get full details of a single incident including actions. |

### Simulation
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/simulation/trigger/{incident_id}` | Manually start the simulation loop for an incident. |
| `GET` | `/api/v1/simulation/state/{incident_id}` | Get current state of all actions in the simulation. |

### WebSocket
| Method | Endpoint | Description |
|--------|----------|-------------|
| `WS` | `/api/v1/ws/{incident_id}` | Live stream of reasoning logs and action status updates. |

---

## 🔌 External APIs

| API | Provider | Type | Owner | Key Env Variable |
|-----|----------|------|-------|-----------------|
| Maps (Rendering) | Google Maps JS API | **Real** | Ayesha | `EXPO_PUBLIC_GOOGLE_MAPS_KEY` |
| Directions & Traffic | Google Maps Distance Matrix | **Real** | Quratulain | `GOOGLE_MAPS_SERVER_KEY` |
| Weather Alerts | OpenWeatherMap | **Real** | Quratulain | `OPENWEATHER_API_KEY` |
| News Search | SerpApi | **Real** | Uneeza | `SERP_API_KEY` |
| AI Brain | Gemini 2.0 Flash | **Real** | Abdullah | `GEMINI_API_KEY` |
| Social Media | Local Mock Script | **Mock** | Quratulain | N/A |
| Emergency Dispatch | Internal Mock Function | **Mock** | Quratulain | N/A |

---

## 📂 Project Folder Structure

```
urban-flood-orchestrator/
│
├── backend/                        # Abdullah & Quratulain
│   ├── app/
│   │   ├── main.py                 # FastAPI entry point, routes registration
│   │   ├── agents/
│   │   │   ├── orchestrator.py     # Triage Agent + Handoff Logic (Abdullah)
│   │   │   ├── signal_agent.py     # Signal cleaning agent (Uneeza)
│   │   │   ├── detection_agent.py  # Incident detection agent (Uneeza)
│   │   │   ├── severity_agent.py   # Risk scoring agent (Uneeza)
│   │   │   └── planning_agent.py   # Response planning agent (Abdullah)
│   │   ├── tools/
│   │   │   ├── weather.py          # get_weather_alerts() (Quratulain)
│   │   │   ├── traffic.py          # get_traffic_matrix() (Quratulain)
│   │   │   ├── search.py           # search_local_news() (Uneeza)
│   │   │   ├── simulation.py       # trigger_simulation() (Quratulain)
│   │   │   └── dispatch.py         # generate_ticket() (Quratulain)
│   │   ├── simulation/
│   │   │   └── engine.py           # Background state machine (Quratulain)
│   │   ├── models/
│   │   │   └── schemas.py          # Pydantic models for all data
│   │   ├── db/
│   │   │   └── database.py         # PostgreSQL connection (Quratulain)
│   │   └── routes/
│   │       ├── signals.py          # /api/v1/signals
│   │       ├── incidents.py        # /api/v1/incidents
│   │       ├── simulation.py       # /api/v1/simulation
│   │       └── websocket.py        # /api/v1/ws
│   ├── mock_data/
│   │   ├── mock_signals.json       # Pre-written signal scenarios for demo (Quratulain)
│   │   └── inject_signals.py       # Script to push signals during demo
│   └── requirements.txt
│
└── frontend/                       # Ayesha
    ├── app/
    │   ├── index.tsx               # Dashboard / Home screen
    │   ├── map.tsx                 # Live Map screen
    │   ├── reasoning.tsx           # AI Reasoning Console
    │   ├── simulation.tsx          # Simulation + Timeline view
    │   └── outcome.tsx             # Final outcome screen
    ├── components/
    │   ├── LiveLogStream.tsx
    │   ├── MapOverlay.tsx
    │   ├── SeverityBadge.tsx
    │   └── ExecutionTimeline.tsx
    ├── lib/
    │   └── api.ts                  # All API and WebSocket calls to backend
    └── package.json
```

---

## 🗓️ Development Phases

### Phase 1: Foundation (Day 1)
- **Quratulain**: Setup PostgreSQL (Neon), create all 4 tables, test connection.
- **Ayesha**: Initialize Expo app, configure Google Maps, build base `FloodMap.tsx`.
- **Abdullah**: Create FastAPI project, build the `/api/v1/signals` endpoint.
- **Uneeza**: Write the first draft of all 5 agent system prompts.

### Phase 2: Intelligence (Day 2)
- **Abdullah**: Implement the Triage Agent with `handoffs` using OpenAI Agents SDK.
- **Uneeza**: Integrate prompts into `signal_agent.py`, `detection_agent.py`.
- **Quratulain**: Build `engine.py` simulation loop and all 5 tool functions.
- **Ayesha**: Build `ReasoningCenter.tsx` and `ExecutionTimeline.tsx`.

### Phase 3: Integration (Day 3 Morning)
- **All**: Connect Frontend WebSocket to Backend. Test the full pipeline with mock signals.
- **Abdullah**: Write `inject_signals.py` demo script for live presentation.
- **Ayesha**: Build the `OutcomeScreen.tsx` with final impact numbers.

### Phase 4: Polish & Demo Prep (Day 3 Afternoon)
- **All**: Fix bugs, polish UI, prepare 5-minute demo script.
- **Abdullah**: Prepare the live demo scenario: Inject 3 signals → Show reasoning → Activate simulation → Show outcome.

---

## 🚀 How to Run the Project

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate       # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npx expo start
```

### Inject Mock Signals (Demo)
```bash
cd backend
python mock_data/inject_signals.py
```

---

## 🏆 Demo Script (For Judges)

### Option A: GPS Live Demo (Most Impressive)
1. **Open** the app on 3 phones/simulators. Show the empty map — no incidents.
2. **Tap** "Report Flood" on Phone 1 → GPS coordinates attach automatically.
3. **Tap** "Report Flood" on Phone 2 and Phone 3 (same GPS area).
4. **Watch** the "AI Reasoning Console" scroll — agents detect the GPS cluster.
5. **See** the Red flood polygon appear at the exact GPS location on the map.
6. **Click** "Activate Plan" — the Simulation begins automatically.
7. **Watch** the Execution Timeline: Alert Sent → Traffic Rerouted → Drainage Dispatched.
8. **See** the Green alternate route polyline draw itself on the map in real-time.
9. **Navigate** to Outcome: *"Community Safe. 50 vehicles saved. Congestion -60%."*

### Option B: Script Demo (Backup / Faster)
```bash
cd backend
python mock_data/inject_signals.py   # Injects 3 GPS signals + weather alert
```
This instantly triggers the full pipeline without needing 3 physical phones.

---

## ⚡ Multi-Crisis Scenario (Two Simultaneous Floods)

This is the key stress-test scenario required by the challenge judges.

### The Setup
```
T+0s : G-10 Flood detected → Severity 9.0/10
        Signals: 3 GPS reports + Weather Red Alert + Traffic blocked
        Resources needed: 2 rescue teams + 1 ambulance

T+30s: G-13 Flood detected → Severity 6.0/10
        Signals: 2 GPS reports + Traffic slowdown
        Resources needed: 1 rescue team

Available resources: 2 rescue teams, 1 ambulance, 1 drainage crew
```

### What the Resource Allocation Agent Decides
```
Resource Allocation Agent reasoning:
"Two active incidents detected.
 G-10: severity 9.0 — critical. Hospital 200m away. Rain continuing.
 G-13: severity 6.0 — moderate. No critical infrastructure nearby.

 Available: 2 rescue teams, 1 ambulance.
 Decision: Assign both rescue teams + ambulance to G-10.
           Assign drainage crew to G-13.
           Place G-13 on WATCHLIST — escalate if severity rises above 7."
```

### What the UI Shows
- **Map**: Two red polygons — G-10 (large, dark red) and G-13 (smaller, orange)
- **Dashboard**: Active Incidents: 2 | Resources Deployed: 3/3 (100% utilized)
- **Reasoning Console**: Side-by-side log of both incident pipelines
- **Resource Panel**: Live bar showing rescue teams, ambulance, drainage crew assignment

---

## 🔄 False Alarm & Retraction Flow

Required by the challenge: *"Simulate a false alarm and show verification, correction, and alert retraction."*

### Scenario: Field Report Contradicts GPS Signals
```
Step 1: 3 GPS reports say "flood" in G-10 → Detection Agent: CONFIRMED (confidence: 0.80)
Step 2: Field report arrives: "Only a water main burst — road is damp but not flooded."
Step 3: conflict_flag = TRUE → Triage calls Verification Agent
Step 4: Verification Agent checks:
        → Traffic API: Road speed is 15 km/h (not 0) → not fully blocked
        → News search: No flood reports in official channels
        → Verdict: RETRACT flood classification
Step 5: Actions taken:
        → Incident status updated to 'retracted'
        → Public flood alert retracted: "Update: G-10 alert cancelled. Road clear."
        → Utility Company notified: "Water main burst at G-10 Sector 5. Please dispatch."
        → Rescue teams recalled. Drainage crew remains on site.
        → Reasoning log updated with retraction reason.
```

---

## 🛡️ Robustness & Fallback Strategy

| Failure Scenario | Fallback Behavior |
|---|---|
| OpenWeatherMap API down | Use last cached weather data (max 30 min stale) |
| Google Maps API rate limit | Use static road database for alternate routes |
| Duplicate GPS reports (same device) | Deduplicate by device ID within 5-minute window |
| Missing GPS coordinates | Prompt user to confirm location manually on map |
| Signal with no location | Flag as `location_unknown`, hold in queue for 10 mins |
| All resources exhausted | Alert Command Center. Place new incidents in priority queue. |

---

## 📊 Baseline Comparison

| Metric | Without AI (Manual) | With CIRO (Agentic) |
|---|---|---|
| Time to detect crisis | 15–30 minutes (human operator) | ~45 seconds (automated pipeline) |
| Signal sources fused | 1 (phone call) | 4+ simultaneously |
| Resource allocation | Manual whiteboard | Automated optimization across 2+ crises |
| Stakeholder notifications | Manual calls | 6 tailored messages in seconds |
| False alarm handling | Hours to retract | Automated retraction in <2 minutes |
| Multi-crisis coordination | Sequential (1 at a time) | Parallel with trade-off analysis |

---

## 💰 Cost & Latency Analysis

| Operation | Estimated Cost | Latency |
|---|---|---|
| Gemini 2.0 Flash (per pipeline run) | ~$0.01–0.02 | ~2–4 seconds |
| OpenWeatherMap API (per call) | Free tier (1000 calls/day) | ~300ms |
| Google Maps Distance Matrix | ~$0.005 per call | ~200ms |
| SerpApi (per search) | ~$0.01 | ~500ms |
| Full pipeline (signal → action) | ~$0.05 per incident | ~8–12 seconds |
| **Scaling to 100 incidents/day** | **~$5/day** | Parallel workers reduce to ~3s |

---

## 🔒 Privacy & Safety Note

- **GPS data** from citizen reports is stored for a maximum of **24 hours**, then anonymized.
- **No personal identifiers** are collected. Reports are linked to coordinates only, not user accounts.
- **Public alerts** use staged delivery (2km radius first) to prevent panic-driven congestion.
- **All mock data** is clearly labeled `source: "mock"` and contains no real personal information.
- **False alarm retractions** are logged permanently for accountability and system improvement.

---

## 📏 Scalability Discussion

- **10x scale** (10 simultaneous incidents): Add agent worker pool. FastAPI async handles concurrency natively. PostgreSQL connection pooling via `pgbouncer`.
- **100x scale** (city-wide crisis): Introduce message queue (Redis/RabbitMQ) between signal ingestion and agent pipeline. Horizontal scaling of FastAPI via Docker containers.
- **Multi-city**: Each city gets its own `city_id` namespace in the database. Agent prompts include city-specific context.

---

## ⚠️ Limitations

- System requires internet connectivity. No offline mode.
- GPS accuracy is limited to ~5 meters. May mislocate incidents on narrow streets.
- Satellite/camera-based water detection is NOT implemented (requires NASA-level infrastructure).
- Social media signals are mocked. Real Twitter/X API requires paid tier.
- Resource allocation model uses simple priority scoring — not a full linear programming optimizer.
- All emergency dispatch is simulated. No real 1122/emergency service integration.

---

*Built with Google Antigravity | CIRO Challenge 3 | 2026*

---

## ✅ Team Task Breakdown — Flat Task List

> Rule: **Tool functions follow their agent owner.** Each person is fully responsible for their tasks end-to-end.

---

### 👑 Abdullah — AI Architect & Backend Lead

- [ ] Initialize FastAPI project structure (`backend/app/main.py`, `requirements.txt`)
- [ ] Setup `.env` file with all API keys (`GEMINI_API_KEY`, `GOOGLE_MAPS_SERVER_KEY`, `OPENWEATHER_API_KEY`, `SERP_API_KEY`)
- [ ] Create `POST /api/v1/signals` endpoint — accepts GPS + source payload, saves to `signals` table
- [ ] Create `GET /api/v1/incidents/active` endpoint — returns all confirmed active incidents
- [ ] Create `GET /api/v1/incidents/{id}` endpoint — returns full incident detail with actions
- [ ] Create `POST /api/v1/simulation/trigger/{incident_id}` endpoint — manually starts simulation
- [ ] Create `WS /api/v1/ws/{incident_id}` WebSocket endpoint — streams live logs to frontend
- [ ] Implement **Triage Agent** in `agents/orchestrator.py` using OpenAI Agents SDK
- [ ] Define Triage Agent `handoffs` list: `[signal_agent, detection_agent, severity_agent, resource_allocation_agent, planning_agent, verification_agent, notification_agent]`
- [ ] Add confidence-check logic: if `confidence < 0.5` → do NOT call planning, mark as "Monitoring"
- [ ] Add multi-crisis routing: if 2+ active incidents → call `resource_allocation_agent` before `planning_agent`
- [ ] Implement **Resource Allocation Agent** in `agents/resource_allocation_agent.py`
- [ ] Implement `tools/resources.py` → `get_available_resources()` — queries `resources` table for available units
- [ ] Add Resource Allocation logic: compare severity scores of active incidents, assign units to highest priority
- [ ] Output allocation decision: `{ "G-10": { rescue_teams: 2, ambulance: 1 }, "G-13": { drainage_crew: 1, status: "WATCHLIST" } }`
- [ ] Implement **Planning Agent** in `agents/planning_agent.py`
- [ ] Implement `tools/dispatch.py` → `generate_ticket(incident_id, type)` — creates mock emergency ticket in DB
- [ ] Add Planning Agent decision logic: severity ≥ 8 → full dispatch; severity 5–7 → alerts + drainage; severity < 5 → monitor
- [ ] Add `predicted_side_effects` output per action (e.g. "Alert may cause evacuation congestion")
- [ ] Store all `Action` objects in `actions` table with `status = PENDING`
- [ ] Connect Planning Agent output to `trigger_simulation()` call **[JOINT with Quratulain]**
- [ ] Run full end-to-end pipeline test with `inject_signals.py` before final demo

---

### 🤖 Uneeza Ismail — Agent Engineer & Prompt Tuning

- [ ] Write system prompt for `signal_agent.py`: normalize GPS, weather, traffic into unified JSON + assign credibility score
- [ ] Implement **Signal Agent** in `agents/signal_agent.py`
- [ ] Implement `tools/geocode.py` → `reverse_geocode(lat, lng)` — calls Google Maps Geocoding API, returns area name
- [ ] Add credibility scoring logic: Weather API = 0.95, Traffic API = 0.90, GPS citizen = 0.70, Social mock = 0.50
- [ ] Add conflict detection: if signal contradicts existing cluster → set `conflict_flag = true`
- [ ] Handle edge cases: duplicate GPS signals, missing coordinates, unknown source types
- [ ] Write system prompt for `detection_agent.py`: cluster signals within 500m radius, 30-minute window
- [ ] Implement **Detection Agent** in `agents/detection_agent.py`
- [ ] Implement GPS proximity clustering logic: if 3+ signals within 500m → `confirmed = true`
- [ ] Implement weighted confidence formula: `weighted_confidence = sum(credibility_scores) / signal_count`
- [ ] Implement `tools/search.py` → `search_local_news(query)` — calls SerpApi for flood news in the area
- [ ] Output detection result: `{ confirmed, confidence, incident_center_lat, incident_center_lng, conflict_detected }`
- [ ] Write system prompt for `severity_agent.py`: score risk 1–10 based on proximity to critical infrastructure
- [ ] Implement **Severity Agent** in `agents/severity_agent.py`
- [ ] Implement scoring rubric: hospital ≤ 500m = +3pts, school ≤ 300m = +2pts, rain > 2hrs = +2pts, traffic fully blocked = +2pts, high residential density = +1pt
- [ ] Output severity result: `{ severity_score, affected_radius_km, estimated_population, peak_impact_eta, risk_factors }`
- [ ] Write system prompt for `verification_agent.py`: verify or retract incident using secondary signals
- [ ] Implement **Verification Agent** in `agents/verification_agent.py`
- [ ] Add conflict resolution logic: re-call `search_local_news()` and check traffic speed at incident location
- [ ] Add verdict output: `{ verdict: "RETRACT" | "CONFIRM", reason, retract_alert: true/false }`
- [ ] Implement **Logging Agent** in `agents/logging_agent.py`
- [ ] Implement `tools/tracer.py` → `emit_trace(incident_id, agent, phase, content)` — saves to `reasoning_logs` + broadcasts via WebSocket
- [ ] Enforce 5-phase trace structure: OBSERVE → REASON → DECIDE → ACT → EVALUATE for every agent
- [ ] Test all prompts with edge cases: no GPS, conflicting signals, confidence below threshold
- [ ] Save final system prompts to `agents/prompts/` folder as `.txt` files

---

### 📱 Ayesha Aziz — Frontend Lead (React Native + Expo)

- [ ] Initialize Expo project with TypeScript
- [ ] Install and configure `react-native-maps` with Google Maps API key (`EXPO_PUBLIC_GOOGLE_MAPS_KEY`)
- [ ] Setup `lib/api.ts` — all `fetch()` calls to backend endpoints (signals, incidents, simulation)
- [ ] Setup WebSocket client in `lib/api.ts` — connects to `WS /api/v1/ws/{incident_id}`, handles reconnects
- [ ] Add GPS location permission request on app first launch (`expo-location`)
- [ ] Build `Dashboard.tsx` — shows list of active incidents with location, severity badge, and timestamp
- [ ] Build `FloodMap.tsx` — Google Maps view with Red polygon at incident GPS center and Green reroute polyline
- [ ] Build `ReasoningCenter.tsx` — auto-scrolling list of agent trace logs received via WebSocket
- [ ] Build `SimView.tsx` — execution timeline showing action statuses (PENDING → ACTIVE → COMPLETED)
- [ ] Build `OutcomeScreen.tsx` — final impact card: vehicles saved, congestion %, "Community SAFE" badge
- [ ] Build `LiveLogStream.tsx` component — subscribes to WebSocket, renders each 5-phase trace entry
- [ ] Build `MapOverlay.tsx` component — draws flood polygon and alternate route polylines on the map
- [ ] Build `SeverityBadge.tsx` component — color pill: Red (>7), Orange (4–7), Green (<4)
- [ ] Build `ExecutionTimeline.tsx` component — step tracker with status icons and progress animation
- [ ] Build `ResourcePanel.tsx` component — live bar showing rescue teams, ambulance, drainage crew allocation per incident
- [ ] Build `ConfidenceMeter.tsx` component — circular gauge (0–100%) that fills as signals arrive
- [ ] Add "Report Flood" floating button on map — taps current GPS and POSTs to `/api/v1/signals`
- [ ] Add loading spinner while Triage Agent is processing a new signal
- [ ] Add animation when Red flood polygon first appears on map
- [ ] Add animation when Green alternate route polyline draws itself

---

### 📊 Quratulain Shah — Simulation Engine & Database

- [ ] Setup PostgreSQL database on Neon (free tier), get connection string
- [ ] Create `signals` table with all fields including `credibility_score` and `conflict_flag`
- [ ] Create `incidents` table with `affected_radius_km`, `estimated_population`, `peak_impact_eta`, `status`
- [ ] Create `resources` table: `{ type, total_count, available_count, assigned_to_incident, location }`
- [ ] Create `actions` table with `predicted_side_effects` field
- [ ] Create `notifications` table: `{ incident_id, stakeholder, message, sent_at }`
- [ ] Create `reasoning_logs` table: `{ incident_id, agent_name, phase, log_text, created_at }`
- [ ] Add indexes on `incident_id` and `created_at` for fast queries
- [ ] Write `db/database.py` with SQLAlchemy async engine and connection pool
- [ ] Seed `resources` table with initial data: 2 rescue teams, 1 ambulance, 1 drainage crew, 2 police units
- [ ] Implement `tools/weather.py` → `get_weather_alerts(lat, lng)` — calls OpenWeatherMap API
- [ ] Implement `tools/traffic.py` → `get_traffic_matrix(origin, destination, mode)` — calls Google Maps Distance Matrix (supports congestion check + alternate route modes)
- [ ] Implement `tools/simulation.py` → `trigger_simulation(incident_id, actions)` — starts FastAPI `BackgroundTask`
- [ ] Implement **Notification Agent** in `agents/notification_agent.py`
- [ ] Implement `tools/notify.py` → `send_notification(stakeholder, message, incident_id)` — saves to `notifications` table (mock send)
- [ ] Generate all 6 stakeholder messages: Public, Hospital, Utility Company, Traffic Authority, Emergency Services (1122), Command Center/Media
- [ ] Implement **Simulation Engine** in `simulation/engine.py` as a FastAPI `BackgroundTask`
- [ ] State machine: `PENDING → SENT → ACTIVE → ON_SITE → COMPLETED`
- [ ] Simulation timing: T+0s ALERT_SENT, T+30s REROUTE_ACTIVE, T+60s DISPATCH_ON_SITE
- [ ] Push WebSocket broadcast after every state change
- [ ] Write `mock_data/mock_signals.json` — 2 flood scenarios: G-10 (severity 9) and G-13 (severity 6) with realistic GPS coords
- [ ] Write `mock_data/inject_signals.py` — script that POSTs signals sequentially to trigger both incident pipelines
- [ ] Test `inject_signals.py` end-to-end: run → verify both incidents created → verify resource allocation runs → check all 6 DB tables

---

*Built with Google Antigravity | CIRO Challenge 3 | 2026*


---

### 👑 Abdullah — AI Architect & Backend Lead

**Backend Foundation**
- [ ] Initialize FastAPI project structure (`backend/app/main.py`)
- [ ] Setup `.env` file with all API keys (`GEMINI_API_KEY`, `GOOGLE_MAPS_SERVER_KEY`, etc.)
- [ ] Create the `POST /api/v1/signals` endpoint that accepts GPS + source data
- [ ] Create the `GET /api/v1/incidents/active` endpoint
- [ ] Create the WebSocket endpoint `WS /api/v1/ws/{incident_id}`

**Orchestration (The Brain)**
- [ ] Implement the **Triage Agent** in `agents/orchestrator.py` using OpenAI Agents SDK
- [ ] Define the `handoffs` list: `[signal_agent, detection_agent, severity_agent, planning_agent]`
- [ ] Implement the confidence-check logic: if `confidence < 0.5` → stop and mark as "Monitoring"
- [ ] Wire all agents together so a single signal triggers the full pipeline
- [ ] Add `reasoning_logs` writes after every agent completes its task

**Planning Agent**
- [ ] Implement `agents/planning_agent.py`
- [ ] Configure it to call `get_traffic_matrix()` and `generate_ticket()` tools
- [ ] Logic: if `severity >= 8` → dispatch emergency; if `severity < 5` → alerts only
- [ ] Store generated `Action` objects in the `actions` table with status = `PENDING`

**Integration [JOINT with Quratulain]**
- [ ] Connect the Planning Agent output to the Simulation Engine trigger
- [ ] Test the full end-to-end pipeline with mock GPS signals before integration

---

### 🤖 Uneeza Ismail — Agent Engineer & Prompt Tuning

**Signal Agent**
- [ ] Write system prompt for `signal_agent.py`: normalize GPS, weather, and traffic signals into one unified JSON format
- [ ] Implement `reverse_geocode()` tool call inside signal agent (converts lat/lng → area name)
- [ ] Handle edge cases: duplicate signals, missing GPS, unknown source types

**Detection Agent**
- [ ] Write system prompt for `detection_agent.py`: "Cluster signals within 500m and 30 mins"
- [ ] Implement GPS proximity logic: if 3+ signals within 500m → `confirmed = true`
- [ ] Integrate `search_local_news()` tool for extra confirmation
- [ ] Output: `{ confirmed, confidence, incident_center_lat, incident_center_lng }`

**Severity Agent**
- [ ] Write system prompt for `severity_agent.py`: score risk based on what's nearby
- [ ] Configure calls to `get_weather_alerts()` and `get_traffic_matrix()`
- [ ] Implement scoring rubric: hospital nearby = +3pts, school nearby = +2pts, rain > 2hrs = +2pts
- [ ] Output a `reasoning_log` string that explains the score in plain English

**Logging Agent**
- [ ] Implement `agents/logging_agent.py`: converts raw agent output into readable Markdown log entries
- [ ] Format: `[AgentName] [timestamp] — message`
- [ ] Ensure all log entries are written to the `reasoning_logs` table in PostgreSQL

**Prompt Reliability**
- [ ] Test all prompts with edge cases (no GPS, conflicting signals, low-confidence output)
- [ ] Document the final system instructions for each agent in `agents/prompts/`

---

### 📱 Ayesha Aziz — Frontend Lead (React Native + Expo)

**App Setup**
- [ ] Initialize Expo project with TypeScript
- [ ] Install and configure `react-native-maps` with Google Maps API key
- [ ] Setup `lib/api.ts` with all `fetch` calls and WebSocket connection logic
- [ ] Add GPS location permission request on app first launch

**Screens**
- [ ] `Dashboard.tsx` — Active incidents list with `SeverityBadge`, incident count, and last-updated timestamp
- [ ] `FloodMap.tsx` — Google Maps with Red flood polygon at incident GPS center and Green reroute polylines
- [ ] `ReasoningCenter.tsx` — Auto-scrolling list of agent logs streamed from WebSocket
- [ ] `SimView.tsx` — Execution timeline (PENDING → ACTIVE → COMPLETED steps) and Before/After flood polygon slider
- [ ] `OutcomeScreen.tsx` — Final impact card: vehicles saved, congestion reduced, "Community SAFE" badge

**Components**
- [ ] `LiveLogStream.tsx` — Subscribes to WebSocket, auto-scrolls, timestamps each log entry
- [ ] `MapOverlay.tsx` — Renders flood polygon + alternate route polylines on the map
- [ ] `SeverityBadge.tsx` — Color-coded pill: Red (>7), Orange (4–7), Green (<4)
- [ ] `ExecutionTimeline.tsx` — Step tracker with icons and status animations

**UX Polish**
- [ ] Add loading spinner while agents are processing
- [ ] Add "Report Flood" floating button that sends GPS to backend
- [ ] Add subtle animations when map polygon appears and route lines draw themselves

---

### 📊 Quratulain Shah — Simulation Engine & Database

**Database**
- [ ] Setup PostgreSQL on Neon (free tier), get connection string
- [ ] Create all 4 tables: `signals`, `incidents`, `actions`, `reasoning_logs`
- [ ] Add indexes on `incident_id` and `created_at` for fast queries
- [ ] Write `db/database.py` with SQLAlchemy async engine

**Tool Functions**
- [ ] `tools/weather.py` → `get_weather_alerts(lat, lng)` — calls OpenWeatherMap API
- [ ] `tools/traffic.py` → `get_traffic_matrix(origin, destination)` — calls Google Maps Distance Matrix
- [ ] `tools/search.py` → `search_local_news(query)` — calls SerpApi
- [ ] `tools/dispatch.py` → `generate_ticket(incident_id, type)` — creates mock emergency ticket in DB
- [ ] `tools/simulation.py` → `trigger_simulation(incident_id, actions)` — starts background loop

**Simulation Engine**
- [ ] Implement `simulation/engine.py` background task (FastAPI `BackgroundTasks`)
- [ ] State machine: PENDING → SENT → ACTIVE → ON_SITE → COMPLETED
- [ ] Timing: T+0s ALERT, T+30s REROUTE, T+60s DISPATCH
- [ ] Push WebSocket message after every status change

**Mock Data & Demo**
- [ ] Write `mock_data/mock_signals.json` with 3 realistic GPS flood scenarios for G-10, G-13, F-8
- [ ] Write `mock_data/inject_signals.py` — script that POSTs mock signals to the backend API
- [ ] Test the script end-to-end: run it → verify full pipeline triggers → check DB tables

---

*Built with Google Antigravity | CIRO Challenge 3 | 2026*
