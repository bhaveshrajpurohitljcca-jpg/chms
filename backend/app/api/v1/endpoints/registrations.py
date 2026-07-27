from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.registration import Registration, RegistrationStatus
from app.models.team import Team, TeamMember
from app.models.hackathon import Hackathon, ProblemStatement
from app.models.user import User
from app.schemas.registration import RegistrationCreate, RegistrationResponse
from app.schemas.response import StandardResponse
from app.api.deps import get_current_active_user

router = APIRouter(prefix="/registrations", tags=["Registrations"])


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

    # Validate team belongs to this hackathon
    if team.hackathon_id != hackathon.id:
        raise HTTPException(
            status_code=400,
            detail="This team was not created for the selected hackathon."
        )

    # Validate problem statement belongs to hackathon
    if payload.problem_statement_id:
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
