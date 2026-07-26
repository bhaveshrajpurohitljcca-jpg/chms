import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.base import Base
from app.models.user import User, UserRole
from app.models.hackathon import Hackathon, ProblemStatement, HackathonStatus, ProblemCategory
from app.models.team import Team, TeamMember, TeamStatus, MemberRole
from app.models.submission import Submission, Evaluation
from app.core.security import hash_password

logger = logging.getLogger("chms.seed")

def seed_database(db: Session, engine):
    """Auto-creates tables and seeds initial mock data if database is empty."""
    Base.metadata.create_all(bind=engine)

    if db.query(User).first() is not None:
        logger.info("Database already contains data, skipping seed.")
        return

    logger.info("Seeding initial demonstration users, hackathons, and problem statements...")

    # 1. Create Default Users for all roles
    pwd = hash_password("password123")
    
    student = User(
        email="student@college.edu",
        hashed_password=pwd,
        full_name="Alex Rivera",
        role=UserRole.STUDENT,
        department="Computer Science & Engineering",
        college_id="CS2026-088",
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
        bio="Full-stack AI developer passionate about high-scale web systems and LLMs."
    )

    coordinator = User(
        email="coordinator@college.edu",
        hashed_password=pwd,
        full_name="Dr. Sarah Connor",
        role=UserRole.COORDINATOR,
        department="Department of Information Technology",
        college_id="FAC-8812",
        avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80",
        bio="Lead Faculty Coordinator for Hackathons & Innovation Cell."
    )

    judge = User(
        email="judge@college.edu",
        hashed_password=pwd,
        full_name="Prof. David Zhang",
        role=UserRole.JUDGE,
        department="School of Artificial Intelligence",
        college_id="FAC-9901",
        avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80",
        bio="Senior AI Researcher and Industry Mentor."
    )

    admin = User(
        email="admin@college.edu",
        hashed_password=pwd,
        full_name="System Admin",
        role=UserRole.ADMIN,
        department="Central IT & Systems",
        college_id="ADM-0001",
        avatar_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80",
        bio="Platform Administrator."
    )

    db.add_all([student, coordinator, judge, admin])
    db.flush()

    # 2. Create Hackathons
    now = datetime.utcnow()
    h1 = Hackathon(
        title="CyberPulse Hackathon 2026",
        slug="cyberpulse-2026",
        tagline="Building Next-Gen Web3 & AI Autonomous Systems",
        description="Annual flagship internal college hackathon organized by CS Department. Over 48 hours of intense coding, mentoring, and prizes worth $5,000.",
        start_date=now - timedelta(days=1),
        end_date=now + timedelta(days=2),
        registration_deadline=now + timedelta(hours=12),
        max_team_size=4,
        min_team_size=2,
        status=HackathonStatus.ACTIVE,
        banner_url="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80"
    )

    h2 = Hackathon(
        title="AI Visionaries Sprint",
        slug="ai-visionaries-sprint",
        tagline="Exploring Multimodal GenAI and Autonomous Agents",
        description="Spring AI challenge focusing on lightweight local model deployments and agentic workflows.",
        start_date=now + timedelta(days=14),
        end_date=now + timedelta(days=16),
        registration_deadline=now + timedelta(days=12),
        max_team_size=3,
        min_team_size=1,
        status=HackathonStatus.UPCOMING,
        banner_url="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80"
    )

    db.add_all([h1, h2])
    db.flush()

    # 3. Create Problem Statements
    ps1 = ProblemStatement(
        hackathon_id=h1.id,
        title="Real-Time Automated Code Review & Security Audit Agent",
        description="Design an automated LLM agent that hooks into GitHub PRs to run vulnerability checks and static code syntax optimization suggestions.",
        category=ProblemCategory.AI_ML,
        difficulty="Hard",
        max_teams=15
    )

    ps2 = ProblemStatement(
        hackathon_id=h1.id,
        title="Glassmorphic Decentralized Student Identity Vault",
        description="Build a high-performance decentralized web platform for verifying student credentials and certificates on-chain.",
        category=ProblemCategory.BLOCKCHAIN,
        difficulty="Medium",
        max_teams=10
    )

    db.add_all([ps1, ps2])
    db.flush()

    # 4. Create Initial Team & Member
    t1 = Team(
        hackathon_id=h1.id,
        name="Team Antigravity",
        join_code="AG882X",
        leader_id=student.id,
        status=TeamStatus.APPROVED
    )
    db.add(t1)
    db.flush()

    tm1 = TeamMember(
        team_id=t1.id,
        user_id=student.id,
        role_in_team=MemberRole.LEADER
    )
    db.add(tm1)

    # 5. Create Initial Submission & Evaluation
    sub1 = Submission(
        team_id=t1.id,
        hackathon_id=h1.id,
        problem_statement_id=ps1.id,
        title="CyberPulse Security Agent - Autonomous PR Reviewer",
        description="An end-to-end FastAPI + React Web application performing real-time security scanning and code visual analysis using LLM tools.",
        repo_url="https://github.com/example/cyberpulse-security-agent",
        demo_url="https://cyberpulse-agent-demo.vercel.app",
        video_url="https://youtube.com/watch?v=demo"
    )
    db.add(sub1)
    db.flush()

    eval1 = Evaluation(
        submission_id=sub1.id,
        judge_id=judge.id,
        score_innovation=9.5,
        score_execution=9.0,
        score_presentation=8.8,
        total_score=9.1,
        feedback="Outstanding UI design, brilliant agentic architecture, and robust real-time API response times."
    )
    db.add(eval1)

    db.commit()
    logger.info("Database seeding completed successfully!")
