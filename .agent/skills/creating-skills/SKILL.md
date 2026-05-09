---
name: creating-skills
description: Generates high-quality, predictable, and efficient skills for the Antigravity agent environment based on user requirements. Use when the user asks to create a new skill, add an agent capability, or write reusable agent instructions.
---

# Antigravity Skill Creator

## When to use this skill
- The user requests to create a "new skill" for the agent.
- The user asks the agent to "learn how to" do something repeatedly.
- The user provides a workflow and wants it standardized into reusable agent instructions.

## Workflow
- `[ ]` **Analyze Requirements**: Understand the core task, required tools, and potential failure points of the desired skill.
- `[ ]` **Determine Name**: Choose a concise gerund-form name (e.g., `managing-databases`). Max 64 chars. Lowercase, numbers, and hyphens only. Avoid model-specific names like "claude".
- `[ ]` **Create Structure**: Ensure the `.agent/skills/<skill-name>/` directory is created.
- `[ ]` **Draft SKILL.md**: Write the main logic, starting with the required YAML frontmatter.
- `[ ]` **Create Auxiliary Files**: If the skill requires complex scripts, templates, or examples, place them in `scripts/`, `resources/`, or `examples/` subdirectories.
- `[ ]` **Validate**: Review the output against the core writing principles (Conciseness, Progressive Disclosure, Degrees of Freedom).

## Instructions

### 1. Structural Requirements
- Always create the skill under `.agent/skills/<skill-name>/`.
- The main entry point must be exactly `SKILL.md`.
- Use optional folders like `scripts/`, `examples/`, and `resources/` to keep `SKILL.md` focused and clean.

### 2. YAML Frontmatter Standards
The `SKILL.md` MUST start with:
```yaml
---
name: [gerund-name-only-lowercase-and-hyphens]
description: [Written in 3rd person. Max 1024 chars. Must include specific triggers like "Use when the user..."]
---
```

### 3. Writing Principles (The "Claude Way")
- **Conciseness**: Assume the agent executing the skill is highly capable. Focus purely on the unique logic, edge cases, and specific commands. Do not explain basic concepts (e.g., what a Git repository is).
- **Progressive Disclosure**: Keep `SKILL.md` under 500 lines. If more details are required, link to secondary files (e.g., `[See ADVANCED.md](ADVANCED.md)`). Only nest one level deep.
- **Paths**: Always use forward slashes `/` for paths, even on Windows.
- **Degrees of Freedom**:
  - Use **Bullet Points** for high-freedom heuristic tasks (e.g., "Analyze the error logs for...").
  - Use **Code Blocks** for medium-freedom templates.
  - Use **Specific Bash Commands** for low-freedom, fragile operations.

### 4. Workflow & Feedback Loops
When designing a skill for complex tasks, you must include:
1. **Checklists**: Provide a markdown checklist the executing agent can copy to track state across multiple steps.
2. **Validation Loops**: Implement a "Plan-Validate-Execute" pattern (e.g., instruct the agent to run a dry-run or linting script before applying changes).
3. **Error Handling**: Treat scripts as black boxes. Instruct the agent to use `--help` or look at logs if they encounter errors, rather than guessing.

## Resources
- No external resources needed.
