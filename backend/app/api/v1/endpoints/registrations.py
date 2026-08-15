from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.registration import Registration, RegistrationStatus
from app.models.team import Team, TeamMember
from app.models.hackathon import Hackathon, ProblemStatement, CoordinatorAssignment
from app.models.user import User, UserRole
from app.schemas.registration import RegistrationCreate, RegistrationResponse
from app.schemas.response import StandardResponse
from app.api.deps import get_current_active_user
from typing import Optional

router = APIRouter(prefix="/registrations", tags=["Registrations"])


def _ensure_problem_selection_is_open(hackathon: Hackathon) -> None:
    """Apply one server-side PS visibility window to every selection path."""
    now = datetime.utcnow()
    publish_at = hackathon.problem_statement_publish_at or (
        hackathon.start_date if not hackathon.announce_ps_advance else None
    )
    if publish_at and now < publish_at:
        raise HTTPException(status_code=400, detail="Problem statements have not been released yet.")
    if hackathon.problem_selection_deadline and now > hackathon.problem_selection_deadline:
        raise HTTPException(status_code=400, detail="The problem statement selection deadline has passed.")


@router.get("", response_model=StandardResponse[List[RegistrationResponse]])
def list_registrations(
    hackathon_id: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    List all registrations. Admin sees all. Coordinator sees only assigned hackathons.
    Optionally filter by hackathon_id.
    """
    query = db.query(Registration)

    if current_user.role == UserRole.COORDINATOR:
        assigned_ids = [a.hackathon_id for a in db.query(CoordinatorAssignment).filter(
            CoordinatorAssignment.coordinator_id == current_user.id
        ).all()]
        if hackathon_id:
            if hackathon_id not in assigned_ids:
                raise HTTPException(status_code=403, detail="You are not assigned to this hackathon.")
            query = query.filter(Registration.hackathon_id == hackathon_id)
        else:
            query = query.filter(Registration.hackathon_id.in_(assigned_ids))
    elif current_user.role == UserRole.ADMIN:
        if hackathon_id:
            query = query.filter(Registration.hackathon_id == hackathon_id)
    else:
        raise HTTPException(status_code=403, detail="Only admin or coordinator can list all registrations.")

    registrations = query.order_by(Registration.created_at.desc()).all()
    results = [RegistrationResponse.from_orm(r) for r in registrations]
    return StandardResponse(
        success=True,
        message=f"Found {len(results)} registration(s).",
        data=results
    )


@router.post("", response_model=StandardResponse[RegistrationResponse])
def create_registration(
    payload: RegistrationCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Register a team for a hackathon with an optional problem statement selection.
    Business rules enforced:
    - Student must be a member of the team.
    - Hackathon must exist.
    - Problem statement (if provided) must belong to the hackathon.
    - Team cannot register for the same hackathon twice.
    """
    # Validate team exists and current user is a member
    team = db.query(Team).filter(Team.id == payload.team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found.")

    membership = db.query(TeamMember).filter(
        TeamMember.team_id == payload.team_id,
        TeamMember.user_id == current_user.id
    ).first()
    if not membership:
        raise HTTPException(
            status_code=403,
            detail="You must be a member of this team to register."
        )

    # Validate hackathon exists
    hackathon = db.query(Hackathon).filter(Hackathon.id == payload.hackathon_id).first()
    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found.")

    if hackathon.registration_deadline and datetime.utcnow() > hackathon.registration_deadline:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The registration deadline has passed."
        )

    # Validate team belongs to this hackathon
    if team.hackathon_id != hackathon.id:
        raise HTTPException(
            status_code=400,
            detail="This team was not created for the selected hackathon."
        )

    # Validate problem statement belongs to hackathon
    if payload.problem_statement_id:
        _ensure_problem_selection_is_open(hackathon)
        ps = db.query(ProblemStatement).filter(
            ProblemStatement.id == payload.problem_statement_id,
            ProblemStatement.hackathon_id == hackathon.id
        ).first()
        if not ps:
            raise HTTPException(
                status_code=400,
                detail="Selected problem statement does not belong to this hackathon."
            )

    # Check for duplicate registration
    existing_registration = db.query(Registration).filter(
        Registration.team_id == payload.team_id,
        Registration.hackathon_id == payload.hackathon_id
    ).first()
    if existing_registration:
        raise HTTPException(
            status_code=409,
            detail="Your team is already registered for this hackathon."
        )

    # Validate team member count against hackathon rules
    team_members = db.query(TeamMember).filter(TeamMember.team_id == team.id).all()
    member_count = len(team_members)

    is_strict = getattr(hackathon, 'is_strict_team_size', False)
    strict_size = getattr(hackathon, 'strict_team_size', None)

    if is_strict and strict_size:
        if member_count != strict_size:
            raise HTTPException(
                status_code=400,
                detail=f"Registration failed: This hackathon requires exactly {strict_size} team members. Your team currently has {member_count} member(s)."
            )
    else:
        if member_count < hackathon.min_team_size:
            raise HTTPException(
                status_code=400,
                detail=f"Registration failed: Team must have at least {hackathon.min_team_size} member(s). Your team currently has {member_count} member(s)."
            )
        if member_count > hackathon.max_team_size:
            raise HTTPException(
                status_code=400,
                detail=f"Registration failed: Team cannot exceed {hackathon.max_team_size} members. Your team currently has {member_count} member(s)."
            )

    # Check for conflict: ensure NO member of this team is in another registered team for this hackathon
    member_user_ids = [m.user_id for m in team_members]
    other_registrations = db.query(Registration.team_id).filter(
        Registration.hackathon_id == hackathon.id,
        Registration.team_id != team.id
    ).subquery()

    conflict = db.query(TeamMember, User).join(User, TeamMember.user_id == User.id).filter(
        TeamMember.team_id.in_(other_registrations),
        TeamMember.user_id.in_(member_user_ids)
    ).first()

    if conflict:
        tm_obj, user_obj = conflict
        raise HTTPException(
            status_code=400,
            detail=f"Registration failed: Student '{user_obj.full_name}' is already registered with another team in this hackathon."
        )

    registration = Registration(
        team_id=payload.team_id,
        hackathon_id=payload.hackathon_id,
        problem_statement_id=payload.problem_statement_id,
        registered_by_id=current_user.id,
        status=RegistrationStatus.REGISTERED
    )
    db.add(registration)
    db.commit()
    db.refresh(registration)

    return StandardResponse(
        success=True,
        message=f"Team '{team.name}' successfully registered for '{hackathon.title}'!",
        data=RegistrationResponse.from_orm(registration)
    )


@router.get("/my", response_model=StandardResponse[List[RegistrationResponse]])
def get_my_registrations(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get all registrations for teams the current user belongs to.
    """
    # Get all team IDs the user belongs to
    memberships = db.query(TeamMember).filter(TeamMember.user_id == current_user.id).all()
    team_ids = [m.team_id for m in memberships]

    if not team_ids:
        return StandardResponse(
            success=True,
            message="No registrations found.",
            data=[]
        )

    registrations = db.query(Registration).filter(
        Registration.team_id.in_(team_ids)
    ).order_by(Registration.created_at.desc()).all()

    results = [RegistrationResponse.from_orm(r) for r in registrations]
    return StandardResponse(
        success=True,
        message="Registrations retrieved successfully.",
        data=results
    )


@router.get("/{registration_id}", response_model=StandardResponse[RegistrationResponse])
def get_registration(
    registration_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific registration by ID."""
    registration = db.query(Registration).filter(Registration.id == registration_id).first()
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found.")

    return StandardResponse(
        success=True,
        message="Registration retrieved.",
        data=RegistrationResponse.from_orm(registration)
    )


@router.put("/{registration_id}/problem-statement", response_model=StandardResponse[RegistrationResponse])
def select_problem_statement(
    registration_id: str,
    payload: dict,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Allows any team member to select or change their problem statement choice.
    Used particularly for hackathons that release problem statements on the event day.
    """
    registration = db.query(Registration).filter(Registration.id == registration_id).first()
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found.")

    team = registration.team
    if not team:
        raise HTTPException(status_code=404, detail="Associated team not found.")

    membership = db.query(TeamMember).filter(
        TeamMember.team_id == team.id,
        TeamMember.user_id == current_user.id
    ).first()
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team members can select or modify the problem statement choice."
        )

    hackathon = registration.hackathon
    _ensure_problem_selection_is_open(hackathon)

    ps_id = payload.get("problem_statement_id")
    if not ps_id:
        raise HTTPException(status_code=400, detail="problem_statement_id is required.")

    # Validate problem statement belongs to this hackathon
    ps = db.query(ProblemStatement).filter(
        ProblemStatement.id == ps_id,
        ProblemStatement.hackathon_id == registration.hackathon_id
    ).first()
    if not ps:
        raise HTTPException(
            status_code=400,
            detail="Selected problem statement does not belong to this hackathon."
        )

    registration.problem_statement_id = ps_id
    db.commit()
    db.refresh(registration)

    return StandardResponse(
        success=True,
        message=f"Successfully selected problem statement '{ps.title}' for team '{team.name}'!",
        data=RegistrationResponse.from_orm(registration)
    )
