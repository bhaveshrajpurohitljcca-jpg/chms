from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate, PasswordChange
from app.services.user_service import update_profile, change_password, get_user_by_email

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Returns the authenticated user's profile details.
    """
    return current_user

@router.put("/me/profile", response_model=UserResponse)
def update_user_profile(
    update_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Updates the full name or email coordinates of the authenticated user's profile.
    """
    # If email is changing, ensure it doesn't conflict with another user
    if update_in.email is not None and update_in.email.lower().strip() != current_user.email:
        conflicting_user = get_user_by_email(db, email=update_in.email)
        if conflicting_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email address already exists in the system."
            )
            
    return update_profile(db=db, db_user=current_user, update_in=update_in)

@router.put("/me/password")
def update_user_password(
    pwd_in: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Changes the password credentials of the authenticated user.
    """
    try:
        change_password(db=db, db_user=current_user, pwd_in=pwd_in)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    return {
        "success": True,
        "message": "Password changed successfully."
    }
