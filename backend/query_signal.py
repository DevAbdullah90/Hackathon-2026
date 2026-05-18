import asyncio
import sys
from sqlalchemy import select
from app.db.session import async_session_factory
from app.models.signals import Signal

sys.path.append(r"c:\Users\hp\OneDrive\Desktop\Hackathon AISeekho\backend")

async def main():
    async with async_session_factory() as session:
        res = await session.execute(select(Signal).where(Signal.id == "7012006f-c524-4c88-9554-fa04b983f0a4"))
        s = res.scalar()
        if s:
            print(f"ID: {s.id}")
            print(f"Source: {s.source}")
            print(f"Type: {s.type}")
            print(f"Lat/Lng: {s.lat}, {s.lng}")
            print(f"Location: {s.location}")
            print(f"Raw payload: {s.raw_payload}")
            print(f"Credibility score: {s.credibility_score}")
            print(f"Conflict flag: {s.conflict_flag}")
            print(f"Structured JSON: {s.structured_json}")
        else:
            print("Signal not found.")

if __name__ == "__main__":
    asyncio.run(main())
