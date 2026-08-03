"""Merge heads

Revision ID: 02228d3bbcee
Revises: e78b6127c5e9
Create Date: 2026-08-04 02:00:13.394830

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '02228d3bbcee'
down_revision: Union[str, Sequence[str], None] = 'e78b6127c5e9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
