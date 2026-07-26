from datetime import datetime
from sqlalchemy import Column, DateTime
from sqlalchemy.orm import declarative_base, declared_attr

# Scoped declarative base
Base = declarative_base()

class BaseTable(Base):
    """
    Abstract base table model to add common columns like created_at and updated_at,
    and auto-generate table names.
    """
    __abstract__ = True

    @declared_attr
    def __tablename__(cls) -> str:
        # Convert CamelCase class name to snake_case table name
        import re
        name = cls.__name__
        return re.sub(r'(?<!^)(?=[A-Z])', '_', name).lower()

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
