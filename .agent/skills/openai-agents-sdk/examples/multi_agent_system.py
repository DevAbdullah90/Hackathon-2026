import asyncio
from openai_agents import Agent, Runner, Handoff

# Define specialized tools
async def get_weather(location: str):
    return f"The weather in {location} is sunny, 25°C."

# Define the specialist agent
weather_agent = Agent(
    name="WeatherAgent",
    instructions="You are a weather expert. Provide accurate weather reports.",
    tools=[get_weather]
)

# Define the entry-point agent
triage_agent = Agent(
    name="TriageAgent",
    instructions="You are a helpful assistant. If the user asks about weather, hand off to the WeatherAgent.",
    handoffs=[
        Handoff(
            agent=weather_agent, 
            description="Transfer to weather expert for any meteorological queries."
        )
    ]
)

async def main():
    # Simulate a user query
    user_input = "What's the weather like in London?"
    
    print(f"User: {user_input}")
    
    # Run the orchestration
    result = await Runner.run(agent=triage_agent, input=user_input)
    
    print(f"Final Response: {result.final_output}")

if __name__ == "__main__":
    asyncio.run(main())
