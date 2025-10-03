"""
Background tasks for handling prescription timeouts and automated processes
"""
import asyncio
import logging
from datetime import datetime
from typing import List

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import AsyncSessionLocal
from app.models import PrescriptionRequest, PrescriptionStatus, Pharmacy, Product
from app.services.notification_service import NotificationService

logger = logging.getLogger(__name__)

class BackgroundTaskManager:
    """Manages background tasks for prescription validation timeouts"""

    def __init__(self):
        self.notification_service = NotificationService()
        self._running = False

    async def start_timeout_monitor(self):
        """Start the prescription timeout monitoring task"""
        self._running = True
        logger.info("Starting prescription timeout monitor...")

        while self._running:
            try:
                await self.process_expired_prescriptions()
                # Check every 30 seconds
                await asyncio.sleep(30)
            except Exception as e:
                logger.error(f"Error in timeout monitor: {str(e)}")
                await asyncio.sleep(60)  # Wait longer on error

    def stop_timeout_monitor(self):
        """Stop the prescription timeout monitoring task"""
        self._running = False
        logger.info("Stopping prescription timeout monitor...")

    async def process_expired_prescriptions(self):
        """Process all expired prescription requests"""
        async with AsyncSessionLocal() as db:
            try:
                # Find all pending prescriptions that have timed out
                current_time = datetime.utcnow()

                result = await db.execute(
                    select(PrescriptionRequest, Pharmacy, Product).
                    join(Pharmacy, PrescriptionRequest.pharmacy_id == Pharmacy.id).
                    join(Product, PrescriptionRequest.product_id == Product.id).
                    where(
                        PrescriptionRequest.status == PrescriptionStatus.PENDING,
                        PrescriptionRequest.validation_timeout_at < current_time
                    )
                )

                expired_requests = result.all()

                if not expired_requests:
                    return

                logger.info(f"Found {len(expired_requests)} expired prescription requests")

                for request, pharmacy, product in expired_requests:
                    await self.expire_prescription_request(db, request, pharmacy, product)

                await db.commit()

            except Exception as e:
                logger.error(f"Error processing expired prescriptions: {str(e)}")
                await db.rollback()

    async def expire_prescription_request(
        self,
        db: AsyncSession,
        request: PrescriptionRequest,
        pharmacy: Pharmacy,
        product: Product
    ):
        """Expire a single prescription request"""
        try:
            # Update status to EXPIRED with rejection reason
            rejection_reason = (
                f"La pharmacie \"{pharmacy.name}\" n'a malheureusement pas pris en charge "
                f"votre demande dans le délai imparti (15 minutes). Veuillez essayer avec "
                f"une autre pharmacie."
            )

            # Update the prescription request
            await db.execute(
                update(PrescriptionRequest).
                where(PrescriptionRequest.id == request.id).
                values(
                    status=PrescriptionStatus.EXPIRED,
                    rejection_reason=rejection_reason,
                    validated_at=datetime.utcnow()
                )
            )

            # Create notification for the user
            notification_message = (
                f"⏰ Votre demande de prescription pour \"{product.name}\" a expiré. "
                f"La pharmacie {pharmacy.name} n'a pas répondu dans les délais. "
                f"Vous pouvez essayer avec une autre pharmacie."
            )

            notification_data = {
                "prescription_request_id": str(request.id),
                "pharmacy_name": pharmacy.name,
                "product_name": product.name,
                "action": "expired"
            }

            await self.notification_service.create_notification(
                db=db,
                user_id=request.user_id,
                title="Prescription expirée",
                message=notification_message,
                type_="prescription_expired",
                data=notification_data
            )

            logger.info(f"Expired prescription request {request.id} for user {request.user_id}")

        except Exception as e:
            logger.error(f"Error expiring prescription request {request.id}: {str(e)}")

    async def get_alternative_pharmacies(
        self,
        db: AsyncSession,
        expired_request: PrescriptionRequest,
        max_distance_km: float = 50.0,
        limit: int = 5
    ) -> List[dict]:
        """Get alternative pharmacies that sell the same product"""
        try:
            # Get the original pharmacy's location
            original_pharmacy_result = await db.execute(
                select(Pharmacy).where(Pharmacy.id == expired_request.pharmacy_id)
            )
            original_pharmacy = original_pharmacy_result.scalar_one_or_none()

            if not original_pharmacy or not original_pharmacy.latitude or not original_pharmacy.longitude:
                logger.warning(f"Original pharmacy {expired_request.pharmacy_id} not found or missing coordinates")
                return []

            # Find pharmacies that have the product in stock
            # Note: This would need to be implemented based on your inventory system
            # For now, we'll find nearby pharmacies

            from sqlalchemy import text, func

            # Calculate distance using Haversine formula
            distance_formula = func.round(
                func.sqrt(
                    func.pow(
                        69.1 * (Pharmacy.latitude - original_pharmacy.latitude), 2
                    ) +
                    func.pow(
                        69.1 * (original_pharmacy.longitude - Pharmacy.longitude) *
                        func.cos(Pharmacy.latitude / 57.3), 2
                    )
                ), 2
            ).label('distance_km')

            result = await db.execute(
                select(
                    Pharmacy,
                    distance_formula
                ).
                where(
                    Pharmacy.id != expired_request.pharmacy_id,
                    Pharmacy.is_active == True,
                    Pharmacy.is_verified == True,
                    Pharmacy.latitude.is_not(None),
                    Pharmacy.longitude.is_not(None)
                ).
                order_by(distance_formula).
                limit(limit)
            )

            alternatives = []
            for pharmacy, distance in result.all():
                if distance <= max_distance_km:
                    alternatives.append({
                        "id": pharmacy.id,
                        "name": pharmacy.name,
                        "address": pharmacy.address,
                        "city": pharmacy.city,
                        "phone": pharmacy.phone,
                        "distance_km": float(distance),
                        "latitude": float(pharmacy.latitude) if pharmacy.latitude else None,
                        "longitude": float(pharmacy.longitude) if pharmacy.longitude else None
                    })

            logger.info(f"Found {len(alternatives)} alternative pharmacies for prescription {expired_request.id}")
            return alternatives

        except Exception as e:
            logger.error(f"Error finding alternative pharmacies: {str(e)}")
            return []

# Global background task manager instance
background_task_manager = BackgroundTaskManager()