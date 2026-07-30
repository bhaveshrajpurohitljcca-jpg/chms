from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.schemas.user import UserRegister, UserProfileUpdate, UserUpdateAdmin
from app.core.security import hash_password, verify_password

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """
    Retrieves a user record by email, filtering out soft-deleted users.
    """
    return db.query(User).filter(
        User.email == email.lower().strip(),
        User.is_deleted == False
    ).first()

def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    """
    Retrieves a user record by string ID, filtering out soft-deleted users.
    """
    return db.query(User).filter(
        User.id == user_id,
        User.is_deleted == False
    ).first()

def register_user(db: Session, user_in: UserRegister) -> User:
    """
    Registers a new user profile.
    """
    hashed_pwd = hash_password(user_in.password)
    db_user = User(
        email=user_in.email.lower().strip(),
        hashed_password=hashed_pwd,
        full_name=user_in.full_name,
        role=user_in.role or UserRole.STUDENT,
        department=user_in.department,
        college_id=user_in.college_id,
        bio=user_in.bio,
        phone=user_in.phone,
        semester=user_in.semester
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def list_users_paginated(
    db: Session,
    page: int = 1,
    limit: int = 10,
    search: Optional[str] = None,
    role: Optional[UserRole] = None,
    is_active: Optional[bool] = None,
    is_deleted: Optional[bool] = False
) -> Tuple[List[User], int]:
    """
    Returns a paginated list of users filtered by search, role, is_active, and is_deleted.
    """
    query = db.query(User)

    # Filter out soft deleted users by default unless specified
    if is_deleted is not None:
        query = query.filter(User.is_deleted == is_deleted)

    if is_active is not None:
        query = query.filter(User.is_active == is_active)

    if role is not None:
        query = query.filter(User.role == role)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            (User.full_name.like(search_term)) |
            (User.email.like(search_term)) |
            (User.college_id.like(search_term)) |
            (User.department.like(search_term))
        )

    total = query.count()
    offset = (page - 1) * limit
    users = query.order_by(User.created_at.desc()).offset(offset).limit(limit).all()

    return users, total

def update_profile(db: Session, db_user: User, update_in: UserProfileUpdate) -> User:
    """
    Updates the mutable profile fields of a User.
    """
    if update_in.full_name is not None:
        db_user.full_name = update_in.full_name
    if update_in.department is not None:
        db_user.department = update_in.department
    if update_in.college_id is not None:
        db_user.college_id = update_in.college_id
    if update_in.avatar_url is not None:
        db_user.avatar_url = update_in.avatar_url
    if update_in.bio is not None:
        db_user.bio = update_in.bio
    if update_in.phone is not None:
        db_user.phone = update_in.phone

    db.commit()
    db.refresh(db_user)
    return db_user

def update_user_admin(db: Session, db_user: User, update_in: UserUpdateAdmin) -> User:
    """
    Allows Admin to update any user profile field including role and active state.
    """
    if update_in.email is not None:
        db_user.email = update_in.email
    if update_in.password is not None and update_in.password.strip() != "":
        from app.core.security import hash_password
        db_user.hashed_password = hash_password(update_in.password)
    if update_in.full_name is not None:
        db_user.full_name = update_in.full_name
    if update_in.role is not None:
        db_user.role = update_in.role
    if update_in.department is not None:
        db_user.department = update_in.department
    if update_in.college_id is not None:
        db_user.college_id = update_in.college_id
    if update_in.avatar_url is not None:
        db_user.avatar_url = update_in.avatar_url
    if update_in.bio is not None:
        db_user.bio = update_in.bio
    if update_in.phone is not None:
        db_user.phone = update_in.phone
    if update_in.is_active is not None:
        db_user.is_active = update_in.is_active

    db.commit()
    db.refresh(db_user)
    return db_user

def soft_delete_user(db: Session, db_user: User) -> User:
    """
    Soft deletes a user by setting is_deleted=True and is_active=False.
    """
    db_user.is_deleted = True
    db_user.is_active = False
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user_status(db: Session, db_user: User, is_active: bool) -> User:
    """
    Activates or deactivates a user.
    """
    db_user.is_active = is_active
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user_password(db: Session, db_user: User, current_password: str, new_password: str) -> User:
    """
    Changes password if the current password is valid.
    """
    if not verify_password(current_password, db_user.hashed_password):
        raise ValueError("Incorrect current password.")

    if len(new_password) < 6:
        raise ValueError("New password must be at least 6 characters long.")

    db_user.hashed_password = hash_password(new_password)
    db.commit()
    db.refresh(db_user)
    return db_user
