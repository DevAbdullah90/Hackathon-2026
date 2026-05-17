---
name: automated-testing
description: Implements unit, integration, and live end-to-end async tests for FastAPI endpoints and OpenAI Agents SDK tool functions using pytest, pytest-asyncio, and HTTPX. Supports both mocked LLM tests (for CI) and live API tests (with real keys) for full pipeline verification. Use when writing tests for agent tools, API routes, simulating LLM responses, or running real integration tests.
---

# Automated Testing

## When to use this skill
- When writing unit tests for agent tool functions in isolation (no LLM call).
- When integration-testing FastAPI routes with a real DB via HTTPX.
- When mocking `Runner.run` to simulate LLM responses and save API costs in CI.
- When running LIVE end-to-end pipeline tests with real OpenAI/Gemini API keys.
- When verifying full agent chain: Signal → Detection → Severity → Resource → Planning → Notification → Simulation.

## Workflow
- `[ ]` **Install**: `pip install pytest pytest-asyncio httpx pytest-mock aiosqlite`
- `[ ]` **Configure**: Set `asyncio_mode = "auto"` in `pyproject.toml`.
- `[ ]` **Write Fixtures**: Create `conftest.py` with async DB session and HTTPX client.
- `[ ]` **Unit Test Tools**: Call tool functions directly with a real DB session.
- `[ ]` **Integration Test Routes**: Use HTTPX `AsyncClient` with `ASGITransport(app=app)`.
- `[ ]` **Mock LLM**: Use `unittest.mock.patch` or `pytest-mock` to mock `Runner.run`.
- `[ ]` **Live E2E Test**: Use `Runner.run` with real `RunConfig` (Gemini or OpenAI) and real API keys.

## Instructions

### 1. Configure pytest
```toml
# pyproject.toml
[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["app/tests"]
```

### 2. Core Fixture Pattern
```python
# tests/conftest.py
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.db.session import get_session

@pytest_asyncio.fixture
async def client(db_session):
    app.dependency_overrides[get_session] = lambda: db_session
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()
```

### 3. Mock LLM Calls (for CI / unit tests)
```python
from unittest.mock import AsyncMock, patch

async def test_agent_mock():
    mock_result = AsyncMock()
    mock_result.final_output = '{"confirmed": true, "confidence": 0.95}'
    with patch("agents.Runner.run", return_value=mock_result):
        result = await Runner.run(detection_agent, "test input", run_config=config)
        assert result.final_output is not None
```

### 4. Live API Test Pattern (with real keys)
```python
# Use real RunConfig with actual API keys — for pre-demo verification only
from app.ai.connection import openai_config  # or gemini_config
from agents import Runner

async def test_live_agent():
    result = await Runner.run(signal_agent, json.dumps(signal_payload), run_config=openai_config)
    output = json.loads(result.final_output)
    assert output["credibility_score"] > 0
```

### 5. Full Pipeline E2E Pattern
```python
# Run the complete chain sequentially: Signal → Detection → Severity → Resource → Planning → Notification
async def test_full_pipeline():
    # 1. Signal Agent — normalizes each raw signal
    processed = []
    for sig in SCENARIO_KARACHI:
        res = await Runner.run(signal_agent, json.dumps(sig), run_config=config)
        processed.append(json.loads(res.final_output))

    # 2. Detection Agent — clusters and confirms
    res = await Runner.run(detection_agent, json.dumps(processed), run_config=config)
    detection = json.loads(res.final_output)
    assert detection["confirmed"] == True

    # 3. Severity Agent — scores risk 1-10
    res = await Runner.run(severity_agent, json.dumps(detection), run_config=config)
    severity = json.loads(res.final_output)
    assert severity["severity_score"] > 0

    # 4. Resource Agent — allocates emergency resources
    res = await Runner.run(resource_agent, json.dumps(severity), run_config=config)
    
    # 5. Planning Agent — creates PENDING actions in DB
    res = await Runner.run(planning_agent, json.dumps(severity), run_config=config)

    # 6. Notification Agent — dispatches 6 stakeholder alerts
    res = await Runner.run(notification_agent, json.dumps(severity), run_config=config)
    assert res.final_output is not None
```

### 6. API Route Integration Test
```python
async def test_signal_ingest_via_api(client):
    payload = {
        "source": "weather_api",
        "type": "flood_risk",
        "lat": 33.6844,
        "lng": 73.0479,
        "raw_payload": {"alert": "Heavy Rainfall", "intensity_mm_per_hr": 35.0}
    }
    response = await client.post("/api/v1/signals/", json=payload)
    assert response.status_code in (200, 201)
```

### 7. WebSocket Test Pattern
```python
from httpx_ws import aconnect_ws

async def test_websocket_stream(incident_id):
    async with aconnect_ws(f"ws://localhost:8000/api/v1/ws/{incident_id}") as ws:
        message = await asyncio.wait_for(ws.receive_json(), timeout=5.0)
        assert "agent_name" in message
```

### Key Rules
- **Live tests**: Use `openai_config` or `gemini_config` from `app.ai.connection` — never hardcode API keys.
- **Unit tests**: Always mock `Runner.run` — never call real LLMs in unit/CI tests.
- Always `clear()` `app.dependency_overrides` after each test.
- Use `scope="session"` for the async engine to avoid recreating it per test.
- Save live test outputs to `app/tests/test-output/` as `.txt` files for traceability.
- Use `pytest -v -s` to see agent reasoning in terminal output.

## Resources
- [Full conftest + test examples](examples/conftest_example.py)
- [Testing tips & patterns](resources/testing_tips.md)
