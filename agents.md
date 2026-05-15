# 🤖 Agent Skill Registry

> **Instruction for the AI Agent:** For any task or work requested, you **MUST** first identify and use the most relevant specialized skill from `.agent/skills/`. Each skill contains a `SKILL.md` with detailed instructions — always read it before proceeding. Skills are your ground truth; prioritize them over general knowledge.

---

## 📌 How to Use Skills

1. Identify the work category from the table below.
2. Open the corresponding `SKILL.md` file using the `view_file` tool.
3. Follow the instructions **exactly** as documented in the skill.
4. If multiple skills apply, chain them in logical dependency order (e.g., architecture → database → testing).

---

## 🗂️ Skill Index

### 🧠 Agentic & Orchestration

| Skill Folder | Trigger / When to Use |
|---|---|
| `agentic-reasoning` | Multi-phase tasks, complex problem-solving, multi-step planning, agent-to-agent communication, or coordinating multiple specialized agents. |
| `openai-agents-sdk` | Defining autonomous agents, implementing handoffs (delegation), or configuring specialized agents using the OpenAI Agents SDK. |
| `multi-agent-guardrails` | Adding input/output safety layers, PII filtering, safe handoff logic, or preventing sensitive data leakage between agents. |
| `sdk-function-tool-integration` | Exposing Python business logic to AI agents as function tools, writing AI-readable docstrings, or wiring DB/API calls into an agent's toolbox. |

---

### 🏗️ Backend & API Development

| Skill Folder | Trigger / When to Use |
|---|---|
| `fastapi-architecture` | Initializing a FastAPI project, enforcing standardized structure, refactoring, or adding modular components like routers and models. |
| `async-database-migrations` | Setting up async PostgreSQL persistence using SQLModel, Alembic, and psycopg3. Use when defining ORM models, running migrations, or managing async sessions. |
| `pydantic-validation` | Defining API request/response schemas, validating external data, or enforcing strict type checks with Pydantic V2. |
| `api-integration` | Connecting to third-party APIs, managing HTTP clients, or integrating external services into the backend. |
| `authentication-flow` | Implementing user authentication, JWT handling, OAuth flows, or session-based auth in a backend service. |
| `session-management` | Managing user sessions, token refresh logic, or stateful session persistence across requests. |
| `error-handling` | Implementing structured error handling, custom exception classes, or standardized error response formats in APIs. |

---

### 🧪 Testing & Quality

| Skill Folder | Trigger / When to Use |
|---|---|
| `automated-testing` | Writing unit, integration, and mocked async tests for FastAPI endpoints and OpenAI Agents SDK tool functions using pytest, pytest-asyncio, and HTTPX. |
| `testing-debugging` | Debugging unexpected behavior, tracing failures, writing targeted regression tests, or diagnosing runtime errors. |

---

### 📊 Observability

| Skill Folder | Trigger / When to Use |
|---|---|
| `observability-tracing` | Instrumenting FastAPI and OpenAI Agents SDK with Logfire for end-to-end tracing, span-level performance tracking, and request correlation. |

---

### 📱 Mobile Development (React Native / Expo)

| Skill Folder | Trigger / When to Use |
|---|---|
| `generating-react-native-expo` | Generating and configuring code for React Native applications using the Expo framework. Use when building an Expo app, creating React Native components, or managing Expo configurations. |
| `generating-mobile-ui` | Generating modern, responsive mobile UI components and layouts when the user asks to build mobile interfaces or specific UI elements. |
| `building-mobile-screens` | Assembling complete mobile application screens by integrating individual UI components, managing screen-level state, and handling navigation. |
| `responsive-mobile-layout` | Creating layouts that adapt to different screen sizes, orientations, and platforms in React Native — including tablets vs phones handling. |
| `styling-with-nativewind` | Applying Tailwind CSS styling to React Native projects using NativeWind, or converting stylesheets to utility classes. |
| `navigation-setup` | Setting up navigation stacks, tab bars, drawer navigators, or deep linking in a React Native / Expo app. |
| `state-management` | Managing global or local state in React Native using Context, Zustand, Redux, or similar patterns. |
| `event-handling` | Handling user interactions, gestures, touch events, or system-level events in a React Native application. |

---

### 🧩 UI Components & Forms

| Skill Folder | Trigger / When to Use |
|---|---|
| `generating-reusable-components` | Building highly modular, customizable, and reusable UI components or design system elements. |
| `generating-forms` | Creating user input forms with validation, state management, and error handling. |

---

### 🛠️ Skill Development

| Skill Folder | Trigger / When to Use |
|---|---|
| `antigravity-skill-creator` | Generating a new high-quality `.agent/skills/` directory based on user requirements. Use when adding a new agent capability or automating a recurring task. |
| `creating-skills` | Creating new skills for the Antigravity agent environment — covers writing `SKILL.md` files, adding reusable agent instructions, or expanding agent capabilities. |

---

## ⚙️ Skill Chaining Guide

Some tasks require multiple skills. Use this guide to chain them in the correct order:

```
New FastAPI Project
  └─► fastapi-architecture
        └─► async-database-migrations
              └─► pydantic-validation
                    └─► authentication-flow
                          └─► automated-testing
                                └─► observability-tracing

New Multi-Agent System
  └─► agentic-reasoning
        └─► openai-agents-sdk
              └─► sdk-function-tool-integration
                    └─► multi-agent-guardrails
                          └─► observability-tracing

New Mobile App (Expo)
  └─► generating-react-native-expo
        └─► generating-mobile-ui
              └─► styling-with-nativewind
                    └─► navigation-setup
                          └─► building-mobile-screens
                                └─► state-management
```

---

## 📁 Skill Directory Location

All skills live under:

```
.agent/
└── skills/
    ├── agentic-reasoning/
    ├── antigravity-skill-creator/
    ├── api-integration/
    ├── async-database-migrations/
    ├── authentication-flow/
    ├── automated-testing/
    ├── building-mobile-screens/
    ├── creating-skills/
    ├── error-handling/
    ├── event-handling/
    ├── fastapi-architecture/
    ├── generating-forms/
    ├── generating-mobile-ui/
    ├── generating-react-native-expo/
    ├── generating-reusable-components/
    ├── multi-agent-guardrails/
    ├── navigation-setup/
    ├── observability-tracing/
    ├── openai-agents-sdk/
    ├── pydantic-validation/
    ├── responsive-mobile-layout/
    ├── sdk-function-tool-integration/
    ├── session-management/
    ├── state-management/
    ├── styling-with-nativewind/
    └── testing-debugging/
```

---

> **Last Updated:** 2026-05-15  
> **Total Skills Registered:** 26