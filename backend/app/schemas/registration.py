from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.registration import RegistrationStatus
from app.schemas.team import TeamResponse
from app.schemas.hackathon import HackathonResponse, ProblemStatementResponse
from app.schemas.user import UserResponse


class RegistrationCreate(BaseModel):
    team_id: str
    hackathon_id: str
    problem_statement_id: Optional[str] = None


class RegistrationResponse(BaseModel):
    id: str
    team_id: str
    hackathon_id: str
    problem_statement_id: Optional[str] = None
    registered_by_id: str
    status: RegistrationStatus
    team: Optional[TeamResponse] = None
    hackathon: Optional[HackathonResponse] = None
    problem_statement: Optional[ProblemStatementResponse] = None
    registered_by: Optional[UserResponse] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
