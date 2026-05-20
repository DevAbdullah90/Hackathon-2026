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

# Railway injects 'postgcirol://', but asyncpg requires 'postgcirol+asyncpg://'
if DATABASE_URL and DATABASE_URL.startswith("postgcirol://"):
    DATABASE_URL = DATABASE_URL.replace("postgcirol://", "postgcirol+asyncpg://", 1)

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

    # Seed default municipal shelters if safe_havens is empty
    from sqlmodel import select
    from app.models.safe_havens import SafeHaven
    
    try:
        async with async_session_factory() as session:
            result = await session.execute(select(SafeHaven))
            first_haven = result.scalars().first()
            if not first_haven:
                print("Seeding default Safe Haven shelters...")
                shelters = [
                    SafeHaven(
                        name="G-10 Community Center",
                        lat=33.6650,
                        lng=73.0320,
                        capacity=500,
                        current_occupancy=420,  # 84% capacity
                    ),
                    SafeHaven(
                        name="F-8 Markaz Shelter",
                        lat=33.7120,
                        lng=73.0420,
                        capacity=600,
                        current_occupancy=240,  # 40% capacity
                    ),
                    SafeHaven(
                        name="Karachi Cantonment Station",
                        lat=24.8465,
                        lng=67.0325,
                        capacity=1000,
                        current_occupancy=650,  # 65% capacity
                    ),
                    SafeHaven(
                        name="Gulshan-e-Iqbal Town Office",
                        lat=24.9180,
                        lng=67.0970,
                        capacity=400,
                        current_occupancy=310,  # 77.5% capacity
                    )
                ]
                for s in shelters:
                    session.add(s)
                await session.commit()
                print("Successfully seeded municipal Safe Havens.")
    except Exception as e:
        print(f"Error seeding default Safe Havens: {e}")
