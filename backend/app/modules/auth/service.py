import os
from datetime import datetime, timedelta, timezone

from jose import jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.modules.auth.repository import AuthRepository
from app.modules.auth.schemas import TokenResponse

SECRET_KEY = os.environ.get("SECRET_KEY", "changeme")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.environ.get("REFRESH_TOKEN_EXPIRE_DAYS", 7))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _create_token(data: dict, expires_delta: timedelta) -> str:
    payload = data.copy()
    payload["exp"] = datetime.now(timezone.utc) + expires_delta
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


class AuthService:
    def __init__(self, db: Session) -> None:
        self.repo = AuthRepository(db)

    def register(self, email: str, password: str) -> TokenResponse:
        if self.repo.get_by_email(email):
            raise ValueError("E-mail já cadastrado")
        user = self.repo.create(email=email, password_hash=pwd_context.hash(password))
        return self._issue_tokens(user.id)

    def login(self, email: str, password: str) -> TokenResponse:
        user = self.repo.get_by_email(email)
        if not user or not pwd_context.verify(password, user.password_hash):
            raise ValueError("Credenciais inválidas")
        return self._issue_tokens(user.id)

    def refresh(self, refresh_token: str) -> TokenResponse:
        try:
            payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        except Exception:
            raise ValueError("Refresh token inválido")
        return self._issue_tokens(payload["sub"])

    def _issue_tokens(self, user_id: str) -> TokenResponse:
        access_token = _create_token(
            {"sub": user_id}, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        refresh_token = _create_token(
            {"sub": user_id}, timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        )
        return TokenResponse(access_token=access_token, refresh_token=refresh_token)
