from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, hackathons, teams, submissions, registrations, notifications, assignments, evaluations, announcements

api_router = APIRouter()

# Register core routers including auth, users, hackathons, teams, submissions, and notifications
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(hackathons.router)
api_router.include_router(teams.router)
api_router.include_router(submissions.router)
api_router.include_router(registrations.router)
api_router.include_router(notifications.router)
api_router.include_router(assignments.router)
api_router.include_router(evaluations.router)
api_router.include_router(announcements.router)

