import asyncio
import sys
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

sys.path.append(r"c:\Users\hp\OneDrive\Desktop\Hackathon AISeekho\backend")

async def clear():
    url = "postgresql+asyncpg://neondb_owner:npg_x1BEKRoIhrl4@ep-floral-tooth-aqnp7pkq-pooler.c-8.us-east-1.aws.neon.tech/neondb?"
    engine = create_async_engine(url, echo=False)
    
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    tables = [
        "actions",
        "notifications",
        "reasoning_logs",
        "chain_of_thought_logs",
        "signals",
        "vehicle_locations",
        "incidents",
    ]
    
    async with async_session() as session:
        print("Clearing all demo tables...")
        for table in tables:
            try:
                await session.execute(text(f"TRUNCATE TABLE {table} CASCADE;"))
                print(f"[OK] Cleared table: {table}")
            except Exception as e:
                print(f"[ERR] Failed to truncate {table}: {e}")
                
        await session.commit()
    print("Database is now 100% clean and ready for your live demo!")

if __name__ == "__main__":
    asyncio.run(clear())
