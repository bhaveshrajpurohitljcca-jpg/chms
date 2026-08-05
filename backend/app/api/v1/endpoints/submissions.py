import os
import uuid
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.submission import Submission, Evaluation, JudgeAssignment, SubmissionStatus
from app.models.team import Team, TeamMember
from app.models.hackathon import Hackathon, CoordinatorAssignment
from app.models.user import User, UserRole
from app.schemas.submission import (
    SubmissionCreate, SubmissionUpdate, SubmissionResponse,
    EvaluationCreate, EvaluationResponse
)
from app.schemas.response import StandardResponse
from app.api.deps import get_current_active_user, RoleChecker

router = APIRouter(prefix="/submissions", tags=["Submissions & Evaluations"])

# Allowed file extensions and max size
ALLOWED_EXTENSIONS = {".pdf", ".ppt", ".pptx", ".docx", ".zip"}
MAX_FILE_SIZE_MB = 50
UPLOAD_DIR = "uploads"


def _get_user_team_for_hackathon(db: Session, user_id: str, hackathon_id: str) -> Optional[Team]:
    """Returns the team where user is a member for the given hackathon."""
    member_records = db.query(TeamMember).filter(TeamMember.user_id == user_id).all()
    team_ids = [m.team_id for m in member_records]
    if not team_ids:
        return None
    return db.query(Team).filter(
        Team.id.in_(team_ids),
        Team.hackathon_id == hackathon_id
    ).first()


def _ensure_team_membership(db: Session, team_id: str, user_id: str):
    """Raises HTTP 403 if the user is not a member of the team."""
    membership = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == user_id
    ).first()
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You are not a member of this team."
        )


# ─────────────────────────────────────────────────────────────
# GET /submissions  – Admin/Judge/Coordinator list view
# ─────────────────────────────────────────────────────────────
@router.get("", response_model=StandardResponse[List[SubmissionResponse]])
def list_submissions(
    hackathon_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List all submissions, filtered by roles and permissions."""
    if current_user.role == UserRole.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Students cannot list all submissions."
        )

    query = db.query(Submission)
    
    if current_user.role == UserRole.COORDINATOR:
        # Get assigned hackathons for this coordinator
        assigned_ids = [a.hackathon_id for a in db.query(CoordinatorAssignment).filter(
            CoordinatorAssignment.coordinator_id == current_user.id
        ).all()]
        if hackathon_id:
            if hackathon_id not in assigned_ids:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied. This hackathon is not assigned to you."
                )
            query = query.filter(Submission.hackathon_id == hackathon_id)
        else:
            query = query.filter(Submission.hackathon_id.in_(assigned_ids))
            
    elif current_user.role == UserRole.JUDGE:
        # Get judge assignments (specific submissions and hackathons)
        assigned_subs = [a.submission_id for a in db.query(JudgeAssignment).filter(
            JudgeAssignment.judge_id == current_user.id,
            JudgeAssignment.submission_id.isnot(None)
        ).all()]
        assigned_hacks = [a.hackathon_id for a in db.query(JudgeAssignment).filter(
            JudgeAssignment.judge_id == current_user.id,
            JudgeAssignment.submission_id.is_(None)
        ).all()]
        
        if hackathon_id:
            if hackathon_id in assigned_hacks:
                query = query.filter(Submission.hackathon_id == hackathon_id)
            else:
                query = query.filter(
                    Submission.hackathon_id == hackathon_id,
                    Submission.id.in_(assigned_subs)
                )
        else:
            query = query.filter(
                (Submission.hackathon_id.in_(assigned_hacks)) |
                (Submission.id.in_(assigned_subs))
            )
            
    elif hackathon_id:
        query = query.filter(Submission.hackathon_id == hackathon_id)

    subs = query.order_by(Submission.submitted_at.desc()).all()
    results = [SubmissionResponse.from_orm(s) for s in subs]
    return StandardResponse(
        success=True,
        message="Submissions retrieved successfully.",
        data=results
    )



# ─────────────────────────────────────────────────────────────
# GET /submissions/my-submission  – Student's own submission
# ─────────────────────────────────────────────────────────────
@router.get("/my-submission", response_model=StandardResponse[Optional[SubmissionResponse]])
def get_my_submission(
    hackathon_id: str = Query(..., description="The hackathon ID to query submission for"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Returns the authenticated student's team's submission for a given hackathon.
    Returns null data if no submission exists yet.
    """
    team = _get_user_team_for_hackathon(db, current_user.id, hackathon_id)
    if not team:
        return StandardResponse(
            success=True,
            message="No registered team found for this hackathon.",
            data=None
        )

    submission = db.query(Submission).filter(
        Submission.team_id == team.id,
        Submission.hackathon_id == hackathon_id
    ).first()

    return StandardResponse(
        success=True,
        message="Submission retrieved." if submission else "No submission found yet.",
        data=SubmissionResponse.from_orm(submission) if submission else None
    )


# ─────────────────────────────────────────────────────────────
# POST /submissions  – Create new submission
# ─────────────────────────────────────────────────────────────
@router.post("", response_model=StandardResponse[SubmissionResponse])
def create_submission(
    payload: SubmissionCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Creates a new project submission.
    - Validates team membership and ownership.
    - Validates hackathon exists and is active.
    - Prevents duplicate submissions for the same team/hackathon.
    """
    # 1. Validate team membership and require leader role
    team = db.query(Team).filter(Team.id == payload.team_id).first()
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found.")
    
    _ensure_team_membership(db, payload.team_id, current_user.id)

    if team.leader_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the team leader can submit the project."
        )

    # 2. Validate hackathon
    hackathon = db.query(Hackathon).filter(Hackathon.id == payload.hackathon_id).first()
    if not hackathon:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hackathon not found.")

    # 3. Validate team belongs to the hackathon
    team = db.query(Team).filter(
        Team.id == payload.team_id,
        Team.hackathon_id == payload.hackathon_id
    ).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your team is not registered for this hackathon."
        )

    # 3.1 Validate team member count criteria
    member_count = db.query(TeamMember).filter(TeamMember.team_id == payload.team_id).count()
    if hackathon.is_strict_team_size and hackathon.strict_team_size:
        if member_count != hackathon.strict_team_size:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Team size criteria unfulfilled: Your team must have STRICTLY {hackathon.strict_team_size} members to submit. Current members: {member_count}."
            )
    elif hackathon.min_team_size and member_count < hackathon.min_team_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Team size criteria unfulfilled: Your team must have at least {hackathon.min_team_size} members to submit. Current members: {member_count}."
        )

    # 4. Deadline check
    if hackathon.end_date and datetime.utcnow() > hackathon.end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Submission deadline has passed. Submissions are no longer accepted."
        )

    # 5. Duplicate protection — check if team already has a submission
    existing = db.query(Submission).filter(
        Submission.team_id == payload.team_id,
        Submission.hackathon_id == payload.hackathon_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Your team has already submitted for this hackathon. Use the update endpoint to modify it."
        )

    ps_id = payload.problem_statement_id if payload.problem_statement_id and payload.problem_statement_id.strip() else None
    demo_url = payload.demo_url if payload.demo_url and payload.demo_url.strip() else None
    video_url = payload.video_url if payload.video_url and payload.video_url.strip() else None
    notes = payload.additional_notes if payload.additional_notes and payload.additional_notes.strip() else None

    # 6. Create submission
    submission = Submission(
        team_id=payload.team_id,
        hackathon_id=payload.hackathon_id,
        problem_statement_id=ps_id,
        title=payload.title.strip(),
        description=payload.description.strip() if payload.description else None,
        repo_url=payload.repo_url.strip(),
        demo_url=demo_url,
        video_url=video_url,
        additional_notes=notes,
        status=SubmissionStatus.SUBMITTED
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    return StandardResponse(
        success=True,
        message="Project submitted successfully!",
        data=SubmissionResponse.from_orm(submission)
    )


# ─────────────────────────────────────────────────────────────
# PUT /submissions/{submission_id}  – Update existing submission
# ─────────────────────────────────────────────────────────────
@router.put("/{submission_id}", response_model=StandardResponse[SubmissionResponse])
def update_submission(
    submission_id: str,
    payload: SubmissionUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Updates an existing submission.
    - Validates ownership via team membership.
    - Prevents updates to graded or accepted submissions.
    """
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found.")

    # Authorization: user must be the team leader
    _ensure_team_membership(db, submission.team_id, current_user.id)

    if submission.team.leader_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the team leader can modify the project submission."
        )

    # Lock graded/accepted submissions
    if submission.status in (SubmissionStatus.GRADED, SubmissionStatus.ACCEPTED):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Submission is {submission.status} and can no longer be modified."
        )

    # Deadline check
    hackathon = db.query(Hackathon).filter(Hackathon.id == submission.hackathon_id).first()
    if hackathon and hackathon.end_date and datetime.utcnow() > hackathon.end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Submission deadline has passed."
        )

    # Apply partial updates
    update_data = payload.model_dump(exclude_none=True)
    for field, value in update_data.items():
        setattr(submission, field, value)

    db.commit()
    db.refresh(submission)

    return StandardResponse(
        success=True,
        message="Submission updated successfully.",
        data=SubmissionResponse.from_orm(submission)
    )


# ─────────────────────────────────────────────────────────────
# POST /submissions/upload  – File Upload
# ─────────────────────────────────────────────────────────────
@router.post("/upload", response_model=StandardResponse[dict])
async def upload_submission_file(
    file: UploadFile = File(...),
    submission_id: Optional[str] = Query(None, description="Attach to an existing submission"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Uploads a project deliverable file (PDF, PPT, PPTX, DOCX, ZIP).
    - Validates extension and file size (max 50MB).
    - Stores file locally in /uploads directory.
    - Optionally attaches it to an existing submission record.
    """
    # 1. Validate file extension
    filename = file.filename or ""
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type '{ext}' is not allowed. Accepted: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # 2. Read content and validate size
    content = await file.read()
    size_mb = len(content) / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum size of {MAX_FILE_SIZE_MB}MB. Uploaded: {size_mb:.2f}MB"
        )

    # 3. Save to disk with UUID-based name
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    unique_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)
    with open(file_path, "wb") as f:
        f.write(content)

    file_url = f"/uploads/{unique_name}"

    # 4. Attach to submission if submission_id provided
    if submission_id:
        submission = db.query(Submission).filter(Submission.id == submission_id).first()
        if submission:
            _ensure_team_membership(db, submission.team_id, current_user.id)
            if submission.team.leader_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only the team leader can upload/attach files to the submission."
                )
            # Delete old file if present
            if submission.file_url:
                old_path = submission.file_url.lstrip("/")
                if os.path.exists(old_path):
                    os.remove(old_path)
            submission.file_url = file_url
            submission.file_name = filename
            db.commit()

    return StandardResponse(
        success=True,
        message="File uploaded successfully.",
        data={"file_url": file_url, "file_name": filename}
    )


# ─────────────────────────────────────────────────────────────
# DELETE /submissions/{submission_id}/file  – Remove uploaded file
# ─────────────────────────────────────────────────────────────
@router.delete("/{submission_id}/file", response_model=StandardResponse[dict])
def delete_submission_file(
    submission_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Removes the uploaded file from disk and clears file_url from submission."""
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found.")

    _ensure_team_membership(db, submission.team_id, current_user.id)

    if not submission.file_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file attached to this submission."
        )

    # Remove from disk
    file_path = submission.file_url.lstrip("/")
    if os.path.exists(file_path):
        os.remove(file_path)

    submission.file_url = None
    submission.file_name = None
    db.commit()

    return StandardResponse(
        success=True,
        message="File removed successfully.",
        data={}
    )


# ─────────────────────────────────────────────────────────────
# POST /submissions/evaluate  – Judge/Admin evaluation
# ─────────────────────────────────────────────────────────────
@router.post("/evaluate", response_model=StandardResponse[EvaluationResponse])
def evaluate_submission(
    payload: EvaluationCreate,
    current_user: User = Depends(RoleChecker([UserRole.JUDGE, UserRole.ADMIN, UserRole.COORDINATOR])),
    db: Session = Depends(get_db)
):
    """Creates or updates a judge evaluation for a submission."""
    submission = db.query(Submission).filter(Submission.id == payload.submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found.")

    if current_user.role == UserRole.JUDGE:
        # A judge must not evaluate submissions that are not assigned to that judge
        assigned = db.query(JudgeAssignment).filter(
            JudgeAssignment.judge_id == current_user.id,
            (JudgeAssignment.submission_id == payload.submission_id) |
            ((JudgeAssignment.submission_id.is_(None)) & (JudgeAssignment.hackathon_id == submission.hackathon_id))
        ).first()
        if not assigned:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. You are not assigned to evaluate this submission."
            )


    existing_eval = db.query(Evaluation).filter(
        Evaluation.submission_id == payload.submission_id,
        Evaluation.judge_id == current_user.id
    ).first()

    total = (payload.score_innovation + payload.score_execution + payload.score_presentation) / 3.0

    if existing_eval:
        existing_eval.score_innovation = payload.score_innovation
        existing_eval.score_technical = payload.score_execution
        existing_eval.score_presentation = payload.score_presentation
        existing_eval.total_score = round(total, 2)
        existing_eval.feedback = payload.feedback
        eval_obj = existing_eval
    else:
        eval_obj = Evaluation(
            submission_id=payload.submission_id,
            judge_id=current_user.id,
            score_innovation=payload.score_innovation,
            score_technical=payload.score_execution,
            score_presentation=payload.score_presentation,
            total_score=round(total, 2),
            feedback=payload.feedback
        )
        db.add(eval_obj)

    # Update submission status when graded
    submission.status = SubmissionStatus.GRADED
    db.commit()
    db.refresh(eval_obj)

    return StandardResponse(
        success=True,
        message="Evaluation score saved.",
        data=EvaluationResponse.from_orm(eval_obj)
    )
