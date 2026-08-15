from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserRegister, UserLogin, UserResponse, TokenResponse
from app.schemas.response import StandardResponse
from app.core.security import hash_password, verify_password, password_needs_rehash, create_access_token
from app.api.deps import get_current_active_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=StandardResponse[TokenResponse])
def register_user(payload: UserRegister, db: Session = Depends(get_db)):
    clean_email = payload.email.lower().strip()
    existing_user = db.query(User).filter(func.lower(User.email) == clean_email, User.is_deleted == False).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )
    
    new_user = User(
        email=clean_email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        role=payload.role or UserRole.STUDENT,
        department=payload.department,
        college_id=payload.college_id,
        bio=payload.bio,
        phone=getattr(payload, 'phone', None),
        semester=getattr(payload, 'semester', None),
        avatar_url=getattr(payload, 'avatar_url', None),
        github_url=getattr(payload, 'github_url', None),
        linkedin_url=getattr(payload, 'linkedin_url', None),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    from app.services.notification_service import NotificationEventDispatcher
    NotificationEventDispatcher.dispatch_user_registration(db, new_user.id, new_user.full_name)

    token = create_access_token({"sub": new_user.id, "email": new_user.email, "role": new_user.role.value})
    user_resp = UserResponse.from_orm(new_user)

    return StandardResponse(
        success=True,
        message="Registration successful.",
        data=TokenResponse(access_token=token, user=user_resp)
    )

@router.post("/signup", response_model=StandardResponse[TokenResponse])
def signup_user(payload: UserRegister, db: Session = Depends(get_db)):
    """
    Alias endpoint for signup to support older client versions.
    """
    return register_user(payload, db)

@router.post("/login")
def login_user(payload: UserLogin, db: Session = Depends(get_db)):
    clean_email = payload.email.lower().strip()
    user = db.query(User).filter(func.lower(User.email) == clean_email, User.is_deleted == False).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is inactive. Please contact system administrator."
        )

    # Upgrade legacy SHA-256 credentials without forcing a password reset.
    if password_needs_rehash(user.hashed_password):
        user.hashed_password = hash_password(payload.password)
        db.commit()

    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role.value})
    user_resp = UserResponse.from_orm(user)

    from app.services.notification_service import NotificationEventDispatcher
    NotificationEventDispatcher.dispatch_login_success(db, user.id)

    # Return a unified response supporting both the StandardResponse[TokenResponse] structure
    # and the root-level keys expected by alternative contexts.
    return {
        "success": True,
        "message": "Login successful.",
        "access_token": token,
        "token_type": "bearer",
        "role": user.role.value,
        "data": {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user_resp.id,
                "email": user_resp.email,
                "full_name": user_resp.full_name,
                "role": user_resp.role.value,
                "department": user_resp.department,
                "college_id": user_resp.college_id,
                "avatar_url": user_resp.avatar_url,
                "bio": user_resp.bio,
                "is_active": user_resp.is_active,
                "created_at": user_resp.created_at.isoformat(),
                "updated_at": user_resp.updated_at.isoformat()
            }
        }
    }

@router.get("/me", response_model=StandardResponse[UserResponse])
def get_current_user_profile(current_user: User = Depends(get_current_active_user)):
    return StandardResponse(
        success=True,
        message="User profile retrieved.",
        data=UserResponse.from_orm(current_user)
    )

@router.get("/status", response_model=StandardResponse[dict])
def auth_status():
    return StandardResponse(
        success=True,
        message="Auth service active.",
        data={"status": "online", "system": "CHMS Auth v1.0"}
    )
