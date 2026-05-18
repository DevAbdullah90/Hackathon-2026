import asyncio
import sys
import json
import logging

sys.path.append(r"c:\Users\hp\OneDrive\Desktop\Hackathon AISeekho\backend")

logging.basicConfig(level=logging.INFO)

from agents import Runner
from app.ai.orchestrator import triage_agent
from app.db.session import init_db

async def run_pipeline():
    print("Initializing Database...")
    await init_db()
    
    print("Preparing signal payload...")
    signal_payload = {
        "source": "user_gps",
        "type": "flood",
        "lat": 24.9269279,
        "lng": 66.9666101,
        "raw_payload": {
            "lat": 24.9269279,
            "lng": 66.9666101,
            "type": "flood",
            "source": "user_gps"
        }
    }
    
    payload_str = json.dumps(signal_payload)
    
    print("Running Multi-Agent Orchestrator (Triage Agent)...")
    try:
        res = await Runner.run(triage_agent, payload_str)
        print("Triage Agent Pipeline execution complete!")
        safe_res = str(res).encode("ascii", "ignore").decode()
        print("Final Output:", safe_res)
    except Exception as e:
        print("ERROR RUNNING AGENT PIPELINE:", e)

if __name__ == "__main__":
    asyncio.run(run_pipeline())
