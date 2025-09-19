from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, UniqueConstraint
from sqlalchemy.sql import func
from app.domain.value_objects.role import UserRole
from .mixins import SoftDeleteMixin


Base = declarative_base()


class UserModel(Base, SoftDeleteMixin):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=True)
    role = Column(Enum(UserRole, values_callable=lambda obj: [e.value for e in obj]), default=UserRole.USER, nullable=False)
    is_active = Column(Boolean, default=True)
    auth_provider = Column(String, default="local")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    # Soft delete fields are automatically added by the mixin
    

class ShapefileImport(Base):
    __tablename__ = "shapefile_imports"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    checksum = Column(String, nullable=False)
    layer_name = Column(String, nullable=False)
    table_name = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("filename", "checksum", name="uq_shapefile_filename_checksum"),
    )
