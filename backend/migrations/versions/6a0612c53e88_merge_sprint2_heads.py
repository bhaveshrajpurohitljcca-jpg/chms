"""merge_sprint2_heads

Revision ID: 6a0612c53e88
Revises: 013ac4368b4d, 3af374299e1d, 8804aa1e5455
Create Date: 2026-07-27 22:30:36.584947

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6a0612c53e88'
down_revision: Union[str, Sequence[str], None] = ('013ac4368b4d', '3af374299e1d', '8804aa1e5455')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
