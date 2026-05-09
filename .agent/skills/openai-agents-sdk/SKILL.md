---
name: orchestrating-openai-agents
description: Guides the implementation of multi-agent orchestration using the OpenAI Agents SDK. Use when the user wants to define autonomous agents, implement handoffs (delegation), or configure specialized SandboxAgents.
---

# OpenAI Agents SDK Orchestration

## When to use this skill
- When the user wants to build a multi-agent system.
- When you need to implement a "Handoff" between a generalist and a specialist agent.
- When the user mentions "agent delegation", "agent instructions", or "orchestrating agents".
- When configuring "SandboxAgents" for persistent execution environments.

## Workflow
- [ ] **Define Agents**: Create `Agent` instances with specific `name` and `instructions`.
- [ ] **Establish Handoffs**: 
    - Use `handoffs=[agent_b]` in the `Agent` constructor for simple delegation.
    - Use `Handoff(agent=agent_b, description="...")` for finer control over when the handoff is triggered.
- [ ] **Configure Tools**: Attach Python functions to the `tools` parameter of the relevant agent.
- [ ] **Select Orchestrator**:
    - Use `Runner.run()` for standard async loops.
    - Use `SandboxAgent` if a persistent filesystem or shell access is required.
- [ ] **Test Interaction**: Run a sample query to verify that the "transfer_to_<agent>" tool is correctly invoked.

## Instructions

### 1. Agent Definition (Medium-Freedom)
```python
from openai_agents import Agent

researcher = Agent(
    name="Researcher",
    instructions="You are a meticulous researcher. Find facts and summarize them.",
    tools=[search_web_tool]
)

manager = Agent(
    name="Manager",
    instructions="Coordinate tasks and delegate to the researcher when necessary.",
    handoffs=[researcher]
)
```

### 2. Handoff Patterns
Handoffs are converted into tools automatically. The `instructions` should clearly state when to use these handoffs.
- **Explicit Handoff**: `Handoff(agent=tech_support, name="transfer_to_support", description="Use for technical issues")`.
- **Agent as Tool**: Use `agent.as_tool()` if you want the agent to behave like a standard function call within another agent's context.

### 3. Running the System
```python
from openai_agents import Runner

async def main():
    result = await Runner.run(agent=manager, input="Research the history of AI.")
    print(result.final_output)
```

### 4. Specialized "Brains" (SandboxAgent)
Use `SandboxAgent` for tasks requiring code execution or file manipulation.
```python
from openai_agents import SandboxAgent, Manifest

coder = SandboxAgent(
    name="Coder",
    manifest=Manifest(
        requirements=["pandas", "numpy"],
        files={"data.csv": "col1,col2\n1,2"}
    )
)
```

## Resources
- [Full Orchestration Example](examples/multi_agent_system.py)
- [Handoff Best Practices](resources/handoff_tips.md)
