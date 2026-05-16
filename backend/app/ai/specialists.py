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
    RESOURCE_AGENT_INSTRUCTIONS,
    PLANNING_AGENT_INSTRUCTIONS,
)
from .tools import (
    reverse_geocode,
    search_local_news,
    send_notification,
    get_traffic_matrix,
    get_weather_alerts,
    get_nearby_signals,
    allocate_resource,
    create_action,
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
    instructions=RESOURCE_AGENT_INSTRUCTIONS,
    tools=[allocate_resource],
)

planning_agent = Agent(
    name="Planning Agent",
    instructions=PLANNING_AGENT_INSTRUCTIONS,
    tools=[create_action],
)

notification_agent = Agent(
    name="Notification Agent",
    instructions=NOTIFICATION_AGENT_INSTRUCTIONS,
    tools=[send_notification],
)
