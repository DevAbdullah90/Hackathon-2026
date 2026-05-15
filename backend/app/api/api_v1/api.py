"""
app/api/api_v1/api.py
──────────────────────
Central API router for v1. Imports and registers all endpoint routers.
Add new routers here as the project grows.
"""

from fastapi import APIRouter

# Import endpoint routers (each file is added as we build Phase 1 → Phase 2)
from app.api.api_v1.endpoints import signals

api_router = APIRouter()

# ---------------------------------------------------------------------------
# Endpoints registered as each module is built
# ---------------------------------------------------------------------------
api_router.include_router(signals.router, prefix="/signals", tags=["Signals"])
# api_router.include_router(incidents.router,  prefix="/incidents",  tags=["Incidents"])
# api_router.include_router(simulation.router, prefix="/simulation", tags=["Simulation"])
# api_router.include_router(websocket.router,  prefix="/ws",         tags=["WebSocket"])


# Temporary placeholder — confirms API v1 is alive
@api_router.get("/ping", tags=["Health"])
async def ping():
    return {"message": "CIRO API v1 is alive 🌊"}
