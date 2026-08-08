from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models.user import User
from app.api.deps import get_current_active_user
from app.schemas.response import StandardResponse
from app.schemas.notification import (
    NotificationResponse,
    NotificationListResponse,
    UnreadCountResponse
)
from app.services.notification_service import notification_service
from app.services.announcement_service import assert_can_send_announcement, dispatch_announcement

router = APIRouter(prefix="/notifications", tags=["Notifications"])


class AnnouncementCreate(BaseModel):
    hackathon_id: Optional[str] = None
    title: str
    message: str
    target: str  # all_platform_users | all_users | team_leaders | user:<id> | <team_id>


@router.post("/announce", response_model=StandardResponse[int])
def send_announcement(
    payload: AnnouncementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Send an announcement notification and email to targeted users.

    Target options:
    - all_platform_users: all active users (admin/coordinator)
    - all_users: all team members in the hackathon (requires hackathon_id)
    - team_leaders: only team leaders in the hackathon (requires hackathon_id)
    - user:<user_id>: a specific user
    - <team_id>: all members of a specific team (requires hackathon_id)
    """
    assert_can_send_announcement(
        db=db,
        current_user=current_user,
        target=payload.target,
        hackathon_id=payload.hackathon_id,
    )

    notification_count, email_count = dispatch_announcement(
        db=db,
        title=payload.title,
        message=payload.message,
        target=payload.target,
        sender=current_user,
        hackathon_id=payload.hackathon_id,
        send_emails=True,
    )

    return StandardResponse(
        success=True,
        message=(
            f"Announcement sent to {notification_count} user(s)"
            f" ({email_count} email(s) delivered)."
        ),
        data=notification_count
    )


@router.get("", response_model=StandardResponse[NotificationListResponse])
def get_my_notifications(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    is_read: Optional[bool] = Query(None, description="Filter by read/unread status"),
    current_user: User = Depends(get_current_active_user)
):
    """
    Retrieve paginated notifications for the currently authenticated active user.
    """
    notifications, total, unread_count = notification_service.get_user_notifications(
        db=db,
        user_id=current_user.id,
        page=page,
        limit=limit,
        is_read=is_read
    )
    
    mapped_notifications = [
        NotificationResponse.from_orm(n) for n in notifications
    ]
    
    return StandardResponse(
        success=True,
        message="Notifications retrieved successfully.",
        data=NotificationListResponse(
            notifications=mapped_notifications,
            total=total,
            unread_count=unread_count
        )
    )


@router.get("/unread-count", response_model=StandardResponse[UnreadCountResponse])
def get_unread_notifications_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Retrieve the count of unread notifications for the currently authenticated active user.
    """
    _, _, unread_count = notification_service.get_user_notifications(
        db=db,
        user_id=current_user.id,
        page=1,
        limit=1,
        is_read=False
    )
    
    return StandardResponse(
        success=True,
        message="Unread notification count retrieved.",
        data=UnreadCountResponse(unread_count=unread_count)
    )


@router.put("/{notification_id}/read", response_model=StandardResponse[NotificationResponse])
def mark_notification_as_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Mark a specific notification as read.
    """
    notification = notification_service.mark_as_read(
        db=db,
        user_id=current_user.id,
        notification_id=notification_id
    )
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found."
        )
        
    return StandardResponse(
        success=True,
        message="Notification marked as read.",
        data=NotificationResponse.from_orm(notification)
    )


@router.put("/read-all", response_model=StandardResponse[int])
def mark_all_notifications_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Mark all unread notifications for the user as read.
    """
    updated_count = notification_service.mark_all_as_read(
        db=db,
        user_id=current_user.id
    )
    
    return StandardResponse(
        success=True,
        message=f"{updated_count} notifications marked as read.",
        data=updated_count
    )
