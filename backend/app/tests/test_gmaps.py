"""
app/simulation/test_gmaps.py
───────────────────────────
Utility to verify the Google Maps Distance Matrix API (Legacy).
Usage: python -m app.tests.test_gmaps
"""

import os
import httpx
import asyncio
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

async def test_distance_matrix():
    print(f"Testing Google Maps Distance Matrix API...")
    
    # Coordinates for a test in Karachi (from Sea View to Clifton)
    origin = "24.8145,67.0340"
    destination = "24.8138,67.0336"
    
    url = "https://maps.googleapis.com/maps/api/distancematrix/json"
    params = {
        "origins": origin,
        "destinations": destination,
        "key": API_KEY,
        "mode": "driving"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, params=params)
            data = response.json()
            
            if data.get("status") == "OK":
                element = data["rows"][0]["elements"][0]
                if element["status"] == "OK":
                    distance = element["distance"]["text"]
                    duration = element["duration"]["text"]
                    print(f"Success! Distance: {distance}, Duration: {duration}")
                else:
                    print(f"API Error (Element): {element['status']}")
            else:
                print(f"API Error (Root): {data.get('status')} - {data.get('error_message', 'No message')}")
                
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_distance_matrix())
