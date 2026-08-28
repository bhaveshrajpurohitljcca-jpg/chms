"""store remote certificate background paths"""
from alembic import op
import sqlalchemy as sa
revision = "d5e6f7a8b9c0"
down_revision = "c4d5e6f7a8b9"
branch_labels = None
depends_on = None
def upgrade():
    inspector = sa.inspect(op.get_bind())
    if "background_storage_path" not in [c["name"] for c in inspector.get_columns("certificate_template")]:
        op.add_column("certificate_template", sa.Column("background_storage_path", sa.String(500), nullable=True))
def downgrade():
    op.drop_column("certificate_template", "background_storage_path")
