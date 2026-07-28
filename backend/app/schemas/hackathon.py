from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from app.models.hackathon import HackathonStatus, ProblemCategory

class ProblemStatementCreate(BaseModel):
    title: str
    description: str
    category: Optional[ProblemCategory] = ProblemCategory.OPEN_INNOVATION
    difficulty: Optional[str] = "Medium"
    max_teams: Optional[int] = 10

class ProblemStatementUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[ProblemCategory] = None
    difficulty: Optional[str] = None
    max_teams: Optional[int] = None

class ProblemStatementResponse(BaseModel):
    id: str
    hackathon_id: str
    title: str
    description: str
    category: ProblemCategory
    difficulty: str
    max_teams: int
    created_at: datetime

    class Config:
        orm_mode = True
        from_attributes = True

class HackathonCreate(BaseModel):
    title: str
    slug: str
    tagline: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    registration_deadline: Optional[datetime] = None
    max_team_size: Optional[int] = 4
    min_team_size: Optional[int] = 1
    status: Optional[HackathonStatus] = HackathonStatus.UPCOMING
    banner_url: Optional[str] = None

class HackathonUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    tagline: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    registration_deadline: Optional[datetime] = None
    max_team_size: Optional[int] = None
    min_team_size: Optional[int] = None
    status: Optional[HackathonStatus] = None
    banner_url: Optional[str] = None

class HackathonResponse(BaseModel):
    id: str
    title: str
    slug: str
    tagline: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    registration_deadline: Optional[datetime] = None
    max_team_size: int
    min_team_size: int
    status: HackathonStatus
    banner_url: Optional[str] = None
    problem_statements: List[ProblemStatementResponse] = []
    created_at: datetime

    class Config:
        orm_mode = True
        from_attributes = True
