import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import auth, files, preview

app = FastAPI(title="Upflow API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(files.router)
app.include_router(preview.router)


@app.on_event("startup")
def on_startup():
    os.makedirs(settings.upload_dir, exist_ok=True)
    # In production, prefer Alembic migrations over create_all.
    Base.metadata.create_all(bind=engine)


@app.get("/api/health")
def health():
    return {"status": "ok"}