"""
Local-only seed script for CHMS development.
Creates all tables and inserts dummy data into the local SQLite database.
This script should NEVER be run on the production/deployed server.

Usage:
    cd backend
    python seed_local.py
"""

import os
import sys
import hashlib
import secrets
from datetime import datetime, timedelta

# Ensure we can import the app modules
sys.path.insert(0, os.path.dirname(__file__))

from app.config import settings
from app.database import engine, SessionLocal
from app.models.base import Base

# Import ALL models so Base.metadata knows about every table
from app.models.user import User
from app.models.hackathon import Hackathon, ProblemStatement, CoordinatorAssignment
from app.models.team import Team, TeamMember
from app.models.registration import Registration
from app.models.submission import Submission, JudgeAssignment, Evaluation
from app.models.invitation import TeamInvitation
from app.models.notification import Notification
from app.models.announcement import Announcement

# ─────────────────────────────────────────────
# SAFETY: Only run on local/SQLite database
# ─────────────────────────────────────────────
if "sqlite" not in settings.DATABASE_URL:
    print("❌ ERROR: This seed script is meant for LOCAL SQLite development only!")
    print(f"   Current DATABASE_URL starts with: {settings.DATABASE_URL[:30]}...")
    print("   Aborting to protect production data.")
    sys.exit(1)

print("=" * 60)
print("🌱 CHMS Local Seed Script")
print(f"   Database: {settings.DATABASE_URL}")
print(f"   Environment: {settings.ENVIRONMENT}")
print("=" * 60)


def hash_password(password: str) -> str:
    """Same hashing as app.core.security.hash_password"""
    salt = "chms_secure_salt_2026"
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()


# ─────────────────────────────────────────────
# Step 1: Create all tables
# ─────────────────────────────────────────────
print("\n📦 Creating database tables...")
Base.metadata.create_all(bind=engine)
print("   ✅ All tables created successfully!")

db = SessionLocal()

try:
    # Check if data already exists
    existing_users = db.query(User).count()
    if existing_users > 0:
        print(f"\n⚠️  Database already has {existing_users} users. Skipping seed.")
        print("   Delete 'test.db' and re-run this script to re-seed.")
        sys.exit(0)

    now = datetime.utcnow()

    # ─────────────────────────────────────────────
    # Step 2: Create Users (all roles)
    # ─────────────────────────────────────────────
    print("\n👤 Creating users...")

    # Password for all dummy users: "password123"
    default_pwd = hash_password("password123")

    users = [
        # Admin
        User(
            id="u-admin-001",
            email="admin@chms.local",
            hashed_password=default_pwd,
            full_name="Dr. Rajesh Kumar",
            role="admin",
            department="Computer Science",
            college_id="ADMIN001",
            bio="System Administrator for CHMS platform.",
            is_active=True,
            created_at=now,
            updated_at=now,
        ),
        # Coordinators
        User(
            id="u-coord-001",
            email="coordinator1@chms.local",
            hashed_password=default_pwd,
            full_name="Prof. Anita Sharma",
            role="coordinator",
            department="Information Technology",
            college_id="COORD001",
            bio="Hackathon coordinator with 5+ years experience.",
            is_active=True,
            created_at=now,
            updated_at=now,
        ),
        User(
            id="u-coord-002",
            email="coordinator2@chms.local",
            hashed_password=default_pwd,
            full_name="Prof. Vikram Patel",
            role="coordinator",
            department="Computer Science",
            college_id="COORD002",
            bio="Faculty advisor for coding competitions.",
            is_active=True,
            created_at=now,
            updated_at=now,
        ),
        # Judges
        User(
            id="u-judge-001",
            email="judge1@chms.local",
            hashed_password=default_pwd,
            full_name="Mr. Arjun Mehta",
            role="judge",
            department="Software Engineering",
            college_id="JUDGE001",
            bio="Industry expert in full-stack development.",
            is_active=True,
            created_at=now,
            updated_at=now,
        ),
        User(
            id="u-judge-002",
            email="judge2@chms.local",
            hashed_password=default_pwd,
            full_name="Ms. Priya Desai",
            role="judge",
            department="AI & Data Science",
            college_id="JUDGE002",
            bio="AI researcher and ML competition judge.",
            is_active=True,
            created_at=now,
            updated_at=now,
        ),
        User(
            id="u-judge-003",
            email="judge3@chms.local",
            hashed_password=default_pwd,
            full_name="Mr. Karan Singh",
            role="judge",
            department="Cybersecurity",
            college_id="JUDGE003",
            bio="Cybersecurity consultant and CTF organizer.",
            is_active=True,
            created_at=now,
            updated_at=now,
        ),
        # Students (10 students for teams)
        User(
            id="u-stu-001",
            email="bhavesh@chms.local",
            hashed_password=default_pwd,
            full_name="Bhavesh Rajpurohit",
            role="student",
            department="Computer Science",
            college_id="CS2024001",
            bio="Full-stack developer, passionate about hackathons.",
            phone="9876543210",
            semester="6",
            is_active=True,
            created_at=now,
            updated_at=now,
        ),
        User(
            id="u-stu-002",
            email="dhyey@chms.local",
            hashed_password=default_pwd,
            full_name="Dhyey Shah",
            role="student",
            department="Computer Science",
            college_id="CS2024002",
            bio="Backend developer and database enthusiast.",
            phone="9876543211",
            semester="6",
            is_active=True,
            created_at=now,
            updated_at=now,
        ),
        User(
            id="u-stu-003",
            email="yash@chms.local",
            hashed_password=default_pwd,
            full_name="Yash Patel",
            role="student",
            department="Information Technology",
            college_id="IT2024001",
            bio="Frontend developer and UI/UX designer.",
            phone="9876543212",
            semester="6",
            is_active=True,
            created_at=now,
            updated_at=now,
        ),
        User(
            id="u-stu-004",
            email="riya@chms.local",
            hashed_password=default_pwd,
            full_name="Riya Joshi",
            role="student",
            department="Computer Science",
            college_id="CS2024003",
            bio="AI/ML enthusiast, Kaggle competitor.",
            phone="9876543213",
            semester="4",
            is_active=True,
            created_at=now,
            updated_at=now,
        ),
        User(
            id="u-stu-005",
            email="amit@chms.local",
            hashed_password=default_pwd,
            full_name="Amit Verma",
            role="student",
            department="Information Technology",
            college_id="IT2024002",
            bio="Mobile app developer, Flutter expert.",
            phone="9876543214",
            semester="4",
            is_active=True,
            created_at=now,
            updated_at=now,
        ),
        User(
            id="u-stu-006",
            email="neha@chms.local",
            hashed_password=default_pwd,
            full_name="Neha Gupta",
            role="student",
            department="Computer Science",
            college_id="CS2024004",
            bio="Web3 and blockchain developer.",
            phone="9876543215",
            semester="6",
            is_active=True,
            created_at=now,
            updated_at=now,
        ),
        User(
            id="u-stu-007",
            email="rohan@chms.local",
            hashed_password=default_pwd,
            full_name="Rohan Agarwal",
            role="student",
            department="Information Technology",
            college_id="IT2024003",
            bio="DevOps and cloud computing enthusiast.",
            phone="9876543216",
            semester="4",
            is_active=True,
            created_at=now,
            updated_at=now,
        ),
        User(
            id="u-stu-008",
            email="kavya@chms.local",
            hashed_password=default_pwd,
            full_name="Kavya Nair",
            role="student",
            department="AI & Data Science",
            college_id="AI2024001",
            bio="Data science student, loves NLP projects.",
            phone="9876543217",
            semester="6",
            is_active=True,
            created_at=now,
            updated_at=now,
        ),
        User(
            id="u-stu-009",
            email="sahil@chms.local",
            hashed_password=default_pwd,
            full_name="Sahil Thakkar",
            role="student",
            department="Computer Science",
            college_id="CS2024005",
            bio="Competitive programmer, 5-star on CodeChef.",
            phone="9876543218",
            semester="4",
            is_active=True,
            created_at=now,
            updated_at=now,
        ),
        User(
            id="u-stu-010",
            email="pooja@chms.local",
            hashed_password=default_pwd,
            full_name="Pooja Menon",
            role="student",
            department="Information Technology",
            college_id="IT2024004",
            bio="IoT and embedded systems developer.",
            phone="9876543219",
            semester="6",
            is_active=True,
            created_at=now,
            updated_at=now,
        ),
    ]

    for u in users:
        db.add(u)
    db.flush()
    print(f"   ✅ {len(users)} users created (password: 'password123' for all)")

    # ─────────────────────────────────────────────
    # Step 3: Create Hackathons
    # ─────────────────────────────────────────────
    print("\n🏆 Creating hackathons...")

    hackathons = [
        Hackathon(
            id="h-001",
            title="CodeStorm 2026",
            slug="codestorm-2026",
            tagline="Build. Break. Innovate.",
            description="CodeStorm is the flagship annual hackathon of LJ University. 24 hours of non-stop coding, mentoring, and innovation. Open to all departments. Build solutions that matter!",
            start_date=now + timedelta(days=7),
            end_date=now + timedelta(days=8),
            registration_deadline=now + timedelta(days=5),
            max_team_size=4,
            min_team_size=2,
            status="upcoming",
            announce_ps_advance=True,
            results_published=False,
            created_at=now,
            updated_at=now,
        ),
        Hackathon(
            id="h-002",
            title="AI Innovation Challenge",
            slug="ai-innovation-2026",
            tagline="Intelligence Meets Creativity",
            description="A 48-hour hackathon focused on Artificial Intelligence and Machine Learning solutions. Participants will work on real-world datasets and build AI-powered applications.",
            start_date=now + timedelta(days=30),
            end_date=now + timedelta(days=32),
            registration_deadline=now + timedelta(days=25),
            max_team_size=4,
            min_team_size=2,
            status="upcoming",
            announce_ps_advance=True,
            results_published=False,
            created_at=now,
            updated_at=now,
        ),
        Hackathon(
            id="h-003",
            title="WebDev Sprint 2026",
            slug="webdev-sprint-2026",
            tagline="Code the Future of the Web",
            description="A fast-paced 12-hour web development hackathon. Build a complete web application from scratch using modern technologies. Prizes worth ₹50,000!",
            start_date=now - timedelta(days=5),
            end_date=now - timedelta(days=4),
            registration_deadline=now - timedelta(days=7),
            max_team_size=3,
            min_team_size=1,
            status="ended",
            announce_ps_advance=True,
            results_published=True,
            created_at=now - timedelta(days=30),
            updated_at=now - timedelta(days=4),
        ),
        Hackathon(
            id="h-004",
            title="Blockchain Buildathon",
            slug="blockchain-buildathon-2026",
            tagline="Decentralize Everything",
            description="Build decentralized applications using blockchain technology. Smart contracts, DeFi, NFTs - anything goes! Sponsored by Web3 Foundation.",
            start_date=now - timedelta(days=1),
            end_date=now + timedelta(days=1),
            registration_deadline=now - timedelta(days=3),
            max_team_size=4,
            min_team_size=2,
            status="active",
            announce_ps_advance=False,
            results_published=False,
            created_at=now - timedelta(days=15),
            updated_at=now,
        ),
    ]

    for h in hackathons:
        db.add(h)
    db.flush()
    print(f"   ✅ {len(hackathons)} hackathons created")

    # ─────────────────────────────────────────────
    # Step 4: Create Problem Statements
    # ─────────────────────────────────────────────
    print("\n📝 Creating problem statements...")

    problem_statements = [
        # CodeStorm 2026 problems
        ProblemStatement(
            id="ps-001",
            hackathon_id="h-001",
            title="Smart Campus Navigation",
            description="Build an AR-powered campus navigation app that helps new students find classrooms, labs, and facilities using their phone camera.",
            category="Mobile App Development",
            difficulty="Hard",
            max_teams=8,
            created_at=now,
            updated_at=now,
        ),
        ProblemStatement(
            id="ps-002",
            hackathon_id="h-001",
            title="Student Wellness Tracker",
            description="Create a web platform that tracks student mental health, sleep patterns, and academic stress levels with actionable wellness recommendations.",
            category="Web Development",
            difficulty="Medium",
            max_teams=10,
            created_at=now,
            updated_at=now,
        ),
        ProblemStatement(
            id="ps-003",
            hackathon_id="h-001",
            title="Eco-Campus Dashboard",
            description="Design a real-time dashboard showing campus energy usage, water consumption, and carbon footprint with gamification for sustainability goals.",
            category="Open Innovation",
            difficulty="Easy",
            max_teams=12,
            created_at=now,
            updated_at=now,
        ),
        # AI Innovation problems
        ProblemStatement(
            id="ps-004",
            hackathon_id="h-002",
            title="AI-Powered Exam Proctoring",
            description="Build an AI system that can monitor online exams for suspicious behavior using computer vision and behavioral analysis.",
            category="AI / Machine Learning",
            difficulty="Hard",
            max_teams=6,
            created_at=now,
            updated_at=now,
        ),
        ProblemStatement(
            id="ps-005",
            hackathon_id="h-002",
            title="Intelligent Course Recommender",
            description="Create a recommendation engine that suggests elective courses to students based on their interests, past performance, and career goals.",
            category="AI / Machine Learning",
            difficulty="Medium",
            max_teams=10,
            created_at=now,
            updated_at=now,
        ),
        # WebDev Sprint problems (ended hackathon)
        ProblemStatement(
            id="ps-006",
            hackathon_id="h-003",
            title="Real-Time Collaboration Tool",
            description="Build a Google Docs-like real-time collaboration tool for code editing with live cursors, chat, and version history.",
            category="Web Development",
            difficulty="Hard",
            max_teams=8,
            created_at=now - timedelta(days=30),
            updated_at=now - timedelta(days=30),
        ),
        ProblemStatement(
            id="ps-007",
            hackathon_id="h-003",
            title="Portfolio Builder",
            description="Create a drag-and-drop portfolio website builder for students with templates, custom domains, and analytics.",
            category="Web Development",
            difficulty="Medium",
            max_teams=10,
            created_at=now - timedelta(days=30),
            updated_at=now - timedelta(days=30),
        ),
        # Blockchain Buildathon problems
        ProblemStatement(
            id="ps-008",
            hackathon_id="h-004",
            title="Decentralized Credential Verification",
            description="Build a blockchain-based system for verifying academic credentials and certificates that can't be tampered with.",
            category="Web3 & Blockchain",
            difficulty="Hard",
            max_teams=6,
            created_at=now - timedelta(days=15),
            updated_at=now - timedelta(days=15),
        ),
        ProblemStatement(
            id="ps-009",
            hackathon_id="h-004",
            title="Campus Token Economy",
            description="Design a token-based reward system for campus activities - attend events, complete assignments, earn tokens, redeem rewards.",
            category="Web3 & Blockchain",
            difficulty="Medium",
            max_teams=8,
            created_at=now - timedelta(days=15),
            updated_at=now - timedelta(days=15),
        ),
    ]

    for ps in problem_statements:
        db.add(ps)
    db.flush()
    print(f"   ✅ {len(problem_statements)} problem statements created")

    # ─────────────────────────────────────────────
    # Step 5: Create Coordinator Assignments
    # ─────────────────────────────────────────────
    print("\n🔗 Creating coordinator assignments...")

    coord_assignments = [
        CoordinatorAssignment(id="ca-001", coordinator_id="u-coord-001", hackathon_id="h-001", created_at=now, updated_at=now),
        CoordinatorAssignment(id="ca-002", coordinator_id="u-coord-002", hackathon_id="h-002", created_at=now, updated_at=now),
        CoordinatorAssignment(id="ca-003", coordinator_id="u-coord-001", hackathon_id="h-003", created_at=now, updated_at=now),
        CoordinatorAssignment(id="ca-004", coordinator_id="u-coord-002", hackathon_id="h-004", created_at=now, updated_at=now),
    ]

    for ca in coord_assignments:
        db.add(ca)
    db.flush()
    print(f"   ✅ {len(coord_assignments)} coordinator assignments created")

    # ─────────────────────────────────────────────
    # Step 6: Create Teams
    # ─────────────────────────────────────────────
    print("\n👥 Creating teams...")

    teams = [
        # Teams for CodeStorm 2026 (upcoming)
        Team(
            id="t-001",
            hackathon_id="h-001",
            name="Code Crushers",
            join_code=secrets.token_hex(4).upper(),
            leader_id="u-stu-001",
            status="approved",
            created_at=now,
            updated_at=now,
        ),
        Team(
            id="t-002",
            hackathon_id="h-001",
            name="Binary Brains",
            join_code=secrets.token_hex(4).upper(),
            leader_id="u-stu-004",
            status="approved",
            created_at=now,
            updated_at=now,
        ),
        # Teams for WebDev Sprint (ended)
        Team(
            id="t-003",
            hackathon_id="h-003",
            name="Pixel Perfect",
            join_code=secrets.token_hex(4).upper(),
            leader_id="u-stu-001",
            status="approved",
            created_at=now - timedelta(days=20),
            updated_at=now - timedelta(days=20),
        ),
        Team(
            id="t-004",
            hackathon_id="h-003",
            name="Debug Dynasty",
            join_code=secrets.token_hex(4).upper(),
            leader_id="u-stu-006",
            status="approved",
            created_at=now - timedelta(days=20),
            updated_at=now - timedelta(days=20),
        ),
        # Teams for Blockchain Buildathon (active)
        Team(
            id="t-005",
            hackathon_id="h-004",
            name="Chain Gang",
            join_code=secrets.token_hex(4).upper(),
            leader_id="u-stu-006",
            status="approved",
            created_at=now - timedelta(days=5),
            updated_at=now - timedelta(days=5),
        ),
        Team(
            id="t-006",
            hackathon_id="h-004",
            name="Block Builders",
            join_code=secrets.token_hex(4).upper(),
            leader_id="u-stu-009",
            status="approved",
            created_at=now - timedelta(days=5),
            updated_at=now - timedelta(days=5),
        ),
    ]

    for t in teams:
        db.add(t)
    db.flush()
    print(f"   ✅ {len(teams)} teams created")

    # ─────────────────────────────────────────────
    # Step 7: Create Team Members
    # ─────────────────────────────────────────────
    print("\n🧑‍🤝‍🧑 Creating team members...")

    members = [
        # Code Crushers (t-001): Bhavesh(leader), Dhyey, Yash
        TeamMember(id="tm-001", team_id="t-001", user_id="u-stu-001", role_in_team="leader", created_at=now, updated_at=now),
        TeamMember(id="tm-002", team_id="t-001", user_id="u-stu-002", role_in_team="member", created_at=now, updated_at=now),
        TeamMember(id="tm-003", team_id="t-001", user_id="u-stu-003", role_in_team="member", created_at=now, updated_at=now),

        # Binary Brains (t-002): Riya(leader), Amit, Kavya
        TeamMember(id="tm-004", team_id="t-002", user_id="u-stu-004", role_in_team="leader", created_at=now, updated_at=now),
        TeamMember(id="tm-005", team_id="t-002", user_id="u-stu-005", role_in_team="member", created_at=now, updated_at=now),
        TeamMember(id="tm-006", team_id="t-002", user_id="u-stu-008", role_in_team="member", created_at=now, updated_at=now),

        # Pixel Perfect (t-003): Bhavesh(leader), Dhyey
        TeamMember(id="tm-007", team_id="t-003", user_id="u-stu-001", role_in_team="leader", created_at=now - timedelta(days=20), updated_at=now - timedelta(days=20)),
        TeamMember(id="tm-008", team_id="t-003", user_id="u-stu-002", role_in_team="member", created_at=now - timedelta(days=20), updated_at=now - timedelta(days=20)),

        # Debug Dynasty (t-004): Neha(leader), Rohan, Pooja
        TeamMember(id="tm-009", team_id="t-004", user_id="u-stu-006", role_in_team="leader", created_at=now - timedelta(days=20), updated_at=now - timedelta(days=20)),
        TeamMember(id="tm-010", team_id="t-004", user_id="u-stu-007", role_in_team="member", created_at=now - timedelta(days=20), updated_at=now - timedelta(days=20)),
        TeamMember(id="tm-011", team_id="t-004", user_id="u-stu-010", role_in_team="member", created_at=now - timedelta(days=20), updated_at=now - timedelta(days=20)),

        # Chain Gang (t-005): Neha(leader), Sahil
        TeamMember(id="tm-012", team_id="t-005", user_id="u-stu-006", role_in_team="leader", created_at=now - timedelta(days=5), updated_at=now - timedelta(days=5)),
        TeamMember(id="tm-013", team_id="t-005", user_id="u-stu-009", role_in_team="member", created_at=now - timedelta(days=5), updated_at=now - timedelta(days=5)),

        # Block Builders (t-006): Sahil(leader), Rohan, Amit
        TeamMember(id="tm-014", team_id="t-006", user_id="u-stu-009", role_in_team="leader", created_at=now - timedelta(days=5), updated_at=now - timedelta(days=5)),
        TeamMember(id="tm-015", team_id="t-006", user_id="u-stu-007", role_in_team="member", created_at=now - timedelta(days=5), updated_at=now - timedelta(days=5)),
        TeamMember(id="tm-016", team_id="t-006", user_id="u-stu-005", role_in_team="member", created_at=now - timedelta(days=5), updated_at=now - timedelta(days=5)),
    ]

    for m in members:
        db.add(m)
    db.flush()
    print(f"   ✅ {len(members)} team members added")

    # ─────────────────────────────────────────────
    # Step 8: Create Registrations
    # ─────────────────────────────────────────────
    print("\n📋 Creating registrations...")

    registrations = [
        # CodeStorm 2026 registrations
        Registration(id="r-001", team_id="t-001", hackathon_id="h-001", problem_statement_id="ps-001", registered_by_id="u-stu-001", status="registered", created_at=now, updated_at=now),
        Registration(id="r-002", team_id="t-002", hackathon_id="h-001", problem_statement_id="ps-002", registered_by_id="u-stu-004", status="registered", created_at=now, updated_at=now),
        # WebDev Sprint registrations (ended)
        Registration(id="r-003", team_id="t-003", hackathon_id="h-003", problem_statement_id="ps-006", registered_by_id="u-stu-001", status="registered", created_at=now - timedelta(days=20), updated_at=now - timedelta(days=20)),
        Registration(id="r-004", team_id="t-004", hackathon_id="h-003", problem_statement_id="ps-007", registered_by_id="u-stu-006", status="registered", created_at=now - timedelta(days=20), updated_at=now - timedelta(days=20)),
        # Blockchain registrations (active)
        Registration(id="r-005", team_id="t-005", hackathon_id="h-004", problem_statement_id="ps-008", registered_by_id="u-stu-006", status="registered", created_at=now - timedelta(days=5), updated_at=now - timedelta(days=5)),
        Registration(id="r-006", team_id="t-006", hackathon_id="h-004", problem_statement_id="ps-009", registered_by_id="u-stu-009", status="registered", created_at=now - timedelta(days=5), updated_at=now - timedelta(days=5)),
    ]

    for r in registrations:
        db.add(r)
    db.flush()
    print(f"   ✅ {len(registrations)} registrations created")

    # ─────────────────────────────────────────────
    # Step 9: Create Submissions (for ended hackathon)
    # ─────────────────────────────────────────────
    print("\n📤 Creating submissions...")

    submissions = [
        # WebDev Sprint submissions (ended, graded)
        Submission(
            id="sub-001",
            team_id="t-003",
            hackathon_id="h-003",
            problem_statement_id="ps-006",
            title="LiveCode - Real-Time Code Editor",
            description="A real-time collaborative code editor with live cursors, syntax highlighting, and integrated chat. Built with React + WebSockets.",
            repo_url="https://github.com/pixel-perfect/livecode",
            demo_url="https://livecode-demo.vercel.app",
            video_url="https://youtube.com/watch?v=demo1",
            status="graded",
            submitted_at=now - timedelta(days=5),
            created_at=now - timedelta(days=5),
            updated_at=now - timedelta(days=4),
        ),
        Submission(
            id="sub-002",
            team_id="t-004",
            hackathon_id="h-003",
            problem_statement_id="ps-007",
            title="FolioForge - Portfolio Builder",
            description="A beautiful drag-and-drop portfolio website builder with 10+ themes, custom domains, and analytics dashboard. Built with Next.js.",
            repo_url="https://github.com/debug-dynasty/folioforge",
            demo_url="https://folioforge.vercel.app",
            status="graded",
            submitted_at=now - timedelta(days=5),
            created_at=now - timedelta(days=5),
            updated_at=now - timedelta(days=4),
        ),
        # Blockchain Buildathon submissions (active, in progress)
        Submission(
            id="sub-003",
            team_id="t-005",
            hackathon_id="h-004",
            problem_statement_id="ps-008",
            title="CertChain - Decentralized Credentials",
            description="Blockchain-based credential verification system using Ethereum smart contracts. Tamper-proof academic certificates on-chain.",
            repo_url="https://github.com/chain-gang/certchain",
            status="submitted",
            submitted_at=now,
            created_at=now,
            updated_at=now,
        ),
    ]

    for s in submissions:
        db.add(s)
    db.flush()
    print(f"   ✅ {len(submissions)} submissions created")

    # ─────────────────────────────────────────────
    # Step 10: Create Judge Assignments
    # ─────────────────────────────────────────────
    print("\n⚖️ Creating judge assignments...")

    judge_assignments = [
        # WebDev Sprint judge assignments
        JudgeAssignment(id="ja-001", hackathon_id="h-003", submission_id="sub-001", judge_id="u-judge-001", assigned_by_id="u-admin-001", assigned_at=now - timedelta(days=4), created_at=now - timedelta(days=4), updated_at=now - timedelta(days=4)),
        JudgeAssignment(id="ja-002", hackathon_id="h-003", submission_id="sub-002", judge_id="u-judge-001", assigned_by_id="u-admin-001", assigned_at=now - timedelta(days=4), created_at=now - timedelta(days=4), updated_at=now - timedelta(days=4)),
        JudgeAssignment(id="ja-003", hackathon_id="h-003", submission_id="sub-001", judge_id="u-judge-002", assigned_by_id="u-admin-001", assigned_at=now - timedelta(days=4), created_at=now - timedelta(days=4), updated_at=now - timedelta(days=4)),
        JudgeAssignment(id="ja-004", hackathon_id="h-003", submission_id="sub-002", judge_id="u-judge-002", assigned_by_id="u-admin-001", assigned_at=now - timedelta(days=4), created_at=now - timedelta(days=4), updated_at=now - timedelta(days=4)),
        # Blockchain hackathon judge assignment
        JudgeAssignment(id="ja-005", hackathon_id="h-004", submission_id="sub-003", judge_id="u-judge-003", assigned_by_id="u-coord-002", assigned_at=now, created_at=now, updated_at=now),
    ]

    for ja in judge_assignments:
        db.add(ja)
    db.flush()
    print(f"   ✅ {len(judge_assignments)} judge assignments created")

    # ─────────────────────────────────────────────
    # Step 11: Create Evaluations (for ended hackathon)
    # ─────────────────────────────────────────────
    print("\n📊 Creating evaluations...")

    evaluations = [
        # Judge 1 evaluations for WebDev Sprint
        Evaluation(
            id="ev-001",
            submission_id="sub-001",
            judge_id="u-judge-001",
            score_innovation=9.0,
            score_technical=8.5,
            score_uiux=9.0,
            score_impact=8.0,
            score_presentation=8.5,
            total_score=43.0,
            feedback="Excellent real-time collaboration features. Very polished UI.",
            strengths="Seamless real-time sync, beautiful interface, good error handling.",
            weaknesses="Could add more language support for syntax highlighting.",
            suggestions="Consider adding video calling for pair programming sessions.",
            recommendation="accepted",
            is_draft=False,
            submitted_at=now - timedelta(days=3),
            created_at=now - timedelta(days=3),
            updated_at=now - timedelta(days=3),
        ),
        Evaluation(
            id="ev-002",
            submission_id="sub-002",
            judge_id="u-judge-001",
            score_innovation=7.5,
            score_technical=7.0,
            score_uiux=8.5,
            score_impact=7.0,
            score_presentation=8.0,
            total_score=38.0,
            feedback="Good portfolio builder with nice templates. Drag-and-drop works well.",
            strengths="Intuitive UI, good template variety, smooth animations.",
            weaknesses="Custom domain setup documentation needs improvement.",
            suggestions="Add SEO optimization tools and social media preview.",
            recommendation="shortlist",
            is_draft=False,
            submitted_at=now - timedelta(days=3),
            created_at=now - timedelta(days=3),
            updated_at=now - timedelta(days=3),
        ),
        # Judge 2 evaluations for WebDev Sprint
        Evaluation(
            id="ev-003",
            submission_id="sub-001",
            judge_id="u-judge-002",
            score_innovation=8.5,
            score_technical=9.0,
            score_uiux=8.0,
            score_impact=8.5,
            score_presentation=9.0,
            total_score=43.0,
            feedback="Strong technical implementation. WebSocket architecture is well-designed.",
            strengths="Robust architecture, conflict resolution works perfectly.",
            weaknesses="Mobile responsiveness needs work.",
            suggestions="Add offline mode with sync when reconnected.",
            recommendation="accepted",
            is_draft=False,
            submitted_at=now - timedelta(days=3),
            created_at=now - timedelta(days=3),
            updated_at=now - timedelta(days=3),
        ),
        Evaluation(
            id="ev-004",
            submission_id="sub-002",
            judge_id="u-judge-002",
            score_innovation=7.0,
            score_technical=7.5,
            score_uiux=9.0,
            score_impact=7.5,
            score_presentation=7.5,
            total_score=38.5,
            feedback="Very user-friendly portfolio builder. Great UX design.",
            strengths="Beautiful templates, easy to use, fast deployment.",
            weaknesses="Limited customization options for advanced users.",
            suggestions="Consider adding a code editor for advanced customization.",
            recommendation="shortlist",
            is_draft=False,
            submitted_at=now - timedelta(days=3),
            created_at=now - timedelta(days=3),
            updated_at=now - timedelta(days=3),
        ),
    ]

    for ev in evaluations:
        db.add(ev)
    db.flush()
    print(f"   ✅ {len(evaluations)} evaluations created")

    # ─────────────────────────────────────────────
    # Step 12: Create Announcements
    # ─────────────────────────────────────────────
    print("\n📢 Creating announcements...")

    announcements = [
        Announcement(
            id="ann-001",
            title="CodeStorm 2026 Registrations Open!",
            content="We are excited to announce that registrations for CodeStorm 2026 are now open! Form your teams and register before the deadline. Prizes worth ₹1,00,000 up for grabs!",
            announcement_type="success",
            is_published=True,
            hackathon_id="h-001",
            created_by_id="u-coord-001",
            created_at=now,
            updated_at=now,
        ),
        Announcement(
            id="ann-002",
            title="WebDev Sprint Results Published",
            content="Congratulations to all participants! The results for WebDev Sprint 2026 have been published. Check the leaderboard to see the final rankings. Team Pixel Perfect wins first place! 🎉",
            announcement_type="info",
            is_published=True,
            hackathon_id="h-003",
            created_by_id="u-coord-001",
            created_at=now - timedelta(days=3),
            updated_at=now - timedelta(days=3),
        ),
        Announcement(
            id="ann-003",
            title="Blockchain Buildathon - Submission Deadline Extended",
            content="Due to popular demand, the submission deadline for Blockchain Buildathon has been extended by 6 hours. Submit your projects by 11:59 PM tonight!",
            announcement_type="warning",
            is_published=True,
            hackathon_id="h-004",
            created_by_id="u-coord-002",
            created_at=now,
            updated_at=now,
        ),
        Announcement(
            id="ann-004",
            title="Platform Maintenance Notice",
            content="The CHMS platform will undergo scheduled maintenance on Sunday 2 AM - 4 AM IST. Please save your work before the maintenance window.",
            announcement_type="urgent",
            is_published=True,
            hackathon_id=None,
            created_by_id="u-admin-001",
            created_at=now - timedelta(days=1),
            updated_at=now - timedelta(days=1),
        ),
    ]

    for ann in announcements:
        db.add(ann)
    db.flush()
    print(f"   ✅ {len(announcements)} announcements created")

    # ─────────────────────────────────────────────
    # Step 13: Create Notifications
    # ─────────────────────────────────────────────
    print("\n🔔 Creating notifications...")

    notifications = [
        Notification(
            id="n-001",
            user_id="u-stu-001",
            type="hackathon_event",
            title="Registration Confirmed",
            message="Your team 'Code Crushers' has been registered for CodeStorm 2026!",
            is_read=False,
            created_at=now,
            updated_at=now,
        ),
        Notification(
            id="n-002",
            user_id="u-stu-001",
            type="result_publication",
            title="Results Published - WebDev Sprint",
            message="Results for WebDev Sprint 2026 are out! Your team 'Pixel Perfect' secured 1st place! 🏆",
            is_read=True,
            created_at=now - timedelta(days=3),
            updated_at=now - timedelta(days=3),
        ),
        Notification(
            id="n-003",
            user_id="u-stu-004",
            type="hackathon_event",
            title="Registration Confirmed",
            message="Your team 'Binary Brains' has been registered for CodeStorm 2026!",
            is_read=False,
            created_at=now,
            updated_at=now,
        ),
        Notification(
            id="n-004",
            user_id="u-stu-006",
            type="submission_event",
            title="Submission Received",
            message="Your team 'Chain Gang' submission for Blockchain Buildathon has been received successfully.",
            is_read=False,
            created_at=now,
            updated_at=now,
        ),
    ]

    for n in notifications:
        db.add(n)
    db.flush()
    print(f"   ✅ {len(notifications)} notifications created")

    # ─────────────────────────────────────────────
    # Commit everything
    # ─────────────────────────────────────────────
    db.commit()

    print("\n" + "=" * 60)
    print("🎉 SEED COMPLETE! Local database is ready.")
    print("=" * 60)
    print("\n📊 Summary:")
    print(f"   👤 Users:              {len(users)} (1 admin, 2 coordinators, 3 judges, 10 students)")
    print(f"   🏆 Hackathons:         {len(hackathons)} (1 upcoming, 1 future, 1 ended, 1 active)")
    print(f"   📝 Problem Statements: {len(problem_statements)}")
    print(f"   🔗 Coord Assignments:  {len(coord_assignments)}")
    print(f"   👥 Teams:              {len(teams)}")
    print(f"   🧑‍🤝‍🧑 Team Members:      {len(members)}")
    print(f"   📋 Registrations:      {len(registrations)}")
    print(f"   📤 Submissions:        {len(submissions)}")
    print(f"   ⚖️  Judge Assignments:  {len(judge_assignments)}")
    print(f"   📊 Evaluations:        {len(evaluations)}")
    print(f"   📢 Announcements:      {len(announcements)}")
    print(f"   🔔 Notifications:      {len(notifications)}")
    print(f"\n🔐 Login credentials (all users):")
    print(f"   Password: password123")
    print(f"   Admin:       admin@chms.local")
    print(f"   Coordinator: coordinator1@chms.local / coordinator2@chms.local")
    print(f"   Judge:       judge1@chms.local / judge2@chms.local / judge3@chms.local")
    print(f"   Student:     bhavesh@chms.local / dhyey@chms.local / yash@chms.local")
    print(f"                riya@chms.local / amit@chms.local / neha@chms.local")
    print(f"                rohan@chms.local / kavya@chms.local / sahil@chms.local / pooja@chms.local")

except Exception as e:
    db.rollback()
    print(f"\n❌ ERROR during seeding: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
finally:
    db.close()
