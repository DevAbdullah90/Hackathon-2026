"""
backend/mock_data/inject_signals.py
-----------------------------------
A script to inject mock GPS and weather signals to trigger the full CIRO pipeline.
"""

import asyncio
import httpx

API_URL = "http://127.0.0.1:8000/api/v1/signals/"

# We simulate a cluster of signals around Gulshan-e-Iqbal, Karachi
SIGNALS = [
    {
        "source": "weather_api",
        "type": "flood_risk",
        "lat": 24.9180,
        "lng": 67.0970,
        "raw_payload": {
            "location": "Gulshan-e-Iqbal, Karachi",
            "alert": "Heavy Rainfall",
            "intensity_mm_per_hr": 35.0,
            "duration_hrs": 3.0
        }
    },
    {
        "source": "user_gps",
        "type": "flood",
        "lat": 24.9180,
        "lng": 67.0970,
        "raw_payload": {
            "lat": 24.9180,
            "lng": 67.0970,
            "type": "flood",
            "source": "user_gps",
            "message": "Water entering local shopping area basement shops!"
        }
    },
    {
        "source": "user_gps",
        "type": "flood",
        "lat": 24.9185,
        "lng": 67.0975,
        "raw_payload": {
            "lat": 24.9185,
            "lng": 67.0975,
            "type": "flood",
            "source": "user_gps",
            "message": "Main commercial boulevard completely blocked by water."
        }
    },
    {
        "source": "user_gps",
        "type": "flood",
        "lat": 24.9175,
        "lng": 67.0965,
        "raw_payload": {
            "lat": 24.9175,
            "lng": 67.0965,
            "type": "flood",
            "source": "user_gps",
            "message": "Public buses stuck in deep water near Gulshan."
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
