from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserResponse, UserProfileUpdate, UserRoleUpdate
from app.schemas.response import StandardResponse
from app.api.deps import get_current_active_user, RoleChecker

router = APIRouter(prefix="/users", tags=["Users & Profiles"])

@router.put("/profile", response_model=StandardResponse[UserResponse])
def update_profile(
    payload: UserProfileUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
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
