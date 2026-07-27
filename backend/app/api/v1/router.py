from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, hackathons, teams, submissions, registrations, evaluations

api_router = APIRouter()

# Register core routers including auth, users, hackathons, teams, submissions and evaluations
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(hackathons.router)
api_router.include_router(teams.router)
api_router.include_router(submissions.router)
api_router.include_router(registrations.router)
api_router.include_router(evaluations.router)
