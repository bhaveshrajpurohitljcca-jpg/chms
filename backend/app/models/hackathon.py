import enum
import uuid
from sqlalchemy import Column, String, Text, DateTime, Integer, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import BaseTable

class HackathonStatus(str, enum.Enum):
    DRAFT = "draft"
    UPCOMING = "upcoming"
    ACTIVE = "active"
    ENDED = "ended"

class ProblemCategory(str, enum.Enum):
    WEB = "Web Development"
    AI_ML = "AI / Machine Learning"
    MOBILE = "Mobile App Development"
    BLOCKCHAIN = "Web3 & Blockchain"
    OPEN_INNOVATION = "Open Innovation"

class Hackathon(BaseTable):
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    tagline = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    registration_deadline = Column(DateTime, nullable=True)
    max_team_size = Column(Integer, default=4, nullable=False)
    min_team_size = Column(Integer, default=1, nullable=False)
    status = Column(SQLEnum(HackathonStatus), default=HackathonStatus.UPCOMING, nullable=False)
    banner_url = Column(String(500), nullable=True)

    problem_statements = relationship("ProblemStatement", back_populates="hackathon", cascade="all, delete-orphan")
    teams = relationship("Team", back_populates="hackathon", cascade="all, delete-orphan")
    registrations = relationship("Registration", back_populates="hackathon", cascade="all, delete-orphan")

class ProblemStatement(BaseTable):
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hackathon_id = Column(String(36), ForeignKey("hackathon.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(SQLEnum(ProblemCategory), default=ProblemCategory.OPEN_INNOVATION, nullable=False)
    difficulty = Column(String(50), default="Medium", nullable=False)
    max_teams = Column(Integer, default=10, nullable=False)

    hackathon = relationship("Hackathon", back_populates="problem_statements")
    submissions = relationship("Submission", back_populates="problem_statement")
    registrations = relationship("Registration", back_populates="problem_statement")
