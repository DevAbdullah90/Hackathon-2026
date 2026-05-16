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

# gemini_api_key = os.getenv("GEMINI_API_KEY")
# if not gemini_api_key:
#     raise ValueError("GEMINI_API_KEY is not set in the .env file.")
# external_client = AsyncOpenAI(
#     api_key=gemini_api_key,
#     base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
# )
# model = OpenAIChatCompletionsModel(
#     model="gemini-1.5-pro",
#     openai_client=external_client,
# )

openai_api_key = os.getenv("OPENAI_API_KEY")

if not openai_api_key:
    raise ValueError("OPENAI_API_KEY is not set in the .env file. Please add it.")

external_client = AsyncOpenAI(
    api_key=openai_api_key,
)

model = OpenAIChatCompletionsModel(
    model="gpt-4o-mini",
    openai_client=external_client,
)

config = RunConfig(
    model=model,
    model_provider=external_client
)
