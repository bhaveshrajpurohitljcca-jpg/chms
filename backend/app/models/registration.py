import enum
import uuid
from sqlalchemy import Column, String, Enum as SQLEnum, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.models.base import BaseTable


class RegistrationStatus(str, enum.Enum):
    REGISTERED = "registered"
    CANCELLED = "cancelled"


class Registration(BaseTable):
    """
    Represents a team's registration for a specific hackathon and problem statement.
    This is separate from Submission (which holds the actual project submission files).
    A team can only register once per hackathon.
    """
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    team_id = Column(String(36), ForeignKey("team.id", ondelete="CASCADE"), nullable=False)
    hackathon_id = Column(String(36), ForeignKey("hackathon.id", ondelete="CASCADE"), nullable=False)
    problem_statement_id = Column(
        String(36), ForeignKey("problem_statement.id", ondelete="SET NULL"), nullable=True
    )
    registered_by_id = Column(String(36), ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    status = Column(SQLEnum(RegistrationStatus), default=RegistrationStatus.REGISTERED, nullable=False)

    team = relationship("Team", back_populates="registrations")
    hackathon = relationship("Hackathon", back_populates="registrations")
    problem_statement = relationship("ProblemStatement", back_populates="registrations")
    registered_by = relationship("User", foreign_keys=[registered_by_id])

    __table_args__ = (
        # One registration per team per hackathon
        UniqueConstraint("team_id", "hackathon_id", name="unique_team_hackathon_registration"),
    )
