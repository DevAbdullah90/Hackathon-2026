"""
app/ai/agents.py
────────────────
Definitions of all CIRO Specialist Agents.
These agents are experts in specific domains (Signals, Detection, Severity, etc.).
"""

from agents import Agent
from .prompts import (
    SIGNAL_AGENT_INSTRUCTIONS,
    DETECTION_AGENT_INSTRUCTIONS,
    SEVERITY_AGENT_INSTRUCTIONS,
    VERIFICATION_AGENT_INSTRUCTIONS,
    LOGGING_AGENT_INSTRUCTIONS
)

# Import Tool Stubs
from .tools.geo import reverse_geocode
from .tools.weather import get_weather_alerts
from .tools.traffic import get_traffic_matrix
from .tools.news import search_local_news

# ===========================================================================
# SPECIALIST AGENTS
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

# ── Placeholder Agents (For future implementation) ─────────────────────────

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
