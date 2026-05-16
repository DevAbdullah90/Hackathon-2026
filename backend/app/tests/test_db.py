"""
app/tests/test_db.py
────────────────────
Utility to verify the Neon PostgreSQL connection.
Usage: python -m app.tests.test_db
"""

import os
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

async def test_connection():
    print(f"Connecting to Neon Database...")
    
    # Neon often provides URLs with sslmode=require, which asyncpg handles differently.
    # We clean the URL for the async engine.
    clean_url = DATABASE_URL.split('?')[0]
    
    # Create the async engine with SSL required
    engine = create_async_engine(clean_url, connect_args={"ssl": True}, echo=False)
    
    try:
        async with engine.connect() as conn:
            # Run a simple query to get the current database time
            result = await conn.execute(text("SELECT now()"))
            db_time = result.scalar()
            print(f"Success! Database connection established.")
            print(f"Current Database Time: {db_time}")
            
    except Exception as e:
        print(f"Error: Could not connect to the database.")
        print(f"Details: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(test_connection())
