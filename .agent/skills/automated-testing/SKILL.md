---
name: automated-testing
description: Implements unit, integration, and mocked async tests for FastAPI endpoints and OpenAI Agents SDK tool functions using pytest, pytest-asyncio, and HTTPX. Use when writing tests for agent tools, API routes, or simulating LLM responses without real API calls.
---

# Automated Testing

## When to use this skill
- When writing unit tests for agent tool functions in isolation (no LLM call).
- When integration-testing FastAPI routes with a real in-memory DB via HTTPX.
- When mocking `Runner.run` to simulate LLM responses and save API costs in CI.

## Workflow
- `[ ]` **Install**: `pip install pytest pytest-asyncio httpx pytest-mock aiosqlite`
- `[ ]` **Configure**: Set `asyncio_mode = "auto"` in `pyproject.toml`.
- `[ ]` **Write Fixtures**: Create `conftest.py` with async DB session and HTTPX client.
- `[ ]` **Unit Test Tools**: Call tool functions directly with a real in-memory DB session.
- `[ ]` **Integration Test Routes**: Use HTTPX `AsyncClient` with `ASGITransport(app=app)`.
- `[ ]` **Mock LLM**: Use `unittest.mock.patch` or `pytest-mock` to mock `Runner.run`.

## Instructions

### 1. Configure pytest
```toml
# pyproject.toml
[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
```

### 2. Core Fixture Pattern
```python
# tests/conftest.py — see examples/conftest_example.py for the full version
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.db.engine import get_session

@pytest_asyncio.fixture
async def client(db_session):
    app.dependency_overrides[get_session] = lambda: db_session
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()
```

### 3. Mock LLM Calls
```python
from unittest.mock import AsyncMock, patch

async def test_agent_mock():
    mock_result = AsyncMock()
    mock_result.final_output = "mocked response"
    with patch("app.agents.main.Runner.run", return_value=mock_result):
        from app.agents.main import run_agent
        assert await run_agent("hi") == "mocked response"
```

### Key Rules
- **Never** call real LLMs in unit tests — always mock `Runner.run`.
- Always `clear()` `app.dependency_overrides` after each test.
- Use `scope="session"` for the async engine to avoid recreating it per test.

## Resources
- [Full conftest + test examples](examples/conftest_example.py)
- [Testing tips & patterns](resources/testing_tips.md)
