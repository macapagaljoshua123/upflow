import uuid
from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str
    device_token: Optional[str] = None


class UserOut(BaseModel):
    id: uuid.UUID
    name: str
    email: EmailStr
    email_verified: bool

    class Config:
        from_attributes = True


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
    device_token: Optional[str] = None


class PendingVerificationOut(BaseModel):
    requires_verification: bool = True
    email: EmailStr


class VerifyRequest(BaseModel):
    email: EmailStr
    code: str
    remember_device: bool = False


class ResendCodeRequest(BaseModel):
    email: EmailStr


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ForgotPasswordOut(BaseModel):
    message: str = "If an account with that email exists, we\u2019ve sent a reset code."


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str
    new_password: str


class FolderCreate(BaseModel):
    name: str
    parent_id: Optional[uuid.UUID] = None


class FolderRename(BaseModel):
    name: str


class FolderMove(BaseModel):
    parent_id: Optional[uuid.UUID] = None


class FolderOut(BaseModel):
    id: uuid.UUID
    name: str
    parent_id: Optional[uuid.UUID]
    created_at: datetime

    class Config:
        from_attributes = True


class FileOut(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    visibility: str
    folder_id: Optional[uuid.UUID]
    updated_at: datetime
    preview_url: str

    class Config:
        from_attributes = True


class FileRename(BaseModel):
    name: str


class FileMove(BaseModel):
    folder_id: Optional[uuid.UUID] = None


class ShareRequest(BaseModel):
    visibility: Optional[str] = None  # "public" | "private"
    invite_email: Optional[EmailStr] = None
    role: Optional[str] = "viewer"


class ShareResponse(FileOut):
    invite_email_sent: Optional[bool] = None
    invite_email_error: Optional[str] = None


class AccessEntryOut(BaseModel):
    name: str
    email: Optional[str]
    role: str

    class Config:
        from_attributes = True


class UpdateNameRequest(BaseModel):
    name: str


class RequestEmailChangeRequest(BaseModel):
    new_email: EmailStr


class ConfirmEmailChangeRequest(BaseModel):
    code: str


class RequestPasswordChangeRequest(BaseModel):
    current_password: str


class ConfirmPasswordChangeRequest(BaseModel):
    code: str
    new_password: str


class PendingChangeOut(BaseModel):
    message: str


class UploadLogOut(BaseModel):
    action: str
    detail: Optional[str]
    created_at: datetime
    file_name: str
    user_email: str
    user_name: str

    class Config:
        from_attributes = True