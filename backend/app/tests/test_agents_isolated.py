import asyncio
import json
from agents import Runner
from app.ai.specialists import signal_agent, detection_agent, severity_agent
from app.simulation.seed_signals import SCENARIO_ISLAMABAD

async def run_live():
    print("--- 1. Testing Signal Agent ---")
    sig = SCENARIO_ISLAMABAD[0]
    print(f"Input: {sig}")
    res1 = await Runner.run(signal_agent, json.dumps(sig))
    print("Output:", res1.final_output)

if __name__ == "__main__":
    asyncio.run(run_live())
