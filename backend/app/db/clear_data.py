"""
app/db/clear_data.py
────────────────────
Wipes all records from signals, incidents, and reasoning_logs tables.
Usage: python -m app.db.clear_data
"""

import os
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

async def clear_db():
    print("Clearing all signals, incidents, and logs from the database...")
    
    clean_url = DATABASE_URL.split('?')[0]
    engine = create_async_engine(clean_url, connect_args={"ssl": True}, echo=False)
    
    try:
        async with engine.begin() as conn:
            # Delete in order to respect any potential (though currently missing) FKs
            await conn.execute(text("DELETE FROM reasoning_logs"))
            await conn.execute(text("DELETE FROM incidents"))
            await conn.execute(text("DELETE FROM signals"))
            
        print("\nDatabase is now EMPTY and ready for a fresh simulation!")
    except Exception as e:
        print(f"\nError during cleanup: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(clear_db())
