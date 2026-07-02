from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.auth import (
    hash_password, verify_password, generate_verification_code, verification_code_expiry,
)
from app.auth import get_current_user
from app.mailer import send_email_change_code, send_password_change_code

router = APIRouter(prefix="/api/account", tags=["account"])


def _issue_code(db: Session, user: models.User, purpose: str, new_value: str | None = None) -> str:
    code = generate_verification_code()
    db.add(models.VerificationCode(
        user_id=user.id, code=code, purpose=purpose, new_value=new_value,
        expires_at=verification_code_expiry(),
    ))
    db.commit()
    return code


def _consume_code(db: Session, user: models.User, code: str, purpose: str) -> models.VerificationCode:
    record = (
        db.query(models.VerificationCode)
        .filter(
            models.VerificationCode.user_id == user.id,
            models.VerificationCode.code == code,
            models.VerificationCode.purpose == purpose,
            models.VerificationCode.consumed == False,  # noqa: E712
        )
        .order_by(models.VerificationCode.created_at.desc())
        .first()
    )
    if not record or record.expires_at < datetime.utcnow():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="That code is invalid or expired.")
    record.consumed = True
    return record


@router.patch("/name", response_model=schemas.UserOut)
def update_name(
    payload: schemas.UpdateNameRequest,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Name can't be empty.")
    user.name = name
    db.commit()
    db.refresh(user)
    return user


@router.post("/email/request", response_model=schemas.PendingChangeOut)
async def request_email_change(
    payload: schemas.RequestEmailChangeRequest,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    new_email = payload.new_email.lower()
    if new_email == user.email.lower():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="That's already your current email.")
    existing = db.query(models.User).filter(models.User.email == new_email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="That email is already in use by another account.")

    code = _issue_code(db, user, purpose="change_email", new_value=new_email)
    try:
        await send_email_change_code(new_email, code)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"We couldn't send the verification code: {e}",
        )
    return schemas.PendingChangeOut(message=f"We sent a verification code to {new_email}.")


@router.post("/email/confirm", response_model=schemas.UserOut)
def confirm_email_change(
    payload: schemas.ConfirmEmailChangeRequest,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    record = _consume_code(db, user, payload.code, purpose="change_email")
    if not record.new_value:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="That code is invalid or expired.")
    already_taken = (
        db.query(models.User)
        .filter(models.User.email == record.new_value, models.User.id != user.id)
        .first()
    )
    if already_taken:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="That email is already in use by another account.")

    user.email = record.new_value
    user.email_verified = True
    db.commit()
    db.refresh(user)
    return user


@router.post("/password/request", response_model=schemas.PendingChangeOut)
async def request_password_change(
    payload: schemas.RequestPasswordChangeRequest,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    if not verify_password(payload.current_password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Current password is incorrect.")

    code = _issue_code(db, user, purpose="change_password")
    try:
        await send_password_change_code(user.email, code)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"We couldn't send the verification code: {e}",
        )
    return schemas.PendingChangeOut(message=f"We sent a verification code to {user.email}.")


@router.post("/password/confirm", response_model=schemas.UserOut)
def confirm_password_change(
    payload: schemas.ConfirmPasswordChangeRequest,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    _consume_code(db, user, payload.code, purpose="change_password")
    if len(payload.new_password) < 8:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password must be at least 8 characters.")

    user.password_hash = hash_password(payload.new_password)
    db.commit()
    db.refresh(user)
    return user
