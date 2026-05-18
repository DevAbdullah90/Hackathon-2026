import asyncio
import sys
import json
import logging

sys.path.append(r"c:\Users\hp\OneDrive\Desktop\Hackathon AISeekho\backend")

# Configure logging to console so we see all logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("app.api.api_v1.endpoints.signals")
logger.setLevel(logging.INFO)

from app.db.session import init_db
from app.api.api_v1.endpoints.signals import _run_triage_pipeline

async def test_run():
    print("Initializing Database...")
    await init_db()
    
    print("Preparing signal payload...")
    signal_payload = {
        "signal_id": "b8f59d57-1234-4d67-9c8e-8a1a2b3c4d5e", # Use a dummy valid UUID for testing
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
    
    print("Running sequential _run_triage_pipeline...")
    try:
        await _run_triage_pipeline(signal_payload)
        print("Pipeline execution complete!")
    except Exception as e:
        print("ERROR RUNNING PIPELINE:", e)

if __name__ == "__main__":
    asyncio.run(test_run())
