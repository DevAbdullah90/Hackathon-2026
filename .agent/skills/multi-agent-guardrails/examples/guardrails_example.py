"""
Full guardrails example: input guard, output PII guard, and tool-level guard.
"""
import json
import asyncio
from pydantic import BaseModel
from agents import (
    Agent, Runner, GuardrailFunctionOutput,
    InputGuardrailTripwireTriggered, OutputGuardrailTripwireTriggered,
    RunContextWrapper, TResponseInputItem,
    input_guardrail, output_guardrail,
    function_tool, tool_input_guardrail, ToolGuardrailFunctionOutput,
)

# --- Schema for checker agent ---
class SafetyCheck(BaseModel):
    is_unsafe: bool
    reason: str

_checker = Agent(
    name="SafetyChecker",
    instructions="Detect if the input is harmful, off-topic, or contains PII. Be conservative.",
    output_type=SafetyCheck,
)

# --- Input guardrail ---
@input_guardrail
async def safety_input_guardrail(
    ctx: RunContextWrapper[None], agent: Agent, input: str | list[TResponseInputItem]
) -> GuardrailFunctionOutput:
    result = await Runner.run(_checker, str(input), context=ctx.context)
    return GuardrailFunctionOutput(
        output_info=result.final_output,
        tripwire_triggered=result.final_output.is_unsafe,
    )

# --- Output PII guardrail (no LLM needed) ---
PII_TERMS = {"ssn", "social security", "credit card", "sk-"}

@output_guardrail
async def pii_output_guardrail(ctx, agent, output: str) -> GuardrailFunctionOutput:
    triggered = any(t in output.lower() for t in PII_TERMS)
    return GuardrailFunctionOutput(output_info={"pii": triggered}, tripwire_triggered=triggered)

# --- Tool-level input guard ---
@tool_input_guardrail
def block_secrets(data):
    args = json.loads(data.context.tool_arguments or "{}")
    if "sk-" in json.dumps(args):
        return ToolGuardrailFunctionOutput.reject_content("Remove secrets before calling this tool.")
    return ToolGuardrailFunctionOutput.allow()

@function_tool(tool_input_guardrails=[block_secrets])
async def query_database(sql: str) -> str:
    """Execute a read-only SQL query. Use when retrieving data from the database.

    Args:
        sql: The SQL SELECT statement to run.
    """
    return "[]"

# --- Agent with all guards ---
agent = Agent(
    name="SafeAgent",
    instructions="You are a helpful assistant.",
    input_guardrails=[safety_input_guardrail],
    output_guardrails=[pii_output_guardrail],
    tools=[query_database],
)

async def main():
    try:
        result = await Runner.run(agent, "Hello, how can you help?")
        print(result.final_output)
    except InputGuardrailTripwireTriggered:
        print("Input blocked by safety guardrail")
    except OutputGuardrailTripwireTriggered:
        print("Output blocked — PII detected")

if __name__ == "__main__":
    asyncio.run(main())
