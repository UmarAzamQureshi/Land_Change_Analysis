from abc import ABC, abstractmethod
from typing import Optional, List
from app.domain.entities.user import User


class UserRepository(ABC):
    @abstractmethod
    def add(self, user: User) -> User:
        pass

    @abstractmethod
    def get_by_username(self, username: str) -> Optional[User]:
        pass

    @abstractmethod
    def get_by_email(self, email: str) -> Optional[User]:
        pass

    @abstractmethod
    def list(self, skip: int = 0, limit: int = 100) -> List[User]:
        pass

    @abstractmethod
    def delete(self, user_id: int) -> None:
        """Soft delete a user"""
        pass

    @abstractmethod
    def hard_delete(self, user_id: int) -> None:
        """Permanently delete a user (admin only)"""
        pass

    @abstractmethod
    def restore(self, user_id: int) -> bool:
        """Restore a soft-deleted user (admin only)"""
        pass

    @abstractmethod
    def get_deleted_users(self) -> List[User]:
        """Get all soft-deleted users (admin only)"""
        pass

    @abstractmethod
    def update_role(self, user_id: int, role: str) -> None:
        pass


