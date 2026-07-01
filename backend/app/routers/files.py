import secrets
import uuid
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app import models, schemas
from app.auth import get_current_user
from app.config import settings
from app.security_scan import run_safety_checks, UnsafeUploadError
from app.mailer import send_share_invite

router = APIRouter(prefix="/api/files", tags=["files"])


def file_to_out(f: models.FileItem) -> schemas.FileOut:
    return schemas.FileOut(
        id=f.id, name=f.name, slug=f.slug, visibility=f.visibility.value,
        folder_id=f.folder_id, updated_at=f.updated_at,
        preview_url=f"{settings.frontend_url}/p/{f.slug}",
    )


def generate_slug(db: Session, base_name: str) -> str:
    base = "".join(c for c in base_name.lower().replace(" ", "-") if c.isalnum() or c == "-")
    base = base.rsplit(".", 1)[0] or "page"
    slug = base
    while db.query(models.FileItem).filter(models.FileItem.slug == slug).first():
        slug = f"{base}-{secrets.token_hex(3)}"
    return slug


def assert_owner_or_editor(db: Session, file: models.FileItem, user: models.User):
    if file.owner_id == user.id:
        return
    access = (
        db.query(models.FileAccess)
        .filter(models.FileAccess.file_id == file.id, models.FileAccess.user_id == user.id)
        .first()
    )
    if not access or access.role == models.AccessRole.viewer:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You don\u2019t have permission to modify this file.")


@router.get("", response_model=List[schemas.FileOut])
def list_files(
    search: str = "",
    sort: str = Query("new", pattern="^(new|old)$"),
    folder_id: Optional[uuid.UUID] = None,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    q = db.query(models.FileItem).filter(models.FileItem.owner_id == user.id)
    if folder_id is not None:
        q = q.filter(models.FileItem.folder_id == folder_id)
    if search:
        q = q.filter(models.FileItem.name.ilike(f"%{search}%"))
    q = q.order_by(models.FileItem.updated_at.desc() if sort == "new" else models.FileItem.updated_at.asc())
    return [file_to_out(f) for f in q.all()]


@router.get("/folders", response_model=List[schemas.FolderOut])
def list_folders(
    parent_id: Optional[uuid.UUID] = None,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    q = db.query(models.Folder).filter(models.Folder.owner_id == user.id)
    q = q.filter(models.Folder.parent_id == parent_id)
    q = q.order_by(models.Folder.name.asc())
    return q.all()


@router.post("/folders", response_model=schemas.FolderOut)
def create_folder(payload: schemas.FolderCreate, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    folder = models.Folder(name=payload.name, owner_id=user.id, parent_id=payload.parent_id)
    db.add(folder)
    db.commit()
    db.refresh(folder)
    return folder


def _get_owned_folder(db: Session, folder_id: uuid.UUID, user: models.User) -> models.Folder:
    folder = db.query(models.Folder).filter(models.Folder.id == folder_id).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found.")
    if folder.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Only the owner can modify this folder.")
    return folder


@router.patch("/folders/{folder_id}", response_model=schemas.FolderOut)
def rename_folder(folder_id: uuid.UUID, payload: schemas.FolderRename, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    folder = _get_owned_folder(db, folder_id, user)
    folder.name = payload.name
    db.commit()
    db.refresh(folder)
    return folder


@router.patch("/folders/{folder_id}/move", response_model=schemas.FolderOut)
def move_folder(folder_id: uuid.UUID, payload: schemas.FolderMove, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    folder = _get_owned_folder(db, folder_id, user)
    if payload.parent_id == folder.id:
        raise HTTPException(status_code=400, detail="A folder can't be moved into itself.")
    folder.parent_id = payload.parent_id
    db.commit()
    db.refresh(folder)
    return folder


def _delete_folder_recursive(db: Session, folder: models.Folder):
    for child in list(folder.children):
        _delete_folder_recursive(db, child)
    for f in list(folder.files):
        db.delete(f)
    db.delete(folder)


@router.delete("/folders/{folder_id}")
def delete_folder(folder_id: uuid.UUID, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    folder = _get_owned_folder(db, folder_id, user)
    _delete_folder_recursive(db, folder)
    db.commit()
    return {"deleted": True}


@router.post("/upload", response_model=schemas.FileOut)
async def upload_file(
    upload: UploadFile = File(...),
    folder_id: Optional[uuid.UUID] = None,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    content = await upload.read()
    try:
        run_safety_checks(upload.filename, content)
    except UnsafeUploadError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    slug = generate_slug(db, upload.filename)

    file_item = models.FileItem(
        name=upload.filename,
        slug=slug,
        content=content,
        content_size=len(content),
        owner_id=user.id,
        folder_id=folder_id,
        visibility=models.Visibility.private,
    )
    db.add(file_item)
    db.flush()
    db.add(models.UploadLog(file_id=file_item.id, user_id=user.id, action="uploaded", detail=upload.filename))
    db.commit()
    db.refresh(file_item)
    return file_to_out(file_item)


@router.patch("/{file_id}", response_model=schemas.FileOut)
def rename_file(file_id: uuid.UUID, payload: schemas.FileRename, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    f = db.query(models.FileItem).filter(models.FileItem.id == file_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="File not found.")
    assert_owner_or_editor(db, f, user)
    f.name = payload.name
    db.add(models.UploadLog(file_id=f.id, user_id=user.id, action="renamed", detail=payload.name))
    db.commit()
    db.refresh(f)
    return file_to_out(f)


@router.patch("/{file_id}/move", response_model=schemas.FileOut)
def move_file(file_id: uuid.UUID, payload: schemas.FileMove, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    f = db.query(models.FileItem).filter(models.FileItem.id == file_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="File not found.")
    assert_owner_or_editor(db, f, user)
    f.folder_id = payload.folder_id
    db.add(models.UploadLog(file_id=f.id, user_id=user.id, action="moved"))
    db.commit()
    db.refresh(f)
    return file_to_out(f)


@router.post("/{file_id}/copy", response_model=schemas.FileOut)
def copy_file(file_id: uuid.UUID, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    original = db.query(models.FileItem).filter(models.FileItem.id == file_id).first()
    if not original:
        raise HTTPException(status_code=404, detail="File not found.")

    new_slug = generate_slug(db, f"{original.name}-copy")

    copy_item = models.FileItem(
        name=f"{original.name} (copy)",
        slug=new_slug,
        content=original.content,
        content_size=original.content_size,
        owner_id=user.id,
        folder_id=original.folder_id,
        visibility=models.Visibility.private,
    )
    db.add(copy_item)
    db.flush()
    db.add(models.UploadLog(file_id=copy_item.id, user_id=user.id, action="uploaded", detail="copied"))
    db.commit()
    db.refresh(copy_item)
    return file_to_out(copy_item)


@router.get("/{file_id}/download")
def download_file(file_id: uuid.UUID, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    f = db.query(models.FileItem).filter(models.FileItem.id == file_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="File not found.")
    assert_owner_or_editor(db, f, user)
    return Response(
        content=f.content,
        media_type="text/html",
        headers={"Content-Disposition": f'attachment; filename="{f.name}"'},
    )


@router.post("/{file_id}/reupload", response_model=schemas.FileOut)
async def reupload_file(
    file_id: uuid.UUID,
    upload: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    f = db.query(models.FileItem).filter(models.FileItem.id == file_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="File not found.")
    assert_owner_or_editor(db, f, user)

    content = await upload.read()
    try:
        run_safety_checks(upload.filename, content)
    except UnsafeUploadError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    f.content = content
    f.content_size = len(content)

    db.add(models.UploadLog(file_id=f.id, user_id=user.id, action="reuploaded", detail=upload.filename))
    db.commit()
    db.refresh(f)
    return file_to_out(f)


@router.delete("/{file_id}")
def delete_file(file_id: uuid.UUID, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    f = db.query(models.FileItem).filter(models.FileItem.id == file_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="File not found.")
    if f.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Only the owner can delete this file.")
    db.delete(f)
    db.commit()
    return {"deleted": True}


@router.post("/{file_id}/share")
async def share_file(file_id: uuid.UUID, payload: schemas.ShareRequest, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    f = db.query(models.FileItem).filter(models.FileItem.id == file_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="File not found.")
    if f.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Only the owner can change sharing settings.")

    if payload.visibility in ("public", "private"):
        f.visibility = models.Visibility(payload.visibility)

    if payload.invite_email:
        invited_user = db.query(models.User).filter(models.User.email == payload.invite_email).first()
        access = models.FileAccess(
            file_id=f.id,
            user_id=invited_user.id if invited_user else None,
            email=payload.invite_email,
            role=models.AccessRole(payload.role or "viewer"),
        )
        db.add(access)
        preview_url = f"{settings.frontend_url}/p/{f.slug}"
        try:
            await send_share_invite(payload.invite_email, f.name, preview_url, user.name)
        except Exception:
            pass  # Email delivery failures shouldn't block sharing.

    db.add(models.UploadLog(file_id=f.id, user_id=user.id, action="shared", detail=payload.visibility or payload.invite_email))
    db.commit()
    db.refresh(f)
    return file_to_out(f)


@router.get("/{file_id}/access", response_model=List[schemas.AccessEntryOut])
def get_access_list(file_id: uuid.UUID, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    f = db.query(models.FileItem).filter(models.FileItem.id == file_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="File not found.")

    entries = [schemas.AccessEntryOut(name=f.owner.name, email=f.owner.email, role="owner")]
    for a in f.access_entries:
        entries.append(schemas.AccessEntryOut(
            name=a.user.name if a.user else (a.email or "Pending"),
            email=a.user.email if a.user else a.email,
            role=a.role.value,
        ))
    return entries


@router.get("/history", response_model=List[schemas.UploadLogOut])
def get_history(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    logs = (
        db.query(models.UploadLog)
        .join(models.FileItem)
        .filter(models.UploadLog.user_id == user.id)
        .order_by(models.UploadLog.created_at.desc())
        .limit(100)
        .all()
    )
    return [
        schemas.UploadLogOut(action=l.action, detail=l.detail, created_at=l.created_at, file_name=l.file.name)
        for l in logs
    ]