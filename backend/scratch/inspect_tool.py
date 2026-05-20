from app.ai.tools.geo import reverse_geocode
import asyncio

async def test():
    try:
        res = await reverse_geocode.on_invoke_tool(None, '{"lat": 33.6844, "lng": 73.0479}')
        print("Result from on_invoke_tool:", res)
    except Exception as e:
        print("Error calling on_invoke_tool:", e)

asyncio.run(test())
