"""Announcement recipient resolution, in-app notifications, and email dispatch."""

from __future__ import annotations

from typing import Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.hackathon import Hackathon, CoordinatorAssignment
from app.models.notification import NotificationType
from app.models.team import Team, TeamMember
from app.models.user import User, UserRole
from app.services.notification_service import notification_service
from app.utils.email import send_announcement_email


def _unique_active_users(users: list[User]) -> list[User]:
    seen: set[str] = set()
    unique: list[User] = []
    for user in users:
        if user.id in seen or not user.is_active:
            continue
        seen.add(user.id)
        unique.append(user)
    return unique


def resolve_announcement_recipients(
    db: Session,
    target: str,
    hackathon_id: Optional[str] = None,
) -> list[User]:
    """
    Resolve announcement recipients from a target string.

    Target options:
    - all_platform_users: every active user
    - all_users: all team members in a hackathon (requires hackathon_id)
    - team_leaders: team leaders in a hackathon (requires hackathon_id)
    - user:<user_id>: a specific user
    - <team_id>: all members of a specific team (requires hackathon_id)
    """
    if target == "all_platform_users":
        return _unique_active_users(
            db.query(User).filter(User.is_active == True).all()  # noqa: E712
        )

    if target.startswith("user:"):
        user_id = target.split(":", 1)[1].strip()
        user = db.query(User).filter(User.id == user_id, User.is_active == True).first()  # noqa: E712
        if not user:
            raise HTTPException(status_code=404, detail="Target user not found.")
        return [user]

    if not hackathon_id:
        raise HTTPException(status_code=400, detail="hackathon_id is required for this target type.")

    hackathon_teams = db.query(Team).filter(Team.hackathon_id == hackathon_id).all()
    hackathon_team_ids = [team.id for team in hackathon_teams]

    if target == "all_users":
        members = db.query(TeamMember).filter(TeamMember.team_id.in_(hackathon_team_ids)).all()
        user_ids = {member.user_id for member in members}
        if not user_ids:
            return []
        return _unique_active_users(
            db.query(User).filter(User.id.in_(user_ids), User.is_active == True).all()  # noqa: E712
        )

    if target == "team_leaders":
        members = db.query(TeamMember).filter(
            TeamMember.team_id.in_(hackathon_team_ids),
            TeamMember.role_in_team == "leader",
        ).all()
        user_ids = {member.user_id for member in members}
        if not user_ids:
            return []
        return _unique_active_users(
            db.query(User).filter(User.id.in_(user_ids), User.is_active == True).all()  # noqa: E712
        )

    team = db.query(Team).filter(Team.id == target, Team.hackathon_id == hackathon_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found in this hackathon.")

    members = db.query(TeamMember).filter(TeamMember.team_id == team.id).all()
    user_ids = [member.user_id for member in members]
    if not user_ids:
        return []
    return _unique_active_users(
        db.query(User).filter(User.id.in_(user_ids), User.is_active == True).all()  # noqa: E712
    )


def assert_can_send_announcement(
    db: Session,
    current_user: User,
    target: str,
    hackathon_id: Optional[str] = None,
) -> None:
    """Validate that the current user may send an announcement to the given target."""
    if current_user.role not in [UserRole.ADMIN, UserRole.COORDINATOR]:
        raise HTTPException(status_code=403, detail="Only coordinators and admins can send announcements.")

    if target == "all_platform_users" or not hackathon_id:
        return

    if current_user.role == UserRole.COORDINATOR:
        assigned = db.query(CoordinatorAssignment).filter(
            CoordinatorAssignment.coordinator_id == current_user.id,
            CoordinatorAssignment.hackathon_id == hackathon_id,
        ).first()
        if not assigned:
            raise HTTPException(status_code=403, detail="You are not assigned to this hackathon.")


def dispatch_announcement(
    db: Session,
    *,
    title: str,
    message: str,
    target: str,
    sender: User,
    hackathon_id: Optional[str] = None,
    send_emails: bool = True,
) -> tuple[int, int]:
    """
    Create in-app notifications and optionally send emails to resolved recipients.

    Returns (notification_count, email_count).
    """
    recipients = resolve_announcement_recipients(db, target, hackathon_id)
    if not recipients:
        raise HTTPException(status_code=400, detail="No recipients found for this announcement target.")

    hackathon_name: Optional[str] = None
    if hackathon_id:
        hackathon = db.query(Hackathon).filter(Hackathon.id == hackathon_id).first()
        hackathon_name = hackathon.title if hackathon else None

    sender_name = sender.full_name or sender.email
    notification_count = 0
    email_count = 0

    for recipient in recipients:
        notification_service.create_notification(
            db=db,
            user_id=recipient.id,
            type=NotificationType.ANNOUNCEMENT,
            title=title,
            message=message,
        )
        notification_count += 1

        if send_emails and recipient.email:
            if send_announcement_email(
                to_email=recipient.email,
                recipient_name=recipient.full_name or recipient.email,
                title=title,
                message=message,
                sender_name=sender_name,
                hackathon_name=hackathon_name,
            ):
                email_count += 1

    return notification_count, email_count
