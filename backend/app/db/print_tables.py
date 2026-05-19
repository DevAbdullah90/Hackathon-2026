import asyncio
from sqlalchemy import select
from app.db.session import async_session_factory
from app.models.signals import Signal
from app.models.incidents import Incident
from app.models.actions import Action
from app.models.resources import Resource
from app.models.reasoning_logs import ReasoningLog

async def main():
    async with async_session_factory() as session:
        # 1. Signals
        res_sig = await session.execute(select(Signal))
        sigs = res_sig.scalars().all()
        print(f"=== SIGNALS ({len(sigs)}) ===")
        for s in sigs:
            print(f"- ID: {s.id}, Source: {s.source}, Type: {s.type}, Credibility: {s.credibility_score}, Location: {s.location}, Conflict: {s.conflict_flag}")

        # 2. Incidents
        res_inc = await session.execute(select(Incident))
        incs = res_inc.scalars().all()
        print(f"\n=== INCIDENTS ({len(incs)}) ===")
        for i in incs:
            print(f"- ID: {i.id}, Location: {i.location}, Severity: {i.severity_score}, Status: {i.status}, Est Pop: {i.estimated_population}")

        # 3. Actions
        res_act = await session.execute(select(Action))
        acts = res_act.scalars().all()
        print(f"\n=== ACTIONS ({len(acts)}) ===")
        for a in acts:
            print(f"- ID: {a.id}, Type: {a.type}, Status: {a.status}, Side Effects: {a.predicted_side_effects}")

        # 4. Reasoning Logs
        res_logs = await session.execute(select(ReasoningLog))
        logs = res_logs.scalars().all()
        print(f"\n=== REASONING LOGS ({len(logs)}) ===")
        for l in logs:
            print(f"- Agent: {l.agent_name}, Level: {l.log_level}, Text Snippet: {l.log_text[:60]}")

if __name__ == "__main__":
    asyncio.run(main())
