# Expose all SQLAlchemy models for Alembic autodiscovery
from app.models.base import Base, BaseTable
from app.models.user import User

__all__ = ["Base", "BaseTable", "User"]
