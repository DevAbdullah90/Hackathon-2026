import json
import asyncio
import logging
from agents import Runner, trace
from app.ai.orchestrator import triage_agent

logging.basicConfig(level=logging.DEBUG)
logging.getLogger("agents").setLevel(logging.DEBUG)

async def test_routing():
    print("--- Testing Triage Routing ---")
    
    # 1. Single mock signal
    mock_signal = {
        "source": "user_gps",
        "lat": 33.6844,
        "lng": 73.0479,
        "type": "flood",
        "raw_payload": {"comment": "Water entering shops in G-10 Markaz"}
    }
    
    signal_json = json.dumps(mock_signal)
    print("Input:", signal_json)
    
    try:
        with trace("Triage Test", group_id="ciro_test_routing"):
            result = await Runner.run(triage_agent, signal_json)
            
        print("\n--- AGENT HISTORY ---")
        if hasattr(result, "messages"):
            for msg in result.messages:
                print(f"[{getattr(msg, 'agent_name', 'Unknown')}] {getattr(msg, 'role', '')}: {getattr(msg, 'content', '')}")
                
        print("\n--- FINAL OUTPUT ---")
        print(result.final_output)
        
    except Exception as e:
        print(f"\n[ERROR] Pipeline execution failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_routing())
