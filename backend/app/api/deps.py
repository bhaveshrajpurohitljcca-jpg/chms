from typing import List, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import decode_access_token, TokenExpiredError, TokenInvalidError
from app.models.user import User, UserRole

security = HTTPBearer(auto_error=False)

def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Decodes the Bearer token, validates its signature and expiration,
    and returns the active User model from the database.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    try:
        payload = decode_access_token(token)
    except TokenExpiredError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except TokenInvalidError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid signature or token",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload["sub"]
    user = db.query(User).filter(User.id == user_id, User.is_deleted == False).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Ensures that the current authenticated user profile is active.
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )
    return current_user

def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Optional authentication handler. Decodes token if provided,
    but does NOT raise HTTP 401 exceptions if token is missing or expired.
    """
    if not credentials or not credentials.credentials:
        return None
    try:
        payload = decode_access_token(credentials.credentials)
        if not payload or "sub" not in payload:
            return None
        user_id = payload["sub"]
        return db.query(User).filter(User.id == user_id, User.is_deleted == False).first()
    except Exception:
        return None

ROLE_RANK = {
    UserRole.STUDENT: 1,
    UserRole.JUDGE: 2,
    UserRole.COORDINATOR: 3,
    UserRole.ADMIN: 4
}

class RoleChecker:
    """
    RBAC dependency factory that limits API access to a list of allowed roles.
    Respects role hierarchy by default.
    """
    def __init__(self, allowed_roles: List[UserRole], allow_higher: bool = True):
        self.allowed_roles = allowed_roles
        self.allow_higher = allow_higher

    def __call__(self, user: User = Depends(get_current_active_user)) -> User:
        if self.allow_higher:
            min_rank = min(ROLE_RANK.get(role, 0) for role in self.allowed_roles)
            user_rank = ROLE_RANK.get(user.role, 0)
            if user_rank >= min_rank:
                return user
        else:
            if user.role in self.allowed_roles:
                return user

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden. Insufficient permissions.",
        )

def require_roles(*allowed_roles: UserRole):
    """
    Syntactic sugar helper returning a configured RoleChecker dependency.
    """
    return RoleChecker(list(allowed_roles))
