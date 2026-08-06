"""merge_all_migration_heads

Revision ID: 9f23433f7c48
Revises: 0ad18bd2b7b1, dd54d7d0f0bc
Create Date: 2026-08-06 16:26:22.434462

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9f23433f7c48'
down_revision: Union[str, Sequence[str], None] = ('0ad18bd2b7b1', 'dd54d7d0f0bc')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
