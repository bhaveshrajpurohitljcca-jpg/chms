"""add certificate studio tables

Revision ID: b7e3d9a8c1f2
Revises: f1a2b3c4d5e6
Create Date: 2026-08-16 18:15:00.000000
"""
from alembic import op
import sqlalchemy as sa


revision = "b7e3d9a8c1f2"
down_revision = "f1a2b3c4d5e6"
branch_labels = None
depends_on = None


def upgrade():
    # Earlier interrupted deploys may have created one table before the
    # migration revision was recorded. Check first so retrying is safe.
    inspector = sa.inspect(op.get_bind())
    if not inspector.has_table("certificate_template"):
        op.create_table(
            "certificate_template",
            sa.Column("id", sa.String(length=36), primary_key=True),
            sa.Column("hackathon_id", sa.String(length=36), sa.ForeignKey("hackathon.id", ondelete="CASCADE"), nullable=False),
            sa.Column("created_by_id", sa.String(length=36), sa.ForeignKey("user.id", ondelete="SET NULL"), nullable=True),
            sa.Column("name", sa.String(length=255), nullable=False),
            sa.Column("recipient_type", sa.String(length=30), nullable=False),
            sa.Column("certificate_type", sa.String(length=100), nullable=False),
            sa.Column("background_url", sa.String(length=500), nullable=True),
            sa.Column("field_layout", sa.Text(), nullable=False, server_default="[]"),
            sa.Column("is_published", sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column("published_at", sa.DateTime(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=False),
        )
    if not inspector.has_table("certificate"):
        op.create_table(
            "certificate",
            sa.Column("id", sa.String(length=36), primary_key=True),
            sa.Column("verification_id", sa.String(length=40), nullable=False),
            sa.Column("template_id", sa.String(length=36), sa.ForeignKey("certificate_template.id", ondelete="RESTRICT"), nullable=False),
            sa.Column("hackathon_id", sa.String(length=36), sa.ForeignKey("hackathon.id", ondelete="CASCADE"), nullable=False),
            sa.Column("recipient_id", sa.String(length=36), sa.ForeignKey("user.id", ondelete="CASCADE"), nullable=False),
            sa.Column("team_id", sa.String(length=36), sa.ForeignKey("team.id", ondelete="SET NULL"), nullable=True),
            sa.Column("certificate_type", sa.String(length=100), nullable=False),
            sa.Column("recipient_name", sa.String(length=255), nullable=False),
            sa.Column("team_name", sa.String(length=255), nullable=True),
            sa.Column("award_label", sa.String(length=255), nullable=True),
            sa.Column("issued_at", sa.DateTime(), nullable=False),
            sa.Column("revoked_at", sa.DateTime(), nullable=True),
            sa.Column("revoke_reason", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=False),
            sa.UniqueConstraint("template_id", "recipient_id", name="unique_template_recipient_certificate"),
        )
    inspector = sa.inspect(op.get_bind())
    if not any(index["name"] == "ix_certificate_verification_id" for index in inspector.get_indexes("certificate")):
        op.create_index("ix_certificate_verification_id", "certificate", ["verification_id"], unique=True)


def downgrade():
    op.drop_index("ix_certificate_verification_id", table_name="certificate")
    op.drop_table("certificate")
    op.drop_table("certificate_template")
