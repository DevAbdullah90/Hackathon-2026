from agents import function_tool

@function_tool
async def get_weather_alerts(lat: float, lng: float) -> dict:
    """Fetches real-time precipitation and weather alerts."""
    return {"alert": "Heavy Rainfall", "intensity_mm_per_hr": 28.4, "duration_hrs": 2.5}
