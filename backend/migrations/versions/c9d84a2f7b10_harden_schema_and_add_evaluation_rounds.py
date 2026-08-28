"""Harden schema and add independent evaluation rounds.

Revision ID: c9d84a2f7b10
Revises: 9f23433f7c48
"""
from alembic import op
import sqlalchemy as sa

revision = "c9d84a2f7b10"
down_revision = "9f23433f7c48"
branch_labels = None
depends_on = None


def _has_column(bind, table, column):
    return column in {item["name"] for item in sa.inspect(bind).get_columns(table)}


def _add_if_missing(bind, table, column):
    if not _has_column(bind, table, column.name):
        op.add_column(table, column)


def upgrade():
    bind = op.get_bind()
    _add_if_missing(bind, "user", sa.Column("github_url", sa.String(255), nullable=True))
    _add_if_missing(bind, "user", sa.Column("linkedin_url", sa.String(255), nullable=True))
    _add_if_missing(bind, "user", sa.Column("phone", sa.String(20), nullable=True))

    _add_if_missing(bind, "hackathon", sa.Column("is_strict_team_size", sa.Boolean(), nullable=False, server_default=sa.text("false")))
    _add_if_missing(bind, "hackathon", sa.Column("strict_team_size", sa.Integer(), nullable=True))
    _add_if_missing(bind, "hackathon", sa.Column("problem_statement_publish_at", sa.DateTime(), nullable=True))
    _add_if_missing(bind, "hackathon", sa.Column("problem_selection_deadline", sa.DateTime(), nullable=True))
    _add_if_missing(bind, "hackathon", sa.Column("submission_deadline", sa.DateTime(), nullable=True))
    _add_if_missing(bind, "hackathon", sa.Column("evaluation_mode", sa.String(20), nullable=False, server_default="single_round"))
    _add_if_missing(bind, "hackathon", sa.Column("finalists_per_problem", sa.Integer(), nullable=False, server_default="3"))
    _add_if_missing(bind, "hackathon", sa.Column("current_evaluation_round", sa.Integer(), nullable=False, server_default="1"))
    _add_if_missing(bind, "problem_statement", sa.Column("technical_deliverable", sa.Text(), nullable=True))
    _add_if_missing(bind, "problem_statement", sa.Column("points", sa.Integer(), nullable=False, server_default="100"))

    _add_if_missing(bind, "submission", sa.Column("problem_statement_id", sa.String(36), nullable=True))
    _add_if_missing(bind, "submission", sa.Column("repo_url", sa.String(500), nullable=True))
    _add_if_missing(bind, "submission", sa.Column("demo_url", sa.String(500), nullable=True))
    _add_if_missing(bind, "submission", sa.Column("video_url", sa.String(500), nullable=True))
    _add_if_missing(bind, "submission", sa.Column("tech_stack", sa.String(500), nullable=True))
    _add_if_missing(bind, "submission", sa.Column("is_finalist", sa.Boolean(), nullable=False, server_default=sa.text("false")))
    _add_if_missing(bind, "submission", sa.Column("round_one_score", sa.Float(), nullable=True))
    _add_if_missing(bind, "submission", sa.Column("final_rank", sa.Integer(), nullable=True))
    _add_if_missing(bind, "evaluation", sa.Column("round_number", sa.Integer(), nullable=False, server_default="1"))

    constraints = {item.get("name") for item in sa.inspect(bind).get_unique_constraints("evaluation")}
    with op.batch_alter_table("evaluation") as batch:
        if "unique_judge_submission_evaluation" in constraints:
            batch.drop_constraint("unique_judge_submission_evaluation", type_="unique")
        if "unique_judge_submission_round_evaluation" not in constraints:
            batch.create_unique_constraint(
                "unique_judge_submission_round_evaluation",
                ["submission_id", "judge_id", "round_number"],
            )


def downgrade():
    bind = op.get_bind()
    constraints = {item.get("name") for item in sa.inspect(bind).get_unique_constraints("evaluation")}
    with op.batch_alter_table("evaluation") as batch:
        if "unique_judge_submission_round_evaluation" in constraints:
            batch.drop_constraint("unique_judge_submission_round_evaluation", type_="unique")
        batch.create_unique_constraint("unique_judge_submission_evaluation", ["submission_id", "judge_id"])
        batch.drop_column("round_number")
