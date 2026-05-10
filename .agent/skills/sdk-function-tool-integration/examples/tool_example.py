"""
Full tool module example: definition, context passing, schema validation, and agent registration.
"""
import json
import asyncio
from agents import Agent, Runner, FunctionTool, RunContextWrapper, function_tool
from sqlalchemy.ext.asyncio import AsyncSession


# --- Tool 1: DB memory retrieval ---
@function_tool
async def get_user_memory(
    ctx: RunContextWrapper[AsyncSession],
    session_id: str,
    limit: int = 20,
) -> list[dict]:
    """Retrieve the conversation history for a given session.

    Use this when the user references past conversations or asks what was discussed before.

    Args:
        session_id: The unique session identifier string.
        limit: Maximum number of messages to retrieve (default 20).
    """
    db: AsyncSession = ctx.context
    # result = await db.execute(select(AgentMemory).where(...).limit(limit))
    # return [{"role": r.role, "content": r.content} for r in result.scalars().all()]
    return [{"role": "user", "content": f"Mock memory for {session_id}"}]


# --- Tool 2: Simple computation (no context needed) ---
@function_tool
async def summarize_text(text: str, max_words: int = 50) -> str:
    """Summarize a block of text to a shorter version.

    Use this when the user asks to shorten, condense, or summarize content.

    Args:
        text: The full text to summarize.
        max_words: Target word count for the summary (default 50).
    """
    words = text.split()
    return " ".join(words[:max_words]) + ("..." if len(words) > max_words else "")


# --- Agent registration ---
agent = Agent(
    name="ProjectAssistant",
    instructions="Use get_user_memory to recall context. Use summarize_text to condense long content.",
    tools=[get_user_memory, summarize_text],
)


# --- Schema validator (run this to verify LLM sees correct schema) ---
def print_tool_schemas():
    for tool in agent.tools:
        if isinstance(tool, FunctionTool):
            print(f"\nTool: {tool.name}")
            print(f"Description: {tool.description}")
            print(json.dumps(tool.params_json_schema, indent=2))


if __name__ == "__main__":
    print_tool_schemas()
