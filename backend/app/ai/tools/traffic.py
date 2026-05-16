from typing import Dict, Any
from agents import function_tool
from app.tools.traffic import get_traffic_matrix as real_get_traffic_matrix

@function_tool
async def get_traffic_matrix(origin: str, destination: str) -> Dict[str, Any]:
    """
    Retrieves travel time and congestion level between two points using Google Maps.

    Use this when you need to calculate the impact of a flood on traffic or 
    when the Severity Agent needs to understand travel delays in an area.

    Args:
        origin: Starting point as "lat,lng" or a human-readable address.
        destination: Ending point as "lat,lng" or a human-readable address.
    """
    return await real_get_traffic_matrix(origin, destination)