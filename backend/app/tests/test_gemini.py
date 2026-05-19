import asyncio
import sys

sys.path.append(r"c:\Users\hp\OneDrive\Desktop\Hackathon AISeekho\backend")

from app.ai.factory import create_model

async def test():
    print("Creating model...")
    try:
        model = create_model()
        print("Model created successfully:", model)
        
        # Test call
        print("Sending chat completion test...")
        from agents import Agent, Runner
        
        test_agent = Agent(
            name="Test Agent",
            instructions="You are a helpful assistant. Reply with 'HELLO WORLD'.",
            model=model
        )
        
        res = await Runner.run(test_agent, "Hi")
        print("Response:", res)
    except Exception as e:
        print("ERROR IN GEMINI RUN:", e)

if __name__ == "__main__":
    asyncio.run(test())
