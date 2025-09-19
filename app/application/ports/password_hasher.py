

class PasswordHasher:
    def hash(self, password: str) -> str:
        raise NotImplementedError

    def verify(self, plain_password: str, hashed_password: str) -> bool:
        raise NotImplementedError


