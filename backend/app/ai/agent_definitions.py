"""
app/ai/agent_definitions.py
───────────────────────────
Definitions of all CIRO Agents and their handoff relationships.
"""

from agents import Agent

# ===========================================================================
# 1. SPECIALIST AGENTS (Instructions pending)
# ===========================================================================

signal_agent = Agent(
    name="Signal Agent",
    instructions="Instructions pending...",
)

detection_agent = Agent(
    name="Detection Agent",
    instructions="Instructions pending...",
)

severity_agent = Agent(
    name="Severity Agent",
    instructions="Instructions pending...",
)

resource_agent = Agent(
    name="Resource Allocation Agent",
    instructions="Instructions pending...",
)

planning_agent = Agent(
    name="Planning Agent",
    instructions="Instructions pending...",
)

verification_agent = Agent(
    name="Verification Agent",
    instructions="Instructions pending...",
)

notification_agent = Agent(
    name="Notification Agent",
    instructions="Instructions pending...",
)

logging_agent = Agent(
    name="Logging Agent",
    instructions="Instructions pending...",
)

# ===========================================================================
# 2. TRIAGE AGENT (The Entry Point / Orchestrator)
# ===========================================================================

triage_agent = Agent(
    name="Triage Agent",
    instructions="You are the primary orchestrator for the Urban Flood Response system. "
                 "Delegate tasks to the appropriate specialist agents based on the incoming signal.",
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
