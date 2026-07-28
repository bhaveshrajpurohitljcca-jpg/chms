from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.announcement import Announcement, AnnouncementType
from app.models.hackathon import Hackathon
from app.models.user import User, UserRole
from app.schemas.announcement import AnnouncementCreate, AnnouncementUpdate, AnnouncementResponse
from app.schemas.response import StandardResponse
from app.api.deps import get_current_active_user, RoleChecker

router = APIRouter(prefix="/announcements", tags=["Announcements"])


@router.get("", response_model=StandardResponse[List[AnnouncementResponse]])
def list_announcements(
    hackathon_id: Optional[str] = None,
    published_only: bool = True,
    db: Session = Depends(get_db)
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
        # Return announcements for this hackathon + platform-wide announcements
        query = query.filter(
            (Announcement.hackathon_id == hackathon_id) |
            (Announcement.hackathon_id == None)
        )

    announcements = query.order_by(Announcement.created_at.desc()).all()
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
    """Create a new announcement. Coordinator/Admin only."""
    if payload.hackathon_id:
        hackathon = db.query(Hackathon).filter(Hackathon.id == payload.hackathon_id).first()
        if not hackathon:
            raise HTTPException(status_code=404, detail="Hackathon not found.")

    announcement = Announcement(
        title=payload.title,
        content=payload.content,
        announcement_type=payload.announcement_type or AnnouncementType.INFO,
        is_published=payload.is_published if payload.is_published is not None else True,
        hackathon_id=payload.hackathon_id,
        created_by_id=current_user.id
    )
    db.add(announcement)
    db.commit()
    db.refresh(announcement)

    return StandardResponse(
        success=True,
        message="Announcement created successfully.",
        data=AnnouncementResponse.from_orm(announcement)
    )


@router.get("/{announcement_id}", response_model=StandardResponse[AnnouncementResponse])
def get_announcement(announcement_id: str, db: Session = Depends(get_db)):
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not announcement:
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

    if payload.hackathon_id:
        hackathon = db.query(Hackathon).filter(Hackathon.id == payload.hackathon_id).first()
        if not hackathon:
            raise HTTPException(status_code=404, detail="Hackathon not found.")

    update_data = payload.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(announcement, field, value)

    db.commit()
    db.refresh(announcement)

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

    db.delete(announcement)
    db.commit()

    return StandardResponse(
        success=True,
        message="Announcement removed successfully.",
        data={"deleted": True}
    )
