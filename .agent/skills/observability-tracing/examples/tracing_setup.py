"""
Full observability setup: Logfire instrumentation, trace ID middleware, and custom spans.
"""
import uuid
import logfire
from fastapi import FastAPI
from starlette.middleware.base import BaseHTTPMiddleware
from agents import Agent, Runner, function_tool, RunContextWrapper
from httpx import AsyncClient

# --- 1. Configure Logfire (must come first) ---
logfire.configure(service_name="hackathon-api")
logfire.instrument_openai_agents()  # agent runs, tool calls, handoffs
logfire.instrument_openai()         # raw OpenAI API spans
logfire.instrument_asyncpg()        # PostgreSQL query spans

# --- 2. FastAPI setup ---
app = FastAPI()
logfire.instrument_fastapi(app)     # HTTP request/response spans

# --- 3. Trace ID Middleware ---
class TraceIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        trace_id = request.headers.get("X-Trace-ID", str(uuid.uuid4()))
        with logfire.span("http.request", trace_id=trace_id, path=request.url.path):
            response = await call_next(request)
            response.headers["X-Trace-ID"] = trace_id
            return response

app.add_middleware(TraceIDMiddleware)

# --- 4. Tool with custom span ---
@function_tool
async def fetch_external_data(ctx: RunContextWrapper[AsyncClient], url: str) -> str:
    """Fetch data from an external URL.

    Args:
        url: The full URL to fetch.
    """
    with logfire.span("http.fetch_external", url=url):
        response = await ctx.context.get(url)
        return response.text

# --- 5. Running an agent with full tracing ---
async def run_agent(user_input: str) -> str:
    agent = Agent(name="DataAgent", tools=[fetch_external_data])
    async with AsyncClient() as client:
        logfire.instrument_httpx(client)
        result = await Runner.run(agent, user_input, context=client)
    return result.final_output
