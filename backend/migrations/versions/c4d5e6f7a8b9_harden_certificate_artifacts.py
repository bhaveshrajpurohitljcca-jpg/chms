"""enforce one template per audience and persist certificate PDFs"""
from alembic import op
import sqlalchemy as sa

revision = "c4d5e6f7a8b9"
down_revision = "b7e3d9a8c1f2"
branch_labels = None
depends_on = None

def upgrade():
    inspector = sa.inspect(op.get_bind())
    if "pdf_url" not in [c["name"] for c in inspector.get_columns("certificate")]:
        op.add_column("certificate", sa.Column("pdf_url", sa.String(500), nullable=True))
    if not any(x["name"] == "unique_hackathon_recipient_template" for x in inspector.get_unique_constraints("certificate_template")):
        op.create_unique_constraint("unique_hackathon_recipient_template", "certificate_template", ["hackathon_id", "recipient_type"])

def downgrade():
    op.drop_constraint("unique_hackathon_recipient_template", "certificate_template", type_="unique")
    op.drop_column("certificate", "pdf_url")
