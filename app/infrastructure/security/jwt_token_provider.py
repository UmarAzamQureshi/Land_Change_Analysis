from datetime import datetime, timedelta
from jose import jwt
from app.application.ports.token_provider import TokenProvider
from app.config.settings import settings


class JoseJWT(TokenProvider):
    def create(self, claims, expire_minutes: int) -> str:
        expire = datetime.utcnow() + timedelta(minutes=expire_minutes)
        to_encode = {**claims, "exp": expire}
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    def decode(self, token: str):
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])


