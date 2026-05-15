"""
app/ai/agent_definitions.py
───────────────────────────
Definitions of all CIRO Agents and their handoff relationships.
Cleaned version: Prompts are now imported from .prompts
"""

from agents import Agent
from .prompts import (
    SIGNAL_AGENT_INSTRUCTIONS,
    DETECTION_AGENT_INSTRUCTIONS,
    SEVERITY_AGENT_INSTRUCTIONS,
    VERIFICATION_AGENT_INSTRUCTIONS,
    LOGGING_AGENT_INSTRUCTIONS,
    TRIAGE_AGENT_INSTRUCTIONS
)

# ===========================================================================
# 1. SPECIALIST AGENTS
# ===========================================================================

signal_agent = Agent(
    name="Signal Agent",
    instructions=SIGNAL_AGENT_INSTRUCTIONS,
)

detection_agent = Agent(
    name="Detection Agent",
    instructions=DETECTION_AGENT_INSTRUCTIONS,
)

severity_agent = Agent(
    name="Severity Agent",
    instructions=SEVERITY_AGENT_INSTRUCTIONS,
)

verification_agent = Agent(
    name="Verification Agent",
    instructions=VERIFICATION_AGENT_INSTRUCTIONS,
)

logging_agent = Agent(
    name="Logging Agent",
    instructions=LOGGING_AGENT_INSTRUCTIONS,
)

# ===========================================================================
# 2. ADDITIONAL AGENTS (Stubs)
# ===========================================================================

resource_agent = Agent(
    name="Resource Allocation Agent",
    instructions="Instructions pending...",
)

planning_agent = Agent(
    name="Planning Agent",
    instructions="Instructions pending...",
)

notification_agent = Agent(
    name="Notification Agent",
    instructions="Instructions pending...",
)

# ===========================================================================
# 3. TRIAGE AGENT (The Orchestrator)
# ===========================================================================

triage_agent = Agent(
    name="Triage Agent",
    instructions=TRIAGE_AGENT_INSTRUCTIONS,
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
