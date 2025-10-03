from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from app.database import get_db
from app.models import Category
from app.schemas import Category as CategorySchema

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("/", response_model=List[CategorySchema])
async def list_categories(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    active_only: bool = Query(True),
    db: AsyncSession = Depends(get_db)
):
    """Récupérer la liste des catégories"""
    query = select(Category)
    
    if active_only:
        query = query.filter(Category.is_active == True)
    
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    categories = result.scalars().all()
    
    return categories


@router.get("/{category_id}", response_model=CategorySchema)
async def get_category(
    category_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Récupérer une catégorie par ID"""
    query = select(Category).filter(Category.id == category_id)
    result = await db.execute(query)
    category = result.scalar_one_or_none()
    
    if not category:
        raise HTTPException(status_code=404, detail="Catégorie non trouvée")
    
    return category