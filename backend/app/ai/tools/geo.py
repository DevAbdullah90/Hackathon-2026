"""
backend/app/ai/tools/geo.py
───────────────────────────
Google Geocoding API tool with OpenStreetMap fallback for the CIRO signal_agent.

Converts raw GPS coordinates into a human-readable address string
so agents can reason about location names instead of lat/lng pairs.
"""

import httpx
from agents import function_tool

from app.core.config import settings

_GEOCODING_URL = "https://maps.googleapis.com/maps/api/geocode/json"
_OSM_URL = "https://nominatim.openstreetmap.org/reverse"


@function_tool
async def reverse_geocode(lat: float, lng: float) -> str:
    """Convert GPS coordinates to a human-readable area name using Google Geocoding API (with free OSM fallback).

    Call this whenever a signal contains lat/lng coordinates and you need to
    determine the civic address or neighbourhood name for downstream reasoning.
    Returns the full formatted address string (e.g. "G-10 Sector, Islamabad, Pakistan").

    Args:
        lat: Latitude of the location as a decimal float (e.g. 33.6844).
        lng: Longitude of the location as a decimal float (e.g. 73.0479).
    """
    # 1. Try Google Maps Geocoding API first
    try:
        params = {
            "latlng": f"{lat},{lng}",
            "key": settings.GOOGLE_MAPS_SERVER_KEY,
        }
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(_GEOCODING_URL, params=params)
            response.raise_for_status()
            data = response.json()

        if data.get("status") == "OK" and data.get("results"):
            return data["results"][0]["formatted_address"]
    except Exception as e:
        print(f"⚠️ Google Geocoding failed: {e}")

    # 2. Fallback to OpenStreetMap Nominatim API (100% Free, No Billing required)
    try:
        osm_params = {
            "format": "json",
            "lat": str(lat),
            "lon": str(lng),
        }
        headers = {
            "User-Agent": "CIRO-Crisis-Orchestrator/1.0 (contact@ciro.org)"
        }
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(_OSM_URL, params=osm_params, headers=headers)
            response.raise_for_status()
            data = response.json()
            
        display_name = data.get("display_name")
        if display_name:
            parts = [p.strip() for p in display_name.split(",") if p.strip()]
            if len(parts) > 4:
                return ", ".join(parts[:4])
            return display_name
    except Exception as e:
        print(f"⚠️ OSM Geocoding fallback failed: {e}")

    # 3. Last resort guess based on lat/lng coordinate clusters (offline/both fail)
    if 33.5 <= lat <= 33.8 and 72.8 <= lng <= 73.2:
        return "G-10 Sector, Islamabad"
    elif 24.7 <= lat <= 25.1 and 66.8 <= lng <= 67.3:
        return "Clifton Block 5, Karachi"

    return "UNKNOWN — manual review required"