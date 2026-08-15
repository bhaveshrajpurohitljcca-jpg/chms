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
            from sqlalchemy import text, inspect
            def _add_col(table_name, col_name, col_spec):
                try:
                    inspector = inspect(engine)
                    existing_cols = [c['name'] for c in inspector.get_columns(table_name)]
                    if col_name not in existing_cols:
                        db.execute(text(f'ALTER TABLE "{table_name}" ADD COLUMN {col_name} {col_spec};'))
                        db.commit()
                        logger.info(f"Successfully added column {col_name} to {table_name}")
                except Exception as ex:
                    db.rollback()
                    logger.warning(f"Failed adding column {col_name} to {table_name}: {ex}")

            def _fix_nullable_col(table_name, col_name, default_val="0.0"):
                try:
                    inspector = inspect(engine)
                    existing_cols = [c['name'] for c in inspector.get_columns(table_name)]
                    if col_name in existing_cols:
                        if engine.dialect.name == "postgresql":
                            db.execute(text(f'ALTER TABLE "{table_name}" ALTER COLUMN "{col_name}" DROP NOT NULL;'))
                            db.execute(text(f'ALTER TABLE "{table_name}" ALTER COLUMN "{col_name}" SET DEFAULT {default_val};'))
                        db.commit()
                        logger.info(f"Fixed nullable/default for column {col_name} in {table_name}")
                except Exception as ex:
                    db.rollback()
                    logger.warning(f"Failed altering column {col_name} in {table_name}: {ex}")

            # User columns
            _add_col("user", "github_url", "VARCHAR(255)")
            _add_col("user", "linkedin_url", "VARCHAR(255)")
            _add_col("user", "auto_accept_invites", "BOOLEAN DEFAULT FALSE")
            _add_col("user", "phone", "VARCHAR(20)")
            _add_col("user", "semester", "VARCHAR(10)")

            # Hackathon & Problem Statement columns
            _add_col("hackathon", "is_strict_team_size", "BOOLEAN DEFAULT FALSE")
            _add_col("hackathon", "strict_team_size", "INTEGER")
            _add_col("hackathon", "problem_statement_publish_at", "TIMESTAMP")
            _add_col("hackathon", "problem_selection_deadline", "TIMESTAMP")
            _add_col("hackathon", "submission_deadline", "TIMESTAMP")
            _add_col("problem_statement", "technical_deliverable", "TEXT")
            _add_col("problem_statement", "points", "INTEGER DEFAULT 100")

            # Submission columns
            _add_col("submission", "problem_statement_id", "VARCHAR(36)")
            _add_col("submission", "repo_url", "VARCHAR(500)")
            _add_col("submission", "demo_url", "VARCHAR(500)")
            _add_col("submission", "video_url", "VARCHAR(500)")
            _add_col("submission", "additional_notes", "TEXT")
            _add_col("submission", "file_url", "VARCHAR(500)")
            _add_col("submission", "file_name", "VARCHAR(255)")
            _add_col("submission", "tech_stack", "VARCHAR(500)")
            _add_col("submission", "status", "VARCHAR(50) DEFAULT 'submitted'")

            # Evaluation columns
            _add_col("evaluation", "score_technical", "FLOAT DEFAULT 0.0")
            _add_col("evaluation", "score_uiux", "FLOAT DEFAULT 0.0")
            _add_col("evaluation", "score_impact", "FLOAT DEFAULT 0.0")
            _add_col("evaluation", "strengths", "TEXT")
            _add_col("evaluation", "weaknesses", "TEXT")
            _add_col("evaluation", "suggestions", "TEXT")
            _add_col("evaluation", "recommendation", "VARCHAR(50) DEFAULT 'pending'")
            _add_col("evaluation", "is_draft", "BOOLEAN DEFAULT TRUE")
            _add_col("evaluation", "submitted_at", "TIMESTAMP")
            _fix_nullable_col("evaluation", "score_execution", "0.0")

            # Judge Assignment columns
            _add_col("judge_assignment", "hackathon_id", "VARCHAR(36)")
            _add_col("judge_assignment", "submission_id", "VARCHAR(36)")
            _add_col("judge_assignment", "judge_id", "VARCHAR(36)")
            _add_col("judge_assignment", "assigned_by_id", "VARCHAR(36)")
            _add_col("judge_assignment", "assigned_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
            logger.info("Database schema migrations verified and executed successfully.")
        except Exception as e:
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

# Force include custom domain, Vercel frontend and localhost for development
essential_origins = [
    "https://hexathon.aira-lab.in",
    "https://chms-lj.vercel.app",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000"
]
for org in essential_origins:
    if org not in origins:
        origins.append(org)

setup_exception_handlers(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if not origins else list(set(origins + ["https://hexathon.aira-lab.in", "*"])),
    allow_origin_regex=r"https?://.*",
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
