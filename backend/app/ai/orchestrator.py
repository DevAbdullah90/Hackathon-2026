"""
app/ai/orchestrator.py
──────────────────────
The central Brain of CIRO. 
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
