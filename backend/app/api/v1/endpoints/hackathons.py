from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.hackathon import (
    Hackathon,
    ProblemStatement,
    HackathonStatus,
    CoordinatorAssignment,
)
from app.models.user import User, UserRole
from app.models.submission import JudgeAssignment
from app.schemas.hackathon import (
    HackathonCreate, HackathonResponse,
    ProblemStatementCreate, ProblemStatementResponse
)
from app.schemas.response import StandardResponse
from app.api.deps import get_current_active_user, RoleChecker, get_current_user_optional

router = APIRouter(prefix="/hackathons", tags=["Hackathons"])


def sync_hackathon_statuses(db: Session):
    """
    Automatically updates the status of hackathons based on their start and end dates.
    Self-healing routine run on queries to keep DB columns accurate.
    """
    now = datetime.utcnow()
    # 1. If start_date is in the future, status MUST be UPCOMING
    db.query(Hackathon).filter(
        Hackathon.start_date != None,
        Hackathon.start_date > now
    ).update({Hackathon.status: HackathonStatus.UPCOMING}, synchronize_session=False)

    # 2. If start_date <= now and (end_date is null or end_date > now), status MUST be ACTIVE
    db.query(Hackathon).filter(
        Hackathon.start_date != None,
        Hackathon.start_date <= now,
        (Hackathon.end_date == None) | (Hackathon.end_date > now)
    ).update({Hackathon.status: HackathonStatus.ACTIVE}, synchronize_session=False)

    # 3. Only if start_date <= now AND end_date <= now, status is ENDED
    db.query(Hackathon).filter(
        Hackathon.start_date != None,
        Hackathon.start_date <= now,
        Hackathon.end_date != None,
        Hackathon.end_date <= now
    ).update({Hackathon.status: HackathonStatus.ENDED}, synchronize_session=False)

    db.commit()
    _sync_assignment_account_statuses(db)


def _sync_assignment_account_statuses(db: Session) -> None:
    # Ensure coordinator and judge accounts remain active so past hackathons remain accessible
    for user in db.query(User).filter(User.role.in_([UserRole.COORDINATOR, UserRole.JUDGE])).all():
        user.is_active = True
    db.commit()


def _ensure_hackathon_editor(db: Session, user: User, hackathon_id: str) -> None:
    """Admins can manage every event; coordinators only manage assigned events."""
    if user.role == UserRole.ADMIN:
        return
    if user.role == UserRole.COORDINATOR and db.query(CoordinatorAssignment).filter(
        CoordinatorAssignment.coordinator_id == user.id,
        CoordinatorAssignment.hackathon_id == hackathon_id,
    ).first():
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You are not assigned to manage this hackathon.")


def _normalise_hackathon_dates(payload: HackathonCreate) -> None:
    for field in (
        "start_date", "end_date", "registration_deadline", "problem_statement_publish_at",
        "problem_selection_deadline", "submission_deadline",
    ):
        setattr(payload, field, make_naive(getattr(payload, field)))

    if payload.end_date and payload.start_date and payload.end_date < payload.start_date:
        raise HTTPException(status_code=400, detail="End date cannot be before start date.")
    if payload.problem_statement_publish_at and payload.start_date and payload.problem_statement_publish_at < payload.start_date:
        raise HTTPException(status_code=400, detail="Problem statement release cannot be before the hackathon start.")
    if payload.problem_selection_deadline and payload.problem_statement_publish_at and payload.problem_selection_deadline < payload.problem_statement_publish_at:
        raise HTTPException(status_code=400, detail="Problem selection deadline cannot be before problem statement release.")
    if payload.submission_deadline and payload.start_date and payload.submission_deadline < payload.start_date:
        raise HTTPException(status_code=400, detail="Submission deadline cannot be before the hackathon start.")


@router.get("", response_model=StandardResponse[List[HackathonResponse]])
def list_hackathons(
    status_filter: Optional[HackathonStatus] = None,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    sync_hackathon_statuses(db)
    query = db.query(Hackathon)
    if status_filter:
        query = query.filter(Hackathon.status == status_filter)
    
    hackathons = query.order_by(Hackathon.created_at.desc()).all()
    
    # Visibility logic for problem statements
    is_privileged = current_user is not None and current_user.role in (UserRole.ADMIN, UserRole.COORDINATOR)
    now = datetime.utcnow()
    
    results = []
    for h in hackathons:
        res = HackathonResponse.from_orm(h)
        if not is_privileged and not h.announce_ps_advance:
            publish_at = h.problem_statement_publish_at or h.start_date
            if publish_at and now < publish_at:
                res.problem_statements = []
        results.append(res)
        
    return StandardResponse(
        success=True,
        message="Hackathons retrieved successfully.",
        data=results
    )

@router.get("/{hackathon_id}", response_model=StandardResponse[HackathonResponse])
def get_hackathon(
    hackathon_id: str,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    sync_hackathon_statuses(db)
    hackathon = db.query(Hackathon).filter(Hackathon.id == hackathon_id).first()
    if not hackathon:
        # Try finding by slug
        hackathon = db.query(Hackathon).filter(Hackathon.slug == hackathon_id).first()

    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found.")
    
    # Visibility logic for problem statements
    is_privileged = current_user is not None and current_user.role in (UserRole.ADMIN, UserRole.COORDINATOR)
    now = datetime.utcnow()
    
    res = HackathonResponse.from_orm(hackathon)
    if not is_privileged and not hackathon.announce_ps_advance:
        publish_at = hackathon.problem_statement_publish_at or hackathon.start_date
        if publish_at and now < publish_at:
            res.problem_statements = []
            
    return StandardResponse(
        success=True,
        message="Hackathon details retrieved.",
        data=res
    )

def make_naive(dt: Optional[datetime]) -> Optional[datetime]:
    if dt is not None and dt.tzinfo is not None:
        return dt.replace(tzinfo=None)
    return dt


@router.post("", response_model=StandardResponse[HackathonResponse])
def create_hackathon(
    payload: HackathonCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(RoleChecker([UserRole.ADMIN]))
):
    _normalise_hackathon_dates(payload)

    existing = db.query(Hackathon).filter(Hackathon.slug == payload.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Hackathon with this slug already exists.")

    # Validation: date must not be in the past
    now = datetime.utcnow()
    if payload.start_date and payload.start_date.date() < now.date():
        raise HTTPException(status_code=400, detail="Start date cannot be in the past.")
    if payload.registration_deadline and payload.registration_deadline.date() < now.date():
        raise HTTPException(status_code=400, detail="Registration deadline cannot be in the past.")
    if payload.end_date and payload.end_date.date() < now.date():
        raise HTTPException(status_code=400, detail="End date cannot be in the past.")
    if payload.evaluation_mode not in ("single_round", "two_round"):
        raise HTTPException(status_code=400, detail="Evaluation mode must be single_round or two_round.")
    if payload.finalists_per_problem is not None and payload.finalists_per_problem < 1:
        raise HTTPException(status_code=400, detail="Finalists per problem must be at least 1.")

    is_strict = payload.is_strict_team_size or False
    strict_size = payload.strict_team_size if is_strict else None

    min_size = strict_size if is_strict and strict_size else (payload.min_team_size or 1)
    max_size = strict_size if is_strict and strict_size else (payload.max_team_size or 3)

    hackathon = Hackathon(
        title=payload.title,
        slug=payload.slug,
        tagline=payload.tagline,
        description=payload.description,
        start_date=payload.start_date,
        end_date=payload.end_date,
        registration_deadline=payload.registration_deadline,
        problem_statement_publish_at=payload.problem_statement_publish_at,
        problem_selection_deadline=payload.problem_selection_deadline,
        submission_deadline=payload.submission_deadline,
        max_team_size=max_size,
        min_team_size=min_size,
        is_strict_team_size=is_strict,
        strict_team_size=strict_size,
        status=payload.status or HackathonStatus.UPCOMING,
        banner_url=payload.banner_url,
        announce_ps_advance=payload.announce_ps_advance if payload.announce_ps_advance is not None else True,
        evaluation_mode=payload.evaluation_mode or "single_round",
        finalists_per_problem=payload.finalists_per_problem or 3
    )
    db.add(hackathon)
    db.commit()
    db.refresh(hackathon)

    return StandardResponse(
        success=True,
        message="Hackathon created successfully.",
        data=HackathonResponse.from_orm(hackathon)
    )


@router.put("/{hackathon_id}", response_model=StandardResponse[HackathonResponse])
def update_hackathon(
    hackathon_id: str,
    payload: HackathonCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(RoleChecker([UserRole.ADMIN, UserRole.COORDINATOR]))
):
    """Update hackathon details and deadlines."""
    _normalise_hackathon_dates(payload)

    hackathon = db.query(Hackathon).filter(Hackathon.id == hackathon_id).first()
    if not hackathon:
        hackathon = db.query(Hackathon).filter(Hackathon.slug == hackathon_id).first()
    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found.")
    _ensure_hackathon_editor(db, admin, hackathon.id)

    if payload.slug != hackathon.slug:
        existing = db.query(Hackathon).filter(Hackathon.slug == payload.slug).first()
        if existing:
            raise HTTPException(status_code=400, detail="Hackathon with this slug already exists.")

    now = datetime.utcnow()
    # Auto-fix end_date if start_date is moved ahead of old end_date
    if payload.start_date and payload.end_date and payload.end_date < payload.start_date:
        from datetime import timedelta
        payload.end_date = payload.start_date + timedelta(days=2)

    hackathon.title = payload.title
    hackathon.slug = payload.slug
    hackathon.tagline = payload.tagline
    hackathon.description = payload.description
    hackathon.start_date = payload.start_date
    hackathon.end_date = payload.end_date
    hackathon.registration_deadline = payload.registration_deadline
    hackathon.problem_statement_publish_at = payload.problem_statement_publish_at
    hackathon.problem_selection_deadline = payload.problem_selection_deadline
    hackathon.submission_deadline = payload.submission_deadline
    if payload.is_strict_team_size is not None:
        hackathon.is_strict_team_size = payload.is_strict_team_size
    if payload.strict_team_size is not None:
        hackathon.strict_team_size = payload.strict_team_size

    if hackathon.is_strict_team_size and hackathon.strict_team_size:
        hackathon.min_team_size = hackathon.strict_team_size
        hackathon.max_team_size = hackathon.strict_team_size
    else:
        if payload.min_team_size is not None:
            hackathon.min_team_size = payload.min_team_size
        if payload.max_team_size is not None:
            hackathon.max_team_size = payload.max_team_size or 1
    # Calculate accurate status based on dates
    if hackathon.start_date and hackathon.start_date > now:
        hackathon.status = HackathonStatus.UPCOMING
    elif hackathon.end_date and hackathon.end_date <= now and hackathon.start_date and hackathon.start_date <= now:
        hackathon.status = HackathonStatus.ENDED
    elif hackathon.start_date and hackathon.start_date <= now:
        hackathon.status = HackathonStatus.ACTIVE
    else:
        hackathon.status = payload.status or HackathonStatus.UPCOMING
    hackathon.banner_url = payload.banner_url
    if payload.announce_ps_advance is not None:
        hackathon.announce_ps_advance = payload.announce_ps_advance
    if payload.evaluation_mode is not None:
        if payload.evaluation_mode not in ("single_round", "two_round"):
            raise HTTPException(status_code=400, detail="Evaluation mode must be single_round or two_round.")
        hackathon.evaluation_mode = payload.evaluation_mode
    if payload.finalists_per_problem is not None:
        hackathon.finalists_per_problem = max(1, payload.finalists_per_problem)

    db.commit()
    db.refresh(hackathon)

    return StandardResponse(
        success=True,
        message="Hackathon updated successfully.",
        data=HackathonResponse.from_orm(hackathon)
    )


@router.put("/{hackathon_id}/problem-statements/{problem_id}", response_model=StandardResponse[ProblemStatementResponse])
def update_problem_statement(
    hackathon_id: str,
    problem_id: str,
    payload: ProblemStatementCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(RoleChecker([UserRole.ADMIN, UserRole.COORDINATOR]))
):
    """Update an existing problem statement. Restricted to Admin/Coordinator."""
    hackathon = db.query(Hackathon).filter(Hackathon.id == hackathon_id).first()
    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found.")
    _ensure_hackathon_editor(db, admin, hackathon.id)

    ps = db.query(ProblemStatement).filter(
        ProblemStatement.id == problem_id,
        ProblemStatement.hackathon_id == hackathon.id
    ).first()
    if not ps:
        raise HTTPException(status_code=404, detail="Problem statement not found.")

    ps.title = payload.title
    ps.description = payload.description
    ps.technical_deliverable = payload.technical_deliverable
    ps.points = payload.points if payload.points is not None else 100
    ps.category = payload.category
    ps.difficulty = payload.difficulty or "Medium"
    ps.max_teams = payload.max_teams or 10

    db.commit()
    db.refresh(ps)

    return StandardResponse(
        success=True,
        message="Problem statement updated successfully.",
        data=ProblemStatementResponse.from_orm(ps)
    )


@router.delete("/{hackathon_id}/problem-statements/{problem_id}", response_model=StandardResponse[dict])
def delete_problem_statement(
    hackathon_id: str,
    problem_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(RoleChecker([UserRole.ADMIN, UserRole.COORDINATOR]))
):
    """Delete a problem statement. Restricted to Admin/Coordinator."""
    hackathon = db.query(Hackathon).filter(Hackathon.id == hackathon_id).first()
    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found.")
    _ensure_hackathon_editor(db, admin, hackathon.id)

    ps = db.query(ProblemStatement).filter(
        ProblemStatement.id == problem_id,
        ProblemStatement.hackathon_id == hackathon.id
    ).first()
    if not ps:
        raise HTTPException(status_code=404, detail="Problem statement not found.")

    db.delete(ps)
    db.commit()

    return StandardResponse(
        success=True,
        message="Problem statement deleted successfully.",
        data={}
    )


@router.post("/{hackathon_id}/problem-statements", response_model=StandardResponse[ProblemStatementResponse])
def create_problem_statement(
    hackathon_id: str,
    payload: ProblemStatementCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(RoleChecker([UserRole.ADMIN, UserRole.COORDINATOR]))
):
    hackathon = db.query(Hackathon).filter(Hackathon.id == hackathon_id).first()
    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found.")
    _ensure_hackathon_editor(db, admin, hackathon.id)

    ps = ProblemStatement(
        hackathon_id=hackathon.id,
        title=payload.title,
        description=payload.description,
        technical_deliverable=payload.technical_deliverable,
        points=payload.points if payload.points is not None else 100,
        category=payload.category,
        difficulty=payload.difficulty or "Medium",
        max_teams=payload.max_teams or 10
    )
    db.add(ps)
    db.commit()
    db.refresh(ps)

    return StandardResponse(
        success=True,
        message="Problem statement created successfully.",
        data=ProblemStatementResponse.from_orm(ps)
    )


# ─────────────────────────────────────────────────────────────
# SPRINT 5 ENDPOINTS: LEADERBOARD, STATS & CERTIFICATES
# ─────────────────────────────────────────────────────────────
def check_coordinator_assignment(db: Session, coordinator_id: str, hackathon_id: str):
    from app.models.hackathon import CoordinatorAssignment
    assigned = db.query(CoordinatorAssignment).filter(
        CoordinatorAssignment.coordinator_id == coordinator_id,
        CoordinatorAssignment.hackathon_id == hackathon_id
    ).first()
    if not assigned:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. This hackathon is not assigned to you."
        )


@router.put("/{hackathon_id}/publish-results", response_model=StandardResponse[dict])
def publish_results(
    hackathon_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.ADMIN, UserRole.COORDINATOR]))
):
    """Publish hackathon evaluation results. Restricted to Admin/Coordinator."""
    hackathon = db.query(Hackathon).filter(Hackathon.id == hackathon_id).first()
    if not hackathon:
        hackathon = db.query(Hackathon).filter(Hackathon.slug == hackathon_id).first()
    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found.")

    if current_user.role == UserRole.COORDINATOR:
        check_coordinator_assignment(db, current_user.id, hackathon.id)

    hackathon.results_published = True
    db.commit()
    return StandardResponse(
        success=True,
        message="Results published successfully.",
        data={}
    )


@router.put("/{hackathon_id}/unpublish-results", response_model=StandardResponse[dict])
def unpublish_results(
    hackathon_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.ADMIN, UserRole.COORDINATOR]))
):
    """Unpublish hackathon evaluation results. Restricted to Admin/Coordinator."""
    hackathon = db.query(Hackathon).filter(Hackathon.id == hackathon_id).first()
    if not hackathon:
        hackathon = db.query(Hackathon).filter(Hackathon.slug == hackathon_id).first()
    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found.")

    if current_user.role == UserRole.COORDINATOR:
        check_coordinator_assignment(db, current_user.id, hackathon.id)

    hackathon.results_published = False
    db.commit()
    return StandardResponse(
        success=True,
        message="Results unpublished successfully.",
        data={}
    )


@router.get("/{hackathon_id}/leaderboard", response_model=StandardResponse[List[dict]])
def get_hackathon_leaderboard(
    hackathon_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Calculate and return the leaderboard for a given hackathon.
    Includes only graded submissions, sorted by average evaluation score.
    """
    from app.models.submission import Submission, SubmissionStatus
    hackathon = db.query(Hackathon).filter(Hackathon.id == hackathon_id).first()
    if not hackathon:
        hackathon = db.query(Hackathon).filter(Hackathon.slug == hackathon_id).first()
    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found.")
        
    submissions = db.query(Submission).filter(
        Submission.hackathon_id == hackathon.id,
        Submission.status == SubmissionStatus.GRADED
    ).all()
    
    leaderboard = []
    for s in submissions:
        if not s.evaluations:
            continue
        avg_score = sum(e.total_score for e in s.evaluations) / len(s.evaluations)
        members_data = []
        if s.team and s.team.members:
            for m in s.team.members:
                if m.user:
                    members_data.append({
                        "id": m.user.id,
                        "name": m.user.full_name or m.user.email,
                        "email": m.user.email,
                        "role": "Leader" if m.user_id == s.team.leader_id else "Member",
                        "avatar": m.user.avatar_url,
                    })

        leaderboard.append({
            "team_id": s.team_id,
            "team_name": s.team.name if s.team else "Unknown Team",
            "project_title": s.title,
            "description": s.description or "Completed project submission.",
            "repo_url": s.repo_url or "",
            "demo_url": s.demo_url or "",
            "tech_stack": getattr(s, "tech_stack", None) or "Python, React, FastAPI",
            "score": round(avg_score, 2),
            "rank": 0,
            "members": members_data
        })
        
    leaderboard.sort(key=lambda x: x["score"], reverse=True)
    
    for i, item in enumerate(leaderboard):
        item["rank"] = i + 1
        
    return StandardResponse(
        success=True,
        message="Leaderboard retrieved successfully.",
        data=leaderboard
    )


@router.post("/{hackathon_id}/rounds/shortlist", response_model=StandardResponse[List[dict]])
def shortlist_round_one_finalists(
    hackathon_id: str,
    current_user: User = Depends(RoleChecker([UserRole.COORDINATOR, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Select the top configured teams for every problem statement from round-one scores."""
    from app.models.submission import Submission, Evaluation
    hackathon = db.query(Hackathon).filter(Hackathon.id == hackathon_id).first()
    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found.")
    _ensure_hackathon_editor(db, current_user, hackathon.id)
    if hackathon.evaluation_mode != "two_round":
        raise HTTPException(status_code=400, detail="Enable two-round evaluation before shortlisting finalists.")
    if hackathon.current_evaluation_round != 1:
        raise HTTPException(status_code=400, detail="Round-one finalists have already been selected.")

    shortlisted = []
    for problem in hackathon.problem_statements:
        scored = []
        for submission in db.query(Submission).filter(
            Submission.hackathon_id == hackathon.id,
            Submission.problem_statement_id == problem.id
        ).all():
            scores = [evaluation.total_score for evaluation in db.query(Evaluation).filter(
                Evaluation.submission_id == submission.id,
                Evaluation.round_number == 1,
                Evaluation.is_draft == False
            ).all()]
            submission.is_finalist = False
            submission.final_rank = None
            submission.round_one_score = round(sum(scores) / len(scores), 2) if scores else None
            if scores:
                scored.append(submission)
        scored.sort(key=lambda item: item.round_one_score or 0, reverse=True)
        for rank, submission in enumerate(scored[:hackathon.finalists_per_problem], start=1):
            submission.is_finalist = True
            shortlisted.append({
                "problem_statement_id": problem.id,
                "problem_statement_title": problem.title,
                "team_id": submission.team_id,
                "team_name": submission.team.name if submission.team else "Unknown Team",
                "round_one_rank": rank,
                "round_one_score": submission.round_one_score,
            })
    hackathon.current_evaluation_round = 2
    db.commit()
    return StandardResponse(success=True, message="Round-one finalists selected.", data=shortlisted)


@router.post("/{hackathon_id}/rounds/finalize", response_model=StandardResponse[List[dict]])
def finalize_problem_statement_winners(
    hackathon_id: str,
    current_user: User = Depends(RoleChecker([UserRole.COORDINATOR, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Rank only shortlisted teams inside their own problem statement and mark one winner each."""
    from app.models.submission import Submission, Evaluation
    hackathon = db.query(Hackathon).filter(Hackathon.id == hackathon_id).first()
    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found.")
    _ensure_hackathon_editor(db, current_user, hackathon.id)
    if hackathon.evaluation_mode != "two_round" or hackathon.current_evaluation_round != 2:
        raise HTTPException(status_code=400, detail="Shortlist round-one finalists before finalizing winners.")

    results = []
    for problem in hackathon.problem_statements:
        finalists = db.query(Submission).filter(
            Submission.hackathon_id == hackathon.id,
            Submission.problem_statement_id == problem.id,
            Submission.is_finalist == True
        ).all()
        ranked = []
        for submission in finalists:
            scores = [evaluation.total_score for evaluation in db.query(Evaluation).filter(
                Evaluation.submission_id == submission.id,
                Evaluation.round_number == 2,
                Evaluation.is_draft == False
            ).all()]
            if scores:
                ranked.append((submission, round(sum(scores) / len(scores), 2)))
        ranked.sort(key=lambda item: item[1], reverse=True)
        for rank, (submission, score) in enumerate(ranked, start=1):
            submission.final_rank = rank
            results.append({"problem_statement_id": problem.id, "problem_statement_title": problem.title,
                            "team_id": submission.team_id, "team_name": submission.team.name if submission.team else "Unknown Team",
                            "rank": rank, "score": score, "is_winner": rank == 1})
    hackathon.current_evaluation_round = 3
    db.commit()
    return StandardResponse(success=True, message="Problem-statement winners finalized.", data=results)


@router.get("/{hackathon_id}/certificates/eligibility", response_model=StandardResponse[dict])
def check_certificate_eligibility(
    hackathon_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Check if the student is eligible for a certificate and return certificate meta.
    """
    from app.models.team import Team, TeamMember
    from app.models.submission import Submission, SubmissionStatus
    from datetime import datetime
    
    hackathon = db.query(Hackathon).filter(Hackathon.id == hackathon_id).first()
    if not hackathon:
        hackathon = db.query(Hackathon).filter(Hackathon.slug == hackathon_id).first()
    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found.")
        
    if not hackathon.results_published:
        return StandardResponse(
            success=True,
            message="Results are not published yet.",
            data={"eligible": False, "reason": "Results are not published yet."}
        )
        
    member_records = db.query(TeamMember).filter(TeamMember.user_id == current_user.id).all()
    team_ids = [m.team_id for m in member_records]
    team = db.query(Team).filter(
        Team.id.in_(team_ids),
        Team.hackathon_id == hackathon.id
    ).first()
    
    if not team:
        return StandardResponse(
            success=True,
            message="You did not register a team for this hackathon.",
            data={"eligible": False, "reason": "No registered team found."}
        )
        
    submission = db.query(Submission).filter(
        Submission.team_id == team.id,
        Submission.hackathon_id == hackathon.id
    ).first()
    if not submission:
        return StandardResponse(
            success=True,
            message="Your team did not submit a project.",
            data={"eligible": False, "reason": "No project submission found."}
        )
        
    submissions = db.query(Submission).filter(
        Submission.hackathon_id == hackathon.id,
        Submission.status == SubmissionStatus.GRADED
    ).all()
    
    leaderboard = []
    for s in submissions:
        if not s.evaluations:
            continue
        avg_score = sum(e.total_score for e in s.evaluations) / len(s.evaluations)
        leaderboard.append((s.team_id, avg_score))
    leaderboard.sort(key=lambda x: x[1], reverse=True)
    
    rank = None
    for i, (tid, _) in enumerate(leaderboard):
        if tid == team.id:
            rank = i + 1
            break
            
    cert_type = "Participation Certificate"
    if rank == 1:
        cert_type = "First Place Winner Certificate"
    elif rank == 2:
        cert_type = "Second Place Runner-Up Certificate"
    elif rank == 3:
        cert_type = "Third Place Runner-Up Certificate"
        
    return StandardResponse(
        success=True,
        message="Certificate eligibility verified.",
        data={
            "eligible": True,
            "full_name": current_user.full_name,
            "team_name": team.name,
            "hackathon_title": hackathon.title,
            "rank": rank,
            "certificate_type": cert_type,
            "issue_date": datetime.utcnow().strftime("%Y-%m-%d")
        }
    )


@router.get("/{hackathon_id}/stats", response_model=StandardResponse[dict])
def get_hackathon_stats(
    hackathon_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get statistics for a hackathon. Restricted to Admin and assigned Coordinators.
    """
    from app.models.team import Team
    from app.models.submission import Submission, SubmissionStatus
    from app.models.registration import Registration
    
    hackathon = db.query(Hackathon).filter(Hackathon.id == hackathon_id).first()
    if not hackathon:
        hackathon = db.query(Hackathon).filter(Hackathon.slug == hackathon_id).first()
    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found.")
        
    if current_user.role == UserRole.COORDINATOR:
        check_coordinator_assignment(db, current_user.id, hackathon.id)
    elif current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access forbidden.")
        
    total_teams = db.query(Team).filter(Team.hackathon_id == hackathon.id).count()
    total_registrations = db.query(Registration).filter(Registration.hackathon_id == hackathon.id).count()
    total_submissions = db.query(Submission).filter(Submission.hackathon_id == hackathon.id).count()
    graded_submissions = db.query(Submission).filter(
        Submission.hackathon_id == hackathon.id,
        Submission.status == SubmissionStatus.GRADED
    ).count()
    pending_evaluations = total_submissions - graded_submissions

    # Total unique students across all teams in this hackathon
    from app.models.team import TeamMember
    team_ids = [t.id for t in db.query(Team.id).filter(Team.hackathon_id == hackathon.id).all()]
    total_students = 0
    if team_ids:
        total_students = db.query(TeamMember).filter(TeamMember.team_id.in_(team_ids)).count()

    # Average score from evaluations
    from app.models.submission import Evaluation
    avg_score = None
    try:
        evals = db.query(Evaluation).join(Submission).filter(
            Submission.hackathon_id == hackathon.id
        ).all()
        if evals:
            scores = [e.total_score for e in evals if e.total_score is not None]
            if scores:
                avg_score = round(sum(scores) / len(scores), 1)
    except Exception:
        avg_score = None
    
    progress = 0.0
    if total_submissions > 0:
        progress = round((graded_submissions / total_submissions) * 100, 2)
        
    return StandardResponse(
        success=True,
        message="Hackathon stats compiled.",
        data={
            "total_teams": total_teams,
            "total_students": total_students,
            "total_registrations": total_registrations,
            "total_submissions": total_submissions,
            "graded_submissions": graded_submissions,
            "pending_evaluations": pending_evaluations,
            "average_score": avg_score,
            "evaluation_progress_percent": progress
        }
    )


@router.delete("/{hackathon_id}", response_model=StandardResponse[dict])
def delete_hackathon(
    hackathon_id: str,
    force: bool = False,
    current_user: User = Depends(RoleChecker([UserRole.ADMIN, UserRole.COORDINATOR])),
    db: Session = Depends(get_db)
):
    hackathon = db.query(Hackathon).filter(Hackathon.id == hackathon_id).first()
    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found.")

    from app.models.registration import Registration
    reg_count = db.query(Registration).filter(Registration.hackathon_id == hackathon_id).count()

    if reg_count > 0 and not force:
        hackathon.status = HackathonStatus.ENDED
        db.commit()
        return StandardResponse(
            success=True,
            message=f"Hackathon has {reg_count} active registration(s). Status updated to ENDED.",
            data={"cancelled": True}
        )

    db.delete(hackathon)
    db.commit()
    return StandardResponse(
        success=True,
        message="Hackathon deleted successfully.",
        data={"cancelled": False}
    )


