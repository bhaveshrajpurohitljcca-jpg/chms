from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.hackathon import Hackathon, ProblemStatement, HackathonStatus
from app.models.registration import Registration
from app.models.user import User, UserRole
from app.schemas.hackathon import (
    HackathonCreate, HackathonUpdate, HackathonResponse,
    ProblemStatementCreate, ProblemStatementUpdate, ProblemStatementResponse
)
from app.schemas.response import StandardResponse
from app.api.deps import get_current_active_user, RoleChecker

router = APIRouter(prefix="/hackathons", tags=["Hackathons"])

# ─── Hackathon READ ─────────────────────────────────────────────────────────

@router.get("", response_model=StandardResponse[List[HackathonResponse]])
def list_hackathons(
    status_filter: Optional[HackathonStatus] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Hackathon)
    if status_filter:
        query = query.filter(Hackathon.status == status_filter)
    hackathons = query.order_by(Hackathon.created_at.desc()).all()
    results = [HackathonResponse.from_orm(h) for h in hackathons]
    return StandardResponse(
        success=True,
        message="Hackathons retrieved successfully.",
        data=results
    )

@router.get("/{hackathon_id}", response_model=StandardResponse[HackathonResponse])
def get_hackathon(hackathon_id: str, db: Session = Depends(get_db)):
    hackathon = db.query(Hackathon).filter(Hackathon.id == hackathon_id).first()
    if not hackathon:
        hackathon = db.query(Hackathon).filter(Hackathon.slug == hackathon_id).first()
    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found.")
    return StandardResponse(
        success=True,
        message="Hackathon details retrieved.",
        data=HackathonResponse.from_orm(hackathon)
    )

# ─── Hackathon CREATE ────────────────────────────────────────────────────────

@router.post("", response_model=StandardResponse[HackathonResponse])
def create_hackathon(
    payload: HackathonCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(RoleChecker([UserRole.ADMIN, UserRole.COORDINATOR]))
):
    existing = db.query(Hackathon).filter(Hackathon.slug == payload.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Hackathon with this slug already exists.")

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
        banner_url=payload.banner_url
    )
    db.add(hackathon)
    db.commit()
    db.refresh(hackathon)

    return StandardResponse(
        success=True,
        message="Hackathon created successfully.",
        data=HackathonResponse.from_orm(hackathon)
    )

# ─── Hackathon UPDATE ────────────────────────────────────────────────────────

@router.put("/{hackathon_id}", response_model=StandardResponse[HackathonResponse])
def update_hackathon(
    hackathon_id: str,
    payload: HackathonUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(RoleChecker([UserRole.ADMIN, UserRole.COORDINATOR]))
):
    hackathon = db.query(Hackathon).filter(Hackathon.id == hackathon_id).first()
    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found.")

    # Check slug uniqueness if being changed
    if payload.slug and payload.slug != hackathon.slug:
        slug_conflict = db.query(Hackathon).filter(
            Hackathon.slug == payload.slug,
            Hackathon.id != hackathon_id
        ).first()
        if slug_conflict:
            raise HTTPException(status_code=400, detail="A hackathon with this slug already exists.")

    update_data = payload.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(hackathon, field, value)

    db.commit()
    db.refresh(hackathon)

    return StandardResponse(
        success=True,
        message="Hackathon updated successfully.",
        data=HackathonResponse.from_orm(hackathon)
    )

# ─── Hackathon DELETE ────────────────────────────────────────────────────────

@router.delete("/{hackathon_id}", response_model=StandardResponse[dict])
def delete_hackathon(
    hackathon_id: str,
    force: bool = False,
    db: Session = Depends(get_db),
    admin: User = Depends(RoleChecker([UserRole.ADMIN, UserRole.COORDINATOR]))
):
    """
    Delete a hackathon. If it has active registrations and force=False,
    the hackathon will be cancelled (status=ended) instead of deleted.
    Pass ?force=true to hard-delete along with all cascade dependencies.
    """
    hackathon = db.query(Hackathon).filter(Hackathon.id == hackathon_id).first()
    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found.")

    registration_count = db.query(Registration).filter(
        Registration.hackathon_id == hackathon_id
    ).count()

    if registration_count > 0 and not force:
        # Soft cancel instead of destructive delete
        hackathon.status = HackathonStatus.ENDED
        db.commit()
        return StandardResponse(
            success=True,
            message=f"Hackathon has {registration_count} registration(s). "
                    f"It has been cancelled (status set to 'ended') instead of deleted. "
                    f"Use ?force=true to hard-delete all data.",
            data={"cancelled": True, "registration_count": registration_count}
        )

    db.delete(hackathon)
    db.commit()

    return StandardResponse(
        success=True,
        message="Hackathon deleted successfully.",
        data={"deleted": True}
    )

# ─── Problem Statement LIST ──────────────────────────────────────────────────

@router.get("/{hackathon_id}/problem-statements", response_model=StandardResponse[List[ProblemStatementResponse]])
def list_problem_statements(
    hackathon_id: str,
    db: Session = Depends(get_db)
):
    hackathon = db.query(Hackathon).filter(Hackathon.id == hackathon_id).first()
    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found.")

    results = [ProblemStatementResponse.from_orm(ps) for ps in hackathon.problem_statements]
    return StandardResponse(
        success=True,
        message="Problem statements retrieved.",
        data=results
    )

# ─── Problem Statement CREATE ────────────────────────────────────────────────

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

# ─── Problem Statement UPDATE ────────────────────────────────────────────────

@router.put("/{hackathon_id}/problem-statements/{ps_id}", response_model=StandardResponse[ProblemStatementResponse])
def update_problem_statement(
    hackathon_id: str,
    ps_id: str,
    payload: ProblemStatementUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(RoleChecker([UserRole.ADMIN, UserRole.COORDINATOR]))
):
    hackathon = db.query(Hackathon).filter(Hackathon.id == hackathon_id).first()
    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found.")

    ps = db.query(ProblemStatement).filter(
        ProblemStatement.id == ps_id,
        ProblemStatement.hackathon_id == hackathon_id
    ).first()
    if not ps:
        raise HTTPException(status_code=404, detail="Problem statement not found.")

    update_data = payload.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(ps, field, value)

    db.commit()
    db.refresh(ps)

    return StandardResponse(
        success=True,
        message="Problem statement updated successfully.",
        data=ProblemStatementResponse.from_orm(ps)
    )

# ─── Problem Statement DELETE ────────────────────────────────────────────────

@router.delete("/{hackathon_id}/problem-statements/{ps_id}", response_model=StandardResponse[dict])
def delete_problem_statement(
    hackathon_id: str,
    ps_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(RoleChecker([UserRole.ADMIN, UserRole.COORDINATOR]))
):
    hackathon = db.query(Hackathon).filter(Hackathon.id == hackathon_id).first()
    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found.")

    ps = db.query(ProblemStatement).filter(
        ProblemStatement.id == ps_id,
        ProblemStatement.hackathon_id == hackathon_id
    ).first()
    if not ps:
        raise HTTPException(status_code=404, detail="Problem statement not found.")

    db.delete(ps)
    db.commit()

    return StandardResponse(
        success=True,
        message="Problem statement deleted successfully.",
        data={"deleted": True}
    )
