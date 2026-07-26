from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserResponse, UserProfileUpdate, UserRoleUpdate, PasswordChange
from app.schemas.response import StandardResponse
from app.api.deps import get_current_active_user, RoleChecker
from app.core.security import verify_password, hash_password

router = APIRouter(prefix="/users", tags=["Users & Profiles"])

@router.put("/profile", response_model=StandardResponse[UserResponse])
def update_profile(
    payload: UserProfileUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Updates the active authenticated user profile details.
    """
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
    if payload.department is not None:
        current_user.department = payload.department
    if payload.college_id is not None:
        current_user.college_id = payload.college_id
    if payload.avatar_url is not None:
        current_user.avatar_url = payload.avatar_url
    if payload.bio is not None:
        current_user.bio = payload.bio

    db.commit()
    db.refresh(current_user)

    return StandardResponse(
        success=True,
        message="Profile updated successfully.",
        data=UserResponse.from_orm(current_user)
    )

@router.get("", response_model=StandardResponse[List[UserResponse]])
def list_users(
    db: Session = Depends(get_db),
    admin_user: User = Depends(RoleChecker([UserRole.ADMIN, UserRole.COORDINATOR]))
):
    """
    Lists all system users. Restricted to administrators and coordinators.
    """
    users = db.query(User).order_by(User.created_at.desc()).all()
    user_list = [UserResponse.from_orm(u) for u in users]
    return StandardResponse(
        success=True,
        message="Users list retrieved.",
        data=user_list
    )

@router.put("/{user_id}/role", response_model=StandardResponse[UserResponse])
def update_user_role(
    user_id: str,
    payload: UserRoleUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(RoleChecker([UserRole.ADMIN]))
):
    """
    Updates a user's role. Restricted to administrators.
    """
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    target_user.role = payload.role
    db.commit()
    db.refresh(target_user)

    return StandardResponse(
        success=True,
        message=f"User role updated to {payload.role.value}.",
        data=UserResponse.from_orm(target_user)
    )

@router.put("/me/password", response_model=StandardResponse[dict])
def update_user_password(
    pwd_in: PasswordChange,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Changes the password credentials of the authenticated user.
    """
    if not verify_password(pwd_in.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password."
        )
    
    if len(pwd_in.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 6 characters long."
        )
        
    current_user.hashed_password = hash_password(pwd_in.new_password)
    db.commit()
    
    return StandardResponse(
        success=True,
        message="Password changed successfully.",
        data={}
    )
