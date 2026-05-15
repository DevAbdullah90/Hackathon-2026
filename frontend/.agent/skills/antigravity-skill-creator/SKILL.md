---
name: creating-antigravity-skills
description: Generates high-quality, predictable, and efficient .agent/skills/ directories based on user requirements. Use when the user asks to create a new skill, automate a task, or expand the agent's capabilities.
---

# Antigravity Skill Creator

## When to use this skill
- When the user wants to encapsulate a specific workflow into a reusable agent skill.
- When you need to create a structured capability within the `.agent/skills/` directory.
- When the user mentions "creating a skill", "automating this workflow", or "adding a new capability".

## Workflow
- [ ] **Identify Requirement**: Determine the core logic and name for the new skill.
- [ ] **Initialize Structure**: Create the `<skill-name>/` directory and subfolders (`scripts/`, `resources/`, `examples/`).
- [ ] **Draft Frontmatter**: Ensure the `name` is a gerund (e.g., `managing-files`) and the `description` is in the third person.
- [ ] **Write SKILL.md**:
    - [ ] Add "When to use" section with clear triggers.
    - [ ] Add "Workflow" section with a copyable checklist.
    - [ ] Add "Instructions" with concise, high-freedom (bullet points) or low-freedom (scripts) logic.
- [ ] **Finalize Assets**: Add any helper scripts or templates to the respective folders.

## Instructions

### 1. Naming Conventions
- **Skill Folder**: Use `kebab-case` (e.g., `my-cool-skill`).
- **YAML Name**: Use a gerund form (e.g., `doing-something`). Max 64 chars.
- **Description**: Must be third-person and include keywords for the agent's routing logic.

### 2. Writing Logic
- **Be Concise**: Do not explain common concepts. Focus on the *how* for this specific skill.
- **Progressive Disclosure**: Keep the main `SKILL.md` under 500 lines. Use links to other `.md` files in the same directory for deep dives.
- **Pathing**: Always use forward slashes `/`.

### 3. Degrees of Freedom
- **High Freedom**: Use bullet points for heuristics and general rules.
- **Medium Freedom**: Use markdown code blocks for templates the agent should fill in.
- **Low Freedom**: Use specific `bash` or `python` commands for operations that must be precise.

## Resources
- [Skill Template](resources/TEMPLATE.md)
- [Example Skill](examples/example-skill.md)
