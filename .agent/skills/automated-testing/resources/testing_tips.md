# Async Testing Tips & Patterns

## 1. asyncio_mode = "auto"
Setting this in `pyproject.toml` removes the need for `@pytest.mark.asyncio` on every test.
```toml
[tool.pytest.ini_options]
asyncio_mode = "auto"
```

## 2. In-Memory DB for Speed
Use `sqlite+aiosqlite:///:memory:` in tests — it's fast, isolated, and requires no cleanup.
Never point tests at your real Neon Postgres database.

## 3. Dependency Override Pattern
```python
app.dependency_overrides[get_session] = lambda: test_db_session
# ... run tests ...
app.dependency_overrides.clear()  # always clean up
```

## 4. Mocking vs. Real LLM
| Test Type | Use LLM? | Tool |
|-----------|----------|------|
| Unit (tool function) | ❌ No | Direct function call |
| Integration (FastAPI route) | ❌ No | `patch("Runner.run")` |
| E2E / smoke test | ✅ Yes | Real API key in CI secret |

## 5. Fixture Scope
- `scope="session"` → async engine (expensive to create)
- `scope="function"` (default) → db session (must be fresh per test to avoid state leak)
