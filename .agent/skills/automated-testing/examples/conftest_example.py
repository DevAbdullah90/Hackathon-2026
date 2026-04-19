"""
Full conftest.py + test examples for FastAPI + async DB + mocked LLM.
"""
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlmodel import SQLModel
from unittest.mock import AsyncMock, patch

from app.main import app
from app.db.engine import get_session

TEST_DB_URL = "sqlite+aiosqlite:///:memory:"

# --- Fixtures ---

@pytest_asyncio.fixture(loop_scope="session", scope="session")
async def engine():
    eng = create_async_engine(TEST_DB_URL, echo=False)
    async with eng.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    yield eng
    await eng.dispose()

@pytest_asyncio.fixture
async def db_session(engine):
    factory = async_sessionmaker(engine, expire_on_commit=False)
    async with factory() as session:
        yield session

@pytest_asyncio.fixture
async def client(db_session: AsyncSession):
    app.dependency_overrides[get_session] = lambda: db_session
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()

# --- Integration tests ---

@pytest.mark.asyncio
async def test_health_check(client):
    response = await client.get("/health")
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_post_message(client):
    payload = {"session_id": "test-123", "role": "user", "content": "Hello"}
    response = await client.post("/api/v1/memory", json=payload)
    assert response.status_code == 201

# --- Unit test with mocked LLM ---

@pytest.mark.asyncio
async def test_agent_with_mock_llm():
    mock_result = AsyncMock()
    mock_result.final_output = "Mocked LLM response"

    with patch("app.agents.main.Runner.run", return_value=mock_result):
        from app.agents.main import run_agent
        output = await run_agent("test input")
        assert output == "Mocked LLM response"
