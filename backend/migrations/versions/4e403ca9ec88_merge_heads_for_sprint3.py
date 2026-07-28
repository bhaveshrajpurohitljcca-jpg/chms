"""merge_heads_for_sprint3

Revision ID: 4e403ca9ec88
Revises: 013ac4368b4d, 3af374299e1d, 8804aa1e5455
Create Date: 2026-07-27 23:33:49.267206

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4e403ca9ec88'
down_revision: Union[str, Sequence[str], None] = ('013ac4368b4d', '3af374299e1d', '8804aa1e5455')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
