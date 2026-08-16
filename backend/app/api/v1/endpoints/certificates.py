import json
import os
import secrets
import shutil
from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import RoleChecker, get_current_active_user
from app.database import get_db
from app.models.certificate import Certificate, CertificateTemplate
from app.models.hackathon import CoordinatorAssignment, Hackathon, HackathonStatus
from app.models.registration import Registration, RegistrationStatus
from app.models.submission import Submission
from app.models.team import Team, TeamMember
from app.models.user import User, UserRole
from app.schemas.certificate import (
    CertificateGenerateRequest,
    CertificateResponse,
    CertificateRevokeRequest,
    CertificateTemplateCreate,
    CertificateTemplateResponse,
    CertificateTemplateUpdate,
)
from app.schemas.response import StandardResponse


router = APIRouter(prefix="/certificates", tags=["Certificates"])
ALLOWED_PLACEHOLDERS = {
    "student_name", "team_name", "hackathon_title", "certificate_type", "issue_date", "verification_id", "award_label",
}
ALLOWED_UPLOAD_TYPES = {"image/png", "image/jpeg", "application/pdf"}


def _ensure_template_scope(db: Session, user: User, hackathon_id: str) -> None:
    if user.role == UserRole.ADMIN:
        return
    if user.role == UserRole.COORDINATOR and db.query(CoordinatorAssignment).filter(
        CoordinatorAssignment.coordinator_id == user.id,
        CoordinatorAssignment.hackathon_id == hackathon_id,
    ).first():
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You are not assigned to manage certificates for this hackathon.")


def _validate_layout(layout: list[dict]) -> None:
    if len(layout) > 20:
        raise HTTPException(status_code=400, detail="A certificate template can contain at most 20 fields.")
    for field in layout:
        if field.get("key") not in ALLOWED_PLACEHOLDERS:
            raise HTTPException(status_code=400, detail="Template contains an unsupported dynamic field.")
        for position in ("x", "y"):
            value = field.get(position, 50)
            if not isinstance(value, (int, float)) or value < 0 or value > 100:
                raise HTTPException(status_code=400, detail="Field positions must be between 0 and 100.")


def _template_response(template: CertificateTemplate) -> CertificateTemplateResponse:
    try:
        layout = json.loads(template.field_layout or "[]")
    except json.JSONDecodeError:
        layout = []
    return CertificateTemplateResponse(
        id=template.id, hackathon_id=template.hackathon_id, name=template.name,
        recipient_type=template.recipient_type, certificate_type=template.certificate_type,
        background_url=template.background_url, field_layout=layout, is_published=template.is_published,
        published_at=template.published_at, created_at=template.created_at,
    )


def _participant_eligibility(db: Session, user: User, hackathon_id: str) -> Optional[dict]:
    member = db.query(TeamMember).join(Team).join(Registration).filter(
        TeamMember.user_id == user.id,
        Team.hackathon_id == hackathon_id,
        Registration.hackathon_id == hackathon_id,
        Registration.status == RegistrationStatus.REGISTERED,
    ).first()
    if not member:
        return None
    team = member.team
    submission = db.query(Submission).filter(
        Submission.team_id == team.id, Submission.hackathon_id == hackathon_id
    ).first()
    award_label = None
    if submission and submission.final_rank:
        award_label = "Winner" if submission.final_rank == 1 else f"Finalist Rank {submission.final_rank}"
    return {"team": team, "award_label": award_label}


def _coordinator_eligibility(db: Session, user: User, hackathon_id: str) -> Optional[dict]:
    assignment = db.query(CoordinatorAssignment).filter(
        CoordinatorAssignment.coordinator_id == user.id,
        CoordinatorAssignment.hackathon_id == hackathon_id,
    ).first()
    return {} if assignment else None


def _certificate_response(certificate: Certificate) -> CertificateResponse:
    return CertificateResponse(
        id=certificate.id, verification_id=certificate.verification_id, template_id=certificate.template_id,
        hackathon_id=certificate.hackathon_id, hackathon_title=certificate.hackathon.title,
        certificate_type=certificate.certificate_type, recipient_name=certificate.recipient_name,
        team_name=certificate.team_name, award_label=certificate.award_label,
        issued_at=certificate.issued_at, revoked_at=certificate.revoked_at,
        template=_template_response(certificate.template),
    )


@router.get("/templates", response_model=StandardResponse[list[CertificateTemplateResponse]])
def list_templates(
    hackathon_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.COORDINATOR, UserRole.ADMIN])),
):
    _ensure_template_scope(db, current_user, hackathon_id)
    templates = db.query(CertificateTemplate).filter(CertificateTemplate.hackathon_id == hackathon_id).order_by(CertificateTemplate.created_at.desc()).all()
    return StandardResponse(message="Certificate templates retrieved.", data=[_template_response(item) for item in templates])


@router.post("/templates", response_model=StandardResponse[CertificateTemplateResponse])
def create_template(
    payload: CertificateTemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.COORDINATOR, UserRole.ADMIN])),
):
    _ensure_template_scope(db, current_user, payload.hackathon_id)
    if not db.query(Hackathon).filter(Hackathon.id == payload.hackathon_id).first():
        raise HTTPException(status_code=404, detail="Hackathon not found.")
    _validate_layout(payload.field_layout)
    template = CertificateTemplate(
        hackathon_id=payload.hackathon_id, created_by_id=current_user.id, name=payload.name,
        recipient_type=payload.recipient_type, certificate_type=payload.certificate_type,
        field_layout=json.dumps(payload.field_layout),
    )
    db.add(template)
    db.commit()
    db.refresh(template)
    return StandardResponse(message="Certificate template created. Upload a background and publish it when ready.", data=_template_response(template))


@router.put("/templates/{template_id}", response_model=StandardResponse[CertificateTemplateResponse])
def update_template(
    template_id: str,
    payload: CertificateTemplateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.COORDINATOR, UserRole.ADMIN])),
):
    template = db.query(CertificateTemplate).filter(CertificateTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Certificate template not found.")
    _ensure_template_scope(db, current_user, template.hackathon_id)
    updates = payload.model_dump(exclude_unset=True)
    if "field_layout" in updates:
        _validate_layout(updates["field_layout"])
        template.field_layout = json.dumps(updates.pop("field_layout"))
    if updates.get("is_published") and not template.background_url:
        raise HTTPException(status_code=400, detail="Upload a certificate background before publishing.")
    for name, value in updates.items():
        setattr(template, name, value)
    if payload.is_published is True:
        template.published_at = datetime.utcnow()
    if payload.is_published is False:
        template.published_at = None
    db.commit()
    db.refresh(template)
    return StandardResponse(message="Certificate template updated.", data=_template_response(template))


@router.post("/templates/{template_id}/background", response_model=StandardResponse[CertificateTemplateResponse])
def upload_template_background(
    template_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.COORDINATOR, UserRole.ADMIN])),
):
    template = db.query(CertificateTemplate).filter(CertificateTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Certificate template not found.")
    _ensure_template_scope(db, current_user, template.hackathon_id)
    if file.content_type not in ALLOWED_UPLOAD_TYPES:
        raise HTTPException(status_code=400, detail="Upload a PNG, JPG, or PDF certificate background.")
    extension = Path(file.filename or "").suffix.lower()
    if extension not in {".png", ".jpg", ".jpeg", ".pdf"}:
        raise HTTPException(status_code=400, detail="Unsupported certificate template file extension.")
    directory = Path("uploads") / "certificates"
    directory.mkdir(parents=True, exist_ok=True)
    filename = f"{template.id}-{secrets.token_hex(8)}{extension}"
    with (directory / filename).open("wb") as destination:
        shutil.copyfileobj(file.file, destination)
    template.background_url = f"/uploads/certificates/{filename}"
    db.commit()
    db.refresh(template)
    return StandardResponse(message="Certificate background uploaded.", data=_template_response(template))


@router.get("/mine", response_model=StandardResponse[list[CertificateResponse]])
def list_my_certificates(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)
):
    certificates = db.query(Certificate).filter(Certificate.recipient_id == current_user.id).order_by(Certificate.issued_at.desc()).all()
    return StandardResponse(message="Issued certificates retrieved.", data=[_certificate_response(item) for item in certificates])


@router.get("/available", response_model=StandardResponse[list[CertificateTemplateResponse]])
def list_available_templates(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)
):
    available = []
    for template in db.query(CertificateTemplate).filter(CertificateTemplate.is_published.is_(True)).all():
        hackathon = template.hackathon
        # Certificates open only after results are published or the event has ended.
        if not (hackathon.results_published or hackathon.status == HackathonStatus.ENDED):
            continue
        eligible = _participant_eligibility(db, current_user, hackathon.id) if template.recipient_type == "participant" else _coordinator_eligibility(db, current_user, hackathon.id)
        if eligible is not None:
            available.append(_template_response(template))
    return StandardResponse(message="Available certificate templates retrieved.", data=available)


@router.post("/templates/{template_id}/generate", response_model=StandardResponse[CertificateResponse])
def generate_certificate(
    template_id: str,
    payload: CertificateGenerateRequest,
    db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)
):
    template = db.query(CertificateTemplate).filter(
        CertificateTemplate.id == template_id, CertificateTemplate.is_published.is_(True)
    ).first()
    if not template:
        raise HTTPException(status_code=404, detail="Published certificate template not found.")
    hackathon = template.hackathon
    if not (hackathon.results_published or hackathon.status == HackathonStatus.ENDED):
        raise HTTPException(status_code=400, detail="Certificates are not available until this hackathon is complete.")
    eligibility = _participant_eligibility(db, current_user, hackathon.id) if template.recipient_type == "participant" else _coordinator_eligibility(db, current_user, hackathon.id)
    if eligibility is None:
        raise HTTPException(status_code=403, detail="You are not eligible for this certificate.")
    certificate = db.query(Certificate).filter(
        Certificate.template_id == template.id, Certificate.recipient_id == current_user.id
    ).first()
    if certificate:
        if certificate.revoked_at:
            raise HTTPException(status_code=403, detail="This certificate has been revoked. Contact the coordinator.")
        return StandardResponse(message="Certificate already issued.", data=_certificate_response(certificate))
    team = eligibility.get("team")
    certificate = Certificate(
        verification_id=f"CERT-{datetime.utcnow():%Y}-{secrets.token_hex(4).upper()}",
        template_id=template.id, hackathon_id=hackathon.id, recipient_id=current_user.id,
        team_id=team.id if team else None, certificate_type=template.certificate_type,
        recipient_name=(payload.display_name or current_user.full_name).strip(),
        team_name=team.name if team else None, award_label=eligibility.get("award_label"),
    )
    db.add(certificate)
    db.commit()
    db.refresh(certificate)
    return StandardResponse(message="Verified certificate generated.", data=_certificate_response(certificate))


@router.post("/{certificate_id}/revoke", response_model=StandardResponse[CertificateResponse])
def revoke_certificate(
    certificate_id: str,
    payload: CertificateRevokeRequest,
    db: Session = Depends(get_db), current_user: User = Depends(RoleChecker([UserRole.COORDINATOR, UserRole.ADMIN]))
):
    certificate = db.query(Certificate).filter(Certificate.id == certificate_id).first()
    if not certificate:
        raise HTTPException(status_code=404, detail="Certificate not found.")
    _ensure_template_scope(db, current_user, certificate.hackathon_id)
    certificate.revoked_at = datetime.utcnow()
    certificate.revoke_reason = payload.reason
    db.commit()
    db.refresh(certificate)
    return StandardResponse(message="Certificate revoked. The verification page now shows its invalid status.", data=_certificate_response(certificate))


@router.get("/verify/{verification_id}", response_model=StandardResponse[dict])
def verify_certificate(verification_id: str, db: Session = Depends(get_db)):
    certificate = db.query(Certificate).filter(Certificate.verification_id == verification_id).first()
    if not certificate:
        raise HTTPException(status_code=404, detail="Certificate not found.")
    return StandardResponse(message="Certificate verification retrieved.", data={
        "valid": certificate.revoked_at is None,
        "verification_id": certificate.verification_id,
        "recipient_name": certificate.recipient_name,
        "hackathon_title": certificate.hackathon.title,
        "certificate_type": certificate.certificate_type,
        "issued_at": certificate.issued_at,
        "revoked_at": certificate.revoked_at,
    })
