from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.security import HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from typing import List, Optional
import uuid
import os
import shutil
from datetime import datetime, timedelta
import aiofiles

from ..database import get_db
from ..auth import get_current_user
from ..models import User, PrescriptionRequest, PrescriptionStatus, Product, Pharmacy, Notification, Category
from ..schemas import (
    PrescriptionRequest as PrescriptionRequestSchema,
    PrescriptionRequestCreate,
    PrescriptionValidation,
    User as UserSchema
)

router = APIRouter(prefix="/prescriptions", tags=["prescriptions"])
security = HTTPBearer()

# Configuration
UPLOAD_DIR = "uploads/prescriptions"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".pdf"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload", response_model=PrescriptionRequestSchema)
async def upload_prescription(
    product_id: str = Form(...),
    pharmacy_id: str = Form(...),
    quantity_requested: int = Form(1),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload a prescription for validation"""

    # Validate file
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Check file size
    file_size = 0
    content = await file.read()
    file_size = len(content)

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size too large (max 10MB)")

    # Verify product requires prescription
    result = await db.execute(
        select(Product).where(Product.id == product_id)
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if not product.requires_prescription:
        raise HTTPException(status_code=400, detail="Product does not require prescription")

    # Verify pharmacy exists
    result = await db.execute(
        select(Pharmacy).where(Pharmacy.id == pharmacy_id)
    )
    pharmacy = result.scalar_one_or_none()
    if not pharmacy:
        raise HTTPException(status_code=404, detail="Pharmacy not found")

    # Generate unique filename
    file_id = str(uuid.uuid4())
    filename = f"{file_id}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    # Save file
    async with aiofiles.open(file_path, 'wb') as f:
        await f.write(content)

    # Create prescription request
    prescription_request = PrescriptionRequest(
        user_id=current_user.id,
        product_id=product_id,
        pharmacy_id=pharmacy_id,
        prescription_image_url=f"/uploads/prescriptions/{filename}",
        original_filename=file.filename,
        file_size=file_size,
        mime_type=file.content_type,
        quantity_requested=quantity_requested,
        expires_at=datetime.utcnow() + timedelta(days=30),  # 30 days expiry
        validation_timeout_at=datetime.utcnow() + timedelta(minutes=10),  # 10 minutes timeout
        status=PrescriptionStatus.PENDING
    )

    db.add(prescription_request)
    await db.commit()

    # Reload with eager loading for relationships to avoid MissingGreenlet errors
    result = await db.execute(
        select(PrescriptionRequest)
        .options(
            selectinload(PrescriptionRequest.product).selectinload(Product.category),
            selectinload(PrescriptionRequest.pharmacy)
        )
        .where(PrescriptionRequest.id == prescription_request.id)
    )
    prescription_request = result.scalar_one()

    # Create notification for pharmacy
    notification = Notification(
        user_id=pharmacy.owner_id,
        type="prescription_request",
        title="Nouvelle demande de prescription",
        message=f"Une nouvelle prescription pour {product.name} nécessite votre validation",
        meta_data={
            "prescription_request_id": prescription_request.id,
            "product_id": product_id,
            "client_name": f"{current_user.first_name} {current_user.last_name}"
        }
    )
    db.add(notification)
    await db.commit()

    return prescription_request


@router.get("/my-requests", response_model=List[PrescriptionRequestSchema])
async def get_my_prescription_requests(
    status: Optional[PrescriptionStatus] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's prescription requests"""
    query = select(PrescriptionRequest).options(
        selectinload(PrescriptionRequest.product).selectinload(Product.category),
        selectinload(PrescriptionRequest.pharmacy)
    ).where(
        PrescriptionRequest.user_id == current_user.id
    )

    if status:
        query = query.where(PrescriptionRequest.status == status)

    query = query.order_by(PrescriptionRequest.created_at.desc())

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/pharmacy-requests", response_model=List[PrescriptionRequestSchema])
async def get_pharmacy_prescription_requests(
    status: Optional[PrescriptionStatus] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get prescription requests for pharmacist's pharmacy"""

    # Get pharmacist's pharmacy
    result = await db.execute(
        select(Pharmacy).where(Pharmacy.owner_id == current_user.id)
    )
    pharmacy = result.scalar_one_or_none()
    if not pharmacy:
        raise HTTPException(status_code=404, detail="Pharmacy not found for current user")

    query = select(PrescriptionRequest).options(
        selectinload(PrescriptionRequest.product).selectinload(Product.category),
        selectinload(PrescriptionRequest.pharmacy)
    ).where(
        PrescriptionRequest.pharmacy_id == pharmacy.id
    )

    if status:
        query = query.where(PrescriptionRequest.status == status)

    query = query.order_by(PrescriptionRequest.created_at.desc())

    result = await db.execute(query)
    return result.scalars().all()


@router.post("/validate")
async def validate_prescription(
    validation: PrescriptionValidation,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Validate or reject a prescription request (pharmacist only)"""

    # Get prescription request
    result = await db.execute(
        select(PrescriptionRequest).where(
            PrescriptionRequest.id == validation.prescription_request_id
        )
    )
    prescription_request = result.scalar_one_or_none()
    if not prescription_request:
        raise HTTPException(status_code=404, detail="Prescription request not found")

    # Verify pharmacist owns the pharmacy
    result = await db.execute(
        select(Pharmacy).where(
            Pharmacy.id == prescription_request.pharmacy_id,
            Pharmacy.owner_id == current_user.id
        )
    )
    pharmacy = result.scalar_one_or_none()
    if not pharmacy:
        raise HTTPException(status_code=403, detail="Not authorized to validate this prescription")

    # Update prescription status
    update_data = {
        "validated_by": current_user.id,
        "validated_at": datetime.utcnow(),
        "pharmacist_notes": validation.pharmacist_notes
    }

    if validation.action == "approve":
        update_data["status"] = PrescriptionStatus.APPROVED
        notification_title = "Prescription approuvée"
        notification_message = f"Votre prescription pour {prescription_request.product.name if prescription_request.product else 'ce produit'} a été approuvée"
    elif validation.action == "reject":
        update_data["status"] = PrescriptionStatus.REJECTED
        update_data["rejection_reason"] = validation.rejection_reason
        notification_title = "Prescription refusée"
        notification_message = f"Votre prescription pour {prescription_request.product.name if prescription_request.product else 'ce produit'} a été refusée"
    else:
        raise HTTPException(status_code=400, detail="Action must be 'approve' or 'reject'")

    await db.execute(
        update(PrescriptionRequest)
        .where(PrescriptionRequest.id == validation.prescription_request_id)
        .values(**update_data)
    )

    # Create notification for client
    notification = Notification(
        user_id=prescription_request.user_id,
        type="prescription_validated",
        title=notification_title,
        message=notification_message,
        meta_data={
            "prescription_request_id": prescription_request.id,
            "status": update_data["status"],
            "pharmacy_name": pharmacy.name,
            "pharmacist_notes": validation.pharmacist_notes,
            "rejection_reason": validation.rejection_reason if validation.action == "reject" else None
        }
    )
    db.add(notification)

    await db.commit()

    return {"message": f"Prescription {validation.action}ed successfully"}


@router.get("/{prescription_id}", response_model=PrescriptionRequestSchema)
async def get_prescription_request(
    prescription_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific prescription request"""
    result = await db.execute(
        select(PrescriptionRequest).options(
            selectinload(PrescriptionRequest.product).selectinload(Product.category),
            selectinload(PrescriptionRequest.pharmacy)
        ).where(PrescriptionRequest.id == prescription_id)
    )
    prescription_request = result.scalar_one_or_none()

    if not prescription_request:
        raise HTTPException(status_code=404, detail="Prescription request not found")

    # Check access rights
    if prescription_request.user_id != current_user.id:
        # Check if current user is the pharmacist for this prescription
        result = await db.execute(
            select(Pharmacy).where(
                Pharmacy.id == prescription_request.pharmacy_id,
                Pharmacy.owner_id == current_user.id
            )
        )
        pharmacy = result.scalar_one_or_none()
        if not pharmacy:
            raise HTTPException(status_code=403, detail="Not authorized to view this prescription")

    return prescription_request


@router.get("/{prescription_id}/alternatives", response_model=List[dict])
async def get_alternative_pharmacies(
    prescription_id: str,
    max_distance: Optional[float] = 50.0,
    limit: Optional[int] = 5,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get alternative pharmacies for an expired prescription request"""
    from app.background_tasks import background_task_manager

    # Get the prescription request
    result = await db.execute(
        select(PrescriptionRequest).where(PrescriptionRequest.id == prescription_id)
    )
    prescription_request = result.scalar_one_or_none()

    if not prescription_request:
        raise HTTPException(status_code=404, detail="Prescription request not found")

    # Check if user owns this prescription request
    if prescription_request.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this prescription")

    # Check if prescription is expired
    if prescription_request.status != PrescriptionStatus.EXPIRED:
        raise HTTPException(
            status_code=400,
            detail="Alternative pharmacies are only available for expired prescriptions"
        )

    # Get alternative pharmacies
    alternatives = await background_task_manager.get_alternative_pharmacies(
        db=db,
        expired_request=prescription_request,
        max_distance_km=max_distance,
        limit=limit
    )

    return alternatives


@router.post("/{prescription_id}/retry", response_model=PrescriptionRequestSchema)
async def retry_prescription_with_alternative_pharmacy(
    prescription_id: str,
    alternative_pharmacy_id: str = Form(...),
    file: UploadFile = File(...),
    quantity_requested: int = Form(1),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retry prescription upload with an alternative pharmacy"""

    # Get the original prescription request
    result = await db.execute(
        select(PrescriptionRequest).where(PrescriptionRequest.id == prescription_id)
    )
    original_request = result.scalar_one_or_none()

    if not original_request:
        raise HTTPException(status_code=404, detail="Original prescription request not found")

    # Check if user owns this prescription request
    if original_request.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to retry this prescription")

    # Check if prescription is expired
    if original_request.status != PrescriptionStatus.EXPIRED:
        raise HTTPException(
            status_code=400,
            detail="Can only retry expired prescriptions"
        )

    # Verify the alternative pharmacy exists
    result = await db.execute(
        select(Pharmacy).where(Pharmacy.id == alternative_pharmacy_id)
    )
    alternative_pharmacy = result.scalar_one_or_none()
    if not alternative_pharmacy:
        raise HTTPException(status_code=404, detail="Alternative pharmacy not found")

    # File validation
    if not file.content_type or not file.content_type.startswith(('image/', 'application/pdf')):
        raise HTTPException(status_code=400, detail="Invalid file type")

    allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="File type not allowed")

    # Create upload directory if it doesn't exist
    UPLOAD_DIR = "uploads/prescriptions"
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    # Read file content
    content = await file.read()
    file_size = len(content)
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size too large (max 10MB)")

    # Generate unique filename
    file_ext = os.path.splitext(file.filename)[1] if file.filename else '.jpg'
    file_id = str(uuid.uuid4())
    filename = f"{file_id}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    # Save file
    async with aiofiles.open(file_path, 'wb') as f:
        await f.write(content)

    # Create new prescription request with alternative pharmacy
    new_prescription_request = PrescriptionRequest(
        user_id=current_user.id,
        product_id=original_request.product_id,
        pharmacy_id=alternative_pharmacy_id,
        prescription_image_url=f"/uploads/prescriptions/{filename}",
        original_filename=file.filename,
        file_size=file_size,
        mime_type=file.content_type,
        quantity_requested=quantity_requested,
        expires_at=datetime.utcnow() + timedelta(days=30),  # 30 days expiry
        validation_timeout_at=datetime.utcnow() + timedelta(minutes=10),  # 10 minutes timeout
        status=PrescriptionStatus.PENDING
    )

    db.add(new_prescription_request)
    await db.commit()

    # Reload with eager loading for relationships to avoid MissingGreenlet errors
    result = await db.execute(
        select(PrescriptionRequest)
        .options(
            selectinload(PrescriptionRequest.product).selectinload(Product.category),
            selectinload(PrescriptionRequest.pharmacy)
        )
        .where(PrescriptionRequest.id == new_prescription_request.id)
    )
    new_prescription_request = result.scalar_one()

    return new_prescription_request