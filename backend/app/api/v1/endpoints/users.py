import os
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import (
    UserResponse, 
    UserProfileUpdate, 
    UserUpdateAdmin, 
    UserStatusUpdate, 
    UserListResponse,
    PasswordChange
)
from app.schemas.response import StandardResponse
from app.api.deps import get_current_active_user, RoleChecker
from app.services import user_service

router = APIRouter(prefix="/users", tags=["Users & Profiles"])

@router.get("/me", response_model=StandardResponse[UserResponse])
def get_current_user_profile(current_user: User = Depends(get_current_active_user)):
    """
    Retrieves the profile of the currently authenticated active user.
    """
    return StandardResponse(
        success=True,
        message="Current user profile retrieved.",
        data=UserResponse.from_orm(current_user)
    )

@router.get("/{user_id}", response_model=StandardResponse[UserResponse])
def get_user_profile_by_id(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Retrieves a user profile by ID. Available to all authenticated active users.
    """
    db_user = user_service.get_user_by_id(db, user_id=user_id)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
    return StandardResponse(
        success=True,
        message="User profile retrieved.",
        data=UserResponse.from_orm(db_user)
    )

@router.get("", response_model=StandardResponse[UserListResponse])
def list_users(
    db: Session = Depends(get_db),
    page: int = 1,
    limit: int = 10,
    search: Optional[str] = None,
    role: Optional[UserRole] = None,
    is_active: Optional[bool] = None,
    is_deleted: Optional[bool] = False,
    admin_user: User = Depends(RoleChecker([UserRole.ADMIN]))
):
    """
    Lists, searches, and filters system users with pagination. Restricted to Admin.
    """
    users, total = user_service.list_users_paginated(
        db=db,
        page=page,
        limit=limit,
        search=search,
        role=role,
        is_active=is_active,
        is_deleted=is_deleted
    )
    
    pages = (total + limit - 1) // limit
    
    list_data = UserListResponse(
        users=[UserResponse.from_orm(u) for u in users],
        total=total,
        page=page,
        limit=limit,
        pages=pages
    )
    
    return StandardResponse(
        success=True,
        message="Users list retrieved successfully.",
        data=list_data
    )

@router.put("/profile", response_model=StandardResponse[UserResponse])
def update_profile(
    payload: UserProfileUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Updates the authenticated user's own profile details.
    """
    updated_user = user_service.update_profile(db=db, db_user=current_user, update_in=payload)
    from app.services.notification_service import NotificationEventDispatcher
    NotificationEventDispatcher.dispatch_profile_updated(db, current_user.id)
    return StandardResponse(
        success=True,
        message="Profile updated successfully.",
        data=UserResponse.from_orm(updated_user)
    )

@router.post("/profile/avatar", response_model=StandardResponse[dict])
def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Uploads a profile picture and saves it to local static file storage.
    """
    if file.content_type not in ["image/jpeg", "image/png", "image/gif"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image format. Allowed formats: JPEG, PNG, GIF."
        )
    
    # Create avatar upload directory inside static folder
    upload_dir = "static/avatars"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Clean filename with user UUID
    file_ext = file.filename.split(".")[-1]
    filename = f"{current_user.id}.{file_ext}"
    filepath = os.path.join(upload_dir, filename)
    
    # Save the file locally
    try:
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not save profile picture: {str(e)}"
        )
        
    # Update avatar URL in db user profile
    avatar_url = f"/static/avatars/{filename}"
    user_service.update_profile(
        db=db, 
        db_user=current_user, 
        update_in=UserProfileUpdate(avatar_url=avatar_url)
    )
    from app.services.notification_service import NotificationEventDispatcher
    NotificationEventDispatcher.dispatch_profile_updated(db, current_user.id)
    
    return StandardResponse(
        success=True,
        message="Profile picture updated successfully.",
        data={"avatar_url": avatar_url}
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
    try:
        user_service.update_user_password(
            db=db, 
            db_user=current_user, 
            current_password=pwd_in.current_password, 
            new_password=pwd_in.new_password
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
        
    from app.services.notification_service import NotificationEventDispatcher
    NotificationEventDispatcher.dispatch_password_changed(db, current_user.id)
    return StandardResponse(
        success=True,
        message="Password changed successfully.",
        data={}
    )

@router.put("/{user_id}", response_model=StandardResponse[UserResponse])
def update_user_by_admin(
    user_id: str,
    payload: UserUpdateAdmin,
    db: Session = Depends(get_db),
    admin_user: User = Depends(RoleChecker([UserRole.ADMIN]))
):
    """
    Updates any user's profile details. Restricted to Admin.
    """
    db_user = user_service.get_user_by_id(db, user_id=user_id)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
        
    updated_user = user_service.update_user_admin(db=db, db_user=db_user, update_in=payload)
    return StandardResponse(
        success=True,
        message="User updated successfully by administrator.",
        data=UserResponse.from_orm(updated_user)
    )

@router.delete("/{user_id}", response_model=StandardResponse[UserResponse])
def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    admin_user: User = Depends(RoleChecker([UserRole.ADMIN]))
):
    """
    Soft deletes a user. Restricted to Admin.
    """
    db_user = db.query(User).filter(User.id == user_id, User.is_deleted == False).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found or already deleted."
        )
        
    deleted_user = user_service.soft_delete_user(db=db, db_user=db_user)
    return StandardResponse(
        success=True,
        message="User soft-deleted successfully.",
        data=UserResponse.from_orm(deleted_user)
    )

@router.put("/{user_id}/status", response_model=StandardResponse[UserResponse])
def toggle_user_status(
    user_id: str,
    payload: UserStatusUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(RoleChecker([UserRole.ADMIN]))
):
    """
    Activates or deactivates a user account. Restricted to Admin.
    """
    db_user = user_service.get_user_by_id(db, user_id=user_id)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
        
    updated_user = user_service.update_user_status(db=db, db_user=db_user, is_active=payload.is_active)
    return StandardResponse(
        success=True,
        message=f"User account {'activated' if payload.is_active else 'deactivated'} successfully.",
        data=UserResponse.from_orm(updated_user)
    )


@router.get("/search", response_model=StandardResponse[List[UserResponse]])
def search_users(
    email: Optional[str] = Query(None, description="Partial email to search"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Search for users by email prefix — accessible by any authenticated user.
    Used by team leaders to find invitees. Returns max 10 results.
    """
    if not email or len(email.strip()) < 3:
        return StandardResponse(
            success=True,
            message="Please enter at least 3 characters to search.",
            data=[]
        )

    users = (
        db.query(User)
        .filter(User.email.ilike(f"%{email.strip()}%"), User.is_active == True)
        .limit(10)
        .all()
    )
    results = [UserResponse.from_orm(u) for u in users]
    return StandardResponse(
        success=True,
        message=f"Found {len(results)} user(s).",
        data=results
    )
