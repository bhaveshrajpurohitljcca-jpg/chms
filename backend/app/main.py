import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.v1.router import api_router
from app.middleware.exception_handler import setup_exception_handlers

# Configure basic logging formatting
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("chms.main")

# Initialize FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API foundation for College Hackathon Management System (CHMS)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Set up CORS middleware
origins = []
if isinstance(settings.CORS_ORIGINS, list):
    origins = [str(o) for o in settings.CORS_ORIGINS]
else:
    origins = [settings.CORS_ORIGINS]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set up global exception handlers
setup_exception_handlers(app)

# Register central routers
app.include_router(api_router, prefix="/api/v1")

@app.get("/", tags=["health"])
async def root_health_check():
    return {
        "success": True,
        "message": f"Welcome to {settings.PROJECT_NAME} API. Foundation is healthy.",
        "data": {
            "environment": settings.ENVIRONMENT,
            "version": "1.0.0"
        }
    }
