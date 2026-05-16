"""
app/simulation/test_agent_sync.py
────────────────────────────────
Quick-test utility for running agents synchronously.
Matches the logic provided in the user's reference image.
Usage: python -m app.tests.test_agent_sync
"""

import sys
from agents import Runner
from app.ai.specialists import signal_agent
from app.ai.connection import config

def main():
    print("CIRO Sync Agent Tester")
    print("-" * 30)
    
    # Example input matching the user's prompt style
    user_input = "There is heavy water accumulation near Clifton Karachi, cars are floating."
    
    print(f"User Input: {user_input}\n")
    print("Refining reasoning... (calling Gemini Flash Lite)")
    
    try:
        # Using Runner.run_sync as requested by the user
        result = Runner.run_sync(
            signal_agent,
            user_input,
            run_config=config
        )
        
        print("\n" + "="*40)
        print("FINAL AI OUTPUT:")
        print("="*40)
        print(result.final_output)
        print("="*40)
        
    except Exception as e:
        print(f"🚨 Error: {e}")

if __name__ == "__main__":
    main()
