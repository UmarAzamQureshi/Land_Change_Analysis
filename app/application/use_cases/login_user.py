from app.application.ports.user_repository import UserRepository
from app.application.ports.password_hasher import PasswordHasher
from app.application.ports.token_provider import TokenProvider
from app.config.settings import settings


def login_user(repo: UserRepository, hasher: PasswordHasher, tokens: TokenProvider, username: str, password: str) -> str:
    user = repo.get_by_username(username)
    if not user or not user.hashed_password or not hasher.verify(password, user.hashed_password):
        raise ValueError("Incorrect username or password")
    return tokens.create({"sub": user.username}, settings.ACCESS_TOKEN_EXPIRE_MINUTES)


