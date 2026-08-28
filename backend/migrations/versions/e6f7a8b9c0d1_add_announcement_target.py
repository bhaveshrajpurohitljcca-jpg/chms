"""persist announcement audience targeting"""
from alembic import op
import sqlalchemy as sa
revision = "e6f7a8b9c0d1"
down_revision = "d5e6f7a8b9c0"
branch_labels = None
depends_on = None
def upgrade():
    inspector = sa.inspect(op.get_bind())
    if "target" not in [c["name"] for c in inspector.get_columns("announcement")]:
        op.add_column("announcement", sa.Column("target", sa.String(255), nullable=True))
def downgrade():
    op.drop_column("announcement", "target")
