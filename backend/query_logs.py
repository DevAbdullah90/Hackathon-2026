import asyncio
import sys
from sqlalchemy import select
from app.db.session import async_session_factory
from app.models.reasoning_logs import ReasoningLog

sys.path.append(r"c:\Users\hp\OneDrive\Desktop\Hackathon AISeekho\backend")

async def main():
    async with async_session_factory() as session:
        res = await session.execute(select(ReasoningLog).order_by(ReasoningLog.created_at.asc()))
        logs = res.scalars().all()
        print(f"=== REASONING LOGS ({len(logs)}) ===")
        for log in logs:
            print(f"[{log.created_at.isoformat()}] Agent: {log.agent_name} | Incident ID: {log.incident_id}")
            print(f"Log Text:\n{log.log_text}")
            print("-" * 50)

if __name__ == "__main__":
    asyncio.run(main())
