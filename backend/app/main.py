import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.api.v1.router import api_router
from app.middleware.exception_handler import setup_exception_handlers

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

# CORS must be explicitly configured per environment. Never allow wildcard origins
# when bearer tokens or cookies can be sent by browsers.
origins = [origin for origin in origins if origin and origin != "*"]

# Production frontends owned by this application. Environment values can add
# further approved domains, but cannot accidentally remove the live website.
for trusted_origin in ("https://hexathon.aira-lab.in", "https://chms-lj.vercel.app"):
    if trusted_origin not in origins:
        origins.append(trusted_origin)

setup_exception_handlers(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(dict.fromkeys(origins)),
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
