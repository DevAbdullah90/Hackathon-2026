"""
app/db/fix_db.py
────────────────
Manually initializes all SQLModel database tables.
Usage: python -m app.db.fix_db
"""

import os
import asyncio
from sqlmodel import SQLModel, create_engine
from sqlalchemy.ext.asyncio import create_async_engine
from dotenv import load_dotenv

# Import models to ensure they are registered with SQLModel.metadata
from app.models.signals import Signal
from app.models.incidents import Incident
from app.models.reasoning_logs import ReasoningLog, ChainOfThought

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

async def init_db_manually():
    print("Initializing database tables manually...")
    
    # Clean the URL for asyncpg
    clean_url = DATABASE_URL.split('?')[0]
    engine = create_async_engine(clean_url, connect_args={"ssl": True}, echo=True)
    
    try:
        async with engine.begin() as conn:
            # This will create all tables defined in SQLModel.metadata
            await conn.run_sync(SQLModel.metadata.create_all)
        print("\nSuccess! All tables (signals, incidents, reasoning_logs) have been created.")
    except Exception as e:
        print(f"\nError during table creation: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(init_db_manually())
