from fastapi import APIRouter
from app.api.v1.endpoints.auth import router as auth_endpoints_router
from app.api.v1.endpoints.users import router as users_endpoints_router

api_router = APIRouter()

# Register core Sprint 1 authentication and user profile sub-routers
api_router.include_router(auth_endpoints_router, prefix="/auth", tags=["auth"])
api_router.include_router(users_endpoints_router, prefix="/users", tags=["users"])

# Placeholder hackathons router
hackathons_router = APIRouter(prefix="/hackathons", tags=["hackathons"])

@hackathons_router.get("")
async def list_hackathons():
    return {
        "success": True,
        "message": "Hackathons list placeholder (No active hackathons)",
        "data": []
    }

# Placeholder teams router
teams_router = APIRouter(prefix="/teams", tags=["teams"])

@teams_router.get("")
async def list_teams():
    return {
        "success": True,
        "message": "Teams list placeholder (No registered teams)",
        "data": []
    }

api_router.include_router(hackathons_router)
api_router.include_router(teams_router)
