from fastapi import Depends, HTTPException, status
from jose import JWTError
from sqlalchemy.orm import Session
from app.infrastructure.db.session import get_db
from app.infrastructure.db.user_repository_sqlalchemy import SqlAlchemyUserRepository
from app.infrastructure.security.jwt_token_provider import JoseJWT
from app.infrastructure.security.passlib_hasher import PasslibPasswordHasher
from app.domain.value_objects.role import UserRole
from app.interfaces.security import oauth2_scheme
from app.application.use_cases.admin_user_ops import AdminUserOperations


def get_user_repo(db: Session = Depends(get_db)):
    return SqlAlchemyUserRepository(db)


def get_token_provider():
    return JoseJWT()


def get_hasher():
    return PasslibPasswordHasher()


def get_admin_user_ops(repo = Depends(get_user_repo)):
    """Get AdminUserOperations instance for admin operations"""
    return AdminUserOperations(repo)


async def get_current_user(token: str = Depends(oauth2_scheme), repo = Depends(get_user_repo), tokens = Depends(get_token_provider)):
    # The HTTP layer will inject token from OAuth2 scheme; keep signature flexible here.
    if token is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
    try:
        payload = tokens.decode(token)
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")

    user = repo.get_by_username(username)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return user


def require_role(required_role: UserRole):
    def checker(current_user = Depends(get_current_user)):
        if current_user.role != required_role and current_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return current_user
    return checker


def require_admin(current_user = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user


