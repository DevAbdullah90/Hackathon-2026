# Implementation Plan - Rebrand CIRO to CIRO by AQUA

This plan details the steps to replace all branding and references to the app **CIRO** (Crisis Intelligence & Response Orchestrator) with the new name **CIRO by AQUA** across the entire project (backend, web frontend, mobile frontend, documentation, and agent instructions).

## Proposed Changes

We will systematically replace references to `CIRO`, `Ciro`, and `ciro` (case-insensitive) in the project. The replacements are categorized as follows:

1. **User-Facing Branding / Text**: 
   - `CIRO` / `Ciro` -> `CIRO by AQUA`
   - Example: `CIRO Command Center` -> `CIRO by AQUA Command Center`
   
2. **Short Codes / Technical Tags**:
   - `CIRO-Sim` -> `CIRO-Sim`
   - `CIRO-ORCHESTRATOR` -> `CIRO-ORCHESTRATOR`
   
3. **Backend App Name Config**:
   - `CIRO_Backend` -> `CIRO_Backend`
   
4. **Agent Prompts / Instructions**:
   - `CIRO (Crisis Intelligence & Response Orchestrator)` -> `CIRO by AQUA`
   
5. **Lowercase Identifiers (e.g. test group IDs)**:
   - `ciro_e2e_live` -> `ciro_e2e_live`
   - `ciro_test_001` -> `ciro_test_001`
   - `contact@ciro.org` -> `contact@ciro.org`

> [!IMPORTANT]
> The virtual environment folder `.venv_ciro` on the local machine will not be renamed to prevent path breaking in local terminal sessions or runner scripts.

---

### Affected Components & Files

#### Web Frontend

##### [MODIFY] [TopBar.tsx](file:///c:/Users/hp/OneDrive/Desktop/Hackathon%20AISeekho/web_frontend/components/dashboard/TopBar.tsx)
- Line 506: `<h1 ...>CIRO</h1>` -> `<h1 ...>CIRO by AQUA</h1>`
- Line 909: `CIRO Swarm Triage Completed` -> `CIRO Swarm Triage Completed`

##### [MODIFY] [Sidebar.tsx](file:///c:/Users/hp/OneDrive/Desktop/Hackathon%20AISeekho/web_frontend/components/dashboard/Sidebar.tsx)
- Line 41: `<h1 ...>CIRO</h1>` -> `<h1 ...>CIRO by AQUA</h1>`

##### [MODIFY] [EventsPanel.tsx](file:///c:/Users/hp/OneDrive/Desktop/Hackathon%20AISeekho/web_frontend/components/dashboard/EventsPanel.tsx)
- Lines 488, 494: `CIRO verified` -> `CIRO by AQUA verified`

##### [MODIFY] [layout.tsx](file:///c:/Users/hp/OneDrive/Desktop/Hackathon%20AISeekho/web_frontend/app/layout.tsx)
- Line 13: `title: "CIRO Command ..."` -> `title: "CIRO by AQUA Command ..."`

---

#### Mobile Frontend

##### [MODIFY] [welcome.tsx](file:///c:/Users/hp/OneDrive/Desktop/Hackathon%20AISeekho/frontend/app/welcome.tsx)
- Line 25: `<Text style={styles.appName}>CIRO</Text>` -> `<Text style={styles.appName}>CIRO by AQUA</Text>`

##### [MODIFY] [index.tsx](file:///c:/Users/hp/OneDrive/Desktop/Hackathon%20AISeekho/frontend/app/index.tsx)
- Line 233: `CIRO COMMAND CENTER` -> `CIRO by AQUA COMMAND CENTER`
- Line 692: `CIRO-ORCHESTRATOR ONLINE` -> `CIRO-ORCHESTRATOR ONLINE`

##### [MODIFY] [simulation.tsx](file:///c:/Users/hp/OneDrive/Desktop/Hackathon%20AISeekho/frontend/app/simulation.tsx)
- Line 288: `CIRO is executing...` -> `CIRO by AQUA is executing...`

##### [MODIFY] [SimulationView.tsx](file:///c:/Users/hp/OneDrive/Desktop/Hackathon%20AISeekho/frontend/components/SimulationView.tsx)
- Line 27: `CIRO-Sim Center` -> `CIRO-Sim Center`

##### [MODIFY] [ReasoningCenter.tsx](file:///c:/Users/hp/OneDrive/Desktop/Hackathon%20AISeekho/frontend/components/ReasoningCenter.tsx)
- Line 17: `CIRO-Sim v4.2` -> `CIRO-Sim v4.2`

##### [MODIFY] [LiveLogStream.tsx](file:///c:/Users/hp/OneDrive/Desktop/Hackathon%20AISeekho/frontend/components/LiveLogStream.tsx)
- Line 65: `CIRO Specialist Network` -> `CIRO Specialist Network`
- Line 94: `CIRO session started` -> `CIRO session started`

---

#### Backend Core & AI Prompts

##### [MODIFY] [config.py](file:///c:/Users/hp/OneDrive/Desktop/Hackathon%20AISeekho/backend/app/core/config.py)
- `PROJECT_NAME = "CIRO — Urban Flood Response Orchestrator"` -> `"CIRO by AQUA — Urban Flood Response Orchestrator"`
- `APP_NAME = "CIRO_Backend"` -> `"CIRO_Backend"`

##### [MODIFY] [main.py](file:///c:/Users/hp/OneDrive/Desktop/Hackathon%20AISeekho/backend/app/main.py)
- Description / startup logs: `Initializing CIRO Database...` -> `Initializing CIRO Database...`

##### [MODIFY] [prompts.py](file:///c:/Users/hp/OneDrive/Desktop/Hackathon%20AISeekho/backend/app/ai/prompts.py)
- All agent instruction prompts mentioning `CIRO (Crisis Intelligence & Response Orchestrator)` will be updated to `CIRO by AQUA`.

##### [MODIFY] [geo.py](file:///c:/Users/hp/OneDrive/Desktop/Hackathon%20AISeekho/backend/app/ai/tools/geo.py)
- User-Agent header: `CIRO-Crisis-Orchestrator` -> `CIRO-Crisis-Orchestrator`

##### [MODIFY] [inject_signals.py](file:///c:/Users/hp/OneDrive/Desktop/Hackathon%20AISeekho/backend/mock_data/inject_signals.py) and [seed_signals.py](file:///c:/Users/hp/OneDrive/Desktop/Hackathon%20AISeekho/backend/app/simulation/seed_signals.py)
- Script outputs & comments.

##### [MODIFY] [test_full_pipeline_live.py](file:///c:/Users/hp/OneDrive/Desktop/Hackathon%20AISeekho/backend/app/tests/test_full_pipeline_live.py), [test_pipeline_end_to_end.py](file:///c:/Users/hp/OneDrive/Desktop/Hackathon%20AISeekho/backend/app/tests/test_pipeline_end_to_end.py), and [test_triage_routing.py](file:///c:/Users/hp/OneDrive/Desktop/Hackathon%20AISeekho/backend/app/tests/test_triage_routing.py)
- Trace names and log messages.

---

#### Documentation & Reports

We will update all markdown documentation files (like `README.md`, `Hackathon Doc.md`, `gaps-and-solutions.md`, `challenge-3.md`, `MULTI_CRISIS_EXPANSION_REPORT.md`, and test reports in `backend/app/tests/output-report/`) to use `CIRO by AQUA` instead of `CIRO`.

## Verification Plan

We will verify that:
1. All frontends (`web_frontend` and `frontend` Expo app) compile successfully.
2. The backend tests pass (to verify that renaming in tests/prompts didn't introduce syntax or configuration errors).
