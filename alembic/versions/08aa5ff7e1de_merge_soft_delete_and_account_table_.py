"""merge soft delete and account table migrations

Revision ID: 08aa5ff7e1de
Revises: add_soft_delete_fields, e256ddd4eec1
Create Date: 2025-09-02 21:18:28.874272

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '08aa5ff7e1de'
down_revision: Union[str, Sequence[str], None] = ('add_soft_delete_fields', 'e256ddd4eec1')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
