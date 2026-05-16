"""
Test script for Google Maps API and SerpApi
"""

import asyncio
import os
import httpx
from dotenv import load_dotenv

# Load .env manually for standalone script
load_dotenv()

async def run_tests():
    print("====================================")
    print("Testing Google Maps Geocoding API...")
    print("====================================")
    
    lat = 33.6844
    lng = 73.0479
    print(f"Input: {lat}, {lng}")
    try:
        google_key = os.getenv("GOOGLE_MAPS_SERVER_KEY")
        if not google_key:
            print("ERROR: GOOGLE_MAPS_SERVER_KEY is missing.")
        else:
            params = {
                "latlng": f"{lat},{lng}",
                "key": google_key,
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get("https://maps.googleapis.com/maps/api/geocode/json", params=params)
                response.raise_for_status()
                data = response.json()
                results = data.get("results", [])
                if results:
                    print(f"Result Address: {results[0]['formatted_address']}")
                else:
                    print("API returned OK but no address found.")
    except Exception as e:
        print(f"Error calling Google Maps API: {e}")

    print("\n====================================")
    print("Testing SerpApi (Google News Search)...")
    print("====================================")
    
    query = "Islamabad rain flood"
    print(f"Input query: '{query}'")
    try:
        serp_key = os.getenv("SERP_API_KEY")
        if not serp_key:
            print("ERROR: SERP_API_KEY is missing.")
        else:
            params = {
                "q": query,
                "api_key": serp_key,
                "num": 5,
                "hl": "en",
                "gl": "pk",
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get("https://serpapi.com/search.json", params=params)
                response.raise_for_status()
                data = response.json()
                raw_results = data.get("organic_results", [])
                if raw_results:
                    print(f"Found {len(raw_results)} news results:")
                    for idx, res in enumerate(raw_results):
                        print(f"  {idx+1}. {res.get('title')}")
                        print(f"     Link: {res.get('link')}")
                else:
                    print("No results returned.")
    except Exception as e:
        print(f"Error calling SerpApi: {e}")

if __name__ == "__main__":
    asyncio.run(run_tests())
