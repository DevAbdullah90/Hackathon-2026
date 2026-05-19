"""
app/api/api_v1/endpoints/safe_havens.py
---------------------------------------
Endpoints for querying municipal Safe Haven shelters and calculating safe
pedestrian evacuation routes that detour around active flood zones.
"""

import math
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_session
from app.models.safe_havens import SafeHaven
from app.models.incidents import Incident
from app.models.schemas import SafeHavenRead, SafeHavenRouteResponse, RouteCoordinate

router = APIRouter()


def get_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates the distance between two coordinates in kilometers using the Haversine formula."""
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


@router.get("/", response_model=List[SafeHavenRead])
async def read_safe_havens(
    *,
    session: AsyncSession = Depends(get_session)
):
    """Retrieve all municipal Safe Haven shelters."""
    query = select(SafeHaven).order_by(SafeHaven.name.asc())
    result = await session.execute(query)
    shelters = result.scalars().all()
    return shelters


@router.get("/route", response_model=SafeHavenRouteResponse)
async def calculate_evacuation_route(
    *,
    lat: float,
    lng: float,
    session: AsyncSession = Depends(get_session)
):
    """
    Calculate the closest Safe Haven shelter and generate a safe pedestrian path
    that detours around active crisis/flooded zones.
    """
    # 1. Fetch all shelters
    result_havens = await session.execute(select(SafeHaven))
    shelters = result_havens.scalars().all()
    
    if not shelters:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No safe haven shelters configured in the system."
        )
    
    # 2. Find the closest shelter
    closest_shelter = None
    min_distance = float("inf")
    
    for shelter in shelters:
        dist = get_distance_km(lat, lng, shelter.lat, shelter.lng)
        if dist < min_distance:
            min_distance = dist
            closest_shelter = shelter
            
    if not closest_shelter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Could not resolve closest safe haven shelter."
        )
        
    # 3. Fetch active incidents (obstacles)
    query_incidents = select(Incident).where(
        or_(
            Incident.status == "confirmed",
            Incident.status == "CONFIRMED",
            Incident.status == "monitoring",
            Incident.status == "MONITORING"
        )
    )
    result_incidents = await session.execute(query_incidents)
    active_incidents = result_incidents.scalars().all()
    
    # 4. Generate route path segments (15 steps)
    N = 15
    path_points = []
    avoided_incidents_ids = set()
    
    for i in range(N + 1):
        t = i / N
        lat_t = lat + t * (closest_shelter.lat - lat)
        lng_t = lng + t * (closest_shelter.lng - lng)
        
        # Check against active incident boundaries
        for incident in active_incidents:
            # If the incident does not have coordinate or radius data, skip
            if incident.lat is None or incident.lng is None:
                continue
                
            radius = incident.affected_radius_km or 0.5
            dist_to_incident = get_distance_km(lat_t, lng_t, incident.lat, incident.lng)
            
            # If coordinates intersect the flooded circle (plus 150m buffer)
            buffer_km = 0.15
            safety_radius = radius + buffer_km
            if dist_to_incident < safety_radius:
                avoided_incidents_ids.add(incident.id)
                
                # Push the path point outward along the radial line from incident center
                d_lat = lat_t - incident.lat
                d_lng = lng_t - incident.lng
                if d_lat == 0.0 and d_lng == 0.0:
                    d_lat = 0.0001
                    d_lng = 0.0001
                    
                mag = math.sqrt(d_lat**2 + d_lng**2)
                dir_lat = d_lat / mag
                dir_lng = d_lng / mag
                
                # Convert safety radius in km to approx degrees
                # 1 deg lat ~ 111 km
                # 1 deg lng ~ 111 * cos(lat) km
                deg_lat = safety_radius / 111.0
                deg_lng = safety_radius / (111.0 * math.cos(math.radians(incident.lat)))
                
                lat_t = incident.lat + dir_lat * deg_lat
                lng_t = incident.lng + dir_lng * deg_lng
                
        path_points.append(RouteCoordinate(lat=lat_t, lng=lng_t))
        
    return SafeHavenRouteResponse(
        safe_haven=closest_shelter,
        path=path_points,
        distance_km=min_distance,
        avoided_flooded_zones_count=len(avoided_incidents_ids)
    )
