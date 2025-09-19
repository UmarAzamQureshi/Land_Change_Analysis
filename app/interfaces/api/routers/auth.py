from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from urllib.parse import urlencode
from app.interfaces.schemas.user import UserCreate, UserResponse
from app.interfaces.schemas.auth import Token
from app.interfaces.dependencies import get_user_repo, get_hasher
from app.interfaces.dependencies import get_token_provider
from app.interfaces.dependencies import require_admin
from app.application.use_cases.register_user import register_user
from app.application.use_cases.login_user import login_user
from app.config.settings import settings
from app.application.ports.oauth_provider import OAuthProvider
from app.infrastructure.oauth.google_oauth_httpx import GoogleOAuthHttpx
from fastapi.security import OAuth2PasswordRequestForm


router = APIRouter(tags=["auth"])


@router.post("/register", response_model=UserResponse)
def register(payload: UserCreate, repo=Depends(get_user_repo), hasher=Depends(get_hasher)):
    try:
        return register_user(repo, hasher, payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/token", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), repo=Depends(get_user_repo), hasher=Depends(get_hasher), tokens=Depends(get_token_provider)):
    try:
        access_token = login_user(repo, hasher, tokens, form_data.username, form_data.password)
        return {"access_token": access_token, "token_type": "bearer"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.get("/auth/google", include_in_schema=False)
async def google_login():
    state = "state-placeholder"  # For brevity; in production, store and validate
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "response_type": "code",
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent",
        "state": state,
    }
    auth_url = f"{settings.GOOGLE_AUTH_URL}?{urlencode(params)}"
    return RedirectResponse(auth_url, status_code=302)


@router.get("/auth/google/callback", include_in_schema=False)
async def google_callback(code: str, provider: OAuthProvider = Depends(GoogleOAuthHttpx), repo=Depends(get_user_repo), tokens=Depends(get_token_provider)):
    try:
        user_info = await provider.exchange_code_for_userinfo(code)
        username = user_info.get("email", "").split("@")[0]
        existing = repo.get_by_email(user_info.get("email"))
        if not existing:
            from app.domain.entities.user import User
            from app.domain.value_objects.role import UserRole
            new_user = User(
                username=username,
                email=user_info.get("email"),
                full_name=user_info.get("name"),
                auth_provider="google",
                role=UserRole.USER,
            )
            existing = repo.add(new_user)
        jwt_token = tokens.create({"sub": existing.username}, settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        return {
            "message": "Google OAuth successful!",
            "user_info": user_info,
            "jwt_token": jwt_token,
            "token_type": "bearer",
            "user": {
                "id": existing.id,
                "username": existing.username,
                "email": existing.email,
                "role": existing.role.value,
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OAuth error: {str(e)}")


