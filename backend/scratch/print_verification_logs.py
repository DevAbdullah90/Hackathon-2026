import asyncio
import sys
from sqlmodel import select
sys.stdout.reconfigure(encoding='utf-8')

sys.path.append(r"c:\Users\hp\OneDrive\Desktop\Hackathon AISeekho\backend")

from app.db.session import async_session_factory
from app.models.reasoning_logs import ReasoningLog

async def main():
    async with async_session_factory() as session:
        query = select(ReasoningLog).where(ReasoningLog.agent_name == "verification_agent").order_by(ReasoningLog.created_at.desc()).limit(2)
        results = (await session.execute(query)).scalars().all()
        for r in results:
            print(f"Time: {r.created_at}")
            print(r.log_text)
            print("-" * 50)

if __name__ == "__main__":
    asyncio.run(main())
