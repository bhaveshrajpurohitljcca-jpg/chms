import io
import json
import os
import secrets
import shutil
import tempfile
import httpx
from urllib.parse import urljoin
from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, Query, status
from fastapi.responses import FileResponse, Response
from sqlalchemy.orm import Session

from app.api.deps import RoleChecker, get_current_active_user, security
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
from app.config import settings


router = APIRouter(prefix="/certificates", tags=["Certificates"])
ALLOWED_PLACEHOLDERS = {
    "student_name", "team_name", "hackathon_title", "certificate_type", "issue_date", "verification_id", "award_label",
}
ALLOWED_UPLOAD_TYPES = {"image/png", "image/jpeg"}

def _storage_is_configured() -> bool:
    return bool(
        settings.SUPABASE_SERVICE_ROLE_KEY
        and settings.SUPABASE_URL
        and not settings.SUPABASE_URL.endswith("placeholder.supabase.co")
        and "yourproject.supabase.co" not in settings.SUPABASE_URL
    )


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
    background_url = template.background_url
    if template.background_storage_path and _storage_is_configured():
        try:
            response = httpx.post(f"{settings.SUPABASE_URL}/storage/v1/object/sign/{settings.SUPABASE_STORAGE_BUCKET}/{template.background_storage_path}", headers={"apikey": settings.SUPABASE_SERVICE_ROLE_KEY, "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}", "Content-Type": "application/json"}, json={"expiresIn": 3600}, timeout=10)
            if response.is_success:
                signed_url = response.json().get("signedURL", "")
                background_url = signed_url if signed_url.startswith("http") else urljoin(f"{settings.SUPABASE_URL}/storage/v1/", signed_url.lstrip("/"))
        except Exception:
            pass
    return CertificateTemplateResponse(
        id=template.id, hackathon_id=template.hackathon_id, name=template.name,
        recipient_type=template.recipient_type, certificate_type=template.certificate_type,
        background_url=background_url, background_storage_path=template.background_storage_path, field_layout=layout, is_published=template.is_published,
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
        pdf_url=certificate.pdf_url,
        template=_template_response(certificate.template),
    )

def _build_valid_certificate_pdf(certificate: Certificate) -> bytes:
    """Generate a standard, 100% valid PDF-1.4 binary file with exact xref table and fonts."""
    width = 842
    height = 595

    cert_type = (certificate.certificate_type or "Certificate of Participation").upper()
    recipient = certificate.recipient_name or "Participant"
    hack_title = certificate.hackathon.title if certificate.hackathon else "College Hackathon"
    team_info = f"Team: {certificate.team_name}" if certificate.team_name else ""
    award_info = f"Award: {certificate.award_label}" if certificate.award_label else ""
    issue_date = f"Issued on: {certificate.issued_at.strftime('%d %B %Y')}" if certificate.issued_at else ""
    verification = f"Verification ID: {certificate.verification_id}"

    def escape_pdf(s: str) -> str:
        return s.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")

    stream_lines = [
        "q",
        "0.97 0.95 0.91 rg",
        f"0 0 {width} {height} re f",
        "0.76 0.60 0.25 RG",
        "4 w",
        f"24 24 {width - 48} {height - 48} re S",
        "0.55 0.40 0.15 RG",
        "1.5 w",
        f"32 32 {width - 64} {height - 64} re S",
        "Q",
        "BT",
        "/F2 26 Tf",
        "0.12 0.15 0.25 rg",
        f"1 0 0 1 70 {height - 110} Tm",
        f"({escape_pdf(cert_type)}) Tj",
        "/F1 15 Tf",
        "0.4 0.4 0.4 rg",
        f"1 0 0 1 70 {height - 165} Tm",
        "(This is proudly presented to) Tj",
        "/F2 30 Tf",
        "0.05 0.20 0.55 rg",
        f"1 0 0 1 70 {height - 225} Tm",
        f"({escape_pdf(recipient)}) Tj",
        "/F1 15 Tf",
        "0.25 0.25 0.25 rg",
        f"1 0 0 1 70 {height - 280} Tm",
        f"(For participating in {escape_pdf(hack_title)}) Tj",
    ]

    current_y = height - 325
    if team_info:
        stream_lines.extend([
            "/F1 14 Tf",
            "0.35 0.35 0.35 rg",
            f"1 0 0 1 70 {current_y} Tm",
            f"({escape_pdf(team_info)}) Tj",
        ])
        current_y -= 30

    if award_info:
        stream_lines.extend([
            "/F2 15 Tf",
            "0.70 0.45 0.05 rg",
            f"1 0 0 1 70 {current_y} Tm",
            f"({escape_pdf(award_info)}) Tj",
        ])
        current_y -= 30

    stream_lines.extend([
        "/F1 11 Tf",
        "0.45 0.45 0.45 rg",
        f"1 0 0 1 70 {height - 520} Tm",
        f"({escape_pdf(issue_date)}) Tj",
        f"1 0 0 1 {width - 320} {height - 520} Tm",
        f"({escape_pdf(verification)}) Tj",
        "ET",
    ])

    stream_content = "\n".join(stream_lines).encode("latin-1")

    buf = io.BytesIO()
    offsets = []

    buf.write(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")

    offsets.append(buf.tell())
    buf.write(b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n")

    offsets.append(buf.tell())
    buf.write(b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n")

    offsets.append(buf.tell())
    buf.write(
        f"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {width} {height}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n".encode("latin-1")
    )

    offsets.append(buf.tell())
    buf.write(b"4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n")

    offsets.append(buf.tell())
    buf.write(b"5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n")

    offsets.append(buf.tell())
    buf.write(f"6 0 obj\n<< /Length {len(stream_content)} >>\nstream\n".encode("latin-1"))
    buf.write(stream_content)
    buf.write(b"\nendstream\nendobj\n")

    xref_offset = buf.tell()
    buf.write(f"xref\n0 {len(offsets) + 1}\n0000000000 65535 f \n".encode("latin-1"))
    for off in offsets:
        buf.write(f"{off:010d} 00000 n \n".encode("latin-1"))

    buf.write(f"trailer\n<< /Size {len(offsets) + 1} /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF\n".encode("latin-1"))
    return buf.getvalue()


def _store_certificate_pdf(certificate: Certificate) -> str:
    """Store a permanent PDF artifact on disk if possible, or return a virtual path."""
    filename = f"{certificate.verification_id}.pdf"
    pdf_bytes = _build_valid_certificate_pdf(certificate)

    try:
        directory = Path("uploads") / "certificates" / "issued"
        directory.mkdir(parents=True, exist_ok=True)
        path = directory / filename
        path.write_bytes(pdf_bytes)
        return f"/uploads/certificates/issued/{filename}"
    except (OSError, PermissionError):
        pass

    try:
        temp_dir = Path(tempfile.gettempdir()) / "chms_certificates"
        temp_dir.mkdir(parents=True, exist_ok=True)
        path = temp_dir / filename
        path.write_bytes(pdf_bytes)
        return str(path)
    except Exception:
        return f"/uploads/certificates/issued/{filename}"

def _issue_certificate(db: Session, template: CertificateTemplate, user: User, team=None, award_label=None) -> Certificate:
    existing = db.query(Certificate).filter(Certificate.template_id == template.id, Certificate.recipient_id == user.id).first()
    if existing:
        return existing
    certificate = Certificate(verification_id=f"CERT-{datetime.utcnow():%Y}-{secrets.token_hex(4).upper()}", template_id=template.id,
        hackathon_id=template.hackathon_id, recipient_id=user.id, team_id=team.id if team else None,
        certificate_type=template.certificate_type, recipient_name=user.full_name.strip(), team_name=team.name if team else None, award_label=award_label)
    db.add(certificate); db.flush(); certificate.pdf_url = _store_certificate_pdf(certificate)
    return certificate

def _bulk_issue(db: Session, template: CertificateTemplate) -> int:
    if template.recipient_type == "coordinator":
        users = [a.coordinator for a in db.query(CoordinatorAssignment).filter(CoordinatorAssignment.hackathon_id == template.hackathon_id).all()]
        for user in users: _issue_certificate(db, template, user)
        return len(users)
    members = db.query(TeamMember).join(Team).join(Registration).filter(Team.hackathon_id == template.hackathon_id, Registration.hackathon_id == template.hackathon_id, Registration.status == RegistrationStatus.REGISTERED).all()
    for member in members:
        submission = db.query(Submission).filter(Submission.team_id == member.team.id, Submission.hackathon_id == template.hackathon_id).first()
        award_label = None
        if submission and submission.final_rank:
            award_label = "Winner" if submission.final_rank == 1 else f"Finalist Rank {submission.final_rank}"
        _issue_certificate(db, template, member.user, member.team, award_label)
    return len(members)


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
    if db.query(CertificateTemplate).filter(CertificateTemplate.hackathon_id == payload.hackathon_id, CertificateTemplate.recipient_type == payload.recipient_type).first():
        raise HTTPException(status_code=409, detail=f"Only one {payload.recipient_type} template is allowed per hackathon.")
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
    if updates.get("recipient_type") and updates["recipient_type"] != template.recipient_type:
        conflict = db.query(CertificateTemplate).filter(CertificateTemplate.hackathon_id == template.hackathon_id, CertificateTemplate.recipient_type == updates["recipient_type"], CertificateTemplate.id != template.id).first()
        if conflict:
            raise HTTPException(status_code=409, detail=f"Only one {updates['recipient_type']} template is allowed per hackathon.")
    if "field_layout" in updates:
        _validate_layout(updates["field_layout"])
        template.field_layout = json.dumps(updates.pop("field_layout"))
    if updates.get("is_published") and not (template.background_url or template.background_storage_path):
        raise HTTPException(status_code=400, detail="Upload a certificate background before publishing.")
    for name, value in updates.items():
        setattr(template, name, value)
    if payload.is_published is True:
        template.published_at = datetime.utcnow()
        _bulk_issue(db, template)
    if payload.is_published is False:
        template.published_at = None
    db.commit()
    db.refresh(template)
    return StandardResponse(message="Certificate template updated.", data=_template_response(template))

@router.delete("/templates/{template_id}", response_model=StandardResponse[dict])
def delete_template(
    template_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker([UserRole.COORDINATOR, UserRole.ADMIN])),
):
    template = db.query(CertificateTemplate).filter(CertificateTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Certificate template not found.")
    _ensure_template_scope(db, current_user, template.hackathon_id)
    issued_count = db.query(Certificate).filter(Certificate.template_id == template.id).count()
    if template.is_published or issued_count:
        raise HTTPException(status_code=409, detail="Published or issued templates cannot be deleted. Unpublish/archive it instead.")
    db.delete(template)
    db.commit()
    return StandardResponse(message="Certificate draft deleted.", data={"id": template_id})


@router.post("/templates/{template_id}/background", response_model=StandardResponse[CertificateTemplateResponse])
async def upload_template_background(
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
        raise HTTPException(status_code=400, detail="Upload a PNG or JPG certificate background.")
    extension = Path(file.filename or "").suffix.lower()
    if extension not in {".png", ".jpg", ".jpeg"}:
        raise HTTPException(status_code=400, detail="Unsupported certificate template file extension.")
    filename = f"{template.id}/{secrets.token_hex(8)}{extension}"
    content = await file.read()
    if _storage_is_configured():
        response = httpx.post(f"{settings.SUPABASE_URL}/storage/v1/object/{settings.SUPABASE_STORAGE_BUCKET}/templates/{filename}", headers={"apikey": settings.SUPABASE_SERVICE_ROLE_KEY, "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}", "Content-Type": file.content_type or "application/octet-stream", "x-upsert": "true"}, content=content, timeout=30)
        if not response.is_success:
            raise HTTPException(status_code=502, detail="Supabase Storage upload failed.")
        template.background_storage_path = f"templates/{filename}"
        template.background_url = None
    else:
        if settings.ENVIRONMENT.lower() in {"production", "prod"}:
            raise HTTPException(status_code=503, detail="Supabase Storage is not configured on the backend. Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and SUPABASE_STORAGE_BUCKET.")
        directory = Path("uploads") / "certificates"
        directory.mkdir(parents=True, exist_ok=True)
        local_name = f"{template.id}-{secrets.token_hex(8)}{extension}"
        (directory / local_name).write_bytes(content)
        template.background_url = f"/uploads/certificates/{local_name}"
    db.commit()
    db.refresh(template)
    return StandardResponse(message="Certificate background uploaded.", data=_template_response(template))


@router.get("/mine", response_model=StandardResponse[list[CertificateResponse]])
def list_my_certificates(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)
):
    certificates = db.query(Certificate).filter(Certificate.recipient_id == current_user.id).order_by(Certificate.issued_at.desc()).all()
    return StandardResponse(message="Issued certificates retrieved.", data=[_certificate_response(item) for item in certificates])

@router.get("/vault", response_model=StandardResponse[list[CertificateResponse]])
def coordinator_vault(hackathon_id: str, db: Session = Depends(get_db), current_user: User = Depends(RoleChecker([UserRole.COORDINATOR, UserRole.ADMIN]))):
    _ensure_template_scope(db, current_user, hackathon_id)
    query = db.query(Certificate).filter(Certificate.hackathon_id == hackathon_id)
    if current_user.role == UserRole.COORDINATOR:
        query = query.filter(Certificate.recipient_id == current_user.id)
    rows = query.order_by(Certificate.issued_at.desc()).all()
    return StandardResponse(message="Certificate vault retrieved.", data=[_certificate_response(row) for row in rows])

def get_user_from_query_or_header(
    token: Optional[str] = None,
    credentials: Optional[object] = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    raw_token = token or (credentials.credentials if credentials and hasattr(credentials, 'credentials') else None)
    if not raw_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )
    from app.core.security import decode_access_token
    try:
        payload = decode_access_token(raw_token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.query(User).filter(User.id == payload["sub"], User.is_deleted == False).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return user


@router.get("/{certificate_id}/download")
def download_certificate(
    certificate_id: str,
    token: Optional[str] = None,
    format: Optional[str] = "pdf",
    db: Session = Depends(get_db),
    credentials: Optional[object] = Depends(security)
):
    current_user = get_user_from_query_or_header(token=token, credentials=credentials, db=db)
    certificate = db.query(Certificate).filter(Certificate.id == certificate_id).first()
    if not certificate or (certificate.recipient_id != current_user.id and current_user.role not in (UserRole.ADMIN, UserRole.COORDINATOR)):
        raise HTTPException(status_code=404, detail="Certificate record not found.")
    if current_user.role == UserRole.COORDINATOR:
        _ensure_template_scope(db, current_user, certificate.hackathon_id)

    fmt = (format or "pdf").lower()
    if fmt in ("jpg", "jpeg", "png"):
        bg_url = certificate.template.background_url if certificate.template else None
        if bg_url:
            if bg_url.startswith("http://") or bg_url.startswith("https://"):
                try:
                    with httpx.Client(timeout=15.0) as client:
                        resp = client.get(bg_url)
                        if resp.is_success:
                            media_type = "image/jpeg" if fmt in ("jpg", "jpeg") else "image/png"
                            ext = "jpg" if fmt in ("jpg", "jpeg") else "png"
                            return Response(
                                content=resp.content,
                                media_type=media_type,
                                headers={"Content-Disposition": f'attachment; filename="{certificate.verification_id}.{ext}"'}
                            )
                except Exception:
                    pass
            else:
                bg_path = Path(bg_url.lstrip("/"))
                if bg_path.exists():
                    media_type = "image/jpeg" if fmt in ("jpg", "jpeg") else "image/png"
                    ext = "jpg" if fmt in ("jpg", "jpeg") else "png"
                    return FileResponse(bg_path, media_type=media_type, filename=f"{certificate.verification_id}.{ext}")

    # Generate 100% valid standard PDF bytes
    pdf_bytes = _build_valid_certificate_pdf(certificate)

    # Best-effort disk persistence (safe on Vercel/serverless read-only filesystems)
    try:
        if not certificate.pdf_url:
            certificate.pdf_url = _store_certificate_pdf(certificate)
            db.commit()
    except Exception:
        pass

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{certificate.verification_id}.pdf"',
            "Content-Type": "application/pdf"
        }
    )


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
        recipient_name=current_user.full_name.strip(),
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
        "pdf_url": certificate.pdf_url,
    })
