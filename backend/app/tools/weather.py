import httpx
from typing import Dict, Any
from app.core.config import settings

async def get_weather_alerts(lat: float, lng: float) -> Dict[str, Any]:
    """
    Fetches real-time precipitation and weather alerts from OpenWeatherMap.
    """
    if not settings.OPENWEATHER_API_KEY or "your_" in settings.OPENWEATHER_API_KEY:
        # Fallback for testing/missing key
        return {
            "status": "mock",
            "condition": "Heavy Rain",
            "precipitation_mm": 15.5,
            "alerts": ["Flash flood warning for the next 2 hours"]
        }

    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lng}&appid={settings.OPENWEATHER_API_KEY}&units=metric"
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            
            return {
                "status": "real",
                "temp": data["main"]["temp"],
                "condition": data["weather"][0]["main"],
                "description": data["weather"][0]["description"],
                "precipitation_mm": data.get("rain", {}).get("1h", 0),
                "raw": data
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}
