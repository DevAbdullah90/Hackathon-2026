from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.api import deps
from app.schemas.item import Item, ItemCreate
from app.services import item_service

router = APIRouter()

@router.get("/", response_model=List[Item])
async def read_items(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100
):
    """
    Retrieve items.
    """
    items = await item_service.get_multi(db, skip=skip, limit=limit)
    return items

@router.post("/", response_model=Item)
async def create_item(
    *,
    db: AsyncSession = Depends(deps.get_db),
    item_in: ItemCreate
):
    """
    Create new item.
    """
    return await item_service.create(db, obj_in=item_in)
