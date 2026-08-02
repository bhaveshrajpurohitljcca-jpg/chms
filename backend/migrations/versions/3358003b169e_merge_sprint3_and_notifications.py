"""merge_sprint3_and_notifications

Revision ID: 3358003b169e
Revises: 0ca59fc4bfdc, aa6f7ac6eec8
Create Date: 2026-07-28 21:28:22.946277

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3358003b169e'
down_revision: Union[str, Sequence[str], None] = ('0ca59fc4bfdc', 'aa6f7ac6eec8')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
