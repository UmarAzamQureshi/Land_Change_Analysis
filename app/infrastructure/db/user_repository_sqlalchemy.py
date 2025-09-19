from typing import Optional, List
from sqlalchemy.orm import Session
from app.application.ports.user_repository import UserRepository
from app.domain.entities.user import User
from app.domain.value_objects.role import UserRole
from .models import UserModel
from .session import get_db_with_deleted


def _to_domain(model: UserModel) -> User:
    return User(
        id=model.id,
        username=model.username,
        email=model.email,
        full_name=model.full_name,
        hashed_password=model.hashed_password,
        role=model.role,
        is_active=model.is_active,
        auth_provider=model.auth_provider,
        created_at=model.created_at,
        updated_at=model.updated_at,
        deleted_at=model.deleted_at,
        is_deleted=model.is_deleted,
    )


class SqlAlchemyUserRepository(UserRepository):
    def __init__(self, db: Session) -> None:
        self.db = db

    def add(self, user: User) -> User:
        model = UserModel(
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            hashed_password=user.hashed_password,
            role=user.role if isinstance(user.role, UserRole) else UserRole(user.role),
            auth_provider=user.auth_provider,
            is_active=user.is_active,
        )
        self.db.add(model)
        self.db.commit()
        self.db.refresh(model)
        return _to_domain(model)

    def get_by_username(self, username: str) -> Optional[User]:
        # With with_loader_criteria, this automatically excludes soft-deleted users
        model = self.db.query(UserModel).filter(UserModel.username == username).first()
        return _to_domain(model) if model else None

    def get_by_email(self, email: str) -> Optional[User]:
        # With with_loader_criteria, this automatically excludes soft-deleted users
        model = self.db.query(UserModel).filter(UserModel.email == email).first()
        return _to_domain(model) if model else None

    def list(self, skip: int = 0, limit: int = 100) -> List[User]:
        # With with_loader_criteria, this automatically excludes soft-deleted users
        models = self.db.query(UserModel).offset(skip).limit(limit).all()
        return [_to_domain(m) for m in models]

    def delete(self, user_id: int) -> None:
        """Soft delete a user"""
        model = self.db.query(UserModel).filter(UserModel.id == user_id).first()
        if model:
            model.soft_delete()  # Uses the mixin method
            self.db.commit()

    def hard_delete(self, user_id: int) -> None:
        """Permanently delete a user (admin only)"""
        model = self.db.query(UserModel).filter(UserModel.id == user_id).first()
        if model:
            self.db.delete(model)
            self.db.commit()

    def restore(self, user_id: int) -> bool:
        """Restore a soft-deleted user (admin only)"""
        # Use session without soft delete filter to find deleted users
        admin_db = get_db_with_deleted()
        try:
            model = admin_db.query(UserModel).filter(
                UserModel.id == user_id,
                UserModel.is_deleted == True
            ).first()
            if model:
                model.restore()  # Uses the mixin method
                admin_db.commit()
                return True
            return False
        finally:
            admin_db.close()

    def get_deleted_users(self) -> List[User]:
        """Get all soft-deleted users (admin only)"""
        # Use session without soft delete filter
        admin_db = get_db_with_deleted()
        try:
            models = admin_db.query(UserModel).filter(UserModel.is_deleted == True).all()
            return [_to_domain(m) for m in models]
        finally:
            admin_db.close()

    def update_role(self, user_id: int, role: str) -> None:
        model = self.db.query(UserModel).filter(UserModel.id == user_id).first()
        if model:
            model.role = UserRole(role) if not isinstance(role, UserRole) else role
            self.db.commit()
            self.db.refresh(model)


