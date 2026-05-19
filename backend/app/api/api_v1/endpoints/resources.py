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
