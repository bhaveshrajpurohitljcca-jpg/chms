"""Merge heads

Revision ID: e78b6127c5e9
Revises: 3358003b169e, 6953bef7fbc6
Create Date: 2026-08-04 01:57:38.020296

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e78b6127c5e9'
down_revision: Union[str, Sequence[str], None] = ('3358003b169e', '6953bef7fbc6')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
