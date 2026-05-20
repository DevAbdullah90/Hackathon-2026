"""
app/ai/specialists.py
---------------------
Definitions of all CIRO by AQUA specialist agents.
"""

from agents import Agent
from app.ai.factory import create_model

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
from .tools.tracer import emit_log, persist_chain_of_thought

# Use factory to assign models to agents. 
# We can use different providers for different agents (Multimodel)
# If a specific provider fails to load (e.g. missing API key), fallback to default.
try:
    fast_model = create_model(provider="groq")
except ValueError:
    fast_model = create_model()

try:
    reasoning_model = create_model(provider="openai")
except ValueError:
    reasoning_model = create_model()

default_model = create_model()

signal_agent = Agent(
    name="Signal Agent",
    instructions=SIGNAL_AGENT_INSTRUCTIONS,
    tools=[reverse_geocode],
    model=fast_model,  # Quick extraction tasks
)

detection_agent = Agent(
    name="Detection Agent",
    instructions=DETECTION_AGENT_INSTRUCTIONS,
    tools=[search_local_news, get_traffic_matrix, get_nearby_signals],
    model=reasoning_model,
)

severity_agent = Agent(
    name="Severity Agent",
    instructions=SEVERITY_AGENT_INSTRUCTIONS,
    tools=[get_weather_alerts, get_traffic_matrix],
    model=reasoning_model,
)

verification_agent = Agent(
    name="Verification Agent",
    instructions=VERIFICATION_AGENT_INSTRUCTIONS,
    tools=[search_local_news, get_traffic_matrix],
    model=reasoning_model,
)

logging_agent = Agent(
    name="Logging Agent",
    instructions=LOGGING_AGENT_INSTRUCTIONS,
    tools=[emit_log, persist_chain_of_thought],
    model=fast_model,
)

resource_agent = Agent(
    name="Resource Allocation Agent",
    instructions=RESOURCE_AGENT_INSTRUCTIONS,
    tools=[allocate_resource],
    model=reasoning_model,
)

planning_agent = Agent(
    name="Planning Agent",
    instructions=PLANNING_AGENT_INSTRUCTIONS,
    tools=[create_action],
    model=reasoning_model,
)

notification_agent = Agent(
    name="Notification Agent",
    instructions=NOTIFICATION_AGENT_INSTRUCTIONS,
    tools=[send_notification],
    model=fast_model,
)
