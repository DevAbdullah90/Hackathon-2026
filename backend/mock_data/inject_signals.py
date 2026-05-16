"""
backend/mock_data/inject_signals.py
-----------------------------------
A script to inject mock GPS and weather signals to trigger the full CIRO pipeline.
"""

import asyncio
import httpx

API_URL = "http://127.0.0.1:8000/api/v1/signals/"

# We simulate a cluster of signals around G-10 Sector, Islamabad
SIGNALS = [
    {
        "source": "weather_api",
        "type": "flood_risk",
        "lat": 33.6844,
        "lng": 73.0479,
        "raw_payload": {
            "location": "G-10, Islamabad",
            "alert": "Heavy Rainfall",
            "intensity_mm_per_hr": 35.0,
            "duration_hrs": 3.0
        }
    },
    {
        "source": "user_gps",
        "type": "flood",
        "lat": 33.6844,
        "lng": 73.0479,
        "raw_payload": {
            "lat": 33.6844,
            "lng": 73.0479,
            "type": "flood",
            "source": "user_gps",
            "message": "Water entering my house!"
        }
    },
    {
        "source": "user_gps",
        "type": "flood",
        "lat": 33.6851,
        "lng": 73.0481,
        "raw_payload": {
            "lat": 33.6851,
            "lng": 73.0481,
            "type": "flood",
            "source": "user_gps",
            "message": "Main road blocked by water."
        }
    },
    {
        "source": "user_gps",
        "type": "flood",
        "lat": 33.6840,
        "lng": 73.0477,
        "raw_payload": {
            "lat": 33.6840,
            "lng": 73.0477,
            "type": "flood",
            "source": "user_gps",
            "message": "Cars stuck in deep water."
        }
    }
]

async def main():
    print("Injecting Mock Signals into CIRO...")
    async with httpx.AsyncClient() as client:
        for index, sig in enumerate(SIGNALS):
            try:
                response = await client.post(API_URL, json=sig)
                response.raise_for_status()
                print(f"[{index+1}/4] Successfully injected: {sig['source']} at {sig.get('lat')}, {sig.get('lng')}")
            except Exception as e:
                print(f"[{index+1}/4] Failed to inject: {e}")
            await asyncio.sleep(1) # Slight delay to simulate realistic incoming reports

    print("\nInjection complete! The AI agents should now be processing the cluster.")

if __name__ == "__main__":
    asyncio.run(main())
