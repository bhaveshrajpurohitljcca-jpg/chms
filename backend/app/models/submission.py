import uuid
from sqlalchemy import Column, String, Text, Float, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.base import BaseTable

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
    submitted_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    team = relationship("Team", back_populates="submissions")
    hackathon = relationship("Hackathon")
    problem_statement = relationship("ProblemStatement", back_populates="submissions")
    evaluations = relationship("Evaluation", back_populates="submission", cascade="all, delete-orphan")

class Evaluation(BaseTable):
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(String(36), ForeignKey("submission.id", ondelete="CASCADE"), nullable=False)
    judge_id = Column(String(36), ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    score_innovation = Column(Float, default=0.0, nullable=False)
    score_execution = Column(Float, default=0.0, nullable=False)
    score_presentation = Column(Float, default=0.0, nullable=False)
    total_score = Column(Float, default=0.0, nullable=False)
    feedback = Column(Text, nullable=True)

    submission = relationship("Submission", back_populates="evaluations")
    judge = relationship("User")

    __table_args__ = (
        UniqueConstraint("submission_id", "judge_id", name="unique_judge_submission_evaluation"),
    )
