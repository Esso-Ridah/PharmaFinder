from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.database import get_db
from app.schemas import Product, ProductSearchQuery, ProductAvailability
from app.crud import (
    get_product, search_products, search_products_with_pharmacy_info, 
    get_product_availability, get_categories
)
from app.auth import get_current_active_user
from app.models import User

router = APIRouter(prefix="/products", tags=["products"])


@router.get("/", response_model=List[Product])
async def search_products_endpoint(
    query: Optional[str] = Query(None, description="Search term for product name, generic name, or active ingredient"),
    category_id: Optional[UUID] = Query(None, description="Filter by category"),
    requires_prescription: Optional[bool] = Query(None, description="Filter by prescription requirement"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=100, description="Maximum number of records to return"),
    db: AsyncSession = Depends(get_db)
):
    """Search products with filters"""
    products = await search_products(
        db=db,
        query=query,
        category_id=category_id,
        requires_prescription=requires_prescription,
        skip=skip,
        limit=limit
    )
    return products


@router.get("/search-enhanced", response_model=List[dict])
async def search_products_enhanced(
    query: Optional[str] = Query(None, description="Search term for product name, generic name, or active ingredient"),
    category_id: Optional[UUID] = Query(None, description="Filter by category"),
    requires_prescription: Optional[bool] = Query(None, description="Filter by prescription requirement"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=100, description="Maximum number of records to return"),
    db: AsyncSession = Depends(get_db)
):
    """Search products with sponsoring and pharmacy information (Amazon-style results)"""
    products = await search_products_with_pharmacy_info(
        db=db,
        query=query,
        category_id=category_id,
        requires_prescription=requires_prescription,
        skip=skip,
        limit=limit
    )
    return products


@router.get("/{product_id}", response_model=Product)
async def get_product_details(
    product_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get product details by ID"""
    product = await get_product(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return product


@router.get("/{product_id}/availability", response_model=List[dict])
async def get_product_availability_endpoint(
    product_id: UUID,
    latitude: Optional[float] = Query(None, description="User latitude for distance calculation"),
    longitude: Optional[float] = Query(None, description="User longitude for distance calculation"),
    max_distance: Optional[float] = Query(10.0, description="Maximum distance in km"),
    db: AsyncSession = Depends(get_db)
):
    """Get product availability across pharmacies"""
    product = await get_product(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    availability = await get_product_availability(
        db=db,
        product_id=product_id,
        latitude=latitude,
        longitude=longitude,
        max_distance=max_distance
    )
    
    # Format response with pharmacy details
    result = []
    for item in availability:
        pharmacy_data = {
            "pharmacy_id": item.pharmacy.id,
            "pharmacy_name": item.pharmacy.name,
            "pharmacy_address": item.pharmacy.address,
            "pharmacy_phone": item.pharmacy.phone,
            "latitude": float(item.pharmacy.latitude) if item.pharmacy.latitude else None,
            "longitude": float(item.pharmacy.longitude) if item.pharmacy.longitude else None,
            "quantity": item.quantity,
            "price": float(item.price),
            "expiry_date": item.expiry_date,
            "last_updated": item.last_updated
        }
        result.append(pharmacy_data)
    
    return result


@router.get("/{product_id}/similar", response_model=List[Product])
async def get_similar_products(
    product_id: UUID,
    limit: int = Query(10, ge=1, le=50, description="Maximum number of similar products"),
    db: AsyncSession = Depends(get_db)
):
    """Get similar products (same category or active ingredient)"""
    product = await get_product(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Find products with same active ingredient or same category
    similar_products = await search_products(
        db=db,
        query=product.active_ingredient or product.generic_name,
        category_id=product.category_id,
        limit=limit
    )
    
    # Remove the original product from results
    similar_products = [p for p in similar_products if p.id != product_id]
    
    return similar_products[:limit]


@router.post("/{product_id}/favorite")
async def add_to_favorites(
    product_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Add product to user favorites (placeholder for future implementation)"""
    product = await get_product(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # TODO: Implement favorites table and logic
    return {"message": "Product added to favorites (feature coming soon)"}


@router.delete("/{product_id}/favorite")
async def remove_from_favorites(
    product_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Remove product from user favorites (placeholder for future implementation)"""
    # TODO: Implement favorites table and logic
    return {"message": "Product removed from favorites (feature coming soon)"}