from typing import Dict


class OAuthProvider:
    async def exchange_code_for_userinfo(self, code: str) -> Dict:
        raise NotImplementedError


