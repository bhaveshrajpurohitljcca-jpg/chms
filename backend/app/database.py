from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings
from app.models.base import Base

# Determine engine parameters based on database URL
engine_kwargs = {}
if settings.DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}

# Create SQLAlchemy engine
engine = create_engine(settings.DATABASE_URL, **engine_kwargs)

# SessionLocal class for instantiating database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Database Dependency Injection
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
