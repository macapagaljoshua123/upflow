# Upflow

Upload any HTML file, get a live preview link, and share it with anyone — like a lightweight Google Drive built specifically for HTML previews.

## Stack
- **Frontend:** React (Vite) + React Router
- **Backend:** FastAPI (Python)
- **Database:** PostgreSQL via SQLAlchemy

## Structure
```
upflow/
  frontend/    React landing page, auth pages, and dashboard
  backend/     FastAPI app: auth, file upload, sharing, history
  database/    Standalone PostgreSQL schema (mirrors the SQLAlchemy models)
```

## Running the backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # then fill in DATABASE_URL, SECRET_KEY, mail settings
uvicorn app.main:app --reload
```
On startup the app creates tables automatically for local development. For
production, generate Alembic migrations instead of relying on `create_all`.

You can also load `database/schema.sql` directly into Postgres if you'd
rather set up the schema by hand:
```bash
createdb upflow
psql -U upflow -d upflow -f database/schema.sql
```

## Running the frontend
```bash
cd frontend
npm install
npm run dev
```
The Vite dev server proxies `/api` to `http://localhost:8000`, so run the
backend first.

## What's implemented
- **Landing page** — header with burger menu, hero, How it works, Safety,
  FAQ, final CTA, footer. Copy follows the page outline from the proposal;
  swap the `image: null` placeholders in `frontend/src/pages/Landing.jsx`
  (`STEPS` array) once you have real screenshots.
- **Auth** — signup/login forms on the frontend, JWT-based auth on the
  backend (`/api/auth/signup`, `/api/auth/login`), passwords hashed with
  bcrypt.
- **Dashboard** — sidebar (Home / My uploads / Upload history), topbar with
  Folder and Upload buttons, search + sort, file grid with a per-file menu
  (Open, Download, Make a copy, Share, Rename, Re-upload, Move to, Delete).
- **Sharing** — `/api/files/{id}/share` toggles public/private and can
  invite a person by email (emailed via `app/mailer.py`); `/api/files/{id}/access`
  returns the people-with-access list shown in the Share modal.
- **Safety** — `app/security_scan.py` checks file extension, size, and a
  short list of high-risk script patterns before anything is stored; every
  preview is then served inside a sandboxed iframe (`allow-scripts allow-forms`,
  no `allow-same-origin`) so an uploaded page can never reach the parent app
  or another user's session.
- **History** — every upload, rename, move, and share is written to
  `upload_logs` and exposed via `/api/files/history` for the sidebar's
  Upload history view.

## What's stubbed or needs your input
- The dashboard currently renders with mock data (`MOCK_FILES` in
  `Dashboard.jsx`) and isn't yet wired to the live `/api/files` endpoints —
  swap the mock state for calls to `frontend/src/api/client.js` once you're
  ready to test end-to-end.
- "Open", "Download", "Re-upload", and "Move to" in the file menu have
  handlers stubbed in `Dashboard.jsx` ready to call the matching API client
  functions.
- Email sending uses `fastapi-mail`; you'll need real SMTP credentials in
  `.env` for invite emails to actually go out.
- The "How it Works" screenshots are placeholders until you upload the real
  images.
