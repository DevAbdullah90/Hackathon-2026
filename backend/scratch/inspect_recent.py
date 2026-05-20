import asyncio
import sys
sys.stdout.reconfigure(encoding='utf-8')

from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import select

sys.path.append(r"c:\Users\hp\OneDrive\Desktop\Hackathon AISeekho\backend")

from app.models.reasoning_logs import ChainOfThought, ReasoningLog
from app.models.signals import Signal

async def inspect():
    url = "postgcirol+asyncpg://neondb_owner:npg_x1BEKRoIhrl4@ep-floral-tooth-aqnp7pkq-pooler.c-8.us-east-1.aws.neon.tech/neondb?"
    engine = create_async_engine(url, echo=False)
    
    from sqlalchemy.ext.asyncio import AsyncSession
    from sqlalchemy.orm import sessionmaker
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Get count of total signals and logs
        total_sig = (await session.execute(select(Signal))).scalars().all()
        total_logs = (await session.execute(select(ReasoningLog))).scalars().all()
        print(f"Total Signals: {len(total_sig)}")
        print(f"Total Reasoning Logs: {len(total_logs)}")
        
        # Get logs from the last 15 minutes
        time_limit = datetime.utcnow() - timedelta(minutes=15)
        res = await session.execute(
            select(ReasoningLog)
            .where(ReasoningLog.created_at >= time_limit)
            .order_by(ReasoningLog.created_at.desc())
        )
        logs = res.scalars().all()
        print(f"=== RECENT REASONING LOGS (Last 15 minutes) - Count: {len(logs)} ===")
        for log in logs:
            print(f"Time: {log.created_at} | Agent: {log.agent_name} | Incident: {log.incident_id}")
            print(f"Log: {log.log_text}")
            print("-" * 60)

        # Get signals from the last 15 minutes
        res_sig = await session.execute(
            select(Signal)
            .where(Signal.created_at >= time_limit)
            .order_by(Signal.created_at.desc())
        )
        sigs = res_sig.scalars().all()
        print(f"\n=== RECENT SIGNALS (Last 15 minutes) - Count: {len(sigs)} ===")
        for sig in sigs:
            print(f"ID: {sig.id} | Created: {sig.created_at} | Source: {sig.source} | Type: {sig.type}")
            print(f"Payload: {sig.raw_payload}")
            print("-" * 60)

if __name__ == "__main__":
    asyncio.run(inspect())
