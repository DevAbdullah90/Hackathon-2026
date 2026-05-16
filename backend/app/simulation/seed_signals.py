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
        "source": "user_gps",
        "lat": 33.6844,
        "lng": 73.0479,
        "type": "flood",
        "raw_payload": {"comment": "Water entering shops in G-10 Markaz"}
    },
    {
        "source": "user_gps",
        "lat": 33.6850,
        "lng": 73.0485,
        "type": "flood",
        "raw_payload": {"comment": "Heavy water accumulation on main road"}
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
    print("3. Run Both Scenarios")
    print("q. Quit")
    
    choice = input("\nSelect a scenario to fire: ").strip().lower()
    
    if choice == '1':
        await run_scenario("Islamabad G-10", SCENARIO_ISLAMABAD)
    elif choice == '2':
        await run_scenario("Karachi Clifton", SCENARIO_KARACHI)
    elif choice == '3':
        await run_scenario("Islamabad G-10", SCENARIO_ISLAMABAD)
        print("Waiting for cooldown...")
        await asyncio.sleep(5)
        await run_scenario("Karachi Clifton", SCENARIO_KARACHI)
    elif choice == 'q':
        sys.exit()
    else:
        print("Invalid choice.")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
