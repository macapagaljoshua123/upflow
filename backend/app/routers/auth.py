from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.auth import (
    hash_password, verify_password, create_access_token,
    generate_verification_code, generate_device_token, verification_code_expiry,
)
from app.mailer import send_verification_code, send_password_reset_code

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _issue_verification_code(db: Session, user: models.User, purpose: str = "login") -> str:
    code = generate_verification_code()
    db.add(models.VerificationCode(
        user_id=user.id, code=code, purpose=purpose, expires_at=verification_code_expiry(),
    ))
    db.commit()
    return code


def _find_trusted_device(db: Session, user: models.User, device_token: str | None) -> models.TrustedDevice | None:
    if not device_token:
        return None
    return (
        db.query(models.TrustedDevice)
        .filter(models.TrustedDevice.user_id == user.id, models.TrustedDevice.token == device_token)
        .first()
    )


@router.post("/signup", response_model=schemas.PendingVerificationOut)
async def signup(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="An account with this email already exists.")

    user = models.User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        email_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    code = _issue_verification_code(db, user)
    try:
        await send_verification_code(user.email, code)
    except Exception:
        pass  # Don't block signup if the mail server isn't configured yet.

    return schemas.PendingVerificationOut(email=user.email)


@router.post("/login")
async def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password.")

    trusted = _find_trusted_device(db, user, payload.device_token)
    if trusted and user.email_verified:
        trusted.last_used_at = datetime.utcnow()
        db.commit()
        token = create_access_token(subject=str(user.id))
        return schemas.TokenOut(access_token=token, user=user)

    code = _issue_verification_code(db, user)
    try:
        await send_verification_code(user.email, code)
    except Exception:
        pass

    return schemas.PendingVerificationOut(email=user.email)


@router.post("/verify", response_model=schemas.TokenOut)
async def verify(payload: schemas.VerifyRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid code.")

    record = (
        db.query(models.VerificationCode)
        .filter(
            models.VerificationCode.user_id == user.id,
            models.VerificationCode.code == payload.code,
            models.VerificationCode.purpose != "reset_password",
            models.VerificationCode.consumed == False,  # noqa: E712
        )
        .order_by(models.VerificationCode.created_at.desc())
        .first()
    )
    if not record or record.expires_at < datetime.utcnow():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="That code is invalid or expired.")

    record.consumed = True
    user.email_verified = True

    device_token = None
    if payload.remember_device:
        device_token = generate_device_token()
        db.add(models.TrustedDevice(user_id=user.id, token=device_token, label="Browser"))

    db.commit()
    db.refresh(user)

    access_token = create_access_token(subject=str(user.id))
    return schemas.TokenOut(access_token=access_token, user=user, device_token=device_token)


@router.post("/resend-code", response_model=schemas.PendingVerificationOut)
async def resend_code(payload: schemas.ResendCodeRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user:
        # Don't reveal whether the email exists.
        return schemas.PendingVerificationOut(email=payload.email)

    code = _issue_verification_code(db, user)
    try:
        await send_verification_code(user.email, code)
    except Exception:
        pass

    return schemas.PendingVerificationOut(email=user.email)


@router.post("/forgot-password", response_model=schemas.ForgotPasswordOut)
async def forgot_password(payload: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if user:
        code = _issue_verification_code(db, user, purpose="reset_password")
        try:
            await send_password_reset_code(user.email, code)
        except Exception:
            pass  # Don't block the response if the mail server hiccups.

    # Always return the same response whether or not the email exists,
    # so the endpoint can't be used to enumerate registered accounts.
    return schemas.ForgotPasswordOut()


@router.post("/reset-password", response_model=schemas.TokenOut)
async def reset_password(payload: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="That code is invalid or expired.")

    record = (
        db.query(models.VerificationCode)
        .filter(
            models.VerificationCode.user_id == user.id,
            models.VerificationCode.code == payload.code,
            models.VerificationCode.purpose == "reset_password",
            models.VerificationCode.consumed == False,  # noqa: E712
        )
        .order_by(models.VerificationCode.created_at.desc())
        .first()
    )
    if not record or record.expires_at < datetime.utcnow():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="That code is invalid or expired.")

    if len(payload.new_password) < 8:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password must be at least 8 characters.")

    record.consumed = True
    user.password_hash = hash_password(payload.new_password)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(subject=str(user.id))
    return schemas.TokenOut(access_token=access_token, user=user)