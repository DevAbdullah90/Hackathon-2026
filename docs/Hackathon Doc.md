# 🌊🔥 Multi-Crisis Response Orchestrator (CIRO by AQUA)
### Crisis Intelligence & Response Orchestrator
**Built for the Google Antigravity Hackathon — Challenge 3**

---

## 📌 What Is This Project?

Natural disasters and extreme weather events in Pakistani metropolitans (Karachi, Lahore, Islamabad)—specifically **urban flooding** and **extreme heatwaves**—are typically handled with slow, fragmented, and reactive systems. Emergency responders lack a unified view of the situation and cannot coordinate in real time.

**CIRO by AQUA** is an **Agentic AI System**—not just a dashboard—that:

1. **Ingests** telemetry and signals from multiple sources (social media, weather alerts, traffic congestion, and direct citizen GPS reports).
2. **Detects** whether a real crisis (flood or heatwave) is forming using proximity-based spatial clustering for floods (500m) or city-scale regional telemetry checks for heatwaves (5km).
3. **Reasons** about the severity and impact using a cooperative Multi-Agent pipeline built on the **OpenAI Agents SDK** and powered by **Gemini 2.0 Flash**.
4. **Plans** a coordinated response (rerouting traffic, deploying dewatering pumps, opening cooling centers, setting up hydration camps, and dispatching medical/rescue teams).
5. **Simulates** the execution of those actions so judges can see the outcome.
6. **Visualizes** the before-vs-after impact on both a React Web Dashboard and a React Native Expo Mobile App.

---

## 🌧️🔥 The Two Crisis Types We Handle

The system is a fully generalized **multi-crisis platform** designed to address Pakistan's two most critical urban hazards: **Urban Floods** and **Extreme Heatwaves**. Both crisis types run through the same AI orchestration pipeline but invoke hazard-specific logic, telemetry parsing, resource profiles, and tactical plans.

---

### 🌊 Crisis Type 1: Urban Flooding
Urban flooding occurs rapidly, especially in congested metropolitans like Lahore and Islamabad, caused by heavy monsoon rainfall and inadequate drainage.

#### 🟡 Scenario 1.1 — Local Flooding ("Ghar ke Bahar Pani")
* **Trigger**: Citizens report a localized issue via their mobile app (e.g., street-level water logging, overflowing sewer).
* **GPS-Centric Detection**: The app automatically attaches precise GPS coordinates.
* **Escalation & Clustering**: A single report is held as a signal. If **3+ independent reports** are received within a **500-meter radius** and within **30 minutes**, the system upgrades it to a confirmed **Local Incident Cluster**.

#### 🔴 Scenario 1.2 — Major Flood / Selab (City-Wide Crisis)
* **Trigger**: Automatic background ingestion from official weather APIs (heavy rain forecast > 30mm/hr) combined with live traffic speed drops (0 km/h gridlocks on main arteries).
* **AI Orchestration**: The system auto-confirms a high-severity (7-10/10) city-wide crisis without waiting for citizen reports.

---

### 🔥 Crisis Type 2: Extreme Heatwaves
Extreme heatwaves frequently plague Karachi and Lahore during summer, leading to severe thermal stress, dehydration, heatstroke, and utility grid stress (power outages).

#### 🟡 Scenario 2.1 — Localized Heat Spike & Power Failure
* **Trigger**: Citizen reports of extreme thermal stress or local power outages, combined with localized high temperature readings.
* **AI Response**: Setting up targeted shade canopies and localized hydration kits.

#### 🔴 Scenario 2.2 — Regional Extreme Heatwave (City-Wide)
* **Trigger**: Ingested weather telemetry reports temperatures exceeding **40°C** or a Heat Index exceeding **45°C** (with peaks up to **54.1°C** in Karachi Saddar).
* **Regional Detection**: Since heatwaves are regional events rather than point-clusters, the system triggers on a **5km city sector radius** or automatically confirms via weather alerts.
* **Severity Scoring**: The Severity Agent factors in high temperatures, relative humidity (calculating Heat Index), presence of power outages (utility grid failure), and proximity of schools/vulnerable populations to determine score (up to **9.2/10**).

---

### 📊 Side-by-Side Crisis Comparison

| Metric / Feature | 🌊 Urban Flooding | 🔥 Extreme Heatwave |
|---|---|---|
| **Primary Signal** | Heavy rain telemetry, citizen GPS reports | Temp/Humidity telemetry (Heat Index > 45°C) |
| **Detection Scale** | Localized (500m proximity spatial clustering) | Regional (5km city sector radius) |
| **Primary Resources** | Dewatering pumps, rescue boats, ambulances | Cooling centers, hydration camps, paramedics |
| **Tactical Actions** | Traffic rerouting, zone evacuation, drainage | Shade canopy setup, cooling centers, grid repair |
| **Key Vulnerabilities** | Hospitals, schools, low-lying drainage points | Power grid failure, dense commercial markets |
| **UI Theme (App/Web)** | Emerald / Teal Green (`#10B981`) | Amber / Orange (`#F59E0B`) |

---

## 🏗️ High-Level System Architecture

```
[Signal Ingestion]                  [AI Agent Pipeline]                 [User Interfaces]
──────────────────                  ───────────────────                 ────────────────
GPS User Report (App Tap) ──►  Triage/Orchestrator Agent (Gemini) ──►  Mobile App (Expo)
Weather API (Rain / Temp) ──►  Signal Agent                            Live Map & Polygons
Traffic API (Congestion)  ──►  Detection Agent                         Reasoning CoT Stream
Mock Social Media         ──►  Severity Agent                         Simulation View
                               Resource Allocation Agent
                               Planning Agent                     ──►  React Web Dashboard
                               Simulation Agent                        Admin Live Matrix
                               Logging Agent                           Incident Injector
                                                                       Telemetry Metrics
```

### Signal Sources Explained

| Source | How It Works | Telemetry Parsed |
|--------|-------------|------------------|
| **GPS User Report** | User taps "Report Flood" or "Extreme Heatwave" in app. GPS coordinates attach automatically. | Coordinates, reported crisis type (`flood` or `heatwave`). |
| **Weather API** | Background fetch every 5 mins from OpenWeatherMap (mocked/real). | Precipitation intensity, duration (floods) OR Temperature, Humidity, UV index (heatwaves). |
| **Traffic API** | Live traffic speed checks from Google Maps Distance Matrix. | Velocity (km/h) and congestion scale (e.g. 0 km/h gridlock). |
| **Mock Social Media** | Simulation script pushes posts during demos. | Parsing text for keywords like "selab", "heat stroke", "load shedding". |

---

## 🤖 The Multi-Agent System (Detailed)

The system uses the **OpenAI Agents SDK** with the **Triage/Handoff Pattern**. The Orchestrator is the center of a "Star Model" — every specialist reports back to it. All prompts contain branching logic for `"flood"` and `"heatwave"`.

### Agent Registry Overview

| Agent | Trigger | Key Output |
|-------|---------|------------|
| Triage Agent | Every new signal | Handoff decision + Multi-crisis prioritization |
| Signal Agent | New raw signal | Structured JSON + credibility score + type inference |
| Detection Agent | Signal cluster | Confirmed/Unconfirmed + confidence (500m vs 5km scale) |
| Severity Agent | Confirmed incident | Severity score 1–10 + risk factors (precip vs heat index) |
| Resource Allocation Agent | Severity score | Resource assignment across incidents (boats vs cooling kits) |
| Planning Agent | Resource assigned | Action list (PENDING) with predicted side effects |
| Verification Agent | Conflicting signals | Confirm/retract incident |
| Notification Agent | Plan activated | 6 tailored stakeholder messages |
| Logging Agent | Any agent activity | Human-readable reasoning logs (CoT) |

---

### Agent 1: Triage Agent (Orchestrator)
* **Role**: The "Manager." Does not do analysis itself. Reads the current state and decides which specialist to call next. Manages **multi-crisis prioritization** — compares all active incidents (e.g. Karachi Heatwave and Islamabad Flood) and routes resources accordingly.
* **Key Logic**: If `detection_agent` returns `confidence < 0.5` → mark as "Unconfirmed" and call `verification_agent`. If multiple incidents are active simultaneously → call `resource_allocation_agent` before `planning_agent`.

### Agent 2: Signal Agent (Signal Processor + Credibility Scorer)
* **Role**: Normalizes all incoming signals into a unified format and assigns a **credibility score** based on source reliability.
* **Disaster Type Inference**: Automatically sets `type = "heatwave"` if temperature telemetry > 40°C or heat index > 45°C.
* **Credibility Scoring Rules**:
  * Weather API / official telemetry → `credibility: 0.95`
  * Google Maps Traffic → `credibility: 0.90`
  * GPS citizen report → `credibility: 0.70`
  * Mock social media post → `credibility: 0.50`
* **Input Example (Heatwave)**: `{ "lat": 24.8607, "lng": 67.0244, "temperature_c": 46.2, "humidity_pct": 74 }`
* **Output**: `{ "location": "Saddar, Karachi", "type": "heatwave", "credibility_score": 0.95, "telemetry": { "heat_index_c": 54.1 } }`

### Agent 3: Detection Agent (Incident Detector)
* **Role**: Clusters signals to confirm a real crisis. Uses weighted credibility scores.
* **Spatial Branching**:
  * **Flood**: 500-meter spatial clustering. Requires 3+ user reports within 500m and 30 mins to confirm.
  * **Heatwave**: 5-kilometer city sector scale. Heatwaves are regional; a single official weather alert automatically confirms the crisis.
* **Output**: `{ "confirmed": true, "confidence": 0.95, "incident_center": "Saddar, Karachi" }`

### Agent 4: Severity Agent (Risk Analyzer)
* **Role**: Scores severity 1–10 based on specific hazard metrics.
* **Scoring Rubric**:
  * **Flood**: Rainfall intensity (+3), Hospital within 500m (+3), School within 300m (+2), Rain > 2hrs (+2), Traffic blocked (+2).
  * **Heatwave**: Heat Index ≥ 50°C (+4), Power Outage active (+3), Schools/Pedestrian markets open during peak hours (+2), Vulnerable residential density (+1).
* **Output**: `{ "severity_score": 9.2, "risk_factors": ["Heat Index 54.1°C", "Active Power Outage", "Empress Market Peak Crowds"] }`

### Agent 5: Resource Allocation Agent (Multi-Crisis Coordinator)
* **Role**: Checks the `resources` table for available units and allocates them across all active incidents.
* **Resource Matching**:
  * **Flood**: Rescue teams, water pumps, ambulances, traffic diversions.
  * **Heatwave**: Cooling centers, hydration camps, paramedic units, electrolyte kits, grid repair crews.

### Agent 6: Planning Agent (Response Planner)
* **Role**: Creates specific action tasks based on the resource allocation decision.
* **Action Plans**:
  * **Flood**: `DISPATCH_RESCUE_TEAM`, `DEPLOY_WATER_PUMPS`, `REROUTE_TRAFFIC`, `EVACUATE_ZONE`.
  * **Heatwave**: `OPEN_COOLING_CENTERS`, `DEPLOY_HYDRATION_CAMPS`, `ACTIVATE_HEAT_STROKE_TRIAGE`, `REQUEST_POWER_RESTORATION`.
* **Output**: Action list with `predicted_side_effects` field per action.

### Agent 7: Verification Agent (False Alarm Handler)
* **Role**: Activated when `conflict_flag = true` or `confidence < 0.6`. Verifies or refutes the incident using secondary sources.
* **Heatwave Example**: Checks if localized complaints of "extreme heat" correlate with regional meteorological stations.

### Agent 8: Notification Agent (Stakeholder Communicator)
* **Role**: Generates **6 tailored messages** for stakeholders based on incident type and severity.
* **Heatwave Messages**:
  1. **Public**: `⚠️ EXTREME HEAT ALERT: Temperature 47°C in Saddar. Stay indoors. Hydration camps activated at Empress Market.`
  2. **Hospital (PIMS/Civil)**: `ACTIVATE HEAT STROKE PROTOCOL: Prepare emergency cooling baths and IV saline packs.`
  3. **Utility Company (K-Electric/IESCO)**: `POWER GRID WARNING: Load-shedding causing failures in Saddar zone. Prioritize cooling center restoration.`
  4. **Traffic/Local Authority**: `Deploy crowd management at hydration camps in Saddar Market area. Restrict vehicle movement in pedestrian heat zones.`
  5. **Emergency Services (1122)**: `Deploy mobile medical units and hydration kits to GPS: 24.8607, 67.0244.`
  6. **Command Center/Media**: `Crisis Level 8 declared. Saddar Extreme Heatwave. Heat index 54°C. 12,000 residents at risk. Cooling response activated.`

### Agent 9: Logging Agent (Explainability Layer)
* **Role**: Converts every agent's chain-of-thought (CoT) into Markdown logs. Pushes logs in real-time via WebSockets to the UI Reasoning Console.

---

## 🛠️ Agent Tool Functions (Function Calling)

These are Python functions registered as tools for the agents:

```python
# app/tools/weather.py
async def get_weather_alerts(lat: float, lng: float) -> dict:
    """Returns weather telemetry. 
    Karachi (lat 24.5-25.5) / Lahore (lat 31.0-32.0) -> Temperature, humidity, heat index (Heatwave).
    Islamabad (default) -> Precipitation intensity, duration (Flood).
    """
    pass

# app/tools/traffic.py
async def get_traffic_matrix(origin: str, destination: str) -> dict:
    """Gets travel time and congestion level between two points via Google Maps."""
    pass

# app/tools/search.py
async def search_local_news(query: str) -> list:
    """Searches local news for validation (e.g. 'heatwave Karachi Saddar today')."""
    pass

# app/tools/simulation.py
async def trigger_simulation(incident_id: str, actions: list) -> str:
    """Starts the background simulation loop for incident actions."""
    pass

# app/tools/dispatch.py
async def generate_ticket(incident_id: str, type: str) -> dict:
    """Creates a mock emergency ticket (cooling center, ambulance, water pump)."""
    pass
```

---

## 📱 Frontend (React Native + Expo)

### Color-Coding & Themes
The mobile application dynamically shifts themes based on the selected incident's `disaster_type`:
* **Flood**: Emerald Green accent theme (`#10B981`)
* **Heatwave**: Amber/Orange accent theme (`#F59E0B`)

### Screens & Their Purpose

* **Home / Dashboard (`Dashboard.tsx`)**: Shows active incidents count, severity badges, and recent alerts.
* **Live Map (`FloodMap.tsx`)**: Renders interactive map overlays. Displays Red polygons at flood centers and Orange/Amber circular heat zones for heatwaves.
* **AI Reasoning Center (`ReasoningCenter.tsx`)**: Displays scrollable, real-time Markdown log stream of the AI's Chain of Thought.
* **Simulation View (`SimView.tsx`)**: Tracks action execution (e.g. Hydration camp deployment progress).
* **Outcome Screen (`OutcomeScreen.tsx`)**: Displays final metrics (e.g. Heat stress reduction: 90%, Response rate: 98%).

---

## 🌐 Web Dashboard (React + Next.js + Vercel)

The Web Dashboard serves as the central command console.
* **Interactive Map Panel**: Displays real-time map overlays of the city with color-coded crisis icons.
* **Metrics Grid**: Dynamically displays telemetry statistics:
  * For Heatwaves: displays "Paramedic Dispatch", "Hydration Camps", "Shade Canopies".
  * For Floods: displays "Ambulance Dispatch", "Rescue Dispatched", "Dewatering Pumps".
* **Incident Injector Widget**: Allows judges to trigger mock incidents. Includes a dropdown to choose between **🚧 Urban Flood** and **🔥 Extreme Heatwave**.

---

## 🗄️ Database Schema (PostgreSQL/Neon)

### Key Updates: `disaster_type` Column
The `incidents` table has been updated to support `disaster_type` (default `"flood"`), making the database schema fully extensible for multi-crisis tracking.

```sql
-- Table 2: Confirmed incidents (Floods or Heatwaves)
CREATE TABLE incidents (
    id UUID PRIMARY KEY,
    location VARCHAR(100),
    lat FLOAT,
    lng FLOAT,
    severity_score FLOAT,
    confidence FLOAT,
    affected_radius_km FLOAT,
    estimated_population INT,
    peak_impact_eta VARCHAR(50),
    status VARCHAR(50),           -- 'monitoring', 'confirmed', 'resolved', 'retracted'
    risk_factors JSONB,
    disaster_type VARCHAR(50) DEFAULT 'flood', -- 'flood' | 'heatwave'
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## ⚡ Multi-Crisis Scenario (Simultaneous Heatwave & Flood)

This is the key multi-hazard stress-test scenario handled by the orchestrator.

### The Setup
* **Incident 1: Karachi Saddar Heatwave** (Severity 9.2/10)
  * *Telemetry*: Temperature 46.2°C, Heat Index 54.1°C, Humidity 74%, Power grid failure active.
  * *Needs*: Cooling centers, hydration camps, paramedic units.
* **Incident 2: Islamabad G-10 Flood** (Severity 8.5/10)
  * *Telemetry*: 28.4 mm/hr rainfall, hospital 200m away, traffic gridlocked.
  * *Needs*: Rescue teams, dewatering pumps, ambulances.

### Resource Allocation Agent Logic
The Resource Agent evaluates available assets in the shared database and maps them to the appropriate crisis:
1. **Karachi (Heatwave)**: Assigns mobile cooling posts, hydration canopies, and paramedics. It coordinates with K-Electric (utility) mock notifications to request power restoration.
2. **Islamabad (Flood)**: Assigns dewatering pumps, rescue teams, and coordinates traffic rerouting with local traffic authorities.

---

## 🔄 False Alarm & Retraction Flow

If a conflicting field report arrives, the verification flow executes:
1. **Trigger**: Field report states temperature readings are normal, or news search queries reveal no heat emergency.
2. **Verification Agent**: Queries secondary APIs (e.g. traffic speed, local social media).
3. **Verdict**: If verified as a false alarm, status updates to `retracted`, public alerts are cancelled (`"Update: Saddar alert cancelled"`), and assets are recalled.

---

## 📊 Baseline Comparison

| Metric | Without AI (Manual) | With CIRO by AQUA (Agentic) |
|---|---|---|
| **Detection Speed** | 15–30 minutes | ~45 seconds |
| **Telemetry Fusion** | Split monitoring screens | Automated unified ingestion |
| **Crisis Coordination** | Single-hazard response | Multi-crisis cross-allocation |
| **Stakeholder Alerts** | Manual notifications | 6 automated custom messages |
| **Retraction Speed** | Hours | < 2 minutes |

---

## 📂 Project Folder Structure

```
hackathon-2026/
│
├── backend/                        # FastAPI Backend
│   ├── app/
│   │   ├── main.py                 # FastAPI Entrypoint
│   │   ├── agents/
│   │   │   └── orchestrator.py     # Triage Agent
│   │   ├── ai/
│   │   │   └── prompts.py          # Dual-Crisis System Prompts
│   │   ├── api/
│   │   │   └── api_v1/             # Endpoints (signals, incidents)
│   │   ├── db/
│   │   │   ├── database.py         # DB Engine
│   │   │   └── alter_db.py         # Database Migration Script
│   │   ├── models/
│   │   │   ├── incidents.py        # Incident model (disaster_type)
│   │   │   ├── signals.py          # Signal model
│   │   │   └── schemas.py          # Pydantic Schemas
│   │   ├── tools/
│   │   │   ├── weather.py          # Dual-Crisis Weather Telemetry
│   │   │   ├── traffic.py          # Google Maps API
│   │   │   └── search.py           # SerpApi search
│   │   └── simulation/
│   │       ├── engine.py           # Background Simulator
│   │       └── seed_signals.py     # Mock Incident Scenarios
│   └── requirements.txt
│
├── frontend/                       # Expo Mobile Application
│   ├── app/
│   │   ├── index.tsx               # Dashboard Screen
│   │   ├── map.tsx                 # Live Map Screen
│   │   └── outcome.tsx             # Outcome Screen
│   └── components/
│       ├── MapOverlay.tsx          # Dynamic styling per type
│       └── ExecutionTimeline.tsx   # Action progress tracker
│
└── web_frontend/                   # Next.js Web Dashboard
    ├── app/
    │   └── layout.tsx
    └── components/
        └── dashboard/
            ├── TopBar.tsx          # Incident injector dropdown
            └── MetricsGrid.tsx     # Dynamic metrics per type
```

---

## ✅ Team Task Breakdown — Completed Checklist

### 👑 Abdullah — AI Architect & Backend Lead
* [x] Ingest `disaster_type` fields inside PostgreSQL database.
* [x] Configure Triage Agent to prioritize simultaneous Flood and Heatwave incidents.
* [x] Integrate Resource Allocation Agent to coordinate ambulances, cooling centers, and dewatering pumps.
* [x] Set up FastAPI WebSocket connection `WS /api/v1/ws/{incident_id}` to stream logs to web/mobile.

### 🤖 Uneeza Ismail — Agent Engineer & Prompt Tuning
* [x] Write Dual-crisis system instructions for Signal, Detection, Severity, and Planning Agents.
* [x] Add regional 5km clustering logic for Heatwave detection.
* [x] Implement Heat Index scoring calculations inside the Severity Agent.
* [x] Integrate SerpApi local news verification for false alarm mitigation.

### 📱 Ayesha Aziz — Frontend Lead (React Native + Expo)
* [x] Implement dual-theme color-coding (Green for flood, Orange for heatwave).
* [x] Overlay heatwave orange heat zones and flood red polygons on the map view.
* [x] Create reasoning console to auto-scroll streamed Markdown logs in real-time.
* [x] Build Outcome screen detailing heat stress index reduction.

### 📊 Quratulain Shah — Simulation Engine & Database
* [x] Perform Neon database migration to add `disaster_type` column.
* [x] Rewrite weather tool to mock both rainfall intensity and temperature/humidity.
* [x] Implement simulation state transitions for cooling centers, hydration canopies, and paramedics.
* [x] Draft 6 custom notifications for heatwave stakeholders (Power grid, Hospital protocols).

---
*Built with Google Antigravity | CIRO by AQUA | 2026*
