# Alembic Async `env.py` Tips

## The Key Change
Replace the sync `run_migrations_online` with an async version using `async_engine_from_config`.

```python
# migrations/env.py
import asyncio
from sqlalchemy.ext.asyncio import async_engine_from_config
from sqlalchemy.pool import NullPool
from sqlmodel import SQLModel
import app.models  # noqa: import all models so Alembic can detect them

target_metadata = SQLModel.metadata

def do_run_migrations(connection):
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()

async def run_async_migrations():
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()

def run_migrations_online():
    asyncio.run(run_async_migrations())
```

## alembic.ini URL
```ini
sqlalchemy.url = postgresql+psycopg://user:pass@host/db
```

## Common Errors
- **`MissingGreenlet`**: You used a sync driver with async engine. Use `psycopg` not `psycopg2`.
- **Models not detected**: Make sure `import app.models` runs before `target_metadata = SQLModel.metadata`.
