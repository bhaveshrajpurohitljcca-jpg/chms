from datetime import datetime
from pydantic import BaseModel
from app.models.notification import NotificationType


class NotificationBase(BaseModel):
    type: NotificationType
    title: str
    message: str


class NotificationResponse(NotificationBase):
    id: str
    user_id: str
    is_read: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class NotificationListResponse(BaseModel):
    notifications: list[NotificationResponse]
    total: int
    unread_count: int


class UnreadCountResponse(BaseModel):
    unread_count: int
