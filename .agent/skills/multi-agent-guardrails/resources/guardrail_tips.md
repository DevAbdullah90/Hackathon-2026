# Guardrail Tips & FastAPI PII Middleware

## Guardrail Design Rules
- **Use a fast/cheap model** as the checker agent (e.g., `gpt-4o-mini`) to minimize latency.
- **Input guards run before** the main agent — fail fast and cheap.
- **Output guards run after** — use simple string matching for PII, not LLM, when possible.
- **Tool guards** are for tools that receive or produce secrets (e.g., DB queries, API calls).

## FastAPI PII Scrubbing Middleware
Add this to `app/main.py` via `app.add_middleware(PIIScrubMiddleware)`.

```python
# app/core/middleware.py
import re, uuid
import logfire
from starlette.middleware.base import BaseHTTPMiddleware

SSN_PATTERN = re.compile(r'\b\d{3}-\d{2}-\d{4}\b')

class PIIScrubMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        # Log + alert on suspicious patterns in the path/query
        if SSN_PATTERN.search(str(request.url)):
            logfire.warn("PII detected in request URL", path=str(request.url))
        return await call_next(request)
```

## Avoiding Common Mistakes
- Don't attach the same guardrail to both input and output — it doubles latency.
- Guardrails run in parallel when multiple are registered on the same agent.
- Always define `tripwire_triggered=False` in the non-triggered branch.
