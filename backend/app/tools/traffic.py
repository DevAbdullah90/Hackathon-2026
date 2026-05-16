import httpx
from typing import Dict, Any
from app.core.config import settings

async def get_traffic_matrix(origin: str, destination: str) -> Dict[str, Any]:
    """
    Gets travel time and congestion level between two points via Google Maps Distance Matrix.
    'origin' and 'destination' can be "lat,lng" or address.
    """
    if not settings.GOOGLE_MAPS_SERVER_KEY or "your_" in settings.GOOGLE_MAPS_SERVER_KEY:
        # Fallback for testing/missing key
        return {
            "status": "mock",
            "distance": "5.2 km",
            "duration": "25 mins",
            "duration_in_traffic": "45 mins",
            "congestion_level": "heavy"
        }

    url = "https://maps.googleapis.com/maps/api/distancematrix/json"
    params = {
        "origins": origin,
        "destinations": destination,
        "departure_time": "now",
        "key": settings.GOOGLE_MAPS_SERVER_KEY
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, params=params, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            
            if data["status"] == "OK":
                element = data["rows"][0]["elements"][0]
                return {
                    "status": "real",
                    "distance": element["distance"]["text"],
                    "duration": element["duration"]["text"],
                    "duration_in_traffic": element.get("duration_in_traffic", {}).get("text"),
                    "raw": data
                }
            return {"status": "error", "message": data["status"]}
        except Exception as e:
            return {"status": "error", "message": str(e)}
