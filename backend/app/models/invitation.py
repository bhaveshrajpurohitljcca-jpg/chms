import enum
import uuid
from sqlalchemy import Column, String, Enum as SQLEnum, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.models.base import BaseTable


class InvitationStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"


class TeamInvitation(BaseTable):
    """
    Represents a team leader's invitation for a student (by email) to join their team.
    The invitee is looked up by email at acceptance time.
    """
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    team_id = Column(String(36), ForeignKey("team.id", ondelete="CASCADE"), nullable=False)
    invited_by_id = Column(String(36), ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    invitee_email = Column(String(255), nullable=False)
    status = Column(SQLEnum(InvitationStatus), default=InvitationStatus.PENDING, nullable=False)

    team = relationship("Team", back_populates="invitations")
    invited_by = relationship("User", foreign_keys=[invited_by_id])

    __table_args__ = (
        # Prevent duplicate pending invitations for the same team+email
        UniqueConstraint("team_id", "invitee_email", name="unique_team_invitation_email"),
    )
