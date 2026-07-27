"""add_invitation_and_registration_tables

Revision ID: 8804aa1e5455
Revises: 2bdd5fc5e7f3
Create Date: 2026-07-26 23:15:19.138699

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8804aa1e5455'
down_revision: Union[str, Sequence[str], None] = '2bdd5fc5e7f3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'team_invitation',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('team_id', sa.String(length=36), nullable=False),
        sa.Column('invited_by_id', sa.String(length=36), nullable=False),
        sa.Column('invitee_email', sa.String(length=255), nullable=False),
        sa.Column('status', sa.Enum('PENDING', 'ACCEPTED', 'REJECTED', name='invitationstatus'), nullable=False, server_default='PENDING'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.ForeignKeyConstraint(['invited_by_id'], ['user.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['team_id'], ['team.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('team_id', 'invitee_email', name='unique_team_invitation_email')
    )

    op.create_table(
        'registration',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('team_id', sa.String(length=36), nullable=False),
        sa.Column('hackathon_id', sa.String(length=36), nullable=False),
        sa.Column('problem_statement_id', sa.String(length=36), nullable=True),
        sa.Column('registered_by_id', sa.String(length=36), nullable=False),
        sa.Column('status', sa.Enum('REGISTERED', 'CANCELLED', name='registrationstatus'), nullable=False, server_default='REGISTERED'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.ForeignKeyConstraint(['hackathon_id'], ['hackathon.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['problem_statement_id'], ['problem_statement.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['registered_by_id'], ['user.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['team_id'], ['team.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('team_id', 'hackathon_id', name='unique_team_hackathon_registration')
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('registration')
    op.drop_table('team_invitation')
