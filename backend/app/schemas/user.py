from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator
from app.models.user import UserRole

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str
    role: Optional[UserRole] = UserRole.STUDENT
    department: Optional[str] = None
    college_id: Optional[str] = None
    bio: Optional[str] = None
    phone: Optional[str] = None
    semester: Optional[Any] = None
    avatar_url: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None

    @field_validator('semester', mode='before')
    @classmethod
    def stringify_semester(cls, v):
        if v is not None:
            return str(v)
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    department: Optional[str] = None
    college_id: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    phone: Optional[str] = None
    auto_accept_invites: Optional[bool] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None

class UserRoleUpdate(BaseModel):
    role: UserRole

class PasswordChange(BaseModel):
    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: UserRole
    department: Optional[str] = None
    college_id: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    phone: Optional[str] = None
    semester: Optional[Any] = None
    is_active: bool
    is_deleted: bool
    auto_accept_invites: bool
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    @field_validator('semester', mode='before')
    @classmethod
    def stringify_semester(cls, v):
        if v is not None:
            return str(v)
        return v

    class Config:
        orm_mode = True
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class UserUpdateAdmin(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    department: Optional[str] = None
    college_id: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    phone: Optional[str] = None
    semester: Optional[Any] = None
    is_active: Optional[bool] = None
    auto_accept_invites: Optional[bool] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None

    @field_validator('semester', mode='before')
    @classmethod
    def stringify_semester(cls, v):
        if v is not None:
            return str(v)
        return v

class UserStatusUpdate(BaseModel):
    is_active: bool

class UserListResponse(BaseModel):
    users: List[UserResponse]
    total: int
    page: int
    limit: int
    pages: int
