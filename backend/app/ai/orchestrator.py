"""
app/ai/orchestrator.py
──────────────────────
The central Brain of CIRO by AQUA. 
Contains the Triage Agent (Orchestrator) which manages the multi-agent pipeline.
"""

from agents import Agent
from app.ai.factory import create_model
from .prompts import TRIAGE_AGENT_INSTRUCTIONS

# Import Specialist Agents
from .specialists import (
    signal_agent,
    detection_agent,
    severity_agent,
    resource_agent,
    planning_agent,
    verification_agent,
    notification_agent,
    logging_agent
)

# ===========================================================================
# TRIAGE AGENT (The Orchestrator)
# ===========================================================================

# Provide the model explicitly
model = create_model()

triage_agent = Agent(
    name="Triage Agent",
    instructions=TRIAGE_AGENT_INSTRUCTIONS,
    model=model,
    handoffs=[
        signal_agent,
        detection_agent,
        severity_agent,
        resource_agent,
        planning_agent,
        verification_agent,
        notification_agent,
        logging_agent
    ]
)

# Dynamically register the triage agent in each specialist's handoffs
# to allow reporting back to the triage agent once their respective workflows complete.
for specialist in triage_agent.handoffs:
    if not hasattr(specialist, "handoffs") or specialist.handoffs is None:
        specialist.handoffs = []
    if triage_agent not in specialist.handoffs:
        specialist.handoffs.append(triage_agent)

