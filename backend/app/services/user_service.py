from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, PasswordChange
from app.utils.security import get_password_hash, verify_password

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """
    Retrieves a user record by email address.
    """
    return db.query(User).filter(User.email == email.lower().strip()).first()

def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """
    Retrieves a user record by integer primary key ID.
    """
    return db.query(User).filter(User.id == user_id).first()

def register_user(db: Session, user_in: UserCreate) -> User:
    """
    Registers a new user profile.
    Checks for email conflicts first (should be done by route calling this).
    """
    hashed_password = get_password_hash(user_in.password)
    db_user = User(
        email=user_in.email.lower().strip(),
        hashed_password=hashed_password,
        full_name=user_in.full_name,
        role=user_in.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """
    Authenticates a user via email and plain-text password.
    Returns the User model if match, else None.
    """
    db_user = get_user_by_email(db, email)
    if not db_user:
        return None
    if not verify_password(password, db_user.hashed_password):
        return None
    return db_user

def update_profile(db: Session, db_user: User, update_in: UserUpdate) -> User:
    """
    Updates the mutable profile fields of a User.
    """
    if update_in.full_name is not None:
        db_user.full_name = update_in.full_name
    if update_in.email is not None:
        db_user.email = update_in.email.lower().strip()
    
    db.commit()
    db.refresh(db_user)
    return db_user

def change_password(db: Session, db_user: User, pwd_in: PasswordChange) -> User:
    """
    Validates current password and updates to new password hash.
    Raises ValueError on invalid credentials.
    """
    if not verify_password(pwd_in.current_password, db_user.hashed_password):
        raise ValueError("Invalid current password")
    
    db_user.hashed_password = get_password_hash(pwd_in.new_password)
    db.commit()
    db.refresh(db_user)
    return db_user
