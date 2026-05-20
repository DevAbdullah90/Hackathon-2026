import asyncio
import sys
import uuid
import json
import logging
sys.stdout.reconfigure(encoding='utf-8')

sys.path.append(r"c:\Users\hp\OneDrive\Desktop\Hackathon AISeekho\backend")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("app.api.api_v1.endpoints.signals")
logger.setLevel(logging.INFO)

from app.db.session import init_db
from app.api.api_v1.endpoints.signals import _run_triage_pipeline, pipeline_status_tracker

async def test_run():
    print("Initializing Database...")
    await init_db()
    
    sig_id = str(uuid.uuid4())
    print(f"Preparing heatwave signal payload with ID: {sig_id}...")
    signal_payload = {
        "signal_id": sig_id,
        "source": "twitter",
        "type": "heatwave",
        "lat": 24.8607,
        "lng": 67.0011,
        "raw_payload": {
            "comment": "Record temperatures at 47°C in Saddar. Citizens fainting near Empress Market due to extreme humidity. Multiple load-shedding zones reported.",
            "location_name": "Karachi"
        }
    }
    
    print("Running sequential _run_triage_pipeline for heatwave...")
    try:
        await _run_triage_pipeline(signal_payload)
        print("Pipeline execution complete!")
        print(f"\nFinal status in tracker: {pipeline_status_tracker.get(sig_id)}")
    except Exception as e:
        print("ERROR RUNNING PIPELINE:", e)

if __name__ == "__main__":
    asyncio.run(test_run())
