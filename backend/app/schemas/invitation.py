from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from app.models.invitation import InvitationStatus
from app.schemas.user import UserResponse
from app.schemas.team import TeamResponse


class InvitationCreate(BaseModel):
    invitee_email: str


class InvitationResponse(BaseModel):
    id: str
    team_id: str
    invited_by_id: str
    invitee_email: str
    status: InvitationStatus
    invited_by: Optional[UserResponse] = None
    team: Optional[TeamResponse] = None
    created_at: datetime

    class Config:
        orm_mode = True
        from_attributes = True
