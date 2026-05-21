# Finalize Backend Architecture

This plan covers the remaining tasks needed to finalize the backend, complete the Intelligence Phase, and wire up the Simulation engine for the frontend UI.

## Proposed Changes

### AI Agents & Logic
#### [MODIFY] [prompts.py](file:///C:/Users/hp/OneDrive/Desktop/Hackathon%20AISeekho/backend/app/ai/prompts.py)
- **Add** `RESOURCE_AGENT_INSTRUCTIONS`: Instruct the agent to analyze the severity and assign the correct number of ambulances, rescue teams, and drainage crews from the `resources` table.
- **Add** `PLANNING_AGENT_INSTRUCTIONS`: Instruct the agent to analyze the assigned resources and create response actions (e.g., "REROUTE_TRAFFIC") in the `actions` table.
- **Update** `TRIAGE_AGENT_INSTRUCTIONS`: Replace the placeholder text with robust instructions that orchestrate the full pipeline: Signal -> Detection -> Severity -> Verification (if low confidence) -> Resource -> Planning -> Notification -> Logging.

#### [NEW] [resource_manager.py](file:///C:/Users/hp/OneDrive/Desktop/Hackathon%20AISeekho/backend/app/ai/tools/resource_manager.py)
- Create an `allocate_resource` tool that the Resource Agent can call to reserve resources (updates `available_count` in the database).

#### [NEW] [planner.py](file:///C:/Users/hp/OneDrive/Desktop/Hackathon%20AISeekho/backend/app/ai/tools/planner.py)
- Create a `create_action` tool that the Planning Agent can call to insert response plans into the `actions` table.

#### [MODIFY] [specialists.py](file:///C:/Users/hp/OneDrive/Desktop/Hackathon%20AISeekho/backend/app/ai/specialists.py)
- Connect the Resource Agent and Planning Agent to their new instructions and tools.

---

### Simulation API
#### [NEW] [simulation.py](file:///C:/Users/hp/OneDrive/Desktop/Hackathon%20AISeekho/backend/app/api/api_v1/endpoints/simulation.py)
- Expose `POST /api/v1/simulation/trigger/{incident_id}`: This will be called by Ayesha's frontend button to kick off the simulation loop.
- Expose `GET /api/v1/simulation/state/{incident_id}`: Used to poll or fetch the current status of all actions.

#### [MODIFY] [api.py](file:///C:/Users/hp/OneDrive/Desktop/Hackathon%20AISeekho/backend/app/api/api_v1/api.py)
- Register the new simulation router.

---

### Demo Script
#### [NEW] [inject_signals.py](file:///C:/Users/hp/OneDrive/Desktop/Hackathon%20AISeekho/backend/mock_data/inject_signals.py)
- A script to post exactly 3 GPS signals and 1 Weather alert to `/api/v1/signals`. This will trigger the AI pipeline automatically so you have a flawless, one-click demo for the judges.

## User Review Required

> [!IMPORTANT]
> The Triage Agent will now hand off to 8 different sub-agents in a chain. Since this relies on the OpenAI Agents SDK, the orchestration flow will be heavily dependent on the new `TRIAGE_AGENT_INSTRUCTIONS`. I will make sure the prompts explicitly map the handoff paths to prevent infinite loops or getting stuck.

## Verification Plan

## Automated Verification
- I will run the local server and use `inject_signals.py` to trigger the entire pipeline from end to end.
- I will verify that the Resource Agent updates the database and the Planning Agent creates Action records.
- I will trigger the simulation via the new API endpoint and verify it updates action statuses.
