"""add magic tokens

Revision ID: c3f1a2b4e5d6
Revises: a7d4c33dddeb
Create Date: 2026-05-13 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'c3f1a2b4e5d6'
down_revision: Union[str, Sequence[str], None] = 'a7d4c33dddeb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'magic_tokens',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('token', sa.String(), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('used', sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('token'),
    )


def downgrade() -> None:
    op.drop_table('magic_tokens')
