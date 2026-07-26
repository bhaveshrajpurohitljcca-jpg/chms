from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, field_validator
import re

GITHUB_URL_REGEX = re.compile(r'^https://github\.com/[\w\-\.]+/[\w\-\.]+/?$')

class SubmissionCreate(BaseModel):
    team_id: str
    hackathon_id: str
    problem_statement_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    repo_url: str
    demo_url: Optional[str] = None
    video_url: Optional[str] = None
    additional_notes: Optional[str] = None

    @field_validator('repo_url')
    @classmethod
    def validate_github_url(cls, v: str) -> str:
        v = v.strip()
        if not GITHUB_URL_REGEX.match(v):
            raise ValueError(
                'Repository URL must be a valid GitHub HTTPS URL. '
                'Format: https://github.com/username/repository'
            )
        return v

    @field_validator('title')
    @classmethod
    def validate_title(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 3:
            raise ValueError('Project title must be at least 3 characters.')
        if len(v) > 255:
            raise ValueError('Project title must not exceed 255 characters.')
        return v


class SubmissionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    repo_url: Optional[str] = None
    demo_url: Optional[str] = None
    video_url: Optional[str] = None
    additional_notes: Optional[str] = None

    @field_validator('repo_url', mode='before')
    @classmethod
    def validate_github_url(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        if not GITHUB_URL_REGEX.match(v):
            raise ValueError(
                'Repository URL must be a valid GitHub HTTPS URL. '
                'Format: https://github.com/username/repository'
            )
        return v


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

    class Config:
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
    additional_notes: Optional[str] = None
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    status: str
    submitted_at: datetime
    evaluations: List[EvaluationResponse] = []

    class Config:
        from_attributes = True
