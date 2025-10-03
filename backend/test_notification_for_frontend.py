#!/usr/bin/env python3
"""
Script pour créer une notification de test pour l'utilisateur frontend
"""

import asyncio
import sys
import os
from datetime import datetime, timedelta

# Add app to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.models import PrescriptionRequest, Product, Pharmacy, User, PrescriptionStatus, Notification
from app.database import AsyncSessionLocal

async def create_test_notification():
    """Create a test notification for frontend user"""
    async with AsyncSessionLocal() as db:
        try:
            # Find the test@exemple.com user (the one used in frontend)
            from sqlalchemy import select

            result = await db.execute(select(User).where(User.email == "test@exemple.com"))
            user = result.scalar_one_or_none()

            if not user:
                print("❌ User test@exemple.com not found in database")
                return

            print(f"✅ Found user: {user.email} (ID: {user.id})")

            # Create a fake prescription expiration notification
            notification_data = {
                "prescription_request_id": "test-prescription-id",
                "pharmacy_name": "Pharmacie Test",
                "product_name": "Amoxicilline Test",
                "action": "expired"
            }

            notification = Notification(
                user_id=user.id,
                type="prescription_expired",
                title="Prescription expirée",
                message="⏰ Votre demande de prescription pour \"Amoxicilline Test\" a expiré. La pharmacie Pharmacie Test n'a pas répondu dans les délais. Vous pouvez essayer avec une autre pharmacie.",
                meta_data=notification_data,
                is_read=False,
                created_at=datetime.utcnow()
            )

            db.add(notification)
            await db.commit()

            print(f"✅ Created test notification with ID: {notification.id}")
            print("   Go to the frontend to see if the modal opens automatically!")

        except Exception as e:
            print(f"❌ Error: {str(e)}")
            await db.rollback()

if __name__ == "__main__":
    print("🧪 Creating test notification for frontend user...")
    asyncio.run(create_test_notification())