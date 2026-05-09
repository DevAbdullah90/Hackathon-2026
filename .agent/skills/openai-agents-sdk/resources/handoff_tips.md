# Handoff Best Practices

To ensure smooth transitions between agents in the OpenAI SDK:

### 1. Descriptive Handoffs
Don't just pass the agent object. Use the `Handoff` class to provide a clear description. This description is what the LLM sees in its tool definitions.
*   **Bad**: `handoffs=[researcher]`
*   **Good**: `handoffs=[Handoff(agent=researcher, description="Use this to look up specific facts or data points you don't know.")]`

### 2. Instruction Synergy
The parent agent's instructions must explicitly mention the capability of the child agent.
*   *Example*: "If the user asks for a code review, delegate to the 'Senior Developer' agent immediately."

### 3. State Awareness
Handoffs in the OpenAI SDK preserve the conversation history by default, but you should be mindful of token limits when handing off frequently in long conversations.

### 4. Avoiding Circular Handoffs
Ensure that two agents don't have instructions that lead them to hand off to each other indefinitely. Always have a "Primary" agent that acts as a gatekeeper.
