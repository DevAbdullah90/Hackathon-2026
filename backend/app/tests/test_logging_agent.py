import asyncio
import sys
import json
import logging

logging.basicConfig(level=logging.INFO)

sys.path.append(r"c:\Users\hp\OneDrive\Desktop\Hackathon AISeekho\backend")

from app.ai.specialists import logging_agent
from agents import Runner

async def main():
    log_payload = {
        "agent_name": "signal_agent",
        "agent_output": {
            "signal_id": "7012006f-c524-4c88-9554-fa04b983f0a4",
            "location": "G-9 Sector, Islamabad",
            "coordinates": [33.6844, 73.0479],
            "type": "flood",
            "source": "user_gps",
            "credibility_score": 0.7,
            "conflict_flag": False
        },
        "incident_id": None,
        "timestamp": "2026-05-18T03:00:00Z"
    }
    print("🚀 Running Logging Agent...")
    try:
        res = await Runner.run(logging_agent, json.dumps(log_payload))
        print("✅ Success!")
        print("Final Output:", res.final_output)
    except Exception as e:
        print("❌ Failed with exception:")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
