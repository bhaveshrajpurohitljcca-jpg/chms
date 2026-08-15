import uuid
from sqlalchemy import Column, String, Text, Float, DateTime, ForeignKey, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.base import BaseTable


# ─── Status Constants ──────────────────────────────────────────
class SubmissionStatus:
    DRAFT = "draft"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    GRADED = "graded"
    ACCEPTED = "accepted"
    REJECTED = "rejected"


class EvaluationRecommendation:
    SHORTLIST = "shortlist"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    PENDING = "pending"


# ─── Submission ─────────────────────────────────────────────────
class Submission(BaseTable):
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    team_id = Column(String(36), ForeignKey("team.id", ondelete="CASCADE"), nullable=False)
    hackathon_id = Column(String(36), ForeignKey("hackathon.id", ondelete="CASCADE"), nullable=False)
    problem_statement_id = Column(String(36), ForeignKey("problem_statement.id", ondelete="CASCADE"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    repo_url = Column(String(500), nullable=False)
    demo_url = Column(String(500), nullable=True)
    video_url = Column(String(500), nullable=True)
    additional_notes = Column(Text, nullable=True)
    file_url = Column(String(500), nullable=True)
    file_name = Column(String(255), nullable=True)
    tech_stack = Column(String(500), nullable=True)
    status = Column(String(50), default=SubmissionStatus.SUBMITTED, nullable=False)
    is_finalist = Column(Boolean, default=False, nullable=False)
    round_one_score = Column(Float, nullable=True)
    final_rank = Column(Integer, nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    team = relationship("Team", back_populates="submissions")
    hackathon = relationship("Hackathon")
    problem_statement = relationship("ProblemStatement", back_populates="submissions")
    evaluations = relationship("Evaluation", back_populates="submission", cascade="all, delete-orphan")
    judge_assignments = relationship("JudgeAssignment", back_populates="submission", cascade="all, delete-orphan")


# ─── Judge Assignment ───────────────────────────────────────────
class JudgeAssignment(BaseTable):
    """
    Links a judge (User with role=JUDGE) to a specific Hackathon or Submission.
    Ensures each judge sees only their assigned work.
    """
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hackathon_id = Column(String(36), ForeignKey("hackathon.id", ondelete="CASCADE"), nullable=False)
    submission_id = Column(String(36), ForeignKey("submission.id", ondelete="CASCADE"), nullable=True)
    judge_id = Column(String(36), ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    assigned_by_id = Column(String(36), ForeignKey("user.id", ondelete="SET NULL"), nullable=True)
    assigned_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    submission = relationship("Submission", back_populates="judge_assignments")
    hackathon = relationship("Hackathon")
    judge = relationship("User", foreign_keys=[judge_id])
    assigned_by = relationship("User", foreign_keys=[assigned_by_id])

    __table_args__ = (
        UniqueConstraint("hackathon_id", "judge_id", "submission_id", name="unique_judge_hackathon_submission_assignment"),
    )


# ─── Evaluation ─────────────────────────────────────────────────
class Evaluation(BaseTable):
    """
    Stores a judge's full evaluation for a submission.
    Supports draft saving (is_draft=True) and final locking (is_draft=False).
    5-criteria scoring + structured written feedback.
    """
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(String(36), ForeignKey("submission.id", ondelete="CASCADE"), nullable=False)
    judge_id = Column(String(36), ForeignKey("user.id", ondelete="CASCADE"), nullable=False)

    # ── Scoring Criteria (each 0–10) ───────────────────────────
    score_innovation = Column(Float, default=0.0, nullable=False)     # Innovation & Originality
    score_technical = Column(Float, default=0.0, nullable=False)       # Technical Complexity & Architecture
    score_uiux = Column(Float, default=0.0, nullable=False)            # UI/UX & Design Quality
    score_impact = Column(Float, default=0.0, nullable=False)          # Implementation & Value Impact
    score_presentation = Column(Float, default=0.0, nullable=False)    # Presentation & Communication

    # ── Calculated Total (sum of above * 2 → out of 100) ──────
    total_score = Column(Float, default=0.0, nullable=False)

    # ── Structured Written Feedback ────────────────────────────
    feedback = Column(Text, nullable=True)          # Overall comments / summary
    strengths = Column(Text, nullable=True)         # What the team did well
    weaknesses = Column(Text, nullable=True)        # Areas needing improvement
    suggestions = Column(Text, nullable=True)       # Actionable suggestions
    recommendation = Column(String(50), default=EvaluationRecommendation.PENDING, nullable=False)

    # ── Lifecycle State ────────────────────────────────────────
    is_draft = Column(Boolean, default=True, nullable=False)
    submitted_at = Column(DateTime, nullable=True)

    submission = relationship("Submission", back_populates="evaluations")
    judge = relationship("User")

    __table_args__ = (
        UniqueConstraint("submission_id", "judge_id", name="unique_judge_submission_evaluation"),
    )



