---
name: observability-tracing
description: Instruments FastAPI and OpenAI Agents SDK with Logfire (by Pydantic) for end-to-end tracing, span-level performance tracking, and request correlation. Use when adding observability to agent workflows, debugging agent handoffs, or tracking database/LLM latency.
---

# Observability & Tracing

## When to use this skill
- When agent workflows are a "black box" and you need to see the chain of thought.
- When tracking latency of DB queries, LLM calls, or tool executions.
- When correlating a user's request across multiple agent handoffs via a trace ID.
- When setting up observability for the first time on a FastAPI + OpenAI Agents project.

## Workflow
- `[ ]` **Install**: `pip install logfire[fastapi,openai,asyncpg]`
- `[ ]` **Authenticate**: `logfire auth` then `logfire projects create <name>`
- `[ ]` **Configure**: Call `logfire.configure()` at the top of `main.py` — before FastAPI and agents.
- `[ ]` **Instrument Stack**: Add instrument calls for FastAPI, OpenAI Agents, and asyncpg.
- `[ ]` **Add Custom Spans**: Use `logfire.span("name", key=val)` around critical tool logic.
- `[ ]` **Add Trace ID Middleware**: Stamp every request so you can follow it across handoffs.

## Instructions

### 1. Full Instrumentation Block (Low-Freedom)
```python
# app/main.py — must come before FastAPI() and agent instantiation
import logfire

logfire.configure(service_name="my-agent-api")
logfire.instrument_openai_agents()  # agent runs, tool calls, handoffs
logfire.instrument_openai()         # raw OpenAI API spans
logfire.instrument_asyncpg()        # DB query spans

app = FastAPI()
logfire.instrument_fastapi(app)     # HTTP request/response spans
```

### 2. Custom Spans in Tool Functions
```python
import logfire

@function_tool
async def get_user_memory(ctx, session_id: str) -> list[dict]:
    """..."""
    with logfire.span("db.get_user_memory", session_id=session_id):
        return await fetch_from_db(session_id)
```

### 3. Key Rules
- `LOGFIRE_TOKEN` must be in `.env` — never commit it.
- Call `logfire.configure()` **before** `FastAPI()` and all agent definitions.
- View live traces at [logfire.pydantic.dev](https://logfire.pydantic.dev).

- For trace ID middleware and HTTPX instrumentation, see `examples/tracing_setup.py`.

## Resources
- [Full tracing setup example](examples/tracing_setup.py)
- [Span naming & tips](resources/tracing_tips.md)
