import asyncio
import sys
import json
import logging

# Ensure backend is in path
sys.path.append(r"c:\Users\hp\OneDrive\Desktop\Hackathon AISeekho\backend")

# Configure debug logging to see all HTTP requests
logging.basicConfig(level=logging.DEBUG)
sys.stdout.reconfigure(encoding='utf-8')

from app.db.session import init_db
from app.ai.specialists import logging_agent
from agents import Runner

async def test_logging():
    print("Initializing DB...")
    await init_db()

    payload = {
        "agent_name": "verification_agent",
        "agent_output": {
            "verification_id": "360387d9-707c-40ab-9ba0-3c3eafd86e49",
            "detection_id": "360387d9-707c-40ab-9ba0-3c3eafd86e49",
            "verdict": "RETRACT",
            "verification_score": 0.05,
            "incident_type_confirmed": "heatwave",
            "incident_type_override": None,
            "reclassification_note": None,
            "retract_alert": True,
            "evidence_used": ["Citizen report of heat / load-shedding (+0.15)", "Traffic flowing normally (-0.10)"],
            "reason": "The verification score did not meet the confirmation threshold due to lack of news evidence.",
            "recommended_action": "Inform local authorities and update public advisories regarding heat safety.",
            "processed_at": "2026-05-20T00:52:00Z",
            "agent": "verification_agent"
        },
        "incident_id": None,
        "timestamp": "2026-05-20T00:52:00Z"
    }

    print("Running logging agent...")
    try:
        res = await Runner.run(logging_agent, json.dumps(payload))
        print("Logging agent execution complete!")
        print("Final Output:")
        print(res.final_output)
    except Exception as e:
        print("ERROR RUNNING LOGGING AGENT:", e)

if __name__ == "__main__":
    asyncio.run(test_logging())
