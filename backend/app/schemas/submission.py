from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, field_validator, model_validator
import re

GITHUB_URL_REGEX = re.compile(r'^https://(?:www\.)?github\.com/[\w\-\.]+/[\w\-\.]+(?:/.*|\.git)?$')

# ─────────────────────────────────────────────────────────────────
# Submission Schemas
# ─────────────────────────────────────────────────────────────────

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


# ─────────────────────────────────────────────────────────────────
# Judge Assignment Schemas
# ─────────────────────────────────────────────────────────────────

class JudgeAssignmentCreate(BaseModel):
    judge_id: str
    hackathon_id: Optional[str] = None
    submission_id: Optional[str] = None


class JudgeUserInfo(BaseModel):
    id: str
    full_name: str
    email: str

    class Config:
        from_attributes = True


class JudgeAssignmentResponse(BaseModel):
    id: str
    judge_id: str
    hackathon_id: Optional[str] = None
    submission_id: Optional[str] = None
    assigned_by_id: Optional[str] = None
    assigned_at: Optional[datetime] = None
    judge: Optional[JudgeUserInfo] = None
    judge_name: Optional[str] = None
    judge_email: Optional[str] = None
    hackathon_name: Optional[str] = None
    team_name: Optional[str] = None

    class Config:
        from_attributes = True



# ─────────────────────────────────────────────────────────────────
# Evaluation Schemas
# ─────────────────────────────────────────────────────────────────

VALID_SCORES = range(0, 11)  # 0–10 inclusive


class EvaluationScores(BaseModel):
    """Shared score fields — used by both draft and final submit."""
    score_innovation: float = 0.0
    score_technical: float = 0.0
    score_uiux: float = 0.0
    score_impact: float = 0.0
    score_presentation: float = 0.0

    @model_validator(mode='after')
    def validate_score_ranges(self) -> 'EvaluationScores':
        fields = {
            'score_innovation': self.score_innovation,
            'score_technical': self.score_technical,
            'score_uiux': self.score_uiux,
            'score_impact': self.score_impact,
            'score_presentation': self.score_presentation,
        }
        for name, val in fields.items():
            if not (0.0 <= val <= 10.0):
                raise ValueError(f'{name} must be between 0 and 10. Got: {val}')
        return self


class EvaluationDraftSave(EvaluationScores):
    """Payload for saving a draft evaluation (partial, no feedback required)."""
    submission_id: str
    feedback: Optional[str] = None
    strengths: Optional[str] = None
    weaknesses: Optional[str] = None
    suggestions: Optional[str] = None
    recommendation: Optional[str] = "pending"


class EvaluationFinalSubmit(EvaluationScores):
    """Payload for final evaluation submission (feedback required)."""
    submission_id: str
    feedback: str
    strengths: Optional[str] = None
    weaknesses: Optional[str] = None
    suggestions: Optional[str] = None
    recommendation: str = "pending"

    @field_validator('feedback')
    @classmethod
    def feedback_not_empty(cls, v: str) -> str:
        if not v or len(v.strip()) < 10:
            raise ValueError('Feedback must be at least 10 characters for final submission.')
        return v.strip()

    @field_validator('recommendation')
    @classmethod
    def validate_recommendation(cls, v: str) -> str:
        valid = {'pending', 'shortlist', 'accepted', 'rejected'}
        if v not in valid:
            raise ValueError(f'Recommendation must be one of: {", ".join(valid)}')
        return v


# ─── Legacy support (old 3-field evaluations endpoint) ──────────
class EvaluationCreate(BaseModel):
    submission_id: str
    score_innovation: float
    score_execution: float
    score_presentation: float
    feedback: Optional[str] = None


# ─────────────────────────────────────────────────────────────────
# Response Schemas
# ─────────────────────────────────────────────────────────────────

class EvaluationResponse(BaseModel):
    id: str
    submission_id: str
    judge_id: str
    score_innovation: float
    score_technical: float
    score_uiux: float
    score_impact: float
    score_presentation: float
    total_score: float
    feedback: Optional[str] = None
    strengths: Optional[str] = None
    weaknesses: Optional[str] = None
    suggestions: Optional[str] = None
    recommendation: str
    is_draft: bool
    submitted_at: Optional[datetime] = None
    judge: Optional[JudgeUserInfo] = None

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
    judge_assignments: List[JudgeAssignmentResponse] = []

    class Config:
        from_attributes = True
