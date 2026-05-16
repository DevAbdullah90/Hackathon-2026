"""
app/ai/connection.py
────────────────────
OpenAI configuration via the OpenAI Agents SDK.
"""

import os
from dotenv import load_dotenv
from agents import (
    AsyncOpenAI, 
    OpenAIChatCompletionsModel, 
    RunConfig
)

load_dotenv()

gemini_api_key = os.getenv("GEMINI_API_KEY")
if not gemini_api_key:
    raise ValueError("GEMINI_API_KEY is not set in the .env file.")
gemini_client = AsyncOpenAI(
    api_key=gemini_api_key,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)
gemini_model = OpenAIChatCompletionsModel(
    model="gemini-2.0-flash",
    openai_client=gemini_client,
)

openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise ValueError("OPENAI_API_KEY is not set in the .env file. Please add it.")
openai_client = AsyncOpenAI(
    api_key=openai_api_key,
)
openai_model = OpenAIChatCompletionsModel(
    model="gpt-4o-mini",
    openai_client=openai_client,
)

gemini_config = RunConfig(
    model=gemini_model,
    model_provider=gemini_client
)

openai_config = RunConfig(
    model=openai_model,
    model_provider=openai_client
)
