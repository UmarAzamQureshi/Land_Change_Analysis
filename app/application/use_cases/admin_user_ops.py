from typing import List
from app.application.ports.user_repository import UserRepository
from app.domain.entities.user import User
from app.domain.value_objects.role import UserRole


def create_user_admin(repo: UserRepository, user: User) -> User:
    if repo.get_by_username(user.username):
        raise ValueError("Username already registered")
    if repo.get_by_email(user.email):
        raise ValueError("Email already registered")
    return repo.add(user)


def list_users(repo: UserRepository, skip: int = 0, limit: int = 100) -> List[User]:
    return repo.list(skip=skip, limit=limit)


def delete_user(repo: UserRepository, user_id: int) -> None:
    repo.delete(user_id)


def update_user_role(repo: UserRepository, user_id: int, role: UserRole) -> None:
    repo.update_role(user_id, role.value if isinstance(role, UserRole) else role)


class AdminUserOperations:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    def soft_delete_user(self, user_id: int) -> bool:
        """Soft delete a user"""
        try:
            self.user_repository.delete(user_id)
            return True
        except Exception:
            return False

    def restore_user(self, user_id: int) -> bool:
        """Restore a soft-deleted user"""
        return self.user_repository.restore(user_id)

    def get_deleted_users(self):
        """Get all soft-deleted users"""
        return self.user_repository.get_deleted_users()

    def hard_delete_user(self, user_id: int) -> bool:
        """Permanently delete a user"""
        try:
            self.user_repository.hard_delete(user_id)
            return True
        except Exception:
            return False


