"""
app/simulation/list_gemini_models.py
───────────────────────────────────
Lists all available models for the provided Gemini API Key.
Used to debug 404 errors in model selection.
Usage: python -m app.tests.list_gemini_models
"""

import os
import httpx
import asyncio
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

async def list_models():
    print("Fetching available Gemini models...")
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url)
            if response.status_code == 200:
                models = response.json().get("models", [])
                print("\nAvailable Models:")
                print("-" * 50)
                for model in models:
                    name = model.get("name").replace("models/", "")
                    print(f"- {name}")
                print("-" * 50)
            else:
                print(f"Error {response.status_code}: {response.text}")
        except Exception as e:
            print(f"Connection Error: {e}")

if __name__ == "__main__":
    asyncio.run(list_models())
