from typing import Optional, List
from pydantic import BaseModel, EmailStr
from app.domain.value_objects.role import UserRole


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    password: str
    role: Optional[UserRole] = UserRole.USER


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str]
    role: UserRole
    is_active: bool
    auth_provider: str

    class Config:
        from_attributes = True


class UserItem(BaseModel):
    item_id: str
    owner: str


