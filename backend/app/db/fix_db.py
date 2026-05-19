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
from app.models.vehicle_locations import VehicleLocation
from app.models.safe_havens import SafeHaven

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

from app.db.session import init_db

if __name__ == "__main__":
    print("Running official database initialization and seeding...")
    asyncio.run(init_db())
    print("Database initialization complete.")
