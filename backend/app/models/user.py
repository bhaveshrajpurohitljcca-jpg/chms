from sqlalchemy import Column, Integer, String, Boolean
from app.models.base import BaseTable

class User(BaseTable):
    """
    SQLAlchemy model representing system users, their login credentials,
    and associated system permission roles.
    """
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    role = Column(String(50), default="Student", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
