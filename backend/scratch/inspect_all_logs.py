import asyncio
import sys
sys.stdout.reconfigure(encoding='utf-8')

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import select

sys.path.append(r"c:\Users\hp\OneDrive\Desktop\Hackathon AISeekho\backend")

from app.models.reasoning_logs import ChainOfThought, ReasoningLog

async def inspect():
    url = "postgcirol+asyncpg://neondb_owner:npg_x1BEKRoIhrl4@ep-floral-tooth-aqnp7pkq-pooler.c-8.us-east-1.aws.neon.tech/neondb?"
    engine = create_async_engine(url, echo=False)
    
    from sqlalchemy.ext.asyncio import AsyncSession
    from sqlalchemy.orm import sessionmaker
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        res = await session.execute(
            select(ReasoningLog)
            .order_by(ReasoningLog.created_at.desc())
            .limit(20)
        )
        logs = res.scalars().all()
        print("=== LATEST REASONING LOGS ===")
        for log in logs:
            print(f"Time: {log.created_at} | Agent: {log.agent_name} | Incident: {log.incident_id}")
            print(f"Log: {log.log_text}")
            print("-" * 60)

if __name__ == "__main__":
    asyncio.run(inspect())
