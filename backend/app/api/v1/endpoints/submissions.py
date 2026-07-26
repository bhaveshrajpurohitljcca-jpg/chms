from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.submission import Submission, Evaluation
from app.models.team import Team, TeamMember
from app.models.user import User, UserRole
from app.schemas.submission import (
    SubmissionCreate, SubmissionResponse,
    EvaluationCreate, EvaluationResponse
)
from app.schemas.response import StandardResponse
from app.api.deps import get_current_active_user, RoleChecker

router = APIRouter(prefix="/submissions", tags=["Submissions & Evaluations"])

@router.get("", response_model=StandardResponse[List[SubmissionResponse]])
def list_submissions(
    hackathon_id: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(Submission)
    if hackathon_id:
        query = query.filter(Submission.hackathon_id == hackathon_id)
    
    subs = query.order_by(Submission.submitted_at.desc()).all()
    results = [SubmissionResponse.from_orm(s) for s in subs]
    return StandardResponse(
        success=True,
        message="Submissions retrieved successfully.",
        data=results
    )

@router.post("", response_model=StandardResponse[SubmissionResponse])
def create_submission(
    payload: SubmissionCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    team_member = db.query(TeamMember).filter(
        TeamMember.team_id == payload.team_id,
        TeamMember.user_id == current_user.id
    ).first()
    if not team_member:
        raise HTTPException(status_code=403, detail="You must be a member of the team to submit project.")

    submission = Submission(
        team_id=payload.team_id,
        hackathon_id=payload.hackathon_id,
        problem_statement_id=payload.problem_statement_id,
        title=payload.title,
        description=payload.description,
        repo_url=payload.repo_url,
        demo_url=payload.demo_url,
        video_url=payload.video_url
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    return StandardResponse(
        success=True,
        message="Project submission recorded successfully!",
        data=SubmissionResponse.from_orm(submission)
    )

@router.post("/evaluate", response_model=StandardResponse[EvaluationResponse])
def evaluate_submission(
    payload: EvaluationCreate,
    current_user: User = Depends(RoleChecker([UserRole.JUDGE, UserRole.ADMIN, UserRole.COORDINATOR])),
    db: Session = Depends(get_db)
):
    submission = db.query(Submission).filter(Submission.id == payload.submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found.")

    existing_eval = db.query(Evaluation).filter(
        Evaluation.submission_id == payload.submission_id,
        Evaluation.judge_id == current_user.id
    ).first()

    total = (payload.score_innovation + payload.score_execution + payload.score_presentation) / 3.0

    if existing_eval:
        existing_eval.score_innovation = payload.score_innovation
        existing_eval.score_execution = payload.score_execution
        existing_eval.score_presentation = payload.score_presentation
        existing_eval.total_score = round(total, 2)
        existing_eval.feedback = payload.feedback
        eval_obj = existing_eval
    else:
        eval_obj = Evaluation(
            submission_id=payload.submission_id,
            judge_id=current_user.id,
            score_innovation=payload.score_innovation,
            score_execution=payload.score_execution,
            score_presentation=payload.score_presentation,
            total_score=round(total, 2),
            feedback=payload.feedback
        )
        db.add(eval_obj)

    db.commit()
    db.refresh(eval_obj)

    return StandardResponse(
        success=True,
        message="Evaluation score saved.",
        data=EvaluationResponse.from_orm(eval_obj)
    )
