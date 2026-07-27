"""add_judge_assignment_and_extended_evaluation

Revision ID: 0ca59fc4bfdc
Revises: 6a0612c53e88
Create Date: 2026-07-27 22:30:50.243734

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = '0ca59fc4bfdc'
down_revision: Union[str, Sequence[str], None] = '6a0612c53e88'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _column_exists(conn, table: str, column: str) -> bool:
    result = conn.execute(sa.text(f"PRAGMA table_info({table})"))
    return any(row[1] == column for row in result)


def _table_exists(conn, table: str) -> bool:
    result = conn.execute(
        sa.text("SELECT name FROM sqlite_master WHERE type='table' AND name=:t"),
        {"t": table}
    )
    return result.fetchone() is not None


def upgrade() -> None:
    """Upgrade schema — idempotent (safe to run even if partly applied)."""
    bind = op.get_bind()

    # ── Extend evaluation columns (only if not yet added) ────────
    eval_columns = [
        ('score_technical', sa.Float(), False, '0.0'),
        ('score_uiux',      sa.Float(), False, '0.0'),
        ('score_impact',    sa.Float(), False, '0.0'),
        ('strengths',       sa.Text(),  True,  None),
        ('weaknesses',      sa.Text(),  True,  None),
        ('suggestions',     sa.Text(),  True,  None),
        ('recommendation',  sa.String(50), False, 'pending'),
        ('is_draft',        sa.Boolean(),  False, '1'),
        ('submitted_at',    sa.DateTime(), True,  None),
    ]
    for col_name, col_type, nullable, default in eval_columns:
        if not _column_exists(bind, 'evaluation', col_name):
            if nullable:
                op.add_column('evaluation', sa.Column(col_name, col_type, nullable=True))
            else:
                op.add_column('evaluation', sa.Column(col_name, col_type, nullable=False, server_default=default))

    # ── Drop score_execution if still exists ─────────────────────
    if _column_exists(bind, 'evaluation', 'score_execution'):
        with op.batch_alter_table('evaluation') as batch_op:
            batch_op.drop_column('score_execution')

    # ── Create judge_assignment only if it doesn't exist ─────────
    if not _table_exists(bind, 'judge_assignment'):
        op.create_table(
            'judge_assignment',
            sa.Column('id', sa.String(36), primary_key=True),
            sa.Column('submission_id', sa.String(36),
                      sa.ForeignKey('submission.id', ondelete='CASCADE'), nullable=False),
            sa.Column('judge_id', sa.String(36),
                      sa.ForeignKey('user.id', ondelete='CASCADE'), nullable=False),
            sa.Column('assigned_by_id', sa.String(36),
                      sa.ForeignKey('user.id', ondelete='SET NULL'), nullable=True),
            sa.Column('assigned_at', sa.DateTime(), nullable=False),
            sa.UniqueConstraint('submission_id', 'judge_id',
                                name='unique_judge_submission_assignment'),
        )


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()

    if _table_exists(bind, 'judge_assignment'):
        op.drop_table('judge_assignment')

    with op.batch_alter_table('evaluation') as batch_op:
        if not _column_exists(bind, 'evaluation', 'score_execution'):
            batch_op.add_column(sa.Column('score_execution', sa.Float(), nullable=False, server_default='0.0'))
        for col in ['submitted_at', 'is_draft', 'recommendation', 'suggestions',
                    'weaknesses', 'strengths', 'score_impact', 'score_uiux', 'score_technical']:
            if _column_exists(bind, 'evaluation', col):
                batch_op.drop_column(col)
