from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.hackathon import Hackathon, ProblemStatement, HackathonStatus
from app.models.user import User, UserRole
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
    # 1. Update upcoming hackathons whose start_date has passed to active
    db.query(Hackathon).filter(
        Hackathon.status == HackathonStatus.UPCOMING,
        Hackathon.start_date <= now
    ).update({Hackathon.status: HackathonStatus.ACTIVE}, synchronize_session=False)

    # 2. Update active/upcoming hackathons whose end_date has passed to ended
    db.query(Hackathon).filter(
        Hackathon.status.in_([HackathonStatus.UPCOMING, HackathonStatus.ACTIVE]),
        Hackathon.end_date <= now
    ).update({Hackathon.status: HackathonStatus.ENDED}, synchronize_session=False)
    
    db.commit()


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
            if h.start_date and now < h.start_date:
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
        if hackathon.start_date and now < hackathon.start_date:
            res.problem_statements = []
            
    return StandardResponse(
        success=True,
        message="Hackathon details retrieved.",
        data=res
    )

@router.post("", response_model=StandardResponse[HackathonResponse])
def create_hackathon(
    payload: HackathonCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(RoleChecker([UserRole.ADMIN, UserRole.COORDINATOR]))
):
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
    if payload.end_date and payload.start_date and payload.end_date < payload.start_date:
        raise HTTPException(status_code=400, detail="End date cannot be before start date.")

    hackathon = Hackathon(
        title=payload.title,
        slug=payload.slug,
        tagline=payload.tagline,
        description=payload.description,
        start_date=payload.start_date,
        end_date=payload.end_date,
        registration_deadline=payload.registration_deadline,
        max_team_size=payload.max_team_size or 4,
        min_team_size=payload.min_team_size or 1,
        status=payload.status or HackathonStatus.UPCOMING,
        banner_url=payload.banner_url,
        announce_ps_advance=payload.announce_ps_advance if payload.announce_ps_advance is not None else True
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
    hackathon = db.query(Hackathon).filter(Hackathon.id == hackathon_id).first()
    if not hackathon:
        hackathon = db.query(Hackathon).filter(Hackathon.slug == hackathon_id).first()
    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found.")

    if payload.slug != hackathon.slug:
        existing = db.query(Hackathon).filter(Hackathon.slug == payload.slug).first()
        if existing:
            raise HTTPException(status_code=400, detail="Hackathon with this slug already exists.")

    # Validation: date must not be in the past (only if modified to a new value)
    now = datetime.utcnow()
    if payload.start_date and payload.start_date != hackathon.start_date:
        if payload.start_date.date() < now.date():
            raise HTTPException(status_code=400, detail="Start date cannot be in the past.")
    if payload.registration_deadline and payload.registration_deadline != hackathon.registration_deadline:
        if payload.registration_deadline.date() < now.date():
            raise HTTPException(status_code=400, detail="Registration deadline cannot be in the past.")
    if payload.end_date and payload.end_date != hackathon.end_date:
        if payload.end_date.date() < now.date():
            raise HTTPException(status_code=400, detail="End date cannot be in the past.")
    if payload.end_date and payload.start_date and payload.end_date < payload.start_date:
        raise HTTPException(status_code=400, detail="End date cannot be before start date.")

    hackathon.title = payload.title
    hackathon.slug = payload.slug
    hackathon.tagline = payload.tagline
    hackathon.description = payload.description
    hackathon.start_date = payload.start_date
    hackathon.end_date = payload.end_date
    hackathon.registration_deadline = payload.registration_deadline
    hackathon.max_team_size = payload.max_team_size or 4
    hackathon.min_team_size = payload.min_team_size or 1
    hackathon.status = payload.status or HackathonStatus.UPCOMING
    hackathon.banner_url = payload.banner_url
    if payload.announce_ps_advance is not None:
        hackathon.announce_ps_advance = payload.announce_ps_advance

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

    ps = db.query(ProblemStatement).filter(
        ProblemStatement.id == problem_id,
        ProblemStatement.hackathon_id == hackathon.id
    ).first()
    if not ps:
        raise HTTPException(status_code=404, detail="Problem statement not found.")

    ps.title = payload.title
    ps.description = payload.description
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

    ps = ProblemStatement(
        hackathon_id=hackathon.id,
        title=payload.title,
        description=payload.description,
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
    current_user: User = Depends(get_current_active_user)
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
        leaderboard.append({
            "team_id": s.team_id,
            "team_name": s.team.name if s.team else "Unknown Team",
            "project_title": s.title,
            "score": round(avg_score, 2),
            "rank": 0
        })
        
    leaderboard.sort(key=lambda x: x["score"], reverse=True)
    
    for i, item in enumerate(leaderboard):
        item["rank"] = i + 1
        
    return StandardResponse(
        success=True,
        message="Leaderboard retrieved successfully.",
        data=leaderboard
    )


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

