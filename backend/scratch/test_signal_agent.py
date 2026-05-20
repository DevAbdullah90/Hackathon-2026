import asyncio
import json
from app.ai.specialists import signal_agent
from agents import Runner

async def main():
    payload = {
        "source": "twitter",
        "type": "flash_flood",
        "lat": 24.918,
        "lng": 67.097,
        "raw_payload": {
            "comment": "Judges Custom Flood Scenario: Gulshan-e-Iqbal roads heavily inundated, traffic suspended.",
            "location_name": "Karachi"
        },
        "signal_id": "65714c56-f18d-452f-ad8d-d3e236b79a56"
    }
    
    print("Running Signal Agent with payload...")
    res = await Runner.run(signal_agent, json.dumps(payload))
    print("\n=== FINAL OUTPUT ===")
    print(res.final_output)
    
if __name__ == "__main__":
    asyncio.run(main())
