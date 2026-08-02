from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models.user import User, UserRole
from app.models.team import Team, TeamMember
from app.models.notification import NotificationType
from app.models.hackathon import CoordinatorAssignment
from app.api.deps import get_current_active_user
from app.schemas.response import StandardResponse
from app.schemas.notification import (
    NotificationResponse,
    NotificationListResponse,
    UnreadCountResponse
)
from app.services.notification_service import notification_service

router = APIRouter(prefix="/notifications", tags=["Notifications"])


# ─── Announcement Schema ───
class AnnouncementCreate(BaseModel):
    hackathon_id: Optional[str] = None
    title: str
    message: str
    target: str  # "all_platform_users" | "all_users" | "team_leaders" | team_id (UUID)


@router.post("/announce", response_model=StandardResponse[int])
def send_announcement(
    payload: AnnouncementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Send an announcement notification.
    Target options:
    - "all_platform_users": all active users in the system (requires admin/coordinator)
    - "all_users": all team members registered in the hackathon (requires hackathon_id)
    - "team_leaders": only team leaders in the hackathon (requires hackathon_id)
    - "<team_id>": all members of a specific team (requires hackathon_id)
    """
    # Authorization check
    if payload.target != "all_platform_users" and payload.hackathon_id:
        if current_user.role == UserRole.COORDINATOR:
            assigned = db.query(CoordinatorAssignment).filter(
                CoordinatorAssignment.coordinator_id == current_user.id,
                CoordinatorAssignment.hackathon_id == payload.hackathon_id
            ).first()
            if not assigned:
                raise HTTPException(status_code=403, detail="You are not assigned to this hackathon.")
        elif current_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=403, detail="Only coordinators and admins can send announcements.")
    else:
        # Platform-wide announcement
        if current_user.role not in [UserRole.ADMIN, UserRole.COORDINATOR]:
            raise HTTPException(status_code=403, detail="Only coordinators and admins can send platform-wide announcements.")

    # Resolve target user IDs
    target_user_ids: list[str] = []

    if payload.target == "all_platform_users":
        # All active users on the platform
        active_users = db.query(User).filter(User.is_active == True).all()
        target_user_ids = [u.id for u in active_users]
    else:
        if not payload.hackathon_id:
            raise HTTPException(status_code=400, detail="hackathon_id is required for this target type.")
        
        # Get all teams in this hackathon
        hackathon_teams = db.query(Team).filter(Team.hackathon_id == payload.hackathon_id).all()
        hackathon_team_ids = [t.id for t in hackathon_teams]

        if payload.target == "all_users":
            # All members of all teams in this hackathon
            members = db.query(TeamMember).filter(TeamMember.team_id.in_(hackathon_team_ids)).all()
            target_user_ids = list(set(m.user_id for m in members))
        elif payload.target == "team_leaders":
            # Only leaders
            members = db.query(TeamMember).filter(
                TeamMember.team_id.in_(hackathon_team_ids),
                TeamMember.role_in_team == "leader"
            ).all()
            target_user_ids = list(set(m.user_id for m in members))
        else:
            # Specific team ID
            team = db.query(Team).filter(Team.id == payload.target, Team.hackathon_id == payload.hackathon_id).first()
            if not team:
                raise HTTPException(status_code=404, detail="Team not found in this hackathon.")
            members = db.query(TeamMember).filter(TeamMember.team_id == team.id).all()
            target_user_ids = [m.user_id for m in members]

    if not target_user_ids:
        raise HTTPException(status_code=400, detail="No recipients found for this announcement target.")

    # Create notifications for each user
    count = 0
    for uid in target_user_ids:
        notification_service.create_notification(
            db=db,
            user_id=uid,
            type=NotificationType.ANNOUNCEMENT,
            title=payload.title,
            message=payload.message
        )
        count += 1

    return StandardResponse(
        success=True,
        message=f"Announcement sent to {count} user(s).",
        data=count
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
    
    # Map SQLAlchemy models to Pydantic responses
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
