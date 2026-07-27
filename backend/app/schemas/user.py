from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr
from app.models.user import UserRole

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: Optional[UserRole] = UserRole.STUDENT
    department: Optional[str] = None
    college_id: Optional[str] = None
    bio: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    department: Optional[str] = None
    college_id: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None

class UserRoleUpdate(BaseModel):
    role: UserRole

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: UserRole
    department: Optional[str] = None
    college_id: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
