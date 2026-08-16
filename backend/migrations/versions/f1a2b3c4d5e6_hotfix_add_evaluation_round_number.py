"""hotfix: add missing round_number (and related cols) to evaluation table

Revision ID: f1a2b3c4d5e6
Revises: c9d84a2f7b10
Create Date: 2026-08-16 11:20:00.000000

This migration is a hotfix for production. The previous migration
(c9d84a2f7b10) used sa.inspect() which can silently fail on PostgreSQL
when checking for column existence, leaving round_number unadded.
This migration uses raw SQL to safely add the column only if missing.
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import text

revision = "f1a2b3c4d5e6"
down_revision = "c9d84a2f7b10"
branch_labels = None
depends_on = None


def column_exists(conn, table_name: str, column_name: str) -> bool:
    """Reliably check column existence via information_schema (works on PostgreSQL & SQLite)."""
    result = conn.execute(text(
        "SELECT COUNT(*) FROM information_schema.columns "
        "WHERE table_name = :table AND column_name = :col"
    ), {"table": table_name, "col": column_name})
    return result.scalar() > 0


def upgrade():
    conn = op.get_bind()

    # ── evaluation.round_number ─────────────────────────────────────
    if not column_exists(conn, "evaluation", "round_number"):
        op.add_column(
            "evaluation",
            sa.Column("round_number", sa.Integer(), nullable=False, server_default="1")
        )

    # ── evaluation.is_draft ─────────────────────────────────────────
    if not column_exists(conn, "evaluation", "is_draft"):
        op.add_column(
            "evaluation",
            sa.Column("is_draft", sa.Boolean(), nullable=False, server_default="true")
        )

    # ── evaluation.submitted_at ─────────────────────────────────────
    if not column_exists(conn, "evaluation", "submitted_at"):
        op.add_column(
            "evaluation",
            sa.Column("submitted_at", sa.DateTime(), nullable=True)
        )

    # ── submission.is_finalist ──────────────────────────────────────
    if not column_exists(conn, "submission", "is_finalist"):
        op.add_column(
            "submission",
            sa.Column("is_finalist", sa.Boolean(), nullable=False, server_default="false")
        )

    # ── submission.round_one_score ──────────────────────────────────
    if not column_exists(conn, "submission", "round_one_score"):
        op.add_column(
            "submission",
            sa.Column("round_one_score", sa.Float(), nullable=True)
        )

    # ── submission.final_rank ───────────────────────────────────────
    if not column_exists(conn, "submission", "final_rank"):
        op.add_column(
            "submission",
            sa.Column("final_rank", sa.Integer(), nullable=True)
        )

    # ── Unique constraint on evaluation (safe add) ──────────────────
    # Only add if round_number was just added and old constraint still exists
    try:
        conn.execute(text(
            "ALTER TABLE evaluation DROP CONSTRAINT IF EXISTS unique_judge_submission_evaluation"
        ))
    except Exception:
        pass  # May not exist on all environments

    try:
        conn.execute(text(
            "ALTER TABLE evaluation ADD CONSTRAINT unique_judge_submission_round_evaluation "
            "UNIQUE (submission_id, judge_id, round_number)"
        ))
    except Exception:
        pass  # Already exists — that's fine


def downgrade():
    # Intentionally minimal — removing round_number would break things
    pass
