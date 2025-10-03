from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.database import get_db
from app.schemas import Pharmacy, PharmacyCreate, PharmacyUpdate, PharmacyWithDistance
from app.crud import (
    create_pharmacy, get_pharmacy, get_pharmacies, 
    search_pharmacies_by_location, get_pharmacy_orders
)
from app.auth import get_current_active_user, get_current_pharmacist
from app.models import User

router = APIRouter(prefix="/pharmacies", tags=["pharmacies"])


@router.get("/", response_model=List[Pharmacy])
async def list_pharmacies(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=100, description="Maximum number of records to return"),
    verified_only: bool = Query(True, description="Return only verified pharmacies"),
    db: AsyncSession = Depends(get_db)
):
    """List all pharmacies"""
    pharmacies = await get_pharmacies(
        db=db,
        skip=skip,
        limit=limit,
        verified_only=verified_only
    )
    return pharmacies


@router.get("/search", response_model=List[dict])
async def search_pharmacies_by_location_endpoint(
    latitude: float = Query(..., description="User latitude"),
    longitude: float = Query(..., description="User longitude"),
    max_distance: float = Query(10.0, ge=0.1, le=50.0, description="Maximum distance in km"),
    limit: int = Query(20, ge=1, le=100, description="Maximum number of pharmacies to return"),
    db: AsyncSession = Depends(get_db)
):
    """Search pharmacies by geographic location"""
    pharmacies = await search_pharmacies_by_location(
        db=db,
        latitude=latitude,
        longitude=longitude,
        max_distance=max_distance,
        limit=limit
    )
    
    # Format response with distance
    result = []
    for pharmacy in pharmacies:
        pharmacy_data = {
            "id": pharmacy.id,
            "name": pharmacy.name,
            "license_number": pharmacy.license_number,
            "address": pharmacy.address,
            "city": pharmacy.city,
            "phone": pharmacy.phone,
            "email": pharmacy.email,
            "latitude": float(pharmacy.latitude) if pharmacy.latitude else None,
            "longitude": float(pharmacy.longitude) if pharmacy.longitude else None,
            "opening_hours": pharmacy.opening_hours,
            "is_verified": pharmacy.is_verified,
            "distance_km": round(pharmacy.distance, 2) if hasattr(pharmacy, 'distance') else None,
            "created_at": pharmacy.created_at
        }
        result.append(pharmacy_data)
    
    return result


@router.get("/{pharmacy_id}", response_model=Pharmacy)
async def get_pharmacy_details(
    pharmacy_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get pharmacy details by ID"""
    from sqlalchemy import select
    from app.models import Pharmacy

    try:
        # Direct query without problematic relationships
        print(f"DEBUG: Searching for pharmacy ID: {pharmacy_id} (type: {type(pharmacy_id)})")

        # Convert UUID to string for consistent comparison
        pharmacy_id_str = str(pharmacy_id)
        print(f"DEBUG: Pharmacy ID as string: {pharmacy_id_str}")

        result = await db.execute(
            select(Pharmacy).where(Pharmacy.id == pharmacy_id_str)
        )
        pharmacy = result.scalar_one_or_none()

        print(f"DEBUG: Query result: {pharmacy}")

        if not pharmacy:
            # Try to list all pharmacies to see what exists
            all_result = await db.execute(select(Pharmacy.id, Pharmacy.name))
            all_pharmacies = all_result.all()
            print(f"DEBUG: Available pharmacies: {all_pharmacies[:3]}")

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pharmacy not found"
            )
        return pharmacy
    except Exception as e:
        print(f"Error in get_pharmacy_details: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pharmacy not found"
        )


@router.post("/", response_model=Pharmacy)
async def create_pharmacy_endpoint(
    pharmacy: PharmacyCreate,
    current_user: User = Depends(get_current_pharmacist),
    db: AsyncSession = Depends(get_db)
):
    """Create a new pharmacy (pharmacist only)"""
    new_pharmacy = await create_pharmacy(db=db, pharmacy=pharmacy, owner_id=current_user.id)
    return new_pharmacy


@router.put("/{pharmacy_id}", response_model=Pharmacy)
async def update_pharmacy(
    pharmacy_id: UUID,
    pharmacy_update: PharmacyUpdate,
    current_user: User = Depends(get_current_pharmacist),
    db: AsyncSession = Depends(get_db)
):
    """Update pharmacy details (owner only)"""
    pharmacy = await get_pharmacy(db, pharmacy_id)
    if not pharmacy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pharmacy not found"
        )
    
    # Check if user owns this pharmacy (unless admin)
    if current_user.role != "admin" and pharmacy.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this pharmacy"
        )
    
    # Update pharmacy fields
    update_data = pharmacy_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(pharmacy, field, value)
    
    await db.commit()
    await db.refresh(pharmacy)
    return pharmacy


@router.get("/{pharmacy_id}/inventory", response_model=List[dict])
async def get_pharmacy_inventory(
    pharmacy_id: UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    in_stock_only: bool = Query(True, description="Show only products in stock"),
    db: AsyncSession = Depends(get_db)
):
    """Get pharmacy inventory - simplified to avoid problematic pharmacy lookup"""
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload
    from app.models import PharmacyInventory

    try:
        # Convert UUID properly to string format
        pharmacy_uuid_str = str(pharmacy_id)
        print(f"DEBUG: Looking for pharmacy inventory with ID: {pharmacy_uuid_str}")

        # Direct query for inventory without pharmacy validation
        query = (
            select(PharmacyInventory)
            .options(selectinload(PharmacyInventory.product))
            .where(PharmacyInventory.pharmacy_id == pharmacy_uuid_str)
        )

        if in_stock_only:
            query = query.where(PharmacyInventory.quantity > 0)

        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        inventory_items = result.scalars().all()

        print(f"DEBUG: Found {len(inventory_items)} inventory items")

        # Format response
        inventory_data = []
        for item in inventory_items:
            inventory_data.append({
                "id": item.id,
                "product": {
                    "id": item.product.id,
                    "name": item.product.name,
                    "generic_name": item.product.generic_name,
                    "manufacturer": item.product.manufacturer,
                    "dosage": item.product.dosage,
                    "requires_prescription": item.product.requires_prescription
                },
                "quantity": item.quantity,
                "price": float(item.price),
                "expiry_date": item.expiry_date,
                "batch_number": item.batch_number,
                "last_updated": item.last_updated
            })

        return inventory_data

    except Exception as e:
        # Log error but return empty array instead of failing
        print(f"Error fetching inventory for pharmacy {pharmacy_id}: {e}")
        import traceback
        traceback.print_exc()
        return []


@router.get("/{pharmacy_id}/orders", response_model=List[dict])
async def get_pharmacy_orders_endpoint(
    pharmacy_id: UUID,
    status: Optional[str] = Query(None, description="Filter by order status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_pharmacist),
    db: AsyncSession = Depends(get_db)
):
    """Get orders for a pharmacy (pharmacy owner only)"""
    pharmacy = await get_pharmacy(db, pharmacy_id)
    if not pharmacy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pharmacy not found"
        )
    
    # Check if user owns this pharmacy (unless admin)
    if current_user.role != "admin" and pharmacy.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this pharmacy's orders"
        )
    
    from app.models import OrderStatus
    order_status = None
    if status:
        try:
            order_status = OrderStatus(status)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid order status"
            )
    
    orders = await get_pharmacy_orders(
        db=db,
        pharmacy_id=pharmacy_id,
        status=order_status,
        skip=skip,
        limit=limit
    )
    
    # Format response
    orders_data = []
    for order in orders:
        orders_data.append({
            "id": order.id,
            "order_number": order.order_number,
            "client": {
                "id": order.client.id,
                "first_name": order.client.first_name,
                "last_name": order.client.last_name,
                "phone": order.client.phone
            },
            "status": order.status.value,
            "delivery_type": order.delivery_type.value,
            "total_amount": float(order.total_amount),
            "pickup_code": order.pickup_code,
            "prescription_validated": order.prescription_validated,
            "created_at": order.created_at,
            "estimated_pickup_time": order.estimated_pickup_time,
            "estimated_delivery_time": order.estimated_delivery_time
        })
    
    return orders_data


@router.get("/{pharmacy_id}/analytics", response_model=dict)
async def get_pharmacy_analytics(
    pharmacy_id: UUID,
    current_user: User = Depends(get_current_pharmacist),
    db: AsyncSession = Depends(get_db)
):
    """Get pharmacy analytics (pharmacy owner only)"""
    pharmacy = await get_pharmacy(db, pharmacy_id)
    if not pharmacy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pharmacy not found"
        )
    
    # Check if user owns this pharmacy (unless admin)
    if current_user.role != "admin" and pharmacy.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this pharmacy's analytics"
        )
    
    # TODO: Implement detailed analytics queries
    # For now, return basic stats
    from sqlalchemy import func, select
    from app.models import Order, PharmacyInventory
    from datetime import datetime, timedelta
    
    # Total orders
    total_orders_result = await db.execute(
        select(func.count(Order.id)).where(Order.pharmacy_id == pharmacy_id)
    )
    total_orders = total_orders_result.scalar()
    
    # Pending orders
    pending_orders_result = await db.execute(
        select(func.count(Order.id)).where(
            and_(
                Order.pharmacy_id == pharmacy_id,
                Order.status.in_(["pending", "confirmed", "preparing"])
            )
        )
    )
    pending_orders = pending_orders_result.scalar()
    
    # Total products in inventory
    total_products_result = await db.execute(
        select(func.count(PharmacyInventory.id)).where(
            and_(
                PharmacyInventory.pharmacy_id == pharmacy_id,
                PharmacyInventory.quantity > 0
            )
        )
    )
    total_products = total_products_result.scalar()
    
    return {
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "total_products_in_stock": total_products,
        "revenue_today": 0,  # TODO: Calculate from completed orders
        "revenue_this_month": 0,  # TODO: Calculate from completed orders
        "avg_rating": 4.5,  # TODO: Calculate from reviews
        "total_reviews": 0  # TODO: Count reviews
    }