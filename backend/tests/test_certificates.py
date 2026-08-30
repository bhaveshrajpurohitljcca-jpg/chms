from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import app.models  # Registers every model before creating the isolated schema.
from app.api.v1.endpoints.certificates import _participant_eligibility, _template_response
from app.models.base import Base
from app.models.certificate import CertificateTemplate
from app.models.hackathon import Hackathon, HackathonStatus
from app.models.registration import Registration
from app.models.team import Team, TeamMember
from app.models.user import User, UserRole


def test_registered_team_member_is_eligible_for_participant_template():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine)()

    student = User(email="student@example.test", hashed_password="hash", full_name="Student One", role=UserRole.STUDENT)
    hackathon = Hackathon(title="Internal Hackathon", slug="internal-hackathon", status=HackathonStatus.ENDED)
    session.add_all([student, hackathon])
    session.commit()

    team = Team(hackathon_id=hackathon.id, name="Team Alpha", leader_id=student.id)
    session.add(team)
    session.commit()
    session.add_all([
        TeamMember(team_id=team.id, user_id=student.id),
        Registration(team_id=team.id, hackathon_id=hackathon.id, registered_by_id=student.id),
    ])
    template = CertificateTemplate(
        hackathon_id=hackathon.id,
        name="Participation",
        recipient_type="participant",
        certificate_type="Participation Certificate",
        field_layout="[]",
    )
    session.add(template)
    session.commit()

    assert _participant_eligibility(session, student, hackathon.id)["team"].name == "Team Alpha"
    assert _template_response(template).recipient_type == "participant"


def test_valid_pdf_generation_can_be_parsed():
    import io
    import PyPDF2
    from datetime import datetime
    from app.api.v1.endpoints.certificates import _build_valid_certificate_pdf
    from app.models.certificate import Certificate

    cert = Certificate(
        certificate_type="Certificate of Achievement",
        recipient_name="Bhavesh Rajpurohit",
        team_name="CyberTech",
        award_label="Winner",
        verification_id="CERT-2026-TEST",
        issued_at=datetime.utcnow()
    )
    cert.hackathon = Hackathon(title="HexaThon 2026")

    pdf_bytes = _build_valid_certificate_pdf(cert)
    assert pdf_bytes.startswith(b"%PDF-1.4")
    assert b"%%EOF" in pdf_bytes

    reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
    assert len(reader.pages) == 1
    text = reader.pages[0].extract_text()
    assert "Bhavesh Rajpurohit" in text
    assert "CERT-2026-TEST" in text

