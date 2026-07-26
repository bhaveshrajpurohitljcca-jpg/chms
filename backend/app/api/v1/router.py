from fastapi import APIRouter, Depends, status
from app.api.deps import get_current_user_placeholder

api_router = APIRouter()

# Placeholder auth router
auth_router = APIRouter(prefix="/auth", tags=["auth"])

@auth_router.get("/status")
async def auth_status():
    return {
        "success": True,
        "message": "Auth integration status check",
        "data": {
            "auth_provider": "Supabase",
            "status": "ready"
        }
    }

# Placeholder users router
users_router = APIRouter(prefix="/users", tags=["users"])

@users_router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user_placeholder)):
    return {
        "success": True,
        "message": "User profile retrieved successfully",
        "data": current_user
    }

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

# Include all routers into v1 main router
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(hackathons_router)
api_router.include_router(teams_router)
