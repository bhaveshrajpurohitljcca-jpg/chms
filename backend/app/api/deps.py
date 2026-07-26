from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings

# HTTPBearer security scheme for token authentication
security = HTTPBearer()

def get_current_user_placeholder(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Placeholder authorization dependency verifying Supabase JWTs.
    In feature sprints, this will verify token signatures using JWT_SECRET.
    """
    token = credentials.credentials
    # Mock decoding behavior for baseline
    if not token or len(token) < 5:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Return mock user metadata payload
    return {
        "id": "mock-uuid-user",
        "email": "student@college.edu",
        "role": "student"
    }

def get_current_active_user(user: dict = Depends(get_current_user_placeholder)) -> dict:
    """
    Ensures user is active. Placed here as a stub.
    """
    return user
