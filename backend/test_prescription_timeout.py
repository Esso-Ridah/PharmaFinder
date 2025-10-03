#!/usr/bin/env python3
"""
Script pour tester le système de timeout des prescriptions
"""

import asyncio
import sqlite3
from datetime import datetime, timedelta
from sqlalchemy import create_engine, select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
import sys
import os

# Add app to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.models import PrescriptionRequest, Product, Pharmacy, User, PrescriptionStatus
from app.database import get_db
from app.config import settings

async def create_test_prescription():
    """Create a prescription with immediate timeout for testing"""
    # Create async engine
    engine = create_async_engine(settings.DATABASE_URL)

    # Create session
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as db:
        try:
            # Find first user, product, and pharmacy
            user_result = await db.execute(select(User).limit(1))
            user = user_result.scalar_one_or_none()

            product_result = await db.execute(select(Product).where(Product.requires_prescription == True).limit(1))
            product = product_result.scalar_one_or_none()

            pharmacy_result = await db.execute(select(Pharmacy).limit(1))
            pharmacy = pharmacy_result.scalar_one_or_none()

            if not user:
                print("❌ No user found in database")
                return

            if not product:
                print("❌ No prescription product found in database")
                return

            if not pharmacy:
                print("❌ No pharmacy found in database")
                return

            print(f"✅ Found user: {user.email}")
            print(f"✅ Found product: {product.name}")
            print(f"✅ Found pharmacy: {pharmacy.name}")

            # Create prescription with immediate timeout (10 seconds from now)
            prescription_request = PrescriptionRequest(
                user_id=user.id,
                product_id=product.id,
                pharmacy_id=pharmacy.id,
                prescription_image_url="/test/fake_prescription.jpg",
                original_filename="test_prescription.jpg",
                file_size=1024,
                mime_type="image/jpeg",
                quantity_requested=1,
                expires_at=datetime.utcnow() + timedelta(days=30),
                validation_timeout_at=datetime.utcnow() + timedelta(seconds=10),  # 10 seconds
                status=PrescriptionStatus.PENDING
            )

            db.add(prescription_request)
            await db.commit()
            await db.refresh(prescription_request)

            print(f"✅ Created test prescription with ID: {prescription_request.id}")
            print(f"   Timeout at: {prescription_request.validation_timeout_at}")
            print("   Waiting 15 seconds for timeout to trigger...")

            # Wait 15 seconds to let the timeout system process it
            await asyncio.sleep(15)

            # Check if it was marked as expired
            await db.refresh(prescription_request)
            print(f"   Status after timeout: {prescription_request.status}")

            if prescription_request.status == PrescriptionStatus.EXPIRED:
                print("✅ Prescription successfully expired by timeout system")
            else:
                print("❌ Prescription was not expired by timeout system")

        except Exception as e:
            print(f"❌ Error: {str(e)}")
            await db.rollback()

    await engine.dispose()

if __name__ == "__main__":
    print("🧪 Testing prescription timeout system...")
    asyncio.run(create_test_prescription())