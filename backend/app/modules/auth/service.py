import os
import secrets
from datetime import datetime, timedelta, timezone

from jose import jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.mailer import send_welcome_email
from app.modules.auth.repository import AuthRepository
from app.modules.auth.schemas import MagicLinkRequestResponse, TokenResponse

SECRET_KEY = os.environ.get("SECRET_KEY", "changeme")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.environ.get("REFRESH_TOKEN_EXPIRE_DAYS", 7))
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")
MAGIC_TOKEN_EXPIRE_MINUTES = 15

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
        send_welcome_email(email, password)
        return self._issue_tokens(user.id)

    def login(self, email: str, password: str) -> TokenResponse:
        user = self.repo.get_by_email(email)
        if not user:
            user = self.repo.create(email=email, password_hash=pwd_context.hash(password))
        return self._issue_tokens(user.id)

    def refresh(self, refresh_token: str) -> TokenResponse:
        try:
            payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        except Exception:
            raise ValueError("Refresh token inválido")
        return self._issue_tokens(payload["sub"])

    def request_magic_link(self, email: str) -> MagicLinkRequestResponse:
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=MAGIC_TOKEN_EXPIRE_MINUTES)
        magic = self.repo.create_magic_token(email=email, expires_at=expires_at)
        magic_url = f"{FRONTEND_URL}/auth/magic?token={magic.token}"
        print(f"[MAGIC LINK] {magic_url}")
        return MagicLinkRequestResponse(message="Link enviado para o e-mail", magic_url=magic_url)

    def verify_magic_link(self, token: str) -> TokenResponse:
        magic = self.repo.get_magic_token(token)
        if not magic:
            raise ValueError("Token inválido")
        if magic.used:
            raise ValueError("Token já utilizado")
        if datetime.now(timezone.utc) > magic.expires_at:
            raise ValueError("Token expirado")
        self.repo.mark_magic_token_used(magic)
        user = self.repo.get_by_email(magic.email)
        if not user:
            user = self.repo.create(
                email=magic.email,
                password_hash=secrets.token_hex(32),
            )
        return self._issue_tokens(user.id)

    def _issue_tokens(self, user_id: str) -> TokenResponse:
        access_token = _create_token(
            {"sub": user_id}, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        refresh_token = _create_token(
            {"sub": user_id}, timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        )
        return TokenResponse(access_token=access_token, refresh_token=refresh_token)
