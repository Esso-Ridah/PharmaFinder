from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
import boto3
from botocore.exceptions import ClientError

from app.database import get_db
from app.schemas import Order, OrderCreate, OrderUpdate
from app.crud import (
    create_order, get_order, get_user_orders, 
    update_order_status, get_pharmacy
)
from app.auth import get_current_active_user, get_current_pharmacist
from app.models import User, OrderStatus
from app.config import settings

router = APIRouter(prefix="/orders", tags=["orders"])


async def upload_prescription_to_s3(file: UploadFile) -> str:
    """Upload prescription image to AWS S3"""
    if not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    # Create S3 client
    s3_client = boto3.client(
        's3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_S3_REGION
    )
    
    # Generate unique filename
    import uuid
    from datetime import datetime
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"prescriptions/{timestamp}_{uuid.uuid4().hex[:8]}.jpg"
    
    try:
        # Upload file
        s3_client.upload_fileobj(
            file.file,
            settings.AWS_S3_BUCKET,
            filename,
            ExtraArgs={'ContentType': file.content_type}
        )
        
        # Return public URL
        return f"https://{settings.AWS_S3_BUCKET}.s3.{settings.AWS_S3_REGION}.amazonaws.com/{filename}"
    
    except ClientError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload image: {str(e)}"
        )


@router.post("/", response_model=Order)
async def create_order_endpoint(
    order: OrderCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new order"""
    # Validate pharmacy exists
    pharmacy = await get_pharmacy(db, order.pharmacy_id)
    if not pharmacy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pharmacy not found"
        )
    
    if not pharmacy.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Pharmacy is not verified"
        )
    
    # Validate delivery address for home delivery
    if order.delivery_type == "home_delivery" and not order.delivery_address_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Delivery address required for home delivery"
        )
    
    try:
        new_order = await create_order(db=db, order=order, client_id=current_user.id)
        return new_order
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/upload-prescription", response_model=dict)
async def upload_prescription(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """Upload prescription image"""
    try:
        image_url = await upload_prescription_to_s3(file)
        return {"image_url": image_url}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload prescription: {str(e)}"
        )


@router.get("/", response_model=List[Order])
async def get_my_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current user's orders"""
    orders = await get_user_orders(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit
    )
    return orders


@router.get("/{order_id}", response_model=Order)
async def get_order_details(
    order_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get order details"""
    order = await get_order(db, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check if user owns this order or is the pharmacy owner
    if current_user.role == "client" and order.client_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this order"
        )
    elif current_user.role == "pharmacist" and order.pharmacy.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this order"
        )
    
    return order


@router.put("/{order_id}/status", response_model=Order)
async def update_order_status_endpoint(
    order_id: UUID,
    new_status: OrderStatus,
    current_user: User = Depends(get_current_pharmacist),
    db: AsyncSession = Depends(get_db)
):
    """Update order status (pharmacy owner only)"""
    order = await get_order(db, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check if user owns the pharmacy (unless admin)
    if current_user.role != "admin" and order.pharmacy.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this order"
        )
    
    updated_order = await update_order_status(db, order_id, new_status)
    return updated_order


@router.put("/{order_id}/validate-prescription", response_model=Order)
async def validate_prescription(
    order_id: UUID,
    is_valid: bool,
    current_user: User = Depends(get_current_pharmacist),
    db: AsyncSession = Depends(get_db)
):
    """Validate prescription for an order (pharmacy owner only)"""
    order = await get_order(db, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check if user owns the pharmacy (unless admin)
    if current_user.role != "admin" and order.pharmacy.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to validate prescriptions for this order"
        )
    
    if not order.prescription_image_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No prescription image uploaded for this order"
        )
    
    # Update prescription validation status
    order.prescription_validated = is_valid
    if is_valid:
        # Auto-confirm the order if prescription is valid
        order.status = OrderStatus.CONFIRMED
    else:
        # Cancel the order if prescription is invalid
        order.status = OrderStatus.CANCELLED
    
    await db.commit()
    await db.refresh(order)
    
    # TODO: Send notification to client about prescription validation result
    
    return order


@router.post("/{order_id}/cancel", response_model=Order)
async def cancel_order(
    order_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Cancel an order"""
    order = await get_order(db, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check if user owns this order
    if order.client_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to cancel this order"
        )
    
    # Check if order can be cancelled
    if order.status in [OrderStatus.IN_DELIVERY, OrderStatus.DELIVERED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot cancel order that is already in delivery or delivered"
        )
    
    updated_order = await update_order_status(db, order_id, OrderStatus.CANCELLED)
    
    # TODO: Handle refund if payment was already processed
    # TODO: Send notification to pharmacy about cancellation
    
    return updated_order


@router.get("/{order_id}/tracking", response_model=dict)
async def get_order_tracking(
    order_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get order tracking information"""
    order = await get_order(db, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check if user owns this order
    if order.client_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to track this order"
        )
    
    # Get delivery information if available
    from sqlalchemy import select
    from app.models import Delivery
    
    delivery_result = await db.execute(
        select(Delivery).where(Delivery.order_id == order_id)
    )
    delivery = delivery_result.scalar_one_or_none()
    
    tracking_info = {
        "order_number": order.order_number,
        "status": order.status.value,
        "delivery_type": order.delivery_type.value,
        "pickup_code": order.pickup_code,
        "estimated_pickup_time": order.estimated_pickup_time,
        "estimated_delivery_time": order.estimated_delivery_time,
        "pharmacy": {
            "name": order.pharmacy.name,
            "address": order.pharmacy.address,
            "phone": order.pharmacy.phone
        }
    }
    
    if delivery:
        tracking_info["delivery"] = {
            "delivery_partner": delivery.delivery_partner,
            "delivery_tracking_id": delivery.delivery_tracking_id,
            "delivery_person_name": delivery.delivery_person_name,
            "delivery_person_phone": delivery.delivery_person_phone,
            "pickup_time": delivery.pickup_time,
            "delivery_time": delivery.delivery_time
        }
    
    return tracking_info


@router.post("/{order_id}/confirm-pickup", response_model=Order)
async def confirm_pickup(
    order_id: UUID,
    pickup_code: str,
    current_user: User = Depends(get_current_pharmacist),
    db: AsyncSession = Depends(get_db)
):
    """Confirm order pickup with pickup code (pharmacy only)"""
    order = await get_order(db, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check if user owns the pharmacy (unless admin)
    if current_user.role != "admin" and order.pharmacy.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to confirm pickup for this order"
        )
    
    if order.delivery_type != "pickup":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order is not for pickup"
        )
    
    if order.pickup_code != pickup_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid pickup code"
        )
    
    updated_order = await update_order_status(db, order_id, OrderStatus.DELIVERED)
    
    # TODO: Update inventory quantities
    # TODO: Create payment record for cash payments
    # TODO: Send notification to client
    
    return updated_order