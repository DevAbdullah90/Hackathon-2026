---
name: multi-agent-guardrails
description: Implements input/output guardrails, PII filtering, and safe handoff logic for multi-agent systems using the OpenAI Agents SDK and Pydantic. Use when adding safety layers to agents, validating cross-agent data, or preventing sensitive data leakage.
---

# Multi-Agent Guardrails & Safety

## When to use this skill
- When an agent must validate user input before processing (block junk, PII, off-topic).
- When an agent's output must be scrubbed before being shown to the user or another agent.
- When adding conditional handoff logic between agents (e.g., Triager → Specialist).
- When adding a FastAPI middleware layer to filter sensitive data before it hits the LLM.

## Workflow
- `[ ]` **Define Schema**: Create a Pydantic model for the checker agent's structured output.
- `[ ]` **Input Guardrail**: Use `@input_guardrail` to validate user messages before the agent runs.
- `[ ]` **Output Guardrail**: Use `@output_guardrail` to scrub sensitive content from responses.
- `[ ]` **Tool Guards**: Use `@tool_input_guardrail` / `@tool_output_guardrail` for sensitive tools.
- `[ ]` **Register on Agent**: Attach via `input_guardrails=[...]` / `output_guardrails=[...]`.
- `[ ]` **Handle Tripwires**: Catch exceptions at the runner level and return safe error responses.

## Instructions

### 1. Input Guardrail Pattern
```python
from pydantic import BaseModel
from agents import Agent, Runner, GuardrailFunctionOutput, RunContextWrapper, input_guardrail

class SafetyCheck(BaseModel):
    is_unsafe: bool
    reason: str

_checker = Agent(name="SafetyChecker", instructions="Detect harmful or off-topic input.", output_type=SafetyCheck)

@input_guardrail
async def safety_guardrail(ctx: RunContextWrapper[None], agent, input) -> GuardrailFunctionOutput:
    result = await Runner.run(_checker, str(input), context=ctx.context)
    return GuardrailFunctionOutput(output_info=result.final_output, tripwire_triggered=result.final_output.is_unsafe)
```

### 2. PII Output Guardrail (no LLM needed)
```python
PII_TERMS = {"ssn", "social security", "credit card", "sk-"}

@output_guardrail
async def pii_guardrail(ctx, agent, output: str) -> GuardrailFunctionOutput:
    triggered = any(t in output.lower() for t in PII_TERMS)
    return GuardrailFunctionOutput(output_info={"pii": triggered}, tripwire_triggered=triggered)
```

### 3. Handling Tripwires
```python
from agents import InputGuardrailTripwireTriggered, OutputGuardrailTripwireTriggered
try:
    result = await Runner.run(agent, user_input)
except InputGuardrailTripwireTriggered:
    return {"error": "Input rejected by safety guardrail"}
except OutputGuardrailTripwireTriggered:
    return {"error": "Output blocked — PII detected"}
```

- For full examples with tool-level guards, see `examples/guardrails_example.py`.
- For FastAPI PII middleware, see `resources/guardrail_tips.md`.

## Resources
- [Guardrail tips & middleware](resources/guardrail_tips.md)
- [Full guardrails example](examples/guardrails_example.py)
