from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from app.schemas.user import UserResponse

class SubmissionCreate(BaseModel):
    team_id: str
    hackathon_id: str
    problem_statement_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    repo_url: str
    demo_url: Optional[str] = None
    video_url: Optional[str] = None

class EvaluationCreate(BaseModel):
    submission_id: str
    score_innovation: float
    score_execution: float
    score_presentation: float
    feedback: Optional[str] = None

class EvaluationResponse(BaseModel):
    id: str
    submission_id: str
    judge_id: str
    score_innovation: float
    score_execution: float
    score_presentation: float
    total_score: float
    feedback: Optional[str] = None
    judge: Optional[UserResponse] = None

    class Config:
        orm_mode = True
        from_attributes = True

class SubmissionResponse(BaseModel):
    id: str
    team_id: str
    hackathon_id: str
    problem_statement_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    repo_url: str
    demo_url: Optional[str] = None
    video_url: Optional[str] = None
    submitted_at: datetime
    evaluations: List[EvaluationResponse] = []

    class Config:
        orm_mode = True
        from_attributes = True
