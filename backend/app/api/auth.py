from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import create_access_token, verify_password
from app.core.auth import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.schemas.auth import CurrentUser, LoginRequest, Token

router = APIRouter()


@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> Token:
    user = db.scalar(select(User).where(User.username == payload.username))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")
    return Token(access_token=create_access_token(subject=user.username))


@router.get("/me", response_model=CurrentUser)
def me(user: User = Depends(get_current_user)) -> CurrentUser:
    return CurrentUser(username=user.username, full_name=user.full_name, role=user.role, email=user.email)
