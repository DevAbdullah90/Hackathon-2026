"""
app/ai/agent_definitions.py
───────────────────────────
Definitions of all CIRO Agents and their handoff relationships.
Integrated with Tool Stubs for Quratulain.
"""

from agents import Agent
from .prompts import (
    SIGNAL_AGENT_INSTRUCTIONS,
    DETECTION_AGENT_INSTRUCTIONS,
    SEVERITY_AGENT_INSTRUCTIONS,
    VERIFICATION_AGENT_INSTRUCTIONS,
    LOGGING_AGENT_INSTRUCTIONS,
    TRIAGE_AGENT_INSTRUCTIONS,
    NOTIFICATION_AGENT_INSTRUCTIONS
)

# Import Tool Stubs
from .tools.geo import reverse_geocode
from .tools.weather import get_weather_alerts
from .tools.traffic import get_traffic_matrix
from .tools.news import search_local_news
from .tools.notify import send_notification

# ===========================================================================
# 1. SPECIALIST AGENTS
# ===========================================================================

signal_agent = Agent(
    name="Signal Agent",
    instructions=SIGNAL_AGENT_INSTRUCTIONS,
    tools=[reverse_geocode]
)

detection_agent = Agent(
    name="Detection Agent",
    instructions=DETECTION_AGENT_INSTRUCTIONS,
    tools=[search_local_news, get_traffic_matrix]
)

severity_agent = Agent(
    name="Severity Agent",
    instructions=SEVERITY_AGENT_INSTRUCTIONS,
    tools=[get_weather_alerts, get_traffic_matrix]
)

verification_agent = Agent(
    name="Verification Agent",
    instructions=VERIFICATION_AGENT_INSTRUCTIONS,
    tools=[search_local_news, get_traffic_matrix]
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
    instructions=NOTIFICATION_AGENT_INSTRUCTIONS,
    tools=[send_notification]
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
