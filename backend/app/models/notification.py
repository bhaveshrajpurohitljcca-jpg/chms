import enum
import uuid
from sqlalchemy import Column, String, Enum as SQLEnum, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from app.models.base import BaseTable


class NotificationType(str, enum.Enum):
    USER_REGISTRATION = "user_registration"
    LOGIN_SUCCESS = "login_success"
    PROFILE_UPDATED = "profile_updated"
    PASSWORD_CHANGED = "password_changed"
    UNAUTHORIZED_ACCESS = "unauthorized_access"
    HACKATHON_EVENT = "hackathon_event"
    SUBMISSION_EVENT = "submission_event"
    RESULT_PUBLICATION = "result_publication"
    ANNOUNCEMENT = "announcement"


class Notification(BaseTable):
    """
    Represents a system alert or message targeted at a specific user.
    """
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    type = Column(SQLEnum(NotificationType), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)

    user = relationship("User", back_populates="notifications")
