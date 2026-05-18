import asyncio
import sys
import uuid
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import select

sys.path.append(r"c:\Users\hp\OneDrive\Desktop\Hackathon AISeekho\backend")

from app.models.incidents import Incident
from app.models.actions import Action
from app.models.reasoning_logs import ReasoningLog, ChainOfThought

async def check():
    url = "postgresql+asyncpg://neondb_owner:npg_x1BEKRoIhrl4@ep-floral-tooth-aqnp7pkq-pooler.c-8.us-east-1.aws.neon.tech/neondb?"
    engine = create_async_engine(url, echo=False)
    
    from sqlalchemy.ext.asyncio import AsyncSession
    from sqlalchemy.orm import sessionmaker
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    incident_id = uuid.UUID("5926b28e-a20d-4252-b421-7c657aaf56ab")
    
    async with async_session() as session:
        # Check logs
        res_logs = await session.execute(
            select(ReasoningLog).where(ReasoningLog.incident_id == incident_id).order_by(ReasoningLog.created_at)
        )
        logs = res_logs.scalars().all()
        print(f"=== REASONING LOGS FOR {incident_id} ===")
        for log in logs:
            print(f"Agent: {log.agent_name} | Text: {log.log_text}")
            
        # Check CoT
        res_cot = await session.execute(
            select(ChainOfThought).where(ChainOfThought.incident_id == incident_id).order_by(ChainOfThought.created_at)
        )
        cots = res_cot.scalars().all()
        print(f"\n=== COT LOGS FOR {incident_id} ===")
        for cot in cots:
            print(f"Agent: {cot.agent_name} | Steps: {cot.cot_steps[:100]}...")

if __name__ == "__main__":
    asyncio.run(check())
