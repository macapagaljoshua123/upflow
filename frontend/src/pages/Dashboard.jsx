import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { BrowserMark } from './Header.jsx'
import Sidebar from '../components/Sidebar.jsx'
import FileCard from '../components/FileCard.jsx'
import ShareModal from '../components/ShareModal.jsx'
import { logout } from '../api/client.js'

const MOCK_FILES = [
  { id: 1, name: 'portfolio-v2.html', updatedAt: 'Updated 2h ago', visibility: 'public', slug: 'portfolio-v2', owner: 'You' },
  { id: 2, name: 'client-pitch.html', updatedAt: 'Updated yesterday', visibility: 'private', slug: 'client-pitch', owner: 'You' },
  { id: 3, name: 'landing-draft.html', updatedAt: 'Updated 3 days ago', visibility: 'private', slug: 'landing-draft', owner: 'You' },
  { id: 4, name: 'demo-app.html', updatedAt: 'Updated 5 days ago', visibility: 'public', slug: 'demo-app', owner: 'You' },
]

export default function Dashboard() {
  const [activeNav, setActiveNav] = useState('home')
  const [files, setFiles] = useState(MOCK_FILES)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('new')
  const [shareTarget, setShareTarget] = useState(null)
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  const visibleFiles = files
    .filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (sort === 'new' ? b.id - a.id : a.id - b.id))

  function handleFileAction(action, file) {
    if (action === 'Share') setShareTarget(file)
    if (action === 'Delete') setFiles((prev) => prev.filter((f) => f.id !== file.id))
    if (action === 'Rename') {
      const name = window.prompt('Rename file', file.name)
      if (name) setFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, name } : f)))
    }
    // Open, Download, Make a copy, Re-upload, Move to wire up to /api/files endpoints.
  }

  function handleUploadClick() {
    fileInputRef.current?.click()
  }

  function handleFilesSelected(e) {
    const selected = Array.from(e.target.files || [])
    if (!selected.length) return
    const newFiles = selected.map((f, i) => ({
      id: Date.now() + i,
      name: f.name,
      updatedAt: 'Just now',
      visibility: 'private',
      slug: f.name.replace(/\.html?$/, '').toLowerCase(),
      owner: 'You',
    }))
    setFiles((prev) => [...newFiles, ...prev])
    e.target.value = ''
  }

  function handleSignOut() {
    logout()
    navigate('/')
  }

  return (
    <div className="dash-shell">
      <header className="dash-topbar">
        <a href="/" className="dash-brand">
          <BrowserMark size={26} />
          <span>Upflow</span>
        </a>
        <div className="dash-topbar-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => setFiles((p) => [{ id: Date.now(), name: 'Untitled folder', updatedAt: 'Just now', visibility: 'private', slug: 'untitled', owner: 'You', isFolder: true }, ...p])}>
            <FolderPlusIcon /> Folder
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleUploadClick}>
            <UploadIcon /> Upload
          </button>
          <input ref={fileInputRef} type="file" multiple accept=".html,.htm" hidden onChange={handleFilesSelected} />
          <button className="btn btn-ghost btn-sm" onClick={handleSignOut}>Sign out</button>
        </div>
      </header>

      <div className="dash-body">
        <Sidebar active={activeNav} onChange={setActiveNav} />

        <main className="dash-main">
          <div className="dash-toolbar">
            <input
              className="dash-search"
              placeholder="Search folders and files"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="dash-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="new">Newest first</option>
              <option value="old">Oldest first</option>
            </select>
          </div>

          {visibleFiles.length === 0 ? (
            <div className="empty-state">
              <p>No files yet. Upload an HTML file to get a live preview link.</p>
              <button className="btn btn-primary" onClick={handleUploadClick}>Upload your first file</button>
            </div>
          ) : (
            <div className="file-grid">
              {visibleFiles.map((file) => (
                <FileCard key={file.id} file={file} onAction={handleFileAction} />
              ))}
            </div>
          )}
        </main>
      </div>

      <footer className="dash-footer">
        <span>Privacy · Terms © 2026 Upflow, from LightWeight Solutions</span>
      </footer>

      {shareTarget && (
        <ShareModal
          file={shareTarget}
          onClose={() => setShareTarget(null)}
          onShare={(payload) => {
            setFiles((prev) => prev.map((f) => (f.id === shareTarget.id ? { ...f, visibility: payload.visibility } : f)))
          }}
        />
      )}

      <style>{`
        .dash-shell { min-height: 100vh; display: flex; flex-direction: column; }
        .dash-topbar { display: flex; align-items: center; justify-content: space-between; padding: 0 24px; height: 68px; border-bottom: 1px solid var(--border); }
        .dash-brand { display: flex; align-items: center; gap: 10px; font-family: var(--font-display); font-weight: 700; }
        .dash-topbar-actions { display: flex; align-items: center; gap: 10px; }
        .btn-sm { padding: 9px 16px; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 6px; }
        .dash-body { flex: 1; display: flex; }
        .dash-main { flex: 1; padding: 24px 28px; }
        .dash-toolbar { display: flex; gap: 12px; margin-bottom: 22px; }
        .dash-search { flex: 1; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 11px 14px; color: var(--ink); font-size: 0.9rem; }
        .dash-search:focus-visible { outline: 2px solid var(--flow); }
        .dash-sort { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 11px 14px; color: var(--ink); font-size: 0.88rem; }
        .file-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 18px; }
        .empty-state { text-align: center; padding: 80px 20px; color: var(--ink-dim); display: flex; flex-direction: column; align-items: center; gap: 18px; }
        .dash-footer { padding: 16px 24px; border-top: 1px solid var(--border); font-size: 0.8rem; color: var(--ink-dim); text-align: center; }
        @media (max-width: 640px) {
          .dash-topbar-actions span { display: none; }
        }
      `}</style>
    </div>
  )
}

function UploadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 16V4M12 4l-4 4M12 4l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 16v3a2 2 0 002 2h10a2 2 0 002-2v-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function FolderPlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M4 6.5a1 1 0 011-1h4.6l1.6 2h7.2a1 1 0 011 1v9.5a1 1 0 01-1 1H5a1 1 0 01-1-1V6.5z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M12 11v4M10 13h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}
