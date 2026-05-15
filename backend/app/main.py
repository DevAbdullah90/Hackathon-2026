"""
CIRO — Crisis Intelligence & Response Orchestrator
FastAPI Entry Point

Built for the Google Antigravity Hackathon — Challenge 3
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.api_v1.api import api_router
from app.core.config import settings

# ---------------------------------------------------------------------------
# App Initialization
# ---------------------------------------------------------------------------
app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "Urban Flood Response Multi-Agent Orchestrator. "
        "Ingests GPS signals, detects crisis clusters, reasons about severity, "
        "and plans coordinated emergency responses using an AI Agent pipeline."
    ),
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------------------------------------------------------------------------
# CORS — Allow Expo / React Native frontend during development
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# API Router — All versioned routes mounted here
# ---------------------------------------------------------------------------
app.include_router(api_router, prefix=settings.API_V1_STR)


# ---------------------------------------------------------------------------
# Root health-check
# ---------------------------------------------------------------------------
@app.get("/", tags=["Health"])
async def root():
    return {
        "project": settings.PROJECT_NAME,
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy"}
