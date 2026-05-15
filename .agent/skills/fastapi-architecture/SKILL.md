---
name: enforcing-fastapi-architecture
description: Enforces standardized project structure and modern patterns for FastAPI development. Use when initializing a project, refactoring, or adding new modular components like routers and models.
---

# FastAPI Architectural Foundation

## When to use this skill
- When starting a new FastAPI project.
- When the user adds new endpoints and needs a modular structure.
- When refactoring "spaghetti" code into organized folders.
- When the user mentions "FastAPI structure", "project layout", or "async best practices".

## Workflow
- [ ] **Verify Layout**: Check if the project follows the `/app` root structure.
- [ ] **Standardize Directories**:
    - `app/api/`: Versioned route handlers (e.g., `v1/`).
    - `app/core/`: Config, security, and global constants.
    - `app/models/`: Database schemas and ORM models.
    - `app/services/`: Business logic away from routers.
- [ ] **Modularize Routes**: Ensure `APIRouter` is used for all endpoints, not `app = FastAPI()` directly in every file.
- [ ] **Enforce Async**: Validate that all I/O operations (database, external APIs) use `async/await`.
- [ ] **Implement Dependency Injection**: Use FastAPI `Depends()` for shared logic (auth, DB sessions).

## Instructions

### 1. Mandatory Project Layout
```text
/app
├── main.py          # Entry point, app initialization
├── api/             # Route handlers
│   ├── api_v1/      # API Version 1
│   │   ├── endpoints/
│   │   └── api.py   # Main router inclusion
├── core/            # Config, security, logging
├── models/          # Database models (SQLAlchemy, Tortoise, etc.)
├── schemas/         # Pydantic models (Request/Response)
├── db/              # Session management, migrations
└── services/        # Business logic
```

### 2. Router Pattern (Low-Freedom)
Always define routers in separate files and include them in a central API aggregator.
```python
# app/api/api_v1/endpoints/users.py
from fastapi import APIRouter
router = APIRouter()

@router.get("/")
async def get_users():
    return [{"user": "admin"}]

# app/api/api_v1/api.py
from fastapi import APIRouter
from app.api.api_v1.endpoints import users
api_router = APIRouter()
api_router.include_router(users.router, prefix="/users", tags=["users"])
```

### 3. Async/Await Rules
- Never use blocking `time.sleep()` or synchronous requests (`requests.get`).
- Use `httpx` or `aiohttp` for external calls.
- Ensure DB drivers are async-compatible (e.g., `asyncpg`, `motor`).

## Resources
- [Project Layout Example](resources/layout_example.md)
- [Router Template](examples/router_template.py)
