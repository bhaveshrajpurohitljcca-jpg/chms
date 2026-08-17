from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.announcement import Announcement, AnnouncementType
from app.models.hackathon import Hackathon, CoordinatorAssignment
from app.models.user import User, UserRole
from app.schemas.announcement import AnnouncementCreate, AnnouncementUpdate, AnnouncementResponse
from app.schemas.response import StandardResponse
from app.api.deps import get_current_active_user, RoleChecker
from app.models.team import TeamMember, Team
from app.services.announcement_service import dispatch_announcement

router = APIRouter(prefix="/announcements", tags=["Announcements"])

def _visible_to_user(db: Session, announcement: Announcement, user: User) -> bool:
    if user.role in (UserRole.ADMIN, UserRole.COORDINATOR):
        return True
    target = announcement.target or ("all_users" if announcement.hackathon_id else "all_platform_users")
    if target == "all_platform_users":
        return True
    if target == "all_users":
        return bool(announcement.hackathon_id and db.query(TeamMember).join(Team).filter(TeamMember.user_id == user.id, Team.hackathon_id == announcement.hackathon_id).first())
    if target.startswith("user:"):
        return target.split(":", 1)[1] == user.id
    if target.startswith("user_email:"):
        return target.split(":", 1)[1].strip().lower() == user.email.lower()
    team_id = target.split(":", 1)[1] if target.startswith("team:") else target
    team = db.query(Team).filter(Team.id == team_id, Team.hackathon_id == announcement.hackathon_id).first()
    return bool(team and db.query(TeamMember).filter(TeamMember.team_id == team.id, TeamMember.user_id == user.id).first())

def _assert_can_manage(db: Session, announcement: Announcement, user: User) -> None:
    if user.role == UserRole.ADMIN or announcement.created_by_id == user.id:
        return
    if announcement.hackathon_id and db.query(CoordinatorAssignment).filter(CoordinatorAssignment.coordinator_id == user.id, CoordinatorAssignment.hackathon_id == announcement.hackathon_id).first():
        return
    raise HTTPException(status_code=403, detail="You are not allowed to manage this announcement.")


@router.get("", response_model=StandardResponse[List[AnnouncementResponse]])
def list_announcements(
    hackathon_id: Optional[str] = None,
    published_only: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    List announcements. Students can call this endpoint to see published announcements.
    - hackathon_id: filter by hackathon (returns hackathon-scoped + platform-wide)
    - published_only: set to false (coordinator only) to see unpublished
    """
    query = db.query(Announcement)

    if published_only:
        query = query.filter(Announcement.is_published == True)

    if hackathon_id:
        query = query.filter(
            (Announcement.hackathon_id == hackathon_id) |
            (Announcement.hackathon_id == None)
        )

    announcements = [a for a in query.order_by(Announcement.created_at.desc()).all() if _visible_to_user(db, a, current_user)]
    results = [AnnouncementResponse.from_orm(a) for a in announcements]

    return StandardResponse(
        success=True,
        message="Announcements retrieved successfully.",
        data=results
    )


@router.post("", response_model=StandardResponse[AnnouncementResponse])
def create_announcement(
    payload: AnnouncementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.ADMIN, UserRole.COORDINATOR]))
):
    """Create a new announcement. Coordinator/Admin only. Sends emails when published."""
    if payload.hackathon_id:
        hackathon = db.query(Hackathon).filter(Hackathon.id == payload.hackathon_id).first()
        if not hackathon:
            raise HTTPException(status_code=404, detail="Hackathon not found.")

    effective_target = payload.target or ("all_users" if payload.hackathon_id else "all_platform_users")
    from app.services.announcement_service import assert_can_send_announcement
    assert_can_send_announcement(db, current_user, effective_target, payload.hackathon_id)

    announcement = Announcement(
        title=payload.title,
        content=payload.content,
        announcement_type=payload.announcement_type or AnnouncementType.INFO,
        is_published=payload.is_published if payload.is_published is not None else True,
        hackathon_id=payload.hackathon_id,
        created_by_id=current_user.id,
        target=effective_target
    )
    db.add(announcement)
    db.commit()
    db.refresh(announcement)

    if announcement.is_published:
        target = announcement.target or ("all_users" if payload.hackathon_id else "all_platform_users")
        dispatch_announcement(
            db=db,
            title=payload.title,
            message=payload.content,
            target=target,
            sender=current_user,
            hackathon_id=payload.hackathon_id,
            send_emails=True,
        )

    return StandardResponse(
        success=True,
        message="Announcement created successfully.",
        data=AnnouncementResponse.from_orm(announcement)
    )


@router.get("/{announcement_id}", response_model=StandardResponse[AnnouncementResponse])
def get_announcement(announcement_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found.")
    if not announcement.is_published and current_user.role not in (UserRole.ADMIN, UserRole.COORDINATOR):
        raise HTTPException(status_code=404, detail="Announcement not found.")
    if current_user.role not in (UserRole.ADMIN, UserRole.COORDINATOR) and not _visible_to_user(db, announcement, current_user):
        raise HTTPException(status_code=404, detail="Announcement not found.")
    return StandardResponse(
        success=True,
        message="Announcement retrieved.",
        data=AnnouncementResponse.from_orm(announcement)
    )


@router.put("/{announcement_id}", response_model=StandardResponse[AnnouncementResponse])
def update_announcement(
    announcement_id: str,
    payload: AnnouncementUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.ADMIN, UserRole.COORDINATOR]))
):
    """Update an announcement. Coordinator/Admin only."""
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found.")
    _assert_can_manage(db, announcement, current_user)

    if payload.hackathon_id:
        hackathon = db.query(Hackathon).filter(Hackathon.id == payload.hackathon_id).first()
        if not hackathon:
            raise HTTPException(status_code=404, detail="Hackathon not found.")

    if payload.target is not None:
        from app.services.announcement_service import assert_can_send_announcement
        assert_can_send_announcement(db, current_user, payload.target, payload.hackathon_id or announcement.hackathon_id)

    was_published = announcement.is_published
    update_data = payload.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(announcement, field, value)

    db.commit()
    db.refresh(announcement)

    if announcement.is_published and not was_published:
        target = announcement.target or ("all_users" if announcement.hackathon_id else "all_platform_users")
        from app.services.announcement_service import assert_can_send_announcement
        assert_can_send_announcement(db, current_user, target, announcement.hackathon_id)
        dispatch_announcement(
            db=db,
            title=announcement.title,
            message=announcement.content,
            target=target,
            sender=current_user,
            hackathon_id=announcement.hackathon_id,
            send_emails=True,
        )

    return StandardResponse(
        success=True,
        message="Announcement updated successfully.",
        data=AnnouncementResponse.from_orm(announcement)
    )


@router.delete("/{announcement_id}", response_model=StandardResponse[dict])
def delete_announcement(
    announcement_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.ADMIN, UserRole.COORDINATOR]))
):
    """Delete an announcement. Coordinator/Admin only."""
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found.")
    _assert_can_manage(db, announcement, current_user)

    db.delete(announcement)
    db.commit()

    return StandardResponse(
        success=True,
        message="Announcement removed successfully.",
        data={"deleted": True}
    )
