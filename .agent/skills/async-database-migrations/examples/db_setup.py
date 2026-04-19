"""
Full async DB setup: engine, session dependency, and a sample SQLModel table.
Copy app/db/engine.py from this pattern.
"""
import os
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlmodel import SQLModel, Field, select
from typing import Optional
from datetime import datetime

# --- Model ---
class AgentMemory(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: str = Field(index=True)
    role: str          # "user" | "assistant"
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

# --- Engine ---
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite+aiosqlite:///./test.db")
engine = create_async_engine(DATABASE_URL, pool_pre_ping=True, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

# --- FastAPI dependency ---
async def get_session() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session

# --- Startup helper ---
async def create_db_and_tables():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

# --- Quick smoke test ---
async def main():
    await create_db_and_tables()
    async with AsyncSessionLocal() as session:
        session.add(AgentMemory(session_id="abc", role="user", content="Hello"))
        await session.commit()
        result = await session.execute(select(AgentMemory))
        print(result.scalars().all())

if __name__ == "__main__":
    asyncio.run(main())
