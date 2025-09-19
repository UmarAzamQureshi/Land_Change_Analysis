"""fix_user_role_enum

Revision ID: aa8793874781
Revises: 08aa5ff7e1de
Create Date: 2025-09-04 21:07:04.960378

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'aa8793874781'
down_revision: Union[str, Sequence[str], None] = '08aa5ff7e1de'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # First, normalize all role values to lowercase
    op.execute("UPDATE users SET role = LOWER(role)")
    
    # Create the enum type
    op.execute("CREATE TYPE userrole AS ENUM ('admin', 'user')")
    
    # Change the column type to use the enum
    op.execute("ALTER TABLE users ALTER COLUMN role TYPE userrole USING role::userrole")


def downgrade() -> None:
    """Downgrade schema."""
    # Change the column back to varchar
    op.execute("ALTER TABLE users ALTER COLUMN role TYPE VARCHAR")
    
    # Drop the enum type
    op.execute("DROP TYPE userrole")
