import enum
import uuid
from sqlalchemy import Column, String, Enum as SQLEnum, Text, Boolean
from sqlalchemy.orm import relationship
from app.models.base import BaseTable

class UserRole(str, enum.Enum):
    STUDENT = "student"
    COORDINATOR = "coordinator"
    JUDGE = "judge"
    ADMIN = "admin"

class User(BaseTable):
    """
    SQLAlchemy model representing system users, their login credentials,
    and associated system permission roles.
    """
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.STUDENT, nullable=False)
    department = Column(String(100), nullable=True)
    college_id = Column(String(50), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    phone = Column(String(20), nullable=True)
    semester = Column(String(10), nullable=True)
    is_deleted = Column(Boolean, default=False, nullable=False)
    auto_accept_invites = Column(Boolean, default=False, nullable=False)
    github_url = Column(String(255), nullable=True)
    linkedin_url = Column(String(255), nullable=True)

    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
