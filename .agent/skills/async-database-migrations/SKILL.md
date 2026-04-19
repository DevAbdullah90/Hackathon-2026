---
name: async-database-migrations
description: Sets up async PostgreSQL persistence using SQLModel, Alembic, and psycopg3 with Neon Postgres. Use when initializing the database layer, defining ORM models, running migrations, or managing async sessions in a FastAPI + OpenAI Agents project.
---

# Async Database & Migrations

## When to use this skill
- When setting up the database layer for a new FastAPI + Agents project.
- When defining SQLModel ORM models for agent memory or RAG state.
- When configuring Alembic for async migrations against Neon Postgres.
- When wiring `AsyncSession` into FastAPI via `Depends()`.

## Workflow
- `[ ]` **Install Dependencies**: Run `pip install sqlmodel "sqlalchemy[asyncio]" "psycopg[asyncio]" alembic aiosqlite`
- `[ ]` **Define Models**: Create table models in `app/models/` using `SQLModel, table=True`.
- `[ ]` **Create Async Engine**: Set up `create_async_engine` with `DATABASE_URL` from `.env`.
- `[ ]` **Session Dependency**: Yield `AsyncSession` from `get_session()` for FastAPI `Depends()`.
- `[ ]` **Init Alembic**: Run `alembic init -t async migrations`, then configure `env.py`.
- `[ ]` **Migrate**: `alembic revision --autogenerate -m "..."` then `alembic upgrade head`.

## Instructions

### 1. Engine & Session Setup
```python
# app/db/engine.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlmodel import SQLModel
import os

engine = create_async_engine(os.environ["DATABASE_URL"], pool_pre_ping=True)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

async def get_session() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session
```

### 2. Alembic `env.py` Async Block
Replace `run_migrations_online` with the async version. See `resources/alembic_env_tips.md`.

### 3. Neon Postgres Tips
- Use pooled URL (port `5432`) for app; direct URL for migrations only.
- Set `pool_pre_ping=True` — Neon serverless connections go idle.
- Use **Neon database branching** to test migrations before applying to `main`.

## Resources
- [Alembic Async env.py tips](resources/alembic_env_tips.md)
- [Full working example](examples/db_setup.py)
