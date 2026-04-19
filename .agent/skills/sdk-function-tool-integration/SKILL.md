---
name: sdk-function-tool-integration
description: Exposes Python business logic to AI agents as function tools using the OpenAI Agents SDK. Use when registering async functions as agent tools, writing AI-readable docstrings, or wiring DB/API calls into an agent's toolbox.
---

# SDK Function Tool Integration

## When to use this skill
- When exposing a Python function (DB query, API call, computation) to an agent.
- When writing or reviewing tool docstrings — the LLM reads these to decide *when* to call the tool.
- When registering multiple tools on an `Agent` cleanly in a `tools/` module.
- When a tool needs shared resources (DB session, HTTP client) via `RunContextWrapper`.

## Workflow
- `[ ]` **Write the Function**: Create the async function in `app/agents/tools/`.
- `[ ]` **Write the Docstring**: Include description + `Args:` block — SDK uses this for the schema.
- `[ ]` **Decorate**: Apply `@function_tool`. SDK auto-generates JSON schema from type hints.
- `[ ]` **Pass Context**: Accept `ctx: RunContextWrapper[T]` as first param for shared resources.
- `[ ]` **Register on Agent**: Add to `Agent(tools=[...])`.
- `[ ]` **Validate Schema**: Print `tool.params_json_schema` to verify the LLM sees what you expect.

## Instructions

### 1. The Docstring Rule (High-Freedom)
The SDK extracts tool name, description, and parameter descriptions from the docstring. Vague docstrings = misused tools.
- ✅ Start with an action verb. Say *when* the agent should call this.
- ✅ Document every parameter in `Args:` — these become JSON schema descriptions.
- ❌ Never write `"""Get user records."""` — add context and triggers.

### 2. Tool Pattern
```python
# app/agents/tools/memory_tools.py
from agents import function_tool, RunContextWrapper
from sqlalchemy.ext.asyncio import AsyncSession

@function_tool
async def get_user_memory(ctx: RunContextWrapper[AsyncSession], session_id: str, limit: int = 20) -> list[dict]:
    """Retrieve conversation history for a session.

    Use this when the user references past conversations or asks what was discussed before.

    Args:
        session_id: The unique session identifier string.
        limit: Max number of messages to return (default 20).
    """
    db: AsyncSession = ctx.context
    # ... async db query
    return []
```

### 3. Register & Pass Context
```python
agent = Agent(name="Assistant", tools=[get_user_memory], instructions="Use get_user_memory to recall context.")

# Pass context (e.g., db session) when running:
result = await Runner.run(agent, user_input, context=db_session)
```

- For a complete module structure and tool schema validator, see `examples/tool_example.py`.

## Resources
- [Full tool example with context](examples/tool_example.py)
- [Docstring & schema tips](resources/tool_tips.md)
