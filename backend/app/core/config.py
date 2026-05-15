"""
app/core/config.py
──────────────────
Centralized project settings loaded from the .env file.
All environment variables are typed and validated here.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    # ------------------------------------------------------------------
    # Project Info
    # ------------------------------------------------------------------
    PROJECT_NAME: str = "CIRO — Urban Flood Response Orchestrator"
    API_V1_STR: str = "/api/v1"

    # ------------------------------------------------------------------
    # CORS
    # ------------------------------------------------------------------
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:8081",   # Expo dev server
        "http://localhost:3000",   # Web frontend (if any)
        "*",                       # Allow all during hackathon demo
    ]

    # ------------------------------------------------------------------
    # AI — Gemini 2.0 Flash (via OpenAI-compatible layer)
    # ------------------------------------------------------------------
    GEMINI_API_KEY: str = ""

    # ------------------------------------------------------------------
    # Google Maps — Server-side (Distance Matrix, Geocoding)
    # ------------------------------------------------------------------
    GOOGLE_MAPS_SERVER_KEY: str = ""

    # ------------------------------------------------------------------
    # OpenWeatherMap
    # ------------------------------------------------------------------
    OPENWEATHER_API_KEY: str = ""

    # ------------------------------------------------------------------
    # SerpApi — Google News/Search wrapper
    # ------------------------------------------------------------------
    SERP_API_KEY: str = ""

    # ------------------------------------------------------------------
    # Database (PostgreSQL / Neon — added by Quratulain in Phase 1)
    # ------------------------------------------------------------------
    DATABASE_URL: str = ""


settings = Settings()
