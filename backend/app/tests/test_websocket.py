"""
app/tests/test_websocket.py
───────────────────────────
Standalone script to test the WebSocket ConnectionManager and broadcast.
Usage:
  1. Start server: uvicorn app.main:app --reload
  2. Run this script: python -m app.tests.test_websocket
"""

import asyncio
import websockets
import json
from app.ai.tools.tracer import emit_log

async def test_websocket():
    uri = "ws://localhost:8000/api/v1/ws/test-incident"
    print(f"🔗 Connecting to {uri}...")
    
    try:
        async with websockets.connect(uri) as websocket:
            print("✅ Connected! Waiting for broadcast...")
            
            # Simulate an agent emitting a log after a short delay
            async def trigger_log():
                await asyncio.sleep(1)
                print("📝 Emitting test log...")
                await emit_log(
                    agent_name="test_agent",
                    log_text="### Test Log\nThis is a real-time message via WebSocket.",
                    incident_id="test-incident",
                    log_level="INFO"
                )
            
            # Start the trigger in the background
            asyncio.create_task(trigger_log())
            
            # Wait for the message from the WebSocket
            response = await websocket.recv()
            data = json.loads(response)
            
            print("\n" + "="*40)
            print("📬 RECEIVED VIA WEBSOCKET:")
            print("="*40)
            print(json.dumps(data, indent=2))
            print("="*40)
            
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\nMake sure the server is running on http://localhost:8000")

if __name__ == "__main__":
    asyncio.run(test_websocket())
