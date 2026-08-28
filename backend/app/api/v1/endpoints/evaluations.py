"""
Sprint 3 — Judge Assignment & Evaluation Endpoints
===================================================
Full RBAC-protected workflow:
  - Assign/remove judges (Coordinator/Admin)
  - Judge sees only assigned submissions
  - Draft save + final submit with locking
  - Score auto-calculated in backend
"""

from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.submission import (
    Submission, Evaluation, JudgeAssignment,
    SubmissionStatus, EvaluationRecommendation
)
from app.models.user import User, UserRole
from app.models.hackathon import CoordinatorAssignment, Hackathon
from app.schemas.submission import (
    JudgeAssignmentCreate, JudgeAssignmentResponse,
    EvaluationDraftSave, EvaluationFinalSubmit, EvaluationResponse,
    SubmissionResponse
)
from app.schemas.response import StandardResponse
from app.api.deps import get_current_active_user, RoleChecker

router = APIRouter(prefix="/evaluations", tags=["Judge Assignment & Evaluation"])


# ─── Score Calculator (backend-authoritative) ─────────────────
def _calculate_total(
    innovation: float, technical: float,
    uiux: float, impact: float, presentation: float
) -> float:
    """Sum of 5 criteria × 2 → max 100 (each criterion 0-10)."""
    return round((innovation + technical + uiux + impact + presentation) * 2.0, 2)


def _get_evaluation(db: Session, submission_id: str, judge_id: str, round_number: int = 1) -> Optional[Evaluation]:
    return db.query(Evaluation).filter(
        Evaluation.submission_id == submission_id,
        Evaluation.judge_id == judge_id,
        Evaluation.round_number == round_number
    ).first()


def _get_active_round(db: Session, submission_id: str, requested_round: int) -> int:
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found.")
    hackathon = db.query(Hackathon).filter(Hackathon.id == submission.hackathon_id).first()
    if not hackathon or hackathon.evaluation_mode != "two_round":
        if requested_round != 1:
            raise HTTPException(status_code=400, detail="Single-round hackathons only support round 1 evaluations.")
        return 1

    active_round = hackathon.current_evaluation_round
    if active_round not in (1, 2):
        raise HTTPException(status_code=400, detail="Judging is closed for this hackathon.")
    if requested_round != active_round:
        raise HTTPException(status_code=400, detail=f"This hackathon is currently in evaluation round {active_round}.")
    if active_round == 2 and not submission.is_finalist:
        raise HTTPException(status_code=403, detail="Only round-one finalists can be evaluated in round 2.")
    return active_round


def _verify_assigned(db: Session, submission_id: str, judge_id: str):
    """Raises 403 if judge is not assigned to the submission (either directly or hackathon-wide)."""
    if db.query(JudgeAssignment).filter(
        JudgeAssignment.submission_id == submission_id,
        JudgeAssignment.judge_id == judge_id
    ).first():
        return

    sub = db.query(Submission).filter(Submission.id == submission_id).first()
    if sub and db.query(JudgeAssignment).filter(
        JudgeAssignment.judge_id == judge_id,
        JudgeAssignment.hackathon_id == sub.hackathon_id,
        JudgeAssignment.submission_id.is_(None)
    ).first():
        return

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Access denied. You are not assigned to this submission."
    )


def _get_coordinator_hackathon_ids(db: Session, coordinator_id: str) -> list[str]:
    return [
        assignment.hackathon_id
        for assignment in db.query(CoordinatorAssignment).filter(
            CoordinatorAssignment.coordinator_id == coordinator_id
        ).all()
    ]


def _assert_submission_scope(db: Session, current_user: User, submission: Submission) -> None:
    if current_user.role != UserRole.COORDINATOR:
        return
    assigned_ids = _get_coordinator_hackathon_ids(db, current_user.id)
    if submission.hackathon_id not in assigned_ids:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. This hackathon is not assigned to you."
        )


def _scoped_assignments_query(db: Session, current_user: User):
    query = db.query(JudgeAssignment).options(joinedload(JudgeAssignment.judge))
    if current_user.role == UserRole.COORDINATOR:
        assigned_ids = _get_coordinator_hackathon_ids(db, current_user.id)
        query = query.filter(JudgeAssignment.hackathon_id.in_(assigned_ids))
    return query


def _scoped_evaluations_query(db: Session, current_user: User):
    query = db.query(Evaluation).join(Submission).options(joinedload(Evaluation.judge))
    if current_user.role == UserRole.COORDINATOR:
        assigned_ids = _get_coordinator_hackathon_ids(db, current_user.id)
        query = query.filter(Submission.hackathon_id.in_(assigned_ids))
    return query


# ─────────────────────────────────────────────────────────────
# JUDGE ASSIGNMENT
# ─────────────────────────────────────────────────────────────

@router.post("/assign", response_model=StandardResponse[JudgeAssignmentResponse])
def assign_judge(
    payload: JudgeAssignmentCreate,
    current_user: User = Depends(RoleChecker([UserRole.COORDINATOR, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Assign a judge to a submission. Prevents duplicate assignments."""
    submission = db.query(Submission).filter(Submission.id == payload.submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found.")
    _assert_submission_scope(db, current_user, submission)

    # Allow any user with JUDGE role - active or not (assignment will activate them)
    judge = db.query(User).filter(
        User.id == payload.judge_id,
        User.is_deleted == False,
    ).first()
    if not judge:
        raise HTTPException(status_code=404, detail="User not found.")
    if judge.role != UserRole.JUDGE:
        raise HTTPException(status_code=400, detail=f"'{judge.full_name}' does not have the JUDGE role.")

    if db.query(JudgeAssignment).filter(
        JudgeAssignment.submission_id == payload.submission_id,
        JudgeAssignment.judge_id == payload.judge_id
    ).first():
        raise HTTPException(status_code=409, detail=f"'{judge.full_name}' is already assigned to this submission.")

    hackathon_id = payload.hackathon_id or submission.hackathon_id

    # Auto-create hackathon-level assignment if missing (needed to activate judge)
    hackathon_level = db.query(JudgeAssignment).filter(
        JudgeAssignment.hackathon_id == hackathon_id,
        JudgeAssignment.judge_id == payload.judge_id,
        JudgeAssignment.submission_id.is_(None)
    ).first()
    if not hackathon_level:
        db.add(JudgeAssignment(
            hackathon_id=hackathon_id,
            judge_id=payload.judge_id,
            submission_id=None,
            assigned_by_id=current_user.id
        ))

    # Activate judge account if not already active
    if not judge.is_active:
        judge.is_active = True

    assignment = JudgeAssignment(
        submission_id=payload.submission_id,
        judge_id=payload.judge_id,
        hackathon_id=hackathon_id,
        assigned_by_id=current_user.id
    )

    db.add(assignment)
    submission.status = SubmissionStatus.UNDER_REVIEW
    db.commit()
    db.refresh(assignment)

    return StandardResponse(
        success=True,
        message=f"Judge '{judge.full_name}' assigned successfully.",
        data=JudgeAssignmentResponse.from_orm(assignment)
    )


@router.delete("/assign/{assignment_id}", response_model=StandardResponse[dict])
def remove_assignment(
    assignment_id: str,
    current_user: User = Depends(RoleChecker([UserRole.COORDINATOR, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Remove a judge assignment. Reverts submission status if no judges remain."""
    assignment = db.query(JudgeAssignment).filter(JudgeAssignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found.")
    if current_user.role == UserRole.COORDINATOR:
        submission = db.query(Submission).filter(Submission.id == assignment.submission_id).first()
        if submission:
            _assert_submission_scope(db, current_user, submission)

    submission_id = assignment.submission_id
    db.delete(assignment)
    db.flush()

    remaining = db.query(JudgeAssignment).filter(JudgeAssignment.submission_id == submission_id).count()
    if remaining == 0:
        sub = db.query(Submission).filter(Submission.id == submission_id).first()
        if sub and sub.status == SubmissionStatus.UNDER_REVIEW:
            sub.status = SubmissionStatus.SUBMITTED

    db.commit()
    return StandardResponse(success=True, message="Assignment removed.", data={})


@router.get("/assignments", response_model=StandardResponse[List[JudgeAssignmentResponse]])
def list_assignments(
    submission_id: Optional[str] = Query(None),
    judge_id: Optional[str] = Query(None),
    current_user: User = Depends(RoleChecker([UserRole.COORDINATOR, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """List all assignments. Filterable by submission or judge."""
    query = _scoped_assignments_query(db, current_user)
    if submission_id:
        submission = db.query(Submission).filter(Submission.id == submission_id).first()
        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found.")
        _assert_submission_scope(db, current_user, submission)
        query = query.filter(JudgeAssignment.submission_id == submission_id)
    if judge_id:
        query = query.filter(JudgeAssignment.judge_id == judge_id)

    results = query.order_by(JudgeAssignment.assigned_at.desc()).all()
    return StandardResponse(
        success=True, message="Assignments retrieved.",
        data=[JudgeAssignmentResponse.from_orm(a) for a in results]
    )


@router.get("/my-assignments", response_model=StandardResponse[List[SubmissionResponse]])
def get_my_assignments(
    current_user: User = Depends(RoleChecker([UserRole.JUDGE], allow_higher=False)),
    db: Session = Depends(get_db)
):
    """Judge-only: Returns only submissions assigned to the logged-in judge."""
    assignments = db.query(JudgeAssignment).filter(
        JudgeAssignment.judge_id == current_user.id
    ).all()

    if not assignments:
        return StandardResponse(success=True, message="No submissions assigned yet.", data=[])

    ids = [a.submission_id for a in assignments]
    submissions = db.query(Submission).options(
        joinedload(Submission.evaluations),
        joinedload(Submission.judge_assignments).joinedload(JudgeAssignment.judge),
        joinedload(Submission.team),
        joinedload(Submission.hackathon)
    ).filter(Submission.id.in_(ids)).all()
    submissions = [submission for submission in submissions if not (
        submission.hackathon and submission.hackathon.evaluation_mode == "two_round"
        and submission.hackathon.current_evaluation_round == 2
        and not submission.is_finalist
    )]

    return StandardResponse(
        success=True, message="Assigned submissions retrieved.",
        data=[SubmissionResponse.from_orm_safe(s) for s in submissions]
    )


@router.get("/judges", response_model=StandardResponse[list])
def list_judges(
    current_user: User = Depends(RoleChecker([UserRole.COORDINATOR, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Get all judge-role users for the assignment dropdown (active and inactive)."""
    judges = db.query(User).filter(
        User.role == UserRole.JUDGE,
        User.is_deleted == False
    ).order_by(User.full_name).all()

    return StandardResponse(
        success=True, message="Judges retrieved.",
        data=[{"id": j.id, "full_name": j.full_name, "email": j.email, "department": j.department, "is_active": j.is_active} for j in judges]
    )


# ─────────────────────────────────────────────────────────────
# EVALUATION
# ─────────────────────────────────────────────────────────────

@router.get("/submission/{submission_id}", response_model=StandardResponse[Optional[EvaluationResponse]])
def get_evaluation(
    submission_id: str,
    round_number: Optional[int] = Query(None, ge=1, le=2),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get evaluation for a submission. Judges only see their own; Admin sees any."""
    requested_round = round_number or 1
    active_round = _get_active_round(db, submission_id, requested_round)
    if current_user.role == UserRole.JUDGE:
        _verify_assigned(db, submission_id, current_user.id)
        ev = _get_evaluation(db, submission_id, current_user.id, active_round)
    else:
        submission = db.query(Submission).filter(Submission.id == submission_id).first()
        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found.")
        _assert_submission_scope(db, current_user, submission)
        ev = (
            db.query(Evaluation)
            .options(joinedload(Evaluation.judge))
            .filter(Evaluation.submission_id == submission_id)
            .filter(Evaluation.round_number == active_round)
            .order_by(Evaluation.submitted_at.desc().nullslast(), Evaluation.id.desc())
            .first()
        )

    return StandardResponse(
        success=True,
        message="Evaluation retrieved." if ev else "No evaluation found yet.",
        data=EvaluationResponse.model_validate(ev, from_attributes=True) if ev else None
    )


@router.post("/draft", response_model=StandardResponse[EvaluationResponse])
def save_draft(
    payload: EvaluationDraftSave,
    current_user: User = Depends(RoleChecker([UserRole.JUDGE], allow_higher=False)),
    db: Session = Depends(get_db)
):
    """Save or update a draft evaluation. Can be called many times. No feedback required."""
    active_round = _get_active_round(db, payload.submission_id, payload.round_number)
    _verify_assigned(db, payload.submission_id, current_user.id)
    existing = _get_evaluation(db, payload.submission_id, current_user.id, active_round)
    if existing and not existing.is_draft:
        raise HTTPException(status_code=400, detail="Evaluation is finalized. Only Admin can modify it.")

    total = _calculate_total(
        payload.score_innovation, payload.score_technical,
        payload.score_uiux, payload.score_impact, payload.score_presentation
    )

    if existing:
        existing.score_innovation = payload.score_innovation
        existing.score_technical = payload.score_technical
        existing.score_uiux = payload.score_uiux
        existing.score_impact = payload.score_impact
        existing.score_presentation = payload.score_presentation
        existing.total_score = total
        existing.feedback = payload.feedback
        existing.strengths = payload.strengths
        existing.weaknesses = payload.weaknesses
        existing.suggestions = payload.suggestions
        existing.recommendation = payload.recommendation or EvaluationRecommendation.PENDING
        db.commit()
        db.refresh(existing)
        ev = existing
    else:
        ev = Evaluation(
            submission_id=payload.submission_id,
            judge_id=current_user.id,
            score_innovation=payload.score_innovation,
            score_technical=payload.score_technical,
            score_uiux=payload.score_uiux,
            score_impact=payload.score_impact,
            score_presentation=payload.score_presentation,
            total_score=total,
            feedback=payload.feedback,
            strengths=payload.strengths,
            weaknesses=payload.weaknesses,
            suggestions=payload.suggestions,
            recommendation=payload.recommendation or EvaluationRecommendation.PENDING,
            round_number=active_round,
            is_draft=True
        )
        db.add(ev)
        db.commit()
        db.refresh(ev)

    return StandardResponse(success=True, message="Draft saved.", data=EvaluationResponse.model_validate(ev, from_attributes=True))


@router.post("/submit", response_model=StandardResponse[EvaluationResponse])
def submit_evaluation(
    payload: EvaluationFinalSubmit,
    current_user: User = Depends(RoleChecker([UserRole.JUDGE], allow_higher=False)),
    db: Session = Depends(get_db)
):
    """
    Submit final evaluation. Feedback required. Evaluation locked after this.
    Submission status → GRADED.
    """
    active_round = _get_active_round(db, payload.submission_id, payload.round_number)
    _verify_assigned(db, payload.submission_id, current_user.id)
    existing = _get_evaluation(db, payload.submission_id, current_user.id, active_round)
    if existing and not existing.is_draft:
        raise HTTPException(status_code=400, detail="Already submitted. Contact Admin for changes.")

    total = _calculate_total(
        payload.score_innovation, payload.score_technical,
        payload.score_uiux, payload.score_impact, payload.score_presentation
    )
    now = datetime.utcnow()

    if existing:
        existing.score_innovation = payload.score_innovation
        existing.score_technical = payload.score_technical
        existing.score_uiux = payload.score_uiux
        existing.score_impact = payload.score_impact
        existing.score_presentation = payload.score_presentation
        existing.total_score = total
        existing.feedback = payload.feedback
        existing.strengths = payload.strengths
        existing.weaknesses = payload.weaknesses
        existing.suggestions = payload.suggestions
        existing.recommendation = payload.recommendation
        existing.is_draft = False
        existing.submitted_at = now
        ev = existing
    else:
        ev = Evaluation(
            submission_id=payload.submission_id,
            judge_id=current_user.id,
            score_innovation=payload.score_innovation,
            score_technical=payload.score_technical,
            score_uiux=payload.score_uiux,
            score_impact=payload.score_impact,
            score_presentation=payload.score_presentation,
            total_score=total,
            feedback=payload.feedback,
            strengths=payload.strengths,
            weaknesses=payload.weaknesses,
            suggestions=payload.suggestions,
            recommendation=payload.recommendation,
            round_number=active_round,
            is_draft=False,
            submitted_at=now
        )
        db.add(ev)

    # Mark submission as GRADED
    sub = db.query(Submission).filter(Submission.id == payload.submission_id).first()
    if sub:
        sub.status = SubmissionStatus.GRADED

    db.commit()
    db.refresh(ev)
    return StandardResponse(success=True, message="Evaluation submitted and locked.", data=EvaluationResponse.model_validate(ev, from_attributes=True))


@router.put("/{evaluation_id}", response_model=StandardResponse[EvaluationResponse])
def admin_update_evaluation(
    evaluation_id: str,
    payload: EvaluationFinalSubmit,
    current_user: User = Depends(RoleChecker([UserRole.ADMIN], allow_higher=False)),
    db: Session = Depends(get_db)
):
    """Admin-only: Edit any evaluation after finalization for corrections."""
    ev = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Evaluation not found.")

    total = _calculate_total(
        payload.score_innovation, payload.score_technical,
        payload.score_uiux, payload.score_impact, payload.score_presentation
    )
    ev.score_innovation = payload.score_innovation
    ev.score_technical = payload.score_technical
    ev.score_uiux = payload.score_uiux
    ev.score_impact = payload.score_impact
    ev.score_presentation = payload.score_presentation
    ev.total_score = total
    ev.feedback = payload.feedback
    ev.strengths = payload.strengths
    ev.weaknesses = payload.weaknesses
    ev.suggestions = payload.suggestions
    ev.recommendation = payload.recommendation
    ev.submitted_at = datetime.utcnow()

    db.commit()
    db.refresh(ev)
    return StandardResponse(success=True, message="Evaluation updated by Admin.", data=EvaluationResponse.model_validate(ev, from_attributes=True))


@router.get("/history", response_model=StandardResponse[List[EvaluationResponse]])
def get_evaluation_history(
    submission_id: Optional[str] = Query(None),
    judge_id: Optional[str] = Query(None),
    current_user: User = Depends(RoleChecker([UserRole.COORDINATOR, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Admin/Coordinator: Full evaluation history with filters."""
    query = _scoped_evaluations_query(db, current_user)
    if submission_id:
        submission = db.query(Submission).filter(Submission.id == submission_id).first()
        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found.")
        _assert_submission_scope(db, current_user, submission)
        query = query.filter(Evaluation.submission_id == submission_id)
    if judge_id:
        query = query.filter(Evaluation.judge_id == judge_id)

    results = query.order_by(Evaluation.submitted_at.desc().nullslast()).all()
    return StandardResponse(
        success=True, message="History retrieved.",
        data=[EvaluationResponse.model_validate(e, from_attributes=True) for e in results]
    )
