import secrets
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.team import Team, TeamMember, TeamStatus, MemberRole
from app.models.hackathon import Hackathon
from app.models.user import User
from app.schemas.team import TeamCreate, TeamJoin, TeamResponse
from app.schemas.response import StandardResponse
from app.api.deps import get_current_active_user

router = APIRouter(prefix="/teams", tags=["Teams"])

@router.get("", response_model=StandardResponse[List[TeamResponse]])
def list_teams(
    hackathon_id: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(Team)
    if hackathon_id:
        query = query.filter(Team.hackathon_id == hackathon_id)
    
    teams = query.order_by(Team.created_at.desc()).all()
    results = [TeamResponse.from_orm(t) for t in teams]
    return StandardResponse(
        success=True,
        message="Teams list retrieved.",
        data=results
    )

@router.get("/my-teams", response_model=StandardResponse[List[TeamResponse]])
def get_my_teams(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    member_records = db.query(TeamMember).filter(TeamMember.user_id == current_user.id).all()
    team_ids = [m.team_id for m in member_records]

    teams = db.query(Team).filter(Team.id.in_(team_ids)).all() if team_ids else []
    results = [TeamResponse.from_orm(t) for t in teams]

    return StandardResponse(
        success=True,
        message="User teams retrieved.",
        data=results
    )

@router.post("", response_model=StandardResponse[TeamResponse])
def create_team(
    payload: TeamCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    hackathon = db.query(Hackathon).filter(Hackathon.id == payload.hackathon_id).first()
    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found.")

    join_code = secrets.token_hex(4).upper()
    team = Team(
        hackathon_id=hackathon.id,
        name=payload.name,
        join_code=join_code,
        leader_id=current_user.id,
        status=TeamStatus.APPROVED
    )
    db.add(team)
    db.flush()

    leader_member = TeamMember(
        team_id=team.id,
        user_id=current_user.id,
        role_in_team=MemberRole.LEADER
    )
    db.add(leader_member)
    db.commit()
    db.refresh(team)

    return StandardResponse(
        success=True,
        message=f"Team '{team.name}' created with Join Code: {join_code}",
        data=TeamResponse.from_orm(team)
    )

@router.post("/join", response_model=StandardResponse[TeamResponse])
def join_team(
    payload: TeamJoin,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    team = db.query(Team).filter(Team.join_code == payload.join_code.strip().upper()).first()
    if not team:
        raise HTTPException(status_code=404, detail="Invalid team join code.")

    existing_member = db.query(TeamMember).filter(
        TeamMember.team_id == team.id,
        TeamMember.user_id == current_user.id
    ).first()
    if existing_member:
        raise HTTPException(status_code=400, detail="You are already a member of this team.")

    new_member = TeamMember(
        team_id=team.id,
        user_id=current_user.id,
        role_in_team=MemberRole.MEMBER
    )
    db.add(new_member)
    db.commit()
    db.refresh(team)

    return StandardResponse(
        success=True,
        message=f"Successfully joined team '{team.name}'!",
        data=TeamResponse.from_orm(team)
    )
