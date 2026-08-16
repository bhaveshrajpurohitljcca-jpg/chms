import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship

from app.models.base import BaseTable


class CertificateTemplate(BaseTable):
    """A coordinator-owned certificate design for one assigned hackathon."""

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hackathon_id = Column(String(36), ForeignKey("hackathon.id", ondelete="CASCADE"), nullable=False)
    created_by_id = Column(String(36), ForeignKey("user.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(255), nullable=False)
    recipient_type = Column(String(30), nullable=False, default="participant")
    certificate_type = Column(String(100), nullable=False, default="Participation Certificate")
    background_url = Column(String(500), nullable=True)
    # JSON array consumed by the browser renderer. Fields use trusted placeholder keys only.
    field_layout = Column(Text, nullable=False, default="[]")
    is_published = Column(Boolean, nullable=False, default=False)
    published_at = Column(DateTime, nullable=True)

    hackathon = relationship("Hackathon")
    created_by = relationship("User", foreign_keys=[created_by_id])
    certificates = relationship("Certificate", back_populates="template")


class Certificate(BaseTable):
    """Immutable recipient-facing issue record. Values are captured at issue time."""

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    verification_id = Column(String(40), unique=True, index=True, nullable=False)
    template_id = Column(String(36), ForeignKey("certificate_template.id", ondelete="RESTRICT"), nullable=False)
    hackathon_id = Column(String(36), ForeignKey("hackathon.id", ondelete="CASCADE"), nullable=False)
    recipient_id = Column(String(36), ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    team_id = Column(String(36), ForeignKey("team.id", ondelete="SET NULL"), nullable=True)
    certificate_type = Column(String(100), nullable=False)
    recipient_name = Column(String(255), nullable=False)
    team_name = Column(String(255), nullable=True)
    award_label = Column(String(255), nullable=True)
    issued_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    revoked_at = Column(DateTime, nullable=True)
    revoke_reason = Column(Text, nullable=True)

    template = relationship("CertificateTemplate", back_populates="certificates")
    hackathon = relationship("Hackathon")
    recipient = relationship("User", foreign_keys=[recipient_id])

    __table_args__ = (
        UniqueConstraint("template_id", "recipient_id", name="unique_template_recipient_certificate"),
    )
