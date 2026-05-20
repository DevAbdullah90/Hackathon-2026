"""
app/db/clear_db_keep_2.py
─────────────────────────
Clears all demo tables (incidents, actions, logs, etc.) while keeping exactly 2 signals in the 'signals' table.
"""

import os
import asyncio
import uuid
from datetime import datetime
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Railway injects 'postgcirol://', but asyncpg requires 'postgcirol+asyncpg://'
if DATABASE_URL and DATABASE_URL.startswith("postgcirol://"):
    DATABASE_URL = DATABASE_URL.replace("postgcirol://", "postgcirol+asyncpg://", 1)

async def clear_and_keep_two():
    if not DATABASE_URL:
        print("Error: DATABASE_URL is not set.")
        return

    print("Connecting to database to clear tables and keep exactly 2 signals...")
    clean_url = DATABASE_URL.split('?')[0]
    engine = create_async_engine(clean_url, connect_args={"ssl": True}, echo=False)

    try:
        async with engine.begin() as conn:
            # 0. Reset resources to prevent foreign key issues on incidents
            try:
                await conn.execute(text("UPDATE resources SET assigned_to_incident = NULL, available_count = total_count"))
                print("[OK] Reset all resource allocations and counts.")
            except Exception as ex:
                print(f"[WARN] Failed to reset resources: {ex}")

            # 1. Clear dependent tables
            tables_to_clear = [
                "actions",
                "notifications",
                "reasoning_logs",
                "chain_of_thought_logs",
                "vehicle_locations",
                "incidents"
            ]
            for tbl in tables_to_clear:
                try:
                    await conn.execute(text(f"DELETE FROM {tbl}"))
                    print(f"[OK] Wiped table: {tbl}")
                except Exception as ex:
                    print(f"[WARN] Failed to wipe {tbl}: {ex}")

            # 2. Get current signals to see if we can keep 2 of them
            res = await conn.execute(text("SELECT id FROM signals ORDER BY created_at DESC"))
            signal_rows = res.all()
            print(f"Found {len(signal_rows)} existing signals.")

            if len(signal_rows) >= 2:
                # Keep the first 2 (most recent)
                keep_ids = [str(r[0]) for r in signal_rows[:2]]
                keep_ids_str = ", ".join(f"'{kid}'" for kid in keep_ids)
                await conn.execute(text(f"DELETE FROM signals WHERE id NOT IN ({keep_ids_str})"))
                print(f"[OK] Purged old signals, kept exactly these two: {keep_ids}")
            else:
                # Delete whatever is there and insert 2 fresh mock signals
                await conn.execute(text("DELETE FROM signals"))
                
                # Mock signal 1
                sig1_id = str(uuid.uuid4())
                await conn.execute(text(f"""
                    INSERT INTO signals (id, source, type, lat, lng, location, raw_payload, conflict_flag, created_at)
                    VALUES (
                        '{sig1_id}', 
                        'weather_api', 
                        'flood', 
                        24.9180, 
                        67.0970, 
                        'Gulshan-e-Iqbal, Karachi', 
                        '{{"location": "Gulshan-e-Iqbal, Karachi", "message": "Simulated initial rain report"}}', 
                        false, 
                        '{datetime.utcnow().isoformat()}'
                    )
                """))

                # Mock signal 2
                sig2_id = str(uuid.uuid4())
                await conn.execute(text(f"""
                    INSERT INTO signals (id, source, type, lat, lng, location, raw_payload, conflict_flag, created_at)
                    VALUES (
                        '{sig2_id}', 
                        'user_gps', 
                        'heatwave', 
                        24.8607, 
                        67.0244, 
                        'Saddar, Karachi', 
                        '{{"location": "Saddar, Karachi", "message": "Simulated heat stress alert"}}', 
                        false, 
                        '{datetime.utcnow().isoformat()}'
                    )
                """))
                print(f"[OK] Seeded 2 default signals since there were fewer than 2.")

        print("\nDatabase cleanup complete! Exactly 2 signals left in signals table, and all other tables are clean.")
    except Exception as e:
        print(f"\nError during cleanup: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(clear_and_keep_two())
