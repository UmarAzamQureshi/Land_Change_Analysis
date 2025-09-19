from typing import Dict


class TokenProvider:
    def create(self, claims: Dict, expire_minutes: int) -> str:
        raise NotImplementedError

    def decode(self, token: str) -> Dict:
        raise NotImplementedError


