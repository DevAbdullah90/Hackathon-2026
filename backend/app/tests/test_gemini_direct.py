"""
app/simulation/test_gemini_direct.py
────────────────────────────────────
Direct test of the Gemini API using the OpenAI-compatible client.
Bypasses the 'agents' library to verify keys and model availability.
Usage: python -m app.tests.test_gemini_direct
"""

import os
import httpx
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
model_name = os.getenv("MODEL_NAME", "gemini-1.5-flash-latest")

def test_gemini():
    print(f"Testing Gemini Direct (Model: {model_name})")
    
    # Reference: https://ai.google.dev/gemini-api/docs/openai
    client = OpenAI(
        api_key=api_key,
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
    )
    
    try:
        response = client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": "You are the CIRO Signal Agent. Normalize the input."},
                {"role": "user", "content": "Flood at G-10 Islamabad."}
            ]
        )
        
        print("\nSuccess! Gemini Response:")
        print("-" * 30)
        print(response.choices[0].message.content)
        print("-" * 30)
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_gemini()
