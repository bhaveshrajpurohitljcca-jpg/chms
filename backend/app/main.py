import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.api.v1.router import api_router
from app.middleware.exception_handler import setup_exception_handlers
from app.database import engine, SessionLocal

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("chms.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure uploads directory exists
    os.makedirs("uploads", exist_ok=True)
    os.makedirs("static", exist_ok=True)
    logger.info("Uploads and static directories verified.")
    # Initialize DB schemas & run safe migrations
    logger.info("Initializing database schemas...")
    try:
        from app.models.base import Base
        import app.models  # Ensure all models are imported so create_all works
        Base.metadata.create_all(bind=engine)
        
        db = SessionLocal()
        try:
            from sqlalchemy import text
            db.execute(text('ALTER TABLE "user" ADD COLUMN IF NOT EXISTS github_url VARCHAR(255);'))
            db.execute(text('ALTER TABLE "user" ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255);'))
            db.execute(text('ALTER TABLE "user" ADD COLUMN IF NOT EXISTS auto_accept_invites BOOLEAN DEFAULT FALSE;'))
            db.execute(text('ALTER TABLE "user" ADD COLUMN IF NOT EXISTS phone VARCHAR(20);'))
            db.execute(text('ALTER TABLE "user" ADD COLUMN IF NOT EXISTS semester VARCHAR(10);'))
            db.execute(text('ALTER TABLE "hackathon" ADD COLUMN IF NOT EXISTS is_strict_team_size BOOLEAN DEFAULT FALSE;'))
            db.execute(text('ALTER TABLE "hackathon" ADD COLUMN IF NOT EXISTS strict_team_size INTEGER;'))
            db.execute(text('ALTER TABLE "submission" ADD COLUMN IF NOT EXISTS problem_statement_id VARCHAR(36);'))
            db.execute(text('ALTER TABLE "submission" ADD COLUMN IF NOT EXISTS repo_url VARCHAR(500);'))
            db.execute(text('ALTER TABLE "submission" ADD COLUMN IF NOT EXISTS demo_url VARCHAR(500);'))
            db.execute(text('ALTER TABLE "submission" ADD COLUMN IF NOT EXISTS video_url VARCHAR(500);'))
            db.execute(text('ALTER TABLE "submission" ADD COLUMN IF NOT EXISTS additional_notes TEXT;'))
            db.execute(text('ALTER TABLE "submission" ADD COLUMN IF NOT EXISTS file_url VARCHAR(500);'))
            db.execute(text('ALTER TABLE "submission" ADD COLUMN IF NOT EXISTS file_name VARCHAR(255);'))
            db.execute(text('ALTER TABLE "submission" ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT \'submitted\';'))

            # Migration for evaluation table columns
            db.execute(text('ALTER TABLE "evaluation" ADD COLUMN IF NOT EXISTS score_technical FLOAT DEFAULT 0.0;'))
            db.execute(text('ALTER TABLE "evaluation" ADD COLUMN IF NOT EXISTS score_uiux FLOAT DEFAULT 0.0;'))
            db.execute(text('ALTER TABLE "evaluation" ADD COLUMN IF NOT EXISTS score_impact FLOAT DEFAULT 0.0;'))
            db.execute(text('ALTER TABLE "evaluation" ADD COLUMN IF NOT EXISTS strengths TEXT;'))
            db.execute(text('ALTER TABLE "evaluation" ADD COLUMN IF NOT EXISTS weaknesses TEXT;'))
            db.execute(text('ALTER TABLE "evaluation" ADD COLUMN IF NOT EXISTS suggestions TEXT;'))
            db.execute(text('ALTER TABLE "evaluation" ADD COLUMN IF NOT EXISTS recommendation VARCHAR(50) DEFAULT \'pending\';'))
            db.execute(text('ALTER TABLE "evaluation" ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT TRUE;'))
            db.execute(text('ALTER TABLE "evaluation" ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP;'))

            # Migration for judge_assignment table columns
            db.execute(text('ALTER TABLE "judge_assignment" ADD COLUMN IF NOT EXISTS hackathon_id VARCHAR(36);'))
            db.execute(text('ALTER TABLE "judge_assignment" ADD COLUMN IF NOT EXISTS submission_id VARCHAR(36);'))
            db.execute(text('ALTER TABLE "judge_assignment" ADD COLUMN IF NOT EXISTS judge_id VARCHAR(36);'))
            db.execute(text('ALTER TABLE "judge_assignment" ADD COLUMN IF NOT EXISTS assigned_by_id VARCHAR(36);'))
            db.commit()
            logger.info("Database schema migrations verified and executed successfully.")
        except Exception as e:
            db.rollback()
            logger.error(f"Migration error (non-fatal): {e}")
        finally:
            db.close()
    except Exception as e:
        logger.error(f"Error during database startup initialization: {e}")
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

# Force include Vercel frontend and localhost for development
essential_origins = ["https://chms-lj.vercel.app", "http://localhost:5173", "http://localhost:5174", "http://localhost:3000"]
for org in essential_origins:
    if org not in origins:
        origins.append(org)

setup_exception_handlers(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

from fastapi.staticfiles import StaticFiles
import os

os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/", tags=["health"])
async def root_health_check():
    return {
        "success": True,
        "message": f"Welcome to {settings.PROJECT_NAME} API.",
        "data": {
            "environment": settings.ENVIRONMENT,
            "version": "1.0.0"
        }
    }
