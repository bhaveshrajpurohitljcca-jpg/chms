import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from app.config import settings
from app.database import engine, SessionLocal
from app.models.base import Base
from app.api.v1.router import api_router
from app.middleware.exception_handler import setup_exception_handlers

# Import all models to register them with Base.metadata
from app.models.user import User, UserRole
from app.models.hackathon import Hackathon, ProblemStatement, CoordinatorAssignment
from app.models.team import Team, TeamMember
from app.models.registration import Registration
from app.models.submission import Submission, JudgeAssignment, Evaluation
from app.models.invitation import TeamInvitation
from app.models.notification import Notification
from app.models.announcement import Announcement
from app.models.certificate import Certificate, CertificateTemplate

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("chms.main")

def _run_idempotent_migrations():
    """Ensure all required tables and columns exist across SQLite and PostgreSQL."""
    try:
        # Create any missing tables (e.g. certificate_template, certificate)
        Base.metadata.create_all(bind=engine)
        
        db = SessionLocal()
        try:
            is_sqlite = engine.url.drivername.startswith("sqlite")
            
            # Columns to verify and add non-destructively
            columns_to_ensure = [
                ("hackathon", "problem_statement_publish_at", "TIMESTAMP"),
                ("hackathon", "problem_selection_deadline", "TIMESTAMP"),
                ("hackathon", "submission_deadline", "TIMESTAMP"),
                ("hackathon", "is_strict_team_size", "BOOLEAN DEFAULT FALSE"),
                ("hackathon", "strict_team_size", "INTEGER"),
                ("hackathon", "evaluation_mode", "VARCHAR(20) DEFAULT 'single_round'"),
                ("hackathon", "finalists_per_problem", "INTEGER DEFAULT 3"),
                ("hackathon", "winners_per_problem", "INTEGER DEFAULT 1"),
                ("hackathon", "current_evaluation_round", "INTEGER DEFAULT 1"),
                ("hackathon", "announce_ps_advance", "BOOLEAN DEFAULT TRUE"),
                ("problem_statement", "technical_deliverable", "TEXT"),
                ("problem_statement", "points", "INTEGER DEFAULT 100"),
                ("submission", "tech_stack", "VARCHAR(500)"),
                ("submission", "is_finalist", "BOOLEAN DEFAULT FALSE"),
                ("submission", "round_one_score", "FLOAT"),
                ("submission", "final_rank", "INTEGER"),
                ("evaluation", "round_number", "INTEGER DEFAULT 1"),
                ("announcement", "target", "VARCHAR(255)"),
            ]
            
            for table, col, col_type in columns_to_ensure:
                try:
                    if is_sqlite:
                        cols = [row[1] for row in db.execute(text(f"PRAGMA table_info({table})")).fetchall()]
                        if col not in cols:
                            db.execute(text(f"ALTER TABLE {table} ADD COLUMN {col} {col_type}"))
                            db.commit()
                            logger.info(f"Added column {table}.{col}")
                    else:
                        db.execute(text(f'ALTER TABLE "{table}" ADD COLUMN IF NOT EXISTS {col} {col_type}'))
                        db.commit()
                except Exception as col_err:
                    db.rollback()
                    logger.warning(f"Column check for {table}.{col}: {col_err}")

            # Reactivate coordinator and judge accounts if deactivated by legacy assignment bug
            try:
                if is_sqlite:
                    db.execute(text("UPDATE user SET is_active = 1 WHERE role IN ('coordinator', 'judge') AND is_deleted = 0"))
                else:
                    db.execute(text("UPDATE \"user\" SET is_active = TRUE WHERE role IN ('coordinator', 'judge') AND is_deleted = FALSE"))
                db.commit()
            except Exception as act_err:
                db.rollback()
                logger.warning(f"Reactivation query notice: {act_err}")
                
        finally:
            db.close()
    except Exception as e:
        logger.error(f"Startup migration warning: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure uploads and static directories exist
    os.makedirs("uploads", exist_ok=True)
    os.makedirs("static", exist_ok=True)
    logger.info("Uploads and static directories verified.")
    
    # Run self-healing schema synchronization
    _run_idempotent_migrations()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API foundation for College Hackathon Management System (CHMS)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

origins = []
if isinstance(settings.CORS_ORIGINS, list):
    origins = [str(o) for o in settings.CORS_ORIGINS]
elif isinstance(settings.CORS_ORIGINS, str):
    origins = [o.strip() for o in settings.CORS_ORIGINS.split(",")]
else:
    origins = [settings.CORS_ORIGINS]

origins = [origin for origin in origins if origin and origin != "*"]

# Production frontends & development origins
trusted_origins = [
    "https://hexathon.aira-lab.in",
    "https://chms-lj.vercel.app",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000"
]
for trusted_origin in trusted_origins:
    if trusted_origin not in origins:
        origins.append(trusted_origin)

setup_exception_handlers(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(dict.fromkeys(origins)),
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/", tags=["health"])
def health_check():
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "version": "1.0.0"
    }
