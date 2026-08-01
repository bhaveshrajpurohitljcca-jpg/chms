import secrets
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.team import Team, TeamMember, TeamStatus, MemberRole
from app.models.hackathon import Hackathon, CoordinatorAssignment
from app.models.user import User, UserRole
from app.models.invitation import TeamInvitation, InvitationStatus
from app.schemas.team import TeamCreate, TeamJoin, TeamResponse
from app.schemas.invitation import InvitationCreate, InvitationResponse
from app.schemas.response import StandardResponse
from app.schemas.user import UserResponse
from app.api.deps import get_current_active_user

router = APIRouter(prefix="/teams", tags=["Teams"])


@router.get("", response_model=StandardResponse[List[TeamResponse]])
def list_teams(
    hackathon_id: str = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    query = db.query(Team)
    
    if current_user.role == UserRole.COORDINATOR:
        # Get assigned hackathons for this coordinator
        assigned_ids = [a.hackathon_id for a in db.query(CoordinatorAssignment).filter(
            CoordinatorAssignment.coordinator_id == current_user.id
        ).all()]
        if hackathon_id:
            if hackathon_id not in assigned_ids:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied. This hackathon is not assigned to you."
                )
            query = query.filter(Team.hackathon_id == hackathon_id)
        else:
            query = query.filter(Team.hackathon_id.in_(assigned_ids))
    elif hackathon_id:
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

    # Prevent duplicate team participation in the same hackathon
    member_records = db.query(TeamMember).filter(TeamMember.user_id == current_user.id).all()
    team_ids = [m.team_id for m in member_records]
    if team_ids:
        already_joined = db.query(Team).filter(
            Team.id.in_(team_ids),
            Team.hackathon_id == hackathon.id
        ).first()
        if already_joined:
            raise HTTPException(
                status_code=400,
                detail="You are already participating in a team for this hackathon."
            )

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

    # Prevent duplicate team participation in the same hackathon
    member_records = db.query(TeamMember).filter(TeamMember.user_id == current_user.id).all()
    team_ids = [m.team_id for m in member_records]
    if team_ids:
        already_joined = db.query(Team).filter(
            Team.id.in_(team_ids),
            Team.hackathon_id == team.hackathon_id
        ).first()
        if already_joined:
            raise HTTPException(
                status_code=400,
                detail="You are already participating in a team for this hackathon."
            )

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


# ==========================================
# TEAM INVITATIONS
# ==========================================

@router.post("/{team_id}/invitations", response_model=StandardResponse[InvitationResponse])
def send_invitation(
    team_id: str,
    payload: InvitationCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Team Leader sends an invitation to a student by email."""
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found.")

    # Only the team leader can send invitations
    if team.leader_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the team leader can send invitations.")

    # Cannot invite yourself
    if payload.invitee_email.lower() == current_user.email.lower():
        raise HTTPException(status_code=400, detail="You cannot invite yourself.")

    # Check invitee exists in the system
    invitee = db.query(User).filter(User.email == payload.invitee_email).first()
    if not invitee:
        raise HTTPException(status_code=404, detail="No student account found with this email address.")

    # Check if invitee is already a member of this team
    existing_member = db.query(TeamMember).filter(
        TeamMember.team_id == team.id,
        TeamMember.user_id == invitee.id
    ).first()
    if existing_member:
        raise HTTPException(status_code=400, detail="This student is already a member of your team.")

    # Check team capacity from hackathon rules
    current_member_count = db.query(TeamMember).filter(TeamMember.team_id == team.id).count()
    hackathon = team.hackathon
    if current_member_count >= hackathon.max_team_size:
        raise HTTPException(
            status_code=400,
            detail=f"Team has reached the maximum capacity of {hackathon.max_team_size} members."
        )

    # Check for existing pending invitation
    existing_invite = db.query(TeamInvitation).filter(
        TeamInvitation.team_id == team.id,
        TeamInvitation.invitee_email == payload.invitee_email.lower(),
        TeamInvitation.status == InvitationStatus.PENDING
    ).first()
    if existing_invite:
        raise HTTPException(
            status_code=409,
            detail="A pending invitation has already been sent to this email address."
        )

    # Check for auto-accept feature
    if getattr(invitee, 'auto_accept_invites', False):
        # Auto-join logic
        new_member = TeamMember(
            team_id=team.id,
            user_id=invitee.id,
            role_in_team=MemberRole.MEMBER
        )
        db.add(new_member)
        
        # We still create an ACCEPTED invitation record for history/tracking
        invitation = TeamInvitation(
            team_id=team.id,
            invited_by_id=current_user.id,
            invitee_email=payload.invitee_email.lower(),
            status=InvitationStatus.ACCEPTED
        )
        db.add(invitation)
        db.commit()
        db.refresh(invitation)
        
        return StandardResponse(
            success=True,
            message=f"{invitee.full_name} had Auto-Join enabled and has been added to your team immediately!",
            data=InvitationResponse.from_orm(invitation)
        )

    # Standard invitation process
    invitation = TeamInvitation(
        team_id=team.id,
        invited_by_id=current_user.id,
        invitee_email=payload.invitee_email.lower(),
        status=InvitationStatus.PENDING
    )
    db.add(invitation)
    db.commit()
    db.refresh(invitation)

    return StandardResponse(
        success=True,
        message=f"Invitation sent to {payload.invitee_email}.",
        data=InvitationResponse.from_orm(invitation)
    )

@router.get("/{team_id}/eligible-users", response_model=StandardResponse[List[UserResponse]])
def get_eligible_users(
    team_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Returns a list of students who have NOT joined any team in the hackathon that this team belongs to.
    """
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found.")
        
    hackathon_id = team.hackathon_id
    
    # Subquery: get all user_ids of students who are already in a team for this hackathon
    busy_user_ids_query = db.query(TeamMember.user_id).join(Team).filter(Team.hackathon_id == hackathon_id)
    
    # Query: get all active students NOT in the subquery
    eligible_users = db.query(User).filter(
        User.role == UserRole.STUDENT,
        User.is_active == True,
        ~User.id.in_(busy_user_ids_query)
    ).limit(50).all()
    
    results = [UserResponse.from_orm(u) for u in eligible_users]
    
    return StandardResponse(
        success=True,
        message=f"Found {len(results)} eligible students.",
        data=results
    )


@router.get("/invitations/received", response_model=StandardResponse[List[InvitationResponse]])
def get_received_invitations(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Student views all invitations sent to their email."""
    invitations = db.query(TeamInvitation).filter(
        TeamInvitation.invitee_email == current_user.email.lower()
    ).order_by(TeamInvitation.created_at.desc()).all()

    results = [InvitationResponse.from_orm(inv) for inv in invitations]
    return StandardResponse(
        success=True,
        message="Received invitations retrieved.",
        data=results
    )


@router.get("/invitations/sent", response_model=StandardResponse[List[InvitationResponse]])
def get_sent_invitations(
    team_id: str = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Team leader views all invitations sent from their team(s)."""
    query = db.query(TeamInvitation).filter(TeamInvitation.invited_by_id == current_user.id)
    if team_id:
        query = query.filter(TeamInvitation.team_id == team_id)
    invitations = query.order_by(TeamInvitation.created_at.desc()).all()

    results = [InvitationResponse.from_orm(inv) for inv in invitations]
    return StandardResponse(
        success=True,
        message="Sent invitations retrieved.",
        data=results
    )


@router.post("/invitations/{invitation_id}/accept", response_model=StandardResponse[TeamResponse])
def accept_invitation(
    invitation_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Student accepts a team invitation and becomes a team member."""
    invitation = db.query(TeamInvitation).filter(TeamInvitation.id == invitation_id).first()
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found.")

    # Verify this invitation belongs to the current user
    if invitation.invitee_email.lower() != current_user.email.lower():
        raise HTTPException(status_code=403, detail="This invitation is not addressed to you.")

    if invitation.status != InvitationStatus.PENDING:
        raise HTTPException(
            status_code=400,
            detail=f"Invitation has already been {invitation.status.value}."
        )

    team = db.query(Team).filter(Team.id == invitation.team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team no longer exists.")

    # Prevent duplicate team participation in the same hackathon
    member_records = db.query(TeamMember).filter(TeamMember.user_id == current_user.id).all()
    team_ids = [m.team_id for m in member_records]
    if team_ids:
        already_joined = db.query(Team).filter(
            Team.id.in_(team_ids),
            Team.hackathon_id == team.hackathon_id
        ).first()
        if already_joined:
            raise HTTPException(
                status_code=400,
                detail="You are already participating in a team for this hackathon."
            )

    # Check capacity again at acceptance time
    current_member_count = db.query(TeamMember).filter(TeamMember.team_id == team.id).count()
    if current_member_count >= team.hackathon.max_team_size:
        invitation.status = InvitationStatus.REJECTED
        db.commit()
        raise HTTPException(
            status_code=400,
            detail="Team is now full. The invitation could not be accepted."
        )

    # Check if already a member (edge case)
    already_member = db.query(TeamMember).filter(
        TeamMember.team_id == team.id,
        TeamMember.user_id == current_user.id
    ).first()
    if already_member:
        invitation.status = InvitationStatus.ACCEPTED
        db.commit()
        raise HTTPException(status_code=400, detail="You are already a member of this team.")

    # Add to team
    new_member = TeamMember(
        team_id=team.id,
        user_id=current_user.id,
        role_in_team=MemberRole.MEMBER
    )
    db.add(new_member)

    invitation.status = InvitationStatus.ACCEPTED
    db.commit()
    db.refresh(team)

    return StandardResponse(
        success=True,
        message=f"You have joined team '{team.name}'!",
        data=TeamResponse.from_orm(team)
    )


@router.post("/invitations/{invitation_id}/reject", response_model=StandardResponse[InvitationResponse])
def reject_invitation(
    invitation_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Student rejects a team invitation."""
    invitation = db.query(TeamInvitation).filter(TeamInvitation.id == invitation_id).first()
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found.")

    if invitation.invitee_email.lower() != current_user.email.lower():
        raise HTTPException(status_code=403, detail="This invitation is not addressed to you.")

    if invitation.status != InvitationStatus.PENDING:
        raise HTTPException(
            status_code=400,
            detail=f"Invitation has already been {invitation.status.value}."
        )

    invitation.status = InvitationStatus.REJECTED
    db.commit()
    db.refresh(invitation)

    return StandardResponse(
        success=True,
        message="Invitation rejected.",
        data=InvitationResponse.from_orm(invitation)
    )
