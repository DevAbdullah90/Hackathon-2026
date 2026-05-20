import asyncio
import json
import uuid
from app.db.session import async_session_factory
from app.models.signals import Signal
from app.api.api_v1.endpoints.signals import _run_triage_pipeline

async def main():
    async with async_session_factory() as session:
        # Create and add a signal to the database
        db_signal = Signal(
            source="twitter",
            type="flash_flood",
            lat=24.918,
            lng=67.097,
            raw_payload={
                "comment": "Judges Custom Flood Scenario: Gulshan-e-Iqbal roads heavily inundated, traffic suspended.",
                "location_name": "Karachi"
            }
        )
        session.add(db_signal)
        await session.commit()
        await session.refresh(db_signal)
        print("Inserted signal with ID:", db_signal.id)
        
        signal_payload = {
            "source": db_signal.source,
            "type": db_signal.type,
            "lat": db_signal.lat,
            "lng": db_signal.lng,
            "raw_payload": db_signal.raw_payload,
            "signal_id": str(db_signal.id)
        }

    # Run the triage pipeline
    print("Running the triage pipeline...")
    await _run_triage_pipeline(signal_payload)
    print("Triage pipeline execution finished.")

if __name__ == "__main__":
    asyncio.run(main())
