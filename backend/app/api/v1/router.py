from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, hackathons, teams, submissions, registrations

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(hackathons.router)
api_router.include_router(teams.router)
api_router.include_router(submissions.router)
api_router.include_router(registrations.router)
