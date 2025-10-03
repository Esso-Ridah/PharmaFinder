"""
Simple notification service for creating user notifications
"""
import logging
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Notification
from datetime import datetime

logger = logging.getLogger(__name__)

class NotificationService:
    """Service for managing user notifications"""

    def __init__(self):
        pass

    async def create_notification(
        self,
        db: AsyncSession,
        user_id: str,
        title: str,
        message: str,
        type_: str,
        data: Optional[Dict[str, Any]] = None
    ) -> Notification:
        """Create a new notification for a user"""
        try:
            notification = Notification(
                user_id=user_id,
                title=title,
                message=message,
                type=type_,
                meta_data=data or {},
                is_read=False,
                created_at=datetime.utcnow()
            )

            db.add(notification)
            await db.flush()  # Get the ID without committing

            logger.info(f"Created notification {notification.id} for user {user_id}")
            return notification

        except Exception as e:
            logger.error(f"Error creating notification: {str(e)}")
            raise