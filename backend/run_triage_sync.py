import asyncio
import sys
import logging
from sqlalchemy import select
from app.db.session import async_session_factory
from app.models.signals import Signal
from app.api.api_v1.endpoints.signals import _run_triage_pipeline

logging.basicConfig(level=logging.INFO)

async def test_run():
    async with async_session_factory() as session:
        res = await session.execute(select(Signal))
        sig = res.scalars().first()
        if not sig:
            print("No signals found in the database. Please trigger one first.")
            return

        payload = {
            "signal_id": str(sig.id),
            "source": sig.source,
            "type": sig.type,
            "lat": sig.lat,
            "lng": sig.lng,
            "raw_payload": sig.raw_payload
        }
        print(f"Running triage pipeline sync for signal ID: {sig.id}...")
        try:
            await _run_triage_pipeline(payload)
            print("Pipeline run completed!")
        except Exception as e:
            print(f"Pipeline failed with exception: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_run())
