import asyncio
import os
import sys

# Ensure backend folder is in PYTHONPATH
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.db.session import async_session_factory
from sqlmodel import select, or_
from app.models.incidents import Incident

async def check():
    print("Testing DB connection and query...")
    try:
        async with async_session_factory() as session:
            query = (
                select(Incident)
                .where(or_(
                    Incident.status == "confirmed",
                    Incident.status == "CONFIRMED",
                    Incident.status == "monitoring",
                    Incident.status == "MONITORING",
                ))
            )
            result = await session.execute(query)
            incidents = result.scalars().all()
            print(f"Success! Found {len(incidents)} active incidents:")
            for inc in incidents:
                print(f"- {inc.id}: {inc.location} ({inc.status})")
    except Exception as e:
        print("ERROR OCCURRED:")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(check())
