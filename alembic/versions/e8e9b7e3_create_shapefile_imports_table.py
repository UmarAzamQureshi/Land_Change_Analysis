"""
create shapefile_imports table

Revision ID: e8e9b7e3_create_shapefile_imports
Revises: 08aa5ff7e1de_merge_soft_delete_and_account_table_
Create Date: 2025-09-10
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e8e9b7e3_create_shapefile_imports'
down_revision = '08aa5ff7e1de_merge_soft_delete_and_account_table_'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'shapefile_imports',
        sa.Column('id', sa.Integer(), primary_key=True, nullable=False),
        sa.Column('filename', sa.String(), nullable=False),
        sa.Column('checksum', sa.String(), nullable=False),
        sa.Column('layer_name', sa.String(), nullable=False),
        sa.Column('table_name', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=True),
    )
    op.create_unique_constraint(
        'uq_shapefile_filename_checksum',
        'shapefile_imports',
        ['filename', 'checksum']
    )


def downgrade() -> None:
    op.drop_constraint('uq_shapefile_filename_checksum', 'shapefile_imports', type_='unique')
    op.drop_table('shapefile_imports')


