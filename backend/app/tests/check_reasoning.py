import asyncio
from sqlalchemy.future import select
from app.core.database import async_session_factory
from app.models.reasoning_logs import ReasoningLog

async def main():
    async with async_session_factory() as session:
        query = select(ReasoningLog).order_by(ReasoningLog.created_at.desc()).limit(10)
        result = await session.execute(query)
        logs = result.scalars().all()
        print(f"Total logs fetched: {len(logs)}")
        for log in logs:
            print("="*80)
            print(f"ID: {log.id} | Agent: {log.agent_name} | Created: {log.created_at}")
            print(f"Log: {log.log_text[:500]}")

if __name__ == "__main__":
    asyncio.run(main())
