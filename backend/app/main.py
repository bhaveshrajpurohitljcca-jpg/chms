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
from app.core.seed import seed_database

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
    logger.info("Uploads directory verified.")
    # Initialize DB & Seed Data
    logger.info("Initializing database schemas and checking seed data...")
    db = SessionLocal()
    try:
        seed_database(db, engine)
    except Exception as e:
        logger.error(f"Error seeding database: {e}")
    finally:
        db.close()
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

setup_exception_handlers(app)

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
