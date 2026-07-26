from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from app.models.team import TeamStatus, MemberRole
from app.schemas.user import UserResponse

class TeamCreate(BaseModel):
    hackathon_id: str
    name: str

class TeamJoin(BaseModel):
    join_code: str

class TeamMemberResponse(BaseModel):
    id: str
    team_id: str
    user_id: str
    role_in_team: MemberRole
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True

class TeamResponse(BaseModel):
    id: str
    hackathon_id: str
    name: str
    join_code: str
    leader_id: str
    status: TeamStatus
    leader: Optional[UserResponse] = None
    members: List[TeamMemberResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True
