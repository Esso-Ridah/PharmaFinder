from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from uuid import UUID

from app.database import get_db
from app.schemas import ClientAddress, ClientAddressCreate
from app.models import ClientAddress as ClientAddressModel, User
from app.auth import get_current_active_user

router = APIRouter(prefix="/addresses", tags=["addresses"])


@router.post("", response_model=ClientAddress, status_code=status.HTTP_201_CREATED)
async def create_address(
    address_data: ClientAddressCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new address for the current user"""
    try:
        # Create new address
        db_address = ClientAddressModel(
            user_id=str(current_user.id),
            **address_data.model_dump()
        )

        # If this is set as default, unset other defaults
        if address_data.is_default:
            # Unset other default addresses
            stmt = select(ClientAddressModel).where(
                ClientAddressModel.user_id == str(current_user.id),
                ClientAddressModel.is_default == True
            )
            result = await db.execute(stmt)
            existing_defaults = result.scalars().all()
            for addr in existing_defaults:
                addr.is_default = False

        db.add(db_address)
        await db.commit()
        await db.refresh(db_address)

        return db_address
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create address: {str(e)}"
        )


@router.get("", response_model=List[ClientAddress])
async def get_my_addresses(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all addresses for the current user"""
    stmt = select(ClientAddressModel).where(
        ClientAddressModel.user_id == str(current_user.id)
    ).order_by(ClientAddressModel.is_default.desc(), ClientAddressModel.created_at.desc())

    result = await db.execute(stmt)
    addresses = result.scalars().all()

    return addresses


@router.get("/{address_id}", response_model=ClientAddress)
async def get_address(
    address_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific address by ID"""
    stmt = select(ClientAddressModel).where(
        ClientAddressModel.id == str(address_id),
        ClientAddressModel.user_id == str(current_user.id)
    )

    result = await db.execute(stmt)
    address = result.scalar_one_or_none()

    if not address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found"
        )

    return address


@router.put("/{address_id}", response_model=ClientAddress)
async def update_address(
    address_id: UUID,
    address_data: ClientAddressCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update an existing address"""
    # Get existing address
    stmt = select(ClientAddressModel).where(
        ClientAddressModel.id == str(address_id),
        ClientAddressModel.user_id == str(current_user.id)
    )

    result = await db.execute(stmt)
    db_address = result.scalar_one_or_none()

    if not db_address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found"
        )

    # If setting as default, unset other defaults
    if address_data.is_default:
        stmt = select(ClientAddressModel).where(
            ClientAddressModel.user_id == str(current_user.id),
            ClientAddressModel.is_default == True,
            ClientAddressModel.id != str(address_id)
        )
        result = await db.execute(stmt)
        existing_defaults = result.scalars().all()
        for addr in existing_defaults:
            addr.is_default = False

    # Update address fields
    for field, value in address_data.model_dump().items():
        setattr(db_address, field, value)

    await db.commit()
    await db.refresh(db_address)

    return db_address


@router.delete("/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_address(
    address_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete an address"""
    # Get existing address
    stmt = select(ClientAddressModel).where(
        ClientAddressModel.id == str(address_id),
        ClientAddressModel.user_id == str(current_user.id)
    )

    result = await db.execute(stmt)
    db_address = result.scalar_one_or_none()

    if not db_address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found"
        )

    await db.delete(db_address)
    await db.commit()

    return None
