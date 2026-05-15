"""
app/db/session.py
─────────────────
Database connection and session management.
Using SQLModel with Async Engine.
"""

import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in the .env file.")

# Create Async Engine
engine = create_async_engine(DATABASE_URL, echo=True, future=True)

# Create Session Factory
async_session_factory = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def get_session() -> AsyncSession:
    """Dependency for providing a database session."""
    async with async_session_factory() as session:
        yield session

async def init_db():
    """Initializes the database tables."""
    async with engine.begin() as conn:
        # await conn.run_sync(SQLModel.metadata.drop_all) # Dangerous in prod
        await conn.run_sync(SQLModel.metadata.create_all)
