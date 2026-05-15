"""
app/ai/connection.py
────────────────────
Gemini 2.0 Flash configuration via the OpenAI Agents SDK.
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

# Reference: https://ai.google.dev/gemini-api/docs/openai
external_client = AsyncOpenAI(
    api_key=gemini_api_key,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
)

model = OpenAIChatCompletionsModel(
    model="gemini-2.0-flash",
    openai_client=external_client,
)

config = RunConfig(
    model=model,
    model_provider=external_client
)
