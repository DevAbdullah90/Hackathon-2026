"""
backend/app/ai/tools/weather.py
───────────────────────────────
Weather alerts tool for the CIRO by AQUA severity_agent.

Returns comprehensive weather data covering both flood and heatwave scenarios
so agents can reason about the appropriate risk factors for any disaster type.
"""

from agents import function_tool


@function_tool
async def get_weather_alerts(lat: float, lng: float) -> dict:
    """Fetches real-time weather data including precipitation, temperature, and heat index.

    Call this when you need current weather conditions for severity scoring.
    Returns precipitation data for flood assessment AND temperature/humidity
    data for heatwave assessment. The Severity Agent decides which fields
    to use based on the incident's disaster type.

    Args:
        lat: Latitude of the incident location as a decimal float.
        lng: Longitude of the incident location as a decimal float.
    """
    # Demo mock: Returns comprehensive weather data covering both crisis types.
    # In production, this would call the OpenWeatherMap API.

    # Determine region-appropriate mock data based on coordinates
    # Karachi region (hotter, more humid)
    if 24.5 <= lat <= 25.5 and 66.5 <= lng <= 67.5:
        return {
            "alert": "Extreme Heat Advisory",
            "temperature_c": 46.2,
            "feels_like_c": 52.8,
            "humidity_pct": 74,
            "heat_index_c": 54.1,
            "uv_index": 11,
            "power_outage_reported": True,
            "intensity_mm_per_hr": 0.0,
            "duration_hrs": 0,
            "wind_speed_kmh": 8.5,
            "region": "Karachi Metropolitan"
        }
    # Lahore region (extreme dry heat)
    elif 31.0 <= lat <= 32.0 and 74.0 <= lng <= 75.0:
        return {
            "alert": "Extreme Heat Warning",
            "temperature_c": 47.8,
            "feels_like_c": 50.2,
            "humidity_pct": 42,
            "heat_index_c": 51.3,
            "uv_index": 12,
            "power_outage_reported": True,
            "intensity_mm_per_hr": 0.0,
            "duration_hrs": 0,
            "wind_speed_kmh": 12.0,
            "region": "Lahore Metropolitan"
        }
    # Islamabad / default region (flood-prone monsoon climate)
    else:
        return {
            "alert": "Heavy Rainfall Warning",
            "temperature_c": 32.5,
            "feels_like_c": 36.1,
            "humidity_pct": 85,
            "heat_index_c": 38.2,
            "uv_index": 4,
            "power_outage_reported": False,
            "intensity_mm_per_hr": 28.4,
            "duration_hrs": 2.5,
            "wind_speed_kmh": 22.0,
            "region": "Islamabad Capital Territory"
        }
