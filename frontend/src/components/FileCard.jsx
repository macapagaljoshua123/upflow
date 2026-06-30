import { useState, useRef, useEffect } from 'react'

const ACTIONS = ['Open', 'Download', 'Make a copy', 'Share', 'Rename', 'Re-upload', 'Move to', 'Delete']

export default function FileCard({ file, onAction }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="file-card" ref={ref}>
      <div className="file-thumb">
        <CodeIcon />
        <span className={`visibility-pill ${file.visibility}`}>{file.visibility}</span>
      </div>
      <div className="file-meta">
        <span className="file-name" title={file.name}>{file.name}</span>
        <span className="file-date">{file.updatedAt}</span>
      </div>
      <button className="file-menu-btn" onClick={() => setMenuOpen((v) => !v)} aria-label="File actions">
        <DotsIcon />
      </button>

      {menuOpen && (
        <div className="file-menu">
          {ACTIONS.map((action) => (
            <button
              key={action}
              className={`file-menu-item ${action === 'Delete' ? 'danger' : ''}`}
              onClick={() => { setMenuOpen(false); onAction(action, file) }}
            >
              {action}
            </button>
          ))}
        </div>
      )}

      <style>{`
        .file-card { position: relative; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px; background: var(--surface); transition: border-color 0.15s ease; }
        .file-card:hover { border-color: var(--flow); }
        .file-thumb { height: 90px; border-radius: var(--radius-sm); background: var(--surface-2); display: flex; align-items: center; justify-content: center; position: relative; margin-bottom: 12px; }
        .visibility-pill { position: absolute; bottom: 8px; right: 8px; font-family: var(--font-mono); font-size: 0.62rem; text-transform: uppercase; padding: 3px 8px; border-radius: 999px; }
        .visibility-pill.public { background: rgba(94,230,197,0.18); color: var(--flow); }
        .visibility-pill.private { background: rgba(255,255,255,0.1); color: var(--ink-dim); }
        .file-meta { display: flex; flex-direction: column; gap: 2px; padding-right: 24px; }
        .file-name { font-size: 0.92rem; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .file-date { font-size: 0.76rem; color: var(--ink-dim); }
        .file-menu-btn { position: absolute; top: 14px; right: 12px; background: none; color: var(--ink-dim); padding: 4px; border-radius: 6px; }
        .file-menu-btn:hover { color: var(--ink); background: var(--surface-2); }
        .file-menu { position: absolute; top: 42px; right: 12px; z-index: 10; background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 6px; min-width: 150px; box-shadow: 0 14px 30px rgba(0,0,0,0.4); }
        .file-menu-item { width: 100%; text-align: left; padding: 8px 10px; border-radius: 6px; font-size: 0.85rem; background: none; color: var(--ink); }
        .file-menu-item:hover { background: var(--surface); }
        .file-menu-item.danger { color: var(--coral); }
      `}</style>
    </div>
  )
}

function CodeIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path d="M9 8l-4 4 4 4M15 8l4 4-4 4" stroke="var(--flow)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function DotsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="6" r="1.6" fill="currentColor" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
      <circle cx="12" cy="18" r="1.6" fill="currentColor" />
    </svg>
  )
}
