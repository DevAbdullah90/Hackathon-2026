# Tracing Tips & Span Naming

## Span Naming Convention
Use `domain.action` format so spans group logically in the Logfire UI.
- `db.get_user_memory` — database reads
- `db.save_message` — database writes
- `http.fetch_external` — outbound HTTP calls
- `agent.run` — top-level agent invocations (auto-created by `instrument_openai_agents`)

## Adding Searchable Attributes
Pass key-value pairs into `logfire.span()` — they become filterable columns in Logfire's SQL explorer.
```python
with logfire.span("db.query", session_id=session_id, table="agent_memory"):
    ...
```

## Environment Setup
```bash
# .env
LOGFIRE_TOKEN=your_token_here   # get from logfire.pydantic.dev
```
Never commit `LOGFIRE_TOKEN`. Add it as a CI secret (e.g., GitHub Actions secret).

## What Gets Auto-Traced
| Call | Auto-traced by |
|------|---------------|
| FastAPI routes | `instrument_fastapi(app)` |
| Agent runs & tool calls | `instrument_openai_agents()` |
| OpenAI API calls | `instrument_openai()` |
| asyncpg DB queries | `instrument_asyncpg()` |
| httpx requests | `instrument_httpx(client)` |

## Logfire Dashboard
View live at: https://logfire.pydantic.dev
Use SQL queries to filter: `SELECT * FROM spans WHERE attributes->>'session_id' = 'abc123'`
