import asyncio
import sys

sys.path.append(r"c:\Users\hp\OneDrive\Desktop\Hackathon AISeekho\backend")

from app.db.session import init_db, async_session_factory
from app.models.reasoning_logs import ReasoningLog, ChainOfThought
from sqlmodel import select

async def main():
    await init_db()
    async with async_session_factory() as session:
        output = []
        output.append("--- REASONING LOGS ---")
        res = await session.execute(select(ReasoningLog).order_by(ReasoningLog.created_at.desc()).limit(15))
        for row in res.scalars().all():
            output.append(f"[{row.created_at}] Agent: {row.agent_name} | Level: {row.log_level}")
            output.append(f"Text: {row.log_text}\n")
            output.append("-" * 40)
        
        output.append("\n--- CHAIN OF THOUGHT LOGS ---")
        res_cot = await session.execute(select(ChainOfThought).order_by(ChainOfThought.created_at.desc()).limit(10))
        for row in res_cot.scalars().all():
            output.append(f"[{row.created_at}] Agent: {row.agent_name}")
            output.append(f"Steps: {row.cot_steps}\n")
            output.append("-" * 40)
            
        with open("scratch/logs_output.txt", "w", encoding="utf-8") as f:
            f.write("\n".join(output))
        print("Logs successfully written to scratch/logs_output.txt")

if __name__ == "__main__":
    asyncio.run(main())
