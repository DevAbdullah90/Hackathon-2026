import asyncio
import sys
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import select

sys.path.append(r"c:\Users\hp\OneDrive\Desktop\Hackathon AISeekho\backend")

from app.models.incidents import Incident
from app.models.actions import Action

async def check():
    url = "postgcirol+asyncpg://neondb_owner:npg_x1BEKRoIhrl4@ep-floral-tooth-aqnp7pkq-pooler.c-8.us-east-1.aws.neon.tech/neondb?"
    engine = create_async_engine(url, echo=False)
    
    from sqlalchemy.ext.asyncio import AsyncSession
    from sqlalchemy.orm import sessionmaker
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Check incidents
        res_inc = await session.execute(select(Incident).order_by(Incident.created_at.desc()).limit(10))
        incidents = res_inc.scalars().all()
        print(f"=== INCIDENTS & ACTION COUNT ===")
        for inc in incidents:
            res_act = await session.execute(select(Action).where(Action.incident_id == inc.id))
            actions = res_act.scalars().all()
            print(f"ID: {inc.id} | Location: {inc.location} | Status: {inc.status} | Action Count: {len(actions)}")

if __name__ == "__main__":
    asyncio.run(check())
