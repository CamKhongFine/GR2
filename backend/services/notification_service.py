"""
Notification Service
"""
from sqlalchemy.orm import Session
from models.notification import Notification
from models.schemas import NotificationCreate, NotificationUpdate
from typing import Optional, List

class NotificationService:
    """Notification service class"""
    
    @staticmethod
    def get_notification(db: Session, notification_id: int) -> Optional[Notification]:
        """Get notification by ID"""
        return db.query(Notification).filter(Notification.id == notification_id).first()
    
    @staticmethod
    def get_notifications(db: Session, skip: int = 0, limit: int = 100) -> List[Notification]:
        """Get list of notifications"""
        return db.query(Notification).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_notifications_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Notification]:
        """Get notifications by user ID"""
        return db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_unread_notifications(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Notification]:
        """Get unread notifications for a user"""
        return db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()
    
    @staticmethod
    def create_notification(db: Session, notification: NotificationCreate) -> Notification:
        """Create new notification"""
        db_notification = Notification(
            user_id=notification.user_id,
            message=notification.message
        )
        db.add(db_notification)
        db.commit()
        db.refresh(db_notification)
        return db_notification
    
    @staticmethod
    def update_notification(db: Session, notification_id: int, notification_update: NotificationUpdate) -> Optional[Notification]:
        """Update notification"""
        db_notification = db.query(Notification).filter(Notification.id == notification_id).first()
        if not db_notification:
            return None
        
        update_data = notification_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_notification, field, value)
        
        db.commit()
        db.refresh(db_notification)
        return db_notification
    
    @staticmethod
    def mark_all_as_read(db: Session, user_id: int) -> int:
        """Mark all notifications as read for a user"""
        count = db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).update({"is_read": True})
        db.commit()
        return count
    
    @staticmethod
    def delete_notification(db: Session, notification_id: int) -> bool:
        """Delete notification"""
        db_notification = db.query(Notification).filter(Notification.id == notification_id).first()
        if not db_notification:
            return False
        
        db.delete(db_notification)
        db.commit()
        return True

