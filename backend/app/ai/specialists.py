"""
app/ai/specialists.py
---------------------
Definitions of all CIRO specialist agents.
"""

from agents import Agent

from .prompts import (
    DETECTION_AGENT_INSTRUCTIONS,
    LOGGING_AGENT_INSTRUCTIONS,
    NOTIFICATION_AGENT_INSTRUCTIONS,
    SEVERITY_AGENT_INSTRUCTIONS,
    SIGNAL_AGENT_INSTRUCTIONS,
    VERIFICATION_AGENT_INSTRUCTIONS,
)
from .tools import (
    reverse_geocode,
    search_local_news,
    send_notification,
    get_traffic_matrix,
    get_weather_alerts,
    get_nearby_signals,
)
from .tools.tracer import emit_log


signal_agent = Agent(
    name="Signal Agent",
    instructions=SIGNAL_AGENT_INSTRUCTIONS,
    tools=[reverse_geocode],
)

detection_agent = Agent(
    name="Detection Agent",
    instructions=DETECTION_AGENT_INSTRUCTIONS,
    tools=[search_local_news, get_traffic_matrix, get_nearby_signals],
)

severity_agent = Agent(
    name="Severity Agent",
    instructions=SEVERITY_AGENT_INSTRUCTIONS,
    tools=[get_weather_alerts, get_traffic_matrix],
)

verification_agent = Agent(
    name="Verification Agent",
    instructions=VERIFICATION_AGENT_INSTRUCTIONS,
    tools=[search_local_news, get_traffic_matrix],
)

logging_agent = Agent(
    name="Logging Agent",
    instructions=LOGGING_AGENT_INSTRUCTIONS,
    tools=[emit_log],
)

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
    tools=[send_notification],
)
