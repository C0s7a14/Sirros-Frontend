from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.auth.schemas import (
    LoginRequest,
    MagicLinkRequest,
    MagicLinkRequestResponse,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
)
from app.modules.auth.service import AuthService

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    try:
        return AuthService(db).register(body.email, body.password)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    try:
        return AuthService(db).login(body.email, body.password)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.post("/refresh", response_model=TokenResponse)
def refresh(body: RefreshRequest, db: Session = Depends(get_db)):
    try:
        return AuthService(db).refresh(body.refresh_token)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout():
    return None


@router.post("/magic/request", response_model=MagicLinkRequestResponse)
def magic_link_request(body: MagicLinkRequest, db: Session = Depends(get_db)):
    return AuthService(db).request_magic_link(body.email)


@router.get("/magic/verify", response_model=TokenResponse)
def magic_link_verify(token: str, db: Session = Depends(get_db)):
    try:
        return AuthService(db).verify_magic_link(token)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
