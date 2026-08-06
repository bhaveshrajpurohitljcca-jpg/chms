"""merge_all_heads_for_main

Revision ID: dd54d7d0f0bc
Revises: 3358003b169e, 6953bef7fbc6
Create Date: 2026-08-03 19:35:45.555938

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'dd54d7d0f0bc'
down_revision: Union[str, Sequence[str], None] = ('3358003b169e', '6953bef7fbc6')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
