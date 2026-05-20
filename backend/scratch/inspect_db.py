import asyncio
import json
from sqlalchemy import select
from app.db.session import async_session_factory
from app.models.signals import Signal
from app.models.reasoning_logs import ReasoningLog, ChainOfThought

async def inspect():
    async with async_session_factory() as session:
        print("=== RECENT SIGNALS ===")
        stmt = select(Signal).order_by(Signal.created_at.desc()).limit(5)
        result = await session.execute(stmt)
        signals = result.scalars().all()
        for s in signals:
            print(f"ID: {s.id}")
            print(f"Source: {s.source}")
            print(f"Type: {s.type}")
            print(f"Location: {s.location}")
            print(f"Credibility Score: {s.credibility_score}")
            print(f"Conflict Flag: {s.conflict_flag}")
            print(f"Structured JSON: {json.dumps(s.structured_json, indent=2) if s.structured_json else None}")
            print("-" * 50)

        print("\n=== RECENT REASONING LOGS ===")
        stmt_logs = select(ReasoningLog).order_by(ReasoningLog.created_at.desc()).limit(10)
        res_logs = await session.execute(stmt_logs)
        logs = res_logs.scalars().all()
        for l in logs:
            text = str(l.log_text).encode('ascii', errors='replace').decode('ascii')
            print(f"[{l.created_at}] Agent: {l.agent_name} | Incident: {l.incident_id}")
            print(f"Output preview: {text[:300]}")
            print("-" * 50)

        print("\n=== RECENT CHAIN OF THOUGHTS ===")
        stmt_cot = select(ChainOfThought).order_by(ChainOfThought.created_at.desc()).limit(5)
        res_cot = await session.execute(stmt_cot)
        cots = res_cot.scalars().all()
        for c in cots:
            text = str(c.thoughts).encode('ascii', errors='replace').decode('ascii')
            print(f"[{c.created_at}] Agent: {c.agent_name}")
            print(f"Thoughts preview: {text[:300]}")
            print("-" * 50)

if __name__ == "__main__":
    asyncio.run(inspect())
