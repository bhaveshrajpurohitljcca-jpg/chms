"""add_announcement_table_sprint3

Revision ID: 6953bef7fbc6
Revises: 4e403ca9ec88
Create Date: 2026-07-27 23:35:15.714350

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6953bef7fbc6'
down_revision: Union[str, Sequence[str], None] = '4e403ca9ec88'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema — Sprint 3: Add announcement table."""
    op.create_table('announcement',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('announcement_type', sa.Enum('INFO', 'WARNING', 'SUCCESS', 'URGENT', name='announcementtype'), nullable=False),
        sa.Column('is_published', sa.Boolean(), nullable=False),
        sa.Column('hackathon_id', sa.String(length=36), nullable=True),
        sa.Column('created_by_id', sa.String(length=36), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['created_by_id'], ['user.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['hackathon_id'], ['hackathon.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('announcement')
