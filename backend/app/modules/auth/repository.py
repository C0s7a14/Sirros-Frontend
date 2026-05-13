from datetime import datetime

from sqlalchemy.orm import Session

from app.modules.auth.models import MagicToken, User


class AuthRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_by_email(self, email: str) -> User | None:
        return self.db.query(User).filter(User.email == email).first()

    def create(self, email: str, password_hash: str) -> User:
        user = User(email=email, password_hash=password_hash)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def create_magic_token(self, email: str, expires_at: datetime) -> MagicToken:
        magic = MagicToken(email=email, expires_at=expires_at)
        self.db.add(magic)
        self.db.commit()
        self.db.refresh(magic)
        return magic

    def get_magic_token(self, token: str) -> MagicToken | None:
        return self.db.query(MagicToken).filter(MagicToken.token == token).first()

    def mark_magic_token_used(self, magic: MagicToken) -> None:
        magic.used = True
        self.db.commit()
