import asyncio
import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')
if DATABASE_URL and DATABASE_URL.startswith('postgcirol://'):
    DATABASE_URL = DATABASE_URL.replace('postgcirol://', 'postgcirol+asyncpg://', 1)

engine = create_async_engine(DATABASE_URL)

async def alter():
    async with engine.begin() as conn:
        await conn.execute(text("ALTER TABLE incidents ADD COLUMN IF NOT EXISTS disaster_type VARCHAR DEFAULT 'flood';"))
        print('Column added!')

asyncio.run(alter())
