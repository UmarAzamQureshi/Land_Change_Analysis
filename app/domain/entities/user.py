from typing import Optional
from app.domain.value_objects.role import UserRole


class User:
    def __init__(
        self,
        id: Optional[int] = None,
        username: str | None = None,
        email: str | None = None,
        full_name: Optional[str] = None,
        hashed_password: Optional[str] = None,
        role: UserRole = UserRole.USER,
        is_active: bool = True,
        auth_provider: str = "local",
        created_at=None,
        updated_at=None,
        deleted_at=None,
        is_deleted: bool = False,
    ) -> None:
        self.id = id
        self.username = username
        self.email = email
        self.full_name = full_name
        self.hashed_password = hashed_password
        self.role = role
        self.is_active = is_active
        self.auth_provider = auth_provider
        self.created_at = created_at
        self.updated_at = updated_at
        self.deleted_at = deleted_at
        self.is_deleted = is_deleted
