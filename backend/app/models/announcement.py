import enum
import uuid
from sqlalchemy import Column, String, Text, Boolean, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import BaseTable


class AnnouncementType(str, enum.Enum):
    INFO = "info"
    WARNING = "warning"
    SUCCESS = "success"
    URGENT = "urgent"


class Announcement(BaseTable):
    """
    Coordinator-published announcements.
    Optionally scoped to a specific hackathon; if hackathon_id is None,
    the announcement is platform-wide and visible to all students.
    """
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    announcement_type = Column(
        SQLEnum(AnnouncementType),
        default=AnnouncementType.INFO,
        nullable=False
    )
    is_published = Column(Boolean, default=True, nullable=False)
    hackathon_id = Column(
        String(36),
        ForeignKey("hackathon.id", ondelete="CASCADE"),
        nullable=True
    )
    created_by_id = Column(
        String(36),
        ForeignKey("user.id", ondelete="SET NULL"),
        nullable=True
    )
    # all_platform_users | all_users | team:<team_id> | user:<user_id>
    target = Column(String(255), nullable=True)

    hackathon = relationship("Hackathon", back_populates="announcements")
    created_by = relationship("User", foreign_keys=[created_by_id])
