"""
backend/app/ai/tools/geo.py
───────────────────────────
Google Geocoding API tool for the CIRO signal_agent.

Converts raw GPS coordinates into a human-readable address string
so agents can reason about location names instead of lat/lng pairs.
"""

import httpx
from agents import function_tool

from app.core.config import settings

_GEOCODING_URL = "https://maps.googleapis.com/maps/api/geocode/json"


@function_tool
async def reverse_geocode(lat: float, lng: float) -> str:
    """Convert GPS coordinates to a human-readable area name using Google Geocoding API.

    Call this whenever a signal contains lat/lng coordinates and you need to
    determine the civic address or neighbourhood name for downstream reasoning.
    Returns the full formatted address string (e.g. "G-10 Sector, Islamabad, Pakistan").

    Args:
        lat: Latitude of the location as a decimal float (e.g. 33.6844).
        lng: Longitude of the location as a decimal float (e.g. 73.0479).
    """
    try:
        params = {
            "latlng": f"{lat},{lng}",
            "key": settings.GOOGLE_MAPS_SERVER_KEY,
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(_GEOCODING_URL, params=params)
            response.raise_for_status()
            data = response.json()

        results = data.get("results", [])
        if results:
            return results[0]["formatted_address"]

        # API returned OK but zero results (e.g. ocean coordinates)
        return "UNKNOWN — manual review required"

    except Exception:
        # Never raise — return a safe sentinel so the agent can continue
        return "UNKNOWN — manual review required"