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


class UserOut(BaseModel):
    id: uuid.UUID
    name: str
    email: EmailStr

    class Config:
        from_attributes = True


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


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


class AccessEntryOut(BaseModel):
    name: str
    email: Optional[str]
    role: str

    class Config:
        from_attributes = True


class UploadLogOut(BaseModel):
    action: str
    detail: Optional[str]
    created_at: datetime
    file_name: str

    class Config:
        from_attributes = True