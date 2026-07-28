from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from app.models.submission import Submission, JudgeAssignment
from app.models.hackathon import Hackathon, CoordinatorAssignment
from app.api.deps import get_current_active_user, RoleChecker
from app.schemas.response import StandardResponse

router = APIRouter(prefix="/assignments", tags=["Assignments"])

# ─────────────────────────────────────────────────────────────
# PYDANTIC SCHEMAS
# ─────────────────────────────────────────────────────────────
class JudgeAssignmentCreate(BaseModel):
    judge_id: str
    hackathon_id: str
    submission_id: Optional[str] = None

class JudgeAssignmentResponse(BaseModel):
    id: str
    judge_id: str
    hackathon_id: str
    submission_id: Optional[str] = None
    judge_name: str
    judge_email: str
    hackathon_name: str
    team_name: Optional[str] = None

    class Config:
        orm_mode = True
        from_attributes = True

class CoordinatorAssignmentCreate(BaseModel):
    coordinator_id: str
    hackathon_id: str

class CoordinatorAssignmentResponse(BaseModel):
    id: str
    coordinator_id: str
    hackathon_id: str
    coordinator_name: str
    coordinator_email: str
    hackathon_name: str

    class Config:
        orm_mode = True
        from_attributes = True

# ─────────────────────────────────────────────────────────────
# COORDINATOR ASSIGNMENTS ENDPOINTS
# ─────────────────────────────────────────────────────────────
@router.get("/coordinators", response_model=StandardResponse[List[CoordinatorAssignmentResponse]])
def list_coordinator_assignments(
    db: Session = Depends(get_db),
    admin_user: User = Depends(RoleChecker([UserRole.ADMIN]))
):
    """List all coordinator assignments in the system."""
    assigns = db.query(CoordinatorAssignment).all()
    results = []
    for a in assigns:
        coord = db.query(User).filter(User.id == a.coordinator_id).first()
        hack = db.query(Hackathon).filter(Hackathon.id == a.hackathon_id).first()
        if coord and hack:
            results.append(
                CoordinatorAssignmentResponse(
                    id=a.id,
                    coordinator_id=a.coordinator_id,
                    hackathon_id=a.hackathon_id,
                    coordinator_name=coord.full_name,
                    coordinator_email=coord.email,
                    hackathon_name=hack.title
                )
            )
    return StandardResponse(
        success=True,
        message="Coordinator assignments list retrieved.",
        data=results
    )

@router.post("/coordinators", response_model=StandardResponse[CoordinatorAssignmentResponse])
def assign_coordinator(
    payload: CoordinatorAssignmentCreate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(RoleChecker([UserRole.ADMIN]))
):
    """Assign a hackathon scope to a coordinator."""
    coord = db.query(User).filter(User.id == payload.coordinator_id, User.role == UserRole.COORDINATOR).first()
    if not coord:
        raise HTTPException(status_code=404, detail="Coordinator user not found.")
    
    hack = db.query(Hackathon).filter(Hackathon.id == payload.hackathon_id).first()
    if not hack:
        raise HTTPException(status_code=404, detail="Hackathon not found.")

    existing = db.query(CoordinatorAssignment).filter(
        CoordinatorAssignment.coordinator_id == payload.coordinator_id,
        CoordinatorAssignment.hackathon_id == payload.hackathon_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=409, detail="This coordinator is already assigned to this hackathon.")

    new_assign = CoordinatorAssignment(
        coordinator_id=payload.coordinator_id,
        hackathon_id=payload.hackathon_id
    )
    db.add(new_assign)
    db.commit()
    db.refresh(new_assign)

    return StandardResponse(
        success=True,
        message="Hackathon scope assigned to coordinator.",
        data=CoordinatorAssignmentResponse(
            id=new_assign.id,
            coordinator_id=new_assign.coordinator_id,
            hackathon_id=new_assign.hackathon_id,
            coordinator_name=coord.full_name,
            coordinator_email=coord.email,
            hackathon_name=hack.title
        )
    )

@router.delete("/coordinators/{coordinator_id}/{hackathon_id}", response_model=StandardResponse[dict])
def revoke_coordinator_assignment(
    coordinator_id: str,
    hackathon_id: str,
    db: Session = Depends(get_db),
    admin_user: User = Depends(RoleChecker([UserRole.ADMIN]))
):
    """Revoke a coordinator's hackathon scope assignment."""
    assign = db.query(CoordinatorAssignment).filter(
        CoordinatorAssignment.coordinator_id == coordinator_id,
        CoordinatorAssignment.hackathon_id == hackathon_id
    ).first()
    if not assign:
        raise HTTPException(status_code=404, detail="Coordinator assignment not found.")
    
    db.delete(assign)
    db.commit()
    return StandardResponse(
        success=True,
        message="Coordinator scope revoked.",
        data={}
    )

# ─────────────────────────────────────────────────────────────
# JUDGE ASSIGNMENTS ENDPOINTS
# ─────────────────────────────────────────────────────────────
@router.get("/judges", response_model=StandardResponse[List[JudgeAssignmentResponse]])
def list_judge_assignments(
    db: Session = Depends(get_db),
    admin_user: User = Depends(RoleChecker([UserRole.ADMIN]))
):
    """List all judge assignments in the system."""
    assigns = db.query(JudgeAssignment).all()
    results = []
    for a in assigns:
        judge = db.query(User).filter(User.id == a.judge_id).first()
        hack = db.query(Hackathon).filter(Hackathon.id == a.hackathon_id).first()
        if judge and hack:
            team_name = None
            if a.submission_id:
                sub = db.query(Submission).filter(Submission.id == a.submission_id).first()
                if sub and sub.team:
                    team_name = sub.team.name
            results.append(
                JudgeAssignmentResponse(
                    id=a.id,
                    judge_id=a.judge_id,
                    hackathon_id=a.hackathon_id,
                    submission_id=a.submission_id,
                    judge_name=judge.full_name,
                    judge_email=judge.email,
                    hackathon_name=hack.title,
                    team_name=team_name
                )
            )
    return StandardResponse(
        success=True,
        message="Judge assignments list retrieved.",
        data=results
    )

@router.post("/judges", response_model=StandardResponse[JudgeAssignmentResponse])
def assign_judge(
    payload: JudgeAssignmentCreate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(RoleChecker([UserRole.ADMIN]))
):
    """Assign a hackathon or specific submission to a judge."""
    judge = db.query(User).filter(User.id == payload.judge_id, User.role == UserRole.JUDGE).first()
    if not judge:
        raise HTTPException(status_code=404, detail="Judge user not found.")

    hack = db.query(Hackathon).filter(Hackathon.id == payload.hackathon_id).first()
    if not hack:
        raise HTTPException(status_code=404, detail="Hackathon not found.")

    team_name = None
    if payload.submission_id:
        sub = db.query(Submission).filter(Submission.id == payload.submission_id).first()
        if not sub:
            raise HTTPException(status_code=404, detail="Submission not found.")
        if sub.team:
            team_name = sub.team.name

    existing = db.query(JudgeAssignment).filter(
        JudgeAssignment.judge_id == payload.judge_id,
        JudgeAssignment.hackathon_id == payload.hackathon_id,
        JudgeAssignment.submission_id == payload.submission_id
    ).first()

    if existing:
        raise HTTPException(status_code=409, detail="This assignment already exists for the judge.")

    new_assign = JudgeAssignment(
        judge_id=payload.judge_id,
        hackathon_id=payload.hackathon_id,
        submission_id=payload.submission_id
    )
    db.add(new_assign)
    db.commit()
    db.refresh(new_assign)

    return StandardResponse(
        success=True,
        message="Judge assignment created.",
        data=JudgeAssignmentResponse(
            id=new_assign.id,
            judge_id=new_assign.judge_id,
            hackathon_id=new_assign.hackathon_id,
            submission_id=new_assign.submission_id,
            judge_name=judge.full_name,
            judge_email=judge.email,
            hackathon_name=hack.title,
            team_name=team_name
        )
    )

@router.delete("/judges/{judge_id}/{hackathon_id}", response_model=StandardResponse[dict])
def revoke_judge_hackathon_assignment(
    judge_id: str,
    hackathon_id: str,
    db: Session = Depends(get_db),
    admin_user: User = Depends(RoleChecker([UserRole.ADMIN]))
):
    """Revoke a judge's hackathon scope assignment (and all associated submissions)."""
    hack_assign = db.query(JudgeAssignment).filter(
        JudgeAssignment.judge_id == judge_id,
        JudgeAssignment.hackathon_id == hackathon_id,
        JudgeAssignment.submission_id.is_(None)
    ).first()
    
    sub_assigns = db.query(JudgeAssignment).filter(
        JudgeAssignment.judge_id == judge_id,
        JudgeAssignment.hackathon_id == hackathon_id
    ).all()

    if not sub_assigns and not hack_assign:
        raise HTTPException(status_code=404, detail="Judge hackathon assignment not found.")

    for assign in sub_assigns:
        db.delete(assign)
    if hack_assign:
        db.delete(hack_assign)
        
    db.commit()
    return StandardResponse(
        success=True,
        message="Judge hackathon assignments revoked.",
        data={}
    )

@router.delete("/judges/{judge_id}/{hackathon_id}/{submission_id}", response_model=StandardResponse[dict])
def revoke_judge_submission_assignment(
    judge_id: str,
    hackathon_id: str,
    submission_id: str,
    db: Session = Depends(get_db),
    admin_user: User = Depends(RoleChecker([UserRole.ADMIN]))
):
    """Revoke a judge's assignment to a specific team submission."""
    assign = db.query(JudgeAssignment).filter(
        JudgeAssignment.judge_id == judge_id,
        JudgeAssignment.hackathon_id == hackathon_id,
        JudgeAssignment.submission_id == submission_id
    ).first()
    if not assign:
        raise HTTPException(status_code=404, detail="Judge submission assignment not found.")
    
    db.delete(assign)
    db.commit()
    return StandardResponse(
        success=True,
        message="Judge submission assignment revoked.",
        data={}
    )
