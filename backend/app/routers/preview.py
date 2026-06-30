from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import HTMLResponse, FileResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.auth import oauth2_scheme, decode_token

router = APIRouter(prefix="/p", tags=["preview"])


def get_optional_user(request: Request, db: Session) -> models.User | None:
    token = request.headers.get("Authorization", "").removeprefix("Bearer ").strip()
    if not token:
        return None
    try:
        user_id = decode_token(token)
    except HTTPException:
        return None
    return db.query(models.User).filter(models.User.id == user_id).first()


@router.get("/{slug}", response_class=HTMLResponse)
def preview_file(slug: str, request: Request, db: Session = Depends(get_db)):
    f = db.query(models.FileItem).filter(models.FileItem.slug == slug).first()
    if not f:
        raise HTTPException(status_code=404, detail="This preview doesn\u2019t exist or was removed.")

    if f.visibility == models.Visibility.private:
        user = get_optional_user(request, db)
        is_owner = user and user.id == f.owner_id
        has_access = user and any(a.user_id == user.id for a in f.access_entries)
        if not (is_owner or has_access):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This preview is private.")

    # Served inside a sandboxed iframe shell so the page can never access
    # the parent app, cookies, or other previews.
    return f"""
    <!doctype html>
    <html>
      <head><meta charset="utf-8" /><title>{f.name} — Upflow preview</title></head>
      <body style="margin:0;">
        <iframe
          src="/p/{slug}/raw"
          sandbox="allow-scripts allow-forms"
          style="width:100vw;height:100vh;border:0;"
        ></iframe>
      </body>
    </html>
    """


@router.get("/{slug}/raw")
def preview_raw(slug: str, db: Session = Depends(get_db)):
    f = db.query(models.FileItem).filter(models.FileItem.slug == slug).first()
    if not f:
        raise HTTPException(status_code=404, detail="File not found.")
    return FileResponse(f.storage_path, media_type="text/html")
