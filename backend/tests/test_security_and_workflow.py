from datetime import datetime, timedelta

import pytest
from fastapi import HTTPException

from app.core.security import hash_password, password_needs_rehash, verify_password
from app.api.v1.endpoints.registrations import _ensure_problem_selection_is_open
from app.models.hackathon import Hackathon


def test_passwords_use_bcrypt_and_verify():
    hashed = hash_password("SafePassword123!")
    assert hashed.startswith("$2")
    assert verify_password("SafePassword123!", hashed)
    assert not verify_password("wrong-password", hashed)
    assert not password_needs_rehash(hashed)


def test_legacy_password_is_still_accepted_for_login_migration():
    legacy_hash = "42f9012a4757f5c2f890d853c6a3e30e54d03cbc277f6b3be37b819a7b47908e"
    assert verify_password("password", legacy_hash)
    assert password_needs_rehash(legacy_hash)


def test_problem_statement_cannot_be_selected_before_release():
    hackathon = Hackathon(
        title="Test", slug="test-release", announce_ps_advance=False,
        start_date=datetime.utcnow() + timedelta(hours=1),
    )
    with pytest.raises(HTTPException, match="not been released"):
        _ensure_problem_selection_is_open(hackathon)


def test_problem_statement_cannot_be_selected_after_deadline():
    hackathon = Hackathon(
        title="Test", slug="test-deadline", announce_ps_advance=True,
        problem_selection_deadline=datetime.utcnow() - timedelta(minutes=1),
    )
    with pytest.raises(HTTPException, match="deadline has passed"):
        _ensure_problem_selection_is_open(hackathon)
