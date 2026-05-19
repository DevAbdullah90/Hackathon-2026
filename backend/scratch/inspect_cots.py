import asyncio
import sys
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import select

sys.path.append(r"c:\Users\hp\OneDrive\Desktop\Hackathon AISeekho\backend")

from app.models.reasoning_logs import ChainOfThought, ReasoningLog
from app.models.incidents import Incident

async def inspect():
    url = "postgresql+asyncpg://neondb_owner:npg_x1BEKRoIhrl4@ep-floral-tooth-aqnp7pkq-pooler.c-8.us-east-1.aws.neon.tech/neondb?"
    engine = create_async_engine(url, echo=False)
    
    from sqlalchemy.ext.asyncio import AsyncSession
    from sqlalchemy.orm import sessionmaker
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Check cots
        res_cot = await session.execute(select(ChainOfThought).order_by(ChainOfThought.created_at.desc()).limit(15))
        cots = res_cot.scalars().all()
        print("=== LATEST CHAIN OF THOUGHT RECORDS ===")
        for cot in cots:
            print(f"ID: {cot.id} | Incident ID: {cot.incident_id} | Agent: {cot.agent_name}")
            print(f"Steps: {cot.cot_steps}\n" + "-"*50)

        # Check latest incidents
        res_inc = await session.execute(select(Incident).order_by(Incident.created_at.desc()).limit(5))
        incidents = res_inc.scalars().all()
        print("\n=== LATEST INCIDENTS ===")
        for inc in incidents:
            print(f"ID: {inc.id} | Location: {inc.location} | Type: {inc.disaster_type} | Status: {inc.status}")

if __name__ == "__main__":
    asyncio.run(inspect())
