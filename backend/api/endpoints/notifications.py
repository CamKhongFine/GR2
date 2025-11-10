"""
Notification Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database.connection import get_db
from models.schemas import Notification, NotificationCreate, NotificationUpdate
from services.notification_service import NotificationService

router = APIRouter()

@router.get("/", response_model=List[Notification])
async def get_notifications(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get list of notifications"""
    notifications = NotificationService.get_notifications(db, skip=skip, limit=limit)
    return notifications

@router.get("/{notification_id}", response_model=Notification)
async def get_notification(
    notification_id: int,
    db: Session = Depends(get_db)
):
    """Get notification by ID"""
    notification = NotificationService.get_notification(db, notification_id=notification_id)
    if notification is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    return notification

@router.get("/user/{user_id}", response_model=List[Notification])
async def get_notifications_by_user(
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get notifications by user ID"""
    notifications = NotificationService.get_notifications_by_user(db, user_id=user_id, skip=skip, limit=limit)
    return notifications

@router.get("/user/{user_id}/unread", response_model=List[Notification])
async def get_unread_notifications(
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get unread notifications for a user"""
    notifications = NotificationService.get_unread_notifications(db, user_id=user_id, skip=skip, limit=limit)
    return notifications

@router.post("/", response_model=Notification, status_code=status.HTTP_201_CREATED)
async def create_notification(
    notification: NotificationCreate,
    db: Session = Depends(get_db)
):
    """Create new notification"""
    return NotificationService.create_notification(db=db, notification=notification)

@router.put("/{notification_id}", response_model=Notification)
async def update_notification(
    notification_id: int,
    notification_update: NotificationUpdate,
    db: Session = Depends(get_db)
):
    """Update notification"""
    notification = NotificationService.update_notification(db, notification_id=notification_id, notification_update=notification_update)
    if notification is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    return notification

@router.put("/user/{user_id}/mark-all-read", status_code=status.HTTP_200_OK)
async def mark_all_notifications_read(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Mark all notifications as read for a user"""
    count = NotificationService.mark_all_as_read(db, user_id=user_id)
    return {"message": f"Marked {count} notifications as read"}

@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db)
):
    """Delete notification"""
    success = NotificationService.delete_notification(db, notification_id=notification_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

