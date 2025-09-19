import httpx
from typing import Dict
from app.application.ports.oauth_provider import OAuthProvider
from app.config.settings import settings


class GoogleOAuthHttpx(OAuthProvider):
    async def exchange_code_for_userinfo(self, code: str) -> Dict:
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                settings.GOOGLE_TOKEN_URL,
                data={
                    "code": code,
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                    "grant_type": "authorization_code",
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )

        token_response.raise_for_status()
        tokens = token_response.json()
        access_token = tokens.get("access_token")

        if not access_token:
            raise RuntimeError("No access token received from Google")

        async with httpx.AsyncClient() as client:
            user_response = await client.get(
                settings.GOOGLE_USERINFO_URL,
                headers={"Authorization": f"Bearer {access_token}"},
            )
        user_response.raise_for_status()
        return user_response.json()


