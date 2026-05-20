import asyncio
import sys
from sqlmodel import select
sys.stdout.reconfigure(encoding='utf-8')

sys.path.append(r"c:\Users\hp\OneDrive\Desktop\Hackathon AISeekho\backend")

from app.db.session import async_session_factory
from app.models.reasoning_logs import ChainOfThought

async def main():
    async with async_session_factory() as session:
        query = select(ChainOfThought).order_by(ChainOfThought.created_at.desc()).limit(5)
        results = (await session.execute(query)).scalars().all()
        
        for r in results:
            print(f"============================================================")
            print(f"Time: {r.created_at} | Agent: {r.agent_name}")
            print(f"Steps:\n{r.cot_steps}")
            print(f"============================================================")

if __name__ == "__main__":
    asyncio.run(main())
