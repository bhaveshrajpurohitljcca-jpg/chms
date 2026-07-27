from app.models.base import Base, BaseTable
from app.models.user import User, UserRole
from app.models.hackathon import Hackathon, ProblemStatement, HackathonStatus, ProblemCategory
from app.models.team import Team, TeamMember, TeamStatus, MemberRole
from app.models.submission import Submission, Evaluation, JudgeAssignment, SubmissionStatus, EvaluationRecommendation
from app.models.invitation import TeamInvitation, InvitationStatus
from app.models.registration import Registration, RegistrationStatus

__all__ = [
    "Base",
    "BaseTable",
    "User",
    "UserRole",
    "Hackathon",
    "ProblemStatement",
    "HackathonStatus",
    "ProblemCategory",
    "Team",
    "TeamMember",
    "TeamStatus",
    "MemberRole",
    "Submission",
    "SubmissionStatus",
    "Evaluation",
    "EvaluationRecommendation",
    "JudgeAssignment",
    "TeamInvitation",
    "InvitationStatus",
    "Registration",
    "RegistrationStatus",
]
