from datetime import datetime
from typing import Any, List, Optional

from pydantic import BaseModel, Field


class CertificateTemplateCreate(BaseModel):
    hackathon_id: str
    name: str = Field(min_length=2, max_length=255)
    recipient_type: str = Field(default="participant", pattern="^(participant|coordinator)$")
    certificate_type: str = Field(default="Participation Certificate", max_length=100)
    field_layout: List[dict[str, Any]] = Field(default_factory=list)


class CertificateTemplateUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=255)
    certificate_type: Optional[str] = Field(default=None, max_length=100)
    field_layout: Optional[List[dict[str, Any]]] = None
    is_published: Optional[bool] = None


class CertificateTemplateResponse(BaseModel):
    id: str
    hackathon_id: str
    name: str
    recipient_type: str
    certificate_type: str
    background_url: Optional[str] = None
    field_layout: List[dict[str, Any]] = Field(default_factory=list)
    is_published: bool
    published_at: Optional[datetime] = None
    created_at: datetime


class CertificateResponse(BaseModel):
    id: str
    verification_id: str
    template_id: str
    hackathon_id: str
    hackathon_title: str
    certificate_type: str
    recipient_name: str
    team_name: Optional[str] = None
    award_label: Optional[str] = None
    issued_at: datetime
    revoked_at: Optional[datetime] = None
    template: CertificateTemplateResponse


class CertificateGenerateRequest(BaseModel):
    display_name: Optional[str] = Field(default=None, min_length=2, max_length=255)


class CertificateRevokeRequest(BaseModel):
    reason: str = Field(min_length=3, max_length=500)
