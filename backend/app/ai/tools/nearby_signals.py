import math
from datetime import datetime, timedelta
from typing import List, Dict, Any
from agents import function_tool
from sqlalchemy import select, and_
from app.db.session import async_session_factory
from app.models.signals import Signal

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculates the Haversine distance between two points on Earth in meters.
    """
    R = 6371000  # Earth radius in meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = math.sin(dphi / 2)**2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c

async def _get_nearby_signals(
    lat: float, 
    lng: float, 
    radius_m: float = 1000.0, 
    time_window_min: int = 60
) -> List[Dict[str, Any]]:
    """Internal implementation of get_nearby_signals with accurate filtering."""
    # 1. Use bounding box for initial fast database filtering
    lat_deg_delta = radius_m / 111000.0
    lng_deg_delta = radius_m / (111000.0 * math.cos(math.radians(lat)))
    
    since_time = datetime.utcnow() - timedelta(minutes=time_window_min)
    
    async with async_session_factory() as session:
        query = select(Signal).where(
            and_(
                Signal.lat.between(lat - lat_deg_delta, lat + lat_deg_delta),
                Signal.lng.between(lng - lng_deg_delta, lng + lng_deg_delta),
                Signal.created_at >= since_time
            )
        )
        
        result = await session.execute(query)
        signals = result.scalars().all()
        
        # 2. Refine results using accurate Haversine distance
        refined_signals = []
        for s in signals:
            if s.lat is not None and s.lng is not None:
                dist = calculate_haversine_distance(lat, lng, s.lat, s.lng)
                if dist <= radius_m:
                    refined_signals.append({
                        "id": str(s.id),
                        "source": s.source,
                        "type": s.type,
                        "lat": s.lat,
                        "lng": s.lng,
                        "location": s.location,
                        "distance_m": round(dist, 2),
                        "credibility": s.credibility_score,
                        "created_at": s.created_at.isoformat()
                    })
        
        return sorted(refined_signals, key=lambda x: x['distance_m'])

@function_tool
async def get_nearby_signals(
    lat: float, 
    lng: float, 
    radius_m: float = 1000.0, 
    time_window_min: int = 60
) -> List[Dict[str, Any]]:
    """
    Retrieves recent signals from the database within a specified radius and time window.

    Use this to correlate a new signal with existing reports or to check if 
    an area has multiple active flood detections.

    Args:
        lat: Latitude of the center point.
        lng: Longitude of the center point.
        radius_m: Search radius in meters (default 1000m).
        time_window_min: Look back period in minutes (default 60 min).
    """
    return await _get_nearby_signals(lat, lng, radius_m, time_window_min)
