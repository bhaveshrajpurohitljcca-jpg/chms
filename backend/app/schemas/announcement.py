from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from app.models.announcement import AnnouncementType


class AnnouncementCreate(BaseModel):
    title: str
    content: str
    announcement_type: Optional[AnnouncementType] = AnnouncementType.INFO
    is_published: Optional[bool] = True
    hackathon_id: Optional[str] = None


class AnnouncementUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    announcement_type: Optional[AnnouncementType] = None
    is_published: Optional[bool] = None
    hackathon_id: Optional[str] = None


class AnnouncementResponse(BaseModel):
    id: str
    title: str
    content: str
    announcement_type: AnnouncementType
    is_published: bool
    hackathon_id: Optional[str] = None
    created_by_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
        from_attributes = True
