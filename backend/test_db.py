import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

from app.db.session import engine, init_db
from app.models import Signal, Incident, Resource, Action, Notification, ReasoningLog
from sqlalchemy import text
from sqlmodel import SQLModel

async def test_foundation():
    print("\n--- CIRO Database Foundation Test ---")
    
    # 1. Verify Imports and Metadata
    print("\n1. Checking SQLModel Metadata...")
    expected_tables = {"signals", "incidents", "resources", "actions", "notifications", "reasoning_logs"}
    found_tables = set(SQLModel.metadata.tables.keys())
    
    print(f"   Found tables in metadata: {found_tables}")
    missing = expected_tables - found_tables
    if missing:
        print(f"FAILED: Missing tables in metadata: {missing}")
    else:
        print("SUCCESS: All required tables found in metadata.")

    # 2. Test Connection and Run SELECT 1
    print("\n2. Testing Connection (SELECT 1)...")
    try:
        async with engine.begin() as conn:
            result = await conn.execute(text("SELECT 1"))
            print(f"SUCCESS: Connection successful! Result: {result.fetchone()[0]}")
    except Exception as e:
        print(f"FAILED: Connection failed: {e}")
        return

    # 3. Create Schema
    print("\n3. Creating Database Schema...")
    try:
        await init_db()
        print("SUCCESS: Schema created successfully (or already exists).")
    except Exception as e:
        print(f"FAILED: Schema creation failed: {e}")
        return

    # 4. Final Verification
    print("\n4. Final Verification (Querying Tables)...")
    try:
        async with engine.begin() as conn:
            for table in expected_tables:
                await conn.execute(text(f"SELECT * FROM {table} LIMIT 0"))
                print(f"   - Table '{table}' verified.")
        print("\nDatabase Foundation is fully operational!")
    except Exception as e:
        print(f"FAILED: Verification failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_foundation())
