"""
app/simulation/seed_signals.py
──────────────────────────────
Simulation Controller: Fires mock signals into the CIRO pipeline to trigger scenarios.
Usage: python -m app.simulation.seed_signals
"""

import asyncio
import httpx
import sys

BASE_URL = "http://localhost:8000/api/v1/signals"

# ── SCENARIO 1: LOCAL FLOODING (ISLAMABAD G-10) ──────────────────────────────
# A cluster of 3 citizen reports in close proximity.
SCENARIO_ISLAMABAD = [
    {
        "source": "social_mock",
        "lat": 33.7294,
        "lng": 73.0931,
        "type": "medical_emergency",
        "raw_payload": {
            "text": "Ambulance stuck in flood water near F-6 Markaz! Patient needs oxygen!", 
            "platform": "twitter", 
            "urgency": "high"
        }
    },
    {
        "source": "traffic_api",
        "lat": 33.7300,
        "lng": 73.0940,
        "type": "traffic_blockage",
        "raw_payload": {
            "status": "BLOCKED", 
            "reason": "Flash Flood", 
            "location": "F-6 Super Market"
        }
    },
    {
        "source": "user_gps",
        "lat": 33.6840,
        "lng": 73.0470,
        "type": "flood",
        "raw_payload": {"comment": "Drainage blocked, roads underwater"}
    }
]

# ── SCENARIO 2: MONSOON CRISIS (KARACHI CLIFTON) ──────────────────────────────
# A combination of API alerts and citizen reports.
SCENARIO_KARACHI = [
    {
        "source": "weather_api",
        "lat": 24.8138,
        "lng": 67.0336,
        "type": "flood_risk",
        "raw_payload": {
            "alert": "Extreme Precipitation",
            "intensity_mm_hr": 45.0,
            "description": "Red Alert: Severe monsoon system over Clifton"
        }
    },
    {
        "source": "traffic_api",
        "lat": 24.8150,
        "lng": 67.0350,
        "type": "traffic_blockage",
        "raw_payload": {
            "status": "BLOCKED",
            "congestion": "Critical",
            "location": "Khayaban-e-Iqbal"
        }
    },
    {
        "source": "user_gps",
        "lat": 24.8145,
        "lng": 67.0340,
        "type": "flood",
        "raw_payload": {"comment": "Cars floating near Sea View"}
    }
]

# ── SCENARIO 3: EDGE CASES (LAHORE GULBERG) ──────────────────────────────
# Tests system resilience against missing data, bad coords, and unexpected keys.
SCENARIO_LAHORE_EDGE_CASE = [
    {
        "source": "social_mock",
        "lat": None,
        "lng": None,
        "type": "flood",
        "raw_payload": {
            "text": "Gulberg Main Boulevard is completely underwater. Cars are stuck.",
            "platform": "twitter",
            "hashtags": ["#LahoreRain", "#GulbergFlood"]
        }
    },
    {
        "source": "user_gps",
        "lat": 31.5204,
        "lng": 74.3587,
        "type": "",  # Missing type, should be inferred
        "raw_payload": {
            "comment": "Water entering shops near Liberty Market.",
            "unexpected_nested_data": {"device": "iPhone", "battery": "12%"}
        }
    },
    {
        "source": "unknown",
        "lat": 31.5200,
        "lng": 74.3580,
        "type": "non_flood",  # Contradictory signal (false alarm or irrelevant)
        "raw_payload": {
            "report": "Road is perfectly dry here. No water."
        }
    }
]

async def fire_signal(payload: dict, client: httpx.AsyncClient):
    print(f"📡 Sending signal from {payload['source']}...")
    try:
        response = await client.post("/", json=payload)
        if response.status_code == 201:
            print(f"✅ Success: Signal {response.json().get('id')} created.")
        elif response.status_code == 200:
            print(f"⚠️ Duplicate: {response.json().get('status')}")
        else:
            print(f"❌ Error {response.status_code}: {response.text}")
    except Exception as e:
        print(f"🚨 Connection Error: {e}")

async def run_scenario(name: str, signals: list):
    print(f"\n🎬 STARTING SCENARIO: {name}")
    print("=" * 40)
    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        for signal in signals:
            await fire_signal(signal, client)
            # Short delay to prevent race conditions during testing
            await asyncio.sleep(1)
    print("=" * 40)
    print(f"🏁 SCENARIO {name} COMPLETED.\n")

async def main():
    print("🌊 CIRO Simulation Controller")
    print("1. Scenario 1: Local Flooding (Islamabad G-10)")
    print("2. Scenario 2: Monsoon Crisis (Karachi Clifton)")
    print("3. Scenario 3: Edge Cases (Lahore Gulberg)")
    print("4. Run All Scenarios")
    print("q. Quit")
    
    choice = input("\nSelect a scenario to fire: ").strip().lower()
    
    if choice == '1':
        await run_scenario("Islamabad G-10", SCENARIO_ISLAMABAD)
    elif choice == '2':
        await run_scenario("Karachi Clifton", SCENARIO_KARACHI)
    elif choice == '3':
        await run_scenario("Lahore Gulberg Edge Cases", SCENARIO_LAHORE_EDGE_CASE)
    elif choice == '4':
        await run_scenario("Islamabad G-10", SCENARIO_ISLAMABAD)
        await asyncio.sleep(3)
        await run_scenario("Karachi Clifton", SCENARIO_KARACHI)
        await asyncio.sleep(3)
        await run_scenario("Lahore Gulberg Edge Cases", SCENARIO_LAHORE_EDGE_CASE)
    elif choice == 'q':
        sys.exit()
    else:
        print("Invalid choice.")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
