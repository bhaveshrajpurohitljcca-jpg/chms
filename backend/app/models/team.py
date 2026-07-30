import enum
import uuid
import secrets
from sqlalchemy import Column, String, Enum as SQLEnum, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.models.base import BaseTable

class TeamStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class MemberRole(str, enum.Enum):
    LEADER = "leader"
    MEMBER = "member"

class Team(BaseTable):
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hackathon_id = Column(String(36), ForeignKey("hackathon.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    join_code = Column(String(20), unique=True, index=True, default=lambda: secrets.token_hex(4).upper())
    leader_id = Column(String(36), ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    status = Column(SQLEnum(TeamStatus), default=TeamStatus.APPROVED, nullable=False)

    hackathon = relationship("Hackathon", back_populates="teams")
    leader = relationship("User", foreign_keys=[leader_id])
    members = relationship("TeamMember", back_populates="team", cascade="all, delete-orphan")
    submissions = relationship("Submission", back_populates="team", cascade="all, delete-orphan")
    invitations = relationship("TeamInvitation", back_populates="team", cascade="all, delete-orphan")
    registrations = relationship("Registration", back_populates="team", cascade="all, delete-orphan")

    @property
    def problem_statement_id(self):
        if self.registrations and len(self.registrations) > 0:
            return self.registrations[0].problem_statement_id
        return None


class TeamMember(BaseTable):
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    team_id = Column(String(36), ForeignKey("team.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    role_in_team = Column(SQLEnum(MemberRole), default=MemberRole.MEMBER, nullable=False)

    team = relationship("Team", back_populates="members")
    user = relationship("User")

    __table_args__ = (
        UniqueConstraint("team_id", "user_id", name="unique_team_user_member"),
    )
