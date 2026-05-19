"""
app/api/api_v1/endpoints/resources.py
──────────────────────────────────────
Endpoint for retrieving emergency resources and allocations.
"""

from typing import List
from fastapi import APIRouter, Depends
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.resources import Resource
from app.models.vehicle_locations import VehicleLocation
from app.models.schemas import ResourceRead
from app.db.session import get_session

router = APIRouter()

@router.get("/", response_model=List[ResourceRead])
async def read_resources(
    *,
    session: AsyncSession = Depends(get_session)
):
    """
    Retrieve the current status and allocation details of all emergency resources.
    """
    query = select(Resource).order_by(Resource.type.asc())
    result = await session.execute(query)
    resources = result.scalars().all()
    return resources

@router.get("/fleet", response_model=List[VehicleLocation])
async def get_fleet(
    *,
    session: AsyncSession = Depends(get_session)
):
    """
    Retrieve real-time GPS telemetry for the active fleet.
    Calculates progress interpolation for any vehicle in transit.
    """
    from datetime import datetime, timezone
    
    query = select(VehicleLocation)
    result = await session.execute(query)
    vehicles = list(result.scalars().all())
    
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    
    for v in vehicles:
        if v.status == "en_route":
            elapsed = (now - v.dispatch_time).total_seconds()
            fraction = min(elapsed / v.duration_seconds, 1.0)
            
            # Interpolate coordinates
            v.current_lat = v.start_lat + fraction * (v.target_lat - v.start_lat)
            v.current_lng = v.start_lng + fraction * (v.target_lng - v.start_lng)
            
            if fraction >= 1.0:
                v.status = "arrived"
                
            session.add(v)
            
    if vehicles:
        await session.commit()
        for v in vehicles:
            await session.refresh(v)
            
    return vehicles
