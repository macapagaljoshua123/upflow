import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Column, String, Boolean, DateTime, ForeignKey, Enum, Text, func
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


def gen_uuid():
    return uuid.uuid4()


class Visibility(str, enum.Enum):
    private = "private"
    public = "public"


class AccessRole(str, enum.Enum):
    owner = "owner"
    editor = "editor"
    viewer = "viewer"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=gen_uuid)
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    folders = relationship("Folder", back_populates="owner", cascade="all, delete-orphan")
    files = relationship("FileItem", back_populates="owner", cascade="all, delete-orphan")


class Folder(Base):
    __tablename__ = "folders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=gen_uuid)
    name = Column(String(255), nullable=False)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("folders.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    owner = relationship("User", back_populates="folders")
    children = relationship("Folder", backref="parent", remote_side=[id])
    files = relationship("FileItem", back_populates="folder")


class FileItem(Base):
    __tablename__ = "files"

    id = Column(UUID(as_uuid=True), primary_key=True, default=gen_uuid)
    name = Column(String(255), nullable=False)
    slug = Column(String(64), unique=True, nullable=False, index=True)
    storage_path = Column(String(500), nullable=False)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    folder_id = Column(UUID(as_uuid=True), ForeignKey("folders.id"), nullable=True)
    visibility = Column(Enum(Visibility), default=Visibility.private, nullable=False)
    is_scanned_safe = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="files")
    folder = relationship("Folder", back_populates="files")
    access_entries = relationship("FileAccess", back_populates="file", cascade="all, delete-orphan")
    logs = relationship("UploadLog", back_populates="file", cascade="all, delete-orphan")


class FileAccess(Base):
    __tablename__ = "file_access"

    id = Column(UUID(as_uuid=True), primary_key=True, default=gen_uuid)
    file_id = Column(UUID(as_uuid=True), ForeignKey("files.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    email = Column(String(255), nullable=True)  # set when invited before signup
    role = Column(Enum(AccessRole), default=AccessRole.viewer, nullable=False)
    invited_at = Column(DateTime, server_default=func.now())

    file = relationship("FileItem", back_populates="access_entries")
    user = relationship("User")


class UploadLog(Base):
    __tablename__ = "upload_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=gen_uuid)
    file_id = Column(UUID(as_uuid=True), ForeignKey("files.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    action = Column(String(50), nullable=False)  # uploaded, renamed, moved, shared, deleted, reuploaded
    detail = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    file = relationship("FileItem", back_populates="logs")
    user = relationship("User")