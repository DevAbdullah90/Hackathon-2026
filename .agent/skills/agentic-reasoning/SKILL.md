---
name: applying-agentic-reasoning
description: Provides a standardized framework for complex problem-solving, multi-step planning, and agent-to-agent communication. Use for multi-phase tasks, debugging, or when coordinating multiple specialized agents.
---

# Agentic Reasoning & Workflow

## When to use this skill
- When the task requires multiple distinct steps (e.g., "Implement feature X from DB to UI").
- When debugging a complex issue where the first fix might not work.
- When working in a multi-agent system where delegation is required.
- When the conversation history is long and requires context pruning/summarization.
- When the user asks for a "plan" or "architecture review".

## Workflow
- [ ] **Reasoning Phase**: Start with a `### Reasoning` block. Explain *why* you are choosing a specific path.
- [ ] **Planning Phase**: For complex requests, create or update a `PLAN.md` (or `implementation_plan.md`) in the artifacts/scratch directory.
- [ ] **Execution & Monitor**: Run tools and observe output.
- [ ] **Self-Correction**: If a tool fails, analyze the error in a new reasoning block before retrying.
- [ ] **Context Sync**: If the context window is near its limit, summarize previous decisions and append them to the current task list.
- [ ] **Handoff**: Identify if a specialized agent (Coder, Tester, Architect) is better suited for the next step and trigger a handoff.

## Instructions

### 1. Chain-of-Thought (CoT)
Before every significant action or code block, include a reasoning section.
*   **Identify**: The core problem.
*   **Evaluate**: Potential solutions.
*   **Select**: The most efficient tool or architecture.

### 2. The Planning Artifact
For any task involving >3 steps, generate a `PLAN.md`.
```markdown
# Implementation Plan: [Feature Name]

## Steps
1. [ ] Research/Analysis
2. [ ] Schema/Model Update
3. [ ] Logic/Service Implementation
4. [ ] API/Interface Exposure
5. [ ] Verification/Testing
```

### 3. Handoff Protocols
- **Architect -> Coder**: Hand off when the design is finalized and only implementation remains.
- **Coder -> Tester**: Hand off once the feature is written and requires unit/integration testing.
- **Generalist -> Specialist**: Hand off to a `SandboxAgent` if low-level system access or complex dependency isolation is needed.

### 4. Self-Correction Loop
Do not repeat failed commands without modification.
1. Capture error log.
2. Formulate hypothesis for failure.
3. Apply fix (e.g., update permissions, fix syntax, change path).
4. Re-run and verify.

### 5. Context Management
When context is full, create a `CONTEXT_SUMMARY.md`:
- **Current Goal**: What we are doing now.
- **Decisions Made**: Why we chose X over Y.
- **Pending Tasks**: What's left in the `PLAN.md`.

## Resources
- [Plan Template](resources/PLAN_TEMPLATE.md)
- [Handoff Protocol Details](resources/HANDOFF_PROTOCOLS.md)
