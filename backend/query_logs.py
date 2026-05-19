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
    with open("query_logs_output.txt", "w", encoding="utf-8") as f:
        f.write(f"=== REASONING LOGS ({len(logs)}) ===\n")
        for log in logs:
            f.write(f"[{log.created_at.isoformat()}] Agent: {log.agent_name} | Incident ID: {log.incident_id}\n")
            f.write(f"Log Text:\n{log.log_text}\n")
            f.write("-" * 50 + "\n")

if __name__ == "__main__":
    asyncio.run(main())
