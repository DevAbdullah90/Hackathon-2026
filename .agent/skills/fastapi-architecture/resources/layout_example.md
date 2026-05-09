# Recommended FastAPI Layout

A robust, production-ready layout to ensure scalability and maintainability.

### Root Directory
- `app/`: The main application package.
- `tests/`: Pytest suite.
- `.env`: Environment variables.
- `Dockerfile`: Containerization.
- `alembic/`: Database migrations.

### /app Directory
- `main.py`: Creates the `FastAPI` instance.
- `api/`: All API endpoints, organized by version.
- `core/`: Global settings (Pydantic BaseSettings), security (JWT), and constants.
- `db/`: Database connection and session management.
- `models/`: Database entities (e.g., SQLAlchemy classes).
- `schemas/`: Data transfer objects (Pydantic models).
- `services/`: The "Brain" of the app. Routers call services; services handle logic.
- `utils/`: Small helper functions.
