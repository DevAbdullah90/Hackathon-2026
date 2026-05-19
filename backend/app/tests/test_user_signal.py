import asyncio
import sys
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

sys.path.append(r"c:\Users\hp\OneDrive\Desktop\Hackathon AISeekho\backend")

from app.api.api_v1.endpoints.signals import _run_triage_pipeline

async def main():
    payload = {
        "signal_id": "7012006f-c524-4c88-9554-fa04b983f0a4",
        "lat": 33.6844,
        "lng": 73.0479,
        "type": "flood",
        "source": "user_gps"
    }
    print("🚀 Running _run_triage_pipeline with user GPS payload...")
    try:
        await _run_triage_pipeline(payload)
        print("✅ Pipeline completed successfully!")
    except Exception as e:
        print("❌ Pipeline crashed with exception:")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
