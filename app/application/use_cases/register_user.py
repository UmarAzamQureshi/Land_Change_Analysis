from app.application.ports.user_repository import UserRepository
from app.application.ports.password_hasher import PasswordHasher
from app.domain.entities.user import User


def register_user(repo: UserRepository, hasher: PasswordHasher, data) -> User:
    if repo.get_by_username(data.username):
        raise ValueError("Username already registered")
    if repo.get_by_email(data.email):
        raise ValueError("Email already registered")
    user = User(
        username=data.username,
        email=data.email,
        full_name=data.full_name,
        hashed_password=hasher.hash(data.password),
        role=data.role,
        auth_provider="local",
    )
    return repo.add(user)


