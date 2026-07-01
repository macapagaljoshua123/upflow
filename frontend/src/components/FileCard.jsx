import { useState, useRef, useEffect } from 'react'
import { getAuthToken } from '../api/client.js'

const ACTIONS = [
  { label: 'Open', icon: 'open' },
  { label: 'Download', icon: 'download' },
  { label: 'Make a copy', icon: 'copy' },
  { label: 'Share', icon: 'share' },
  { label: 'Rename', icon: 'rename' },
  { label: 'Re-upload', icon: 'reupload' },
  { label: 'Move to', icon: 'move' },
  { label: 'Delete', icon: 'delete' },
]

export default function FileCard({ file, onAction }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [thumbFailed, setThumbFailed] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const token = getAuthToken()
  const thumbSrc = file.previewUrl ? `${file.previewUrl}/raw?token=${token}` : null

  return (
    <div className="file-card" ref={ref}>
      <div className="file-thumb">
        {thumbSrc && !thumbFailed ? (
          <div className="file-thumb-frame">
            <iframe
              src={thumbSrc}
              title={file.name}
              sandbox="allow-scripts allow-forms"
              scrolling="no"
              onError={() => setThumbFailed(true)}
            />
          </div>
        ) : (
          <CodeIcon />
        )}
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
          {ACTIONS.map(({ label, icon }) => (
            <button
              key={label}
              className={`file-menu-item ${label === 'Delete' ? 'danger' : ''}`}
              onClick={() => { setMenuOpen(false); onAction(label, file) }}
            >
              <ActionIcon name={icon} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}

      <style>{`
        .file-card { position: relative; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px; background: var(--surface); transition: border-color 0.15s ease; }
        .file-card:hover { border-color: var(--flow); }
        .file-thumb { height: 90px; border-radius: var(--radius-sm); background: var(--surface-2); display: flex; align-items: center; justify-content: center; position: relative; margin-bottom: 12px; overflow: hidden; }
        .file-thumb-frame { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
        .file-thumb-frame iframe { width: 400%; height: 400%; border: 0; transform: scale(0.25); transform-origin: top left; background: #fff; }
        .visibility-pill { position: absolute; bottom: 8px; right: 8px; font-family: var(--font-mono); font-size: 0.62rem; text-transform: uppercase; padding: 3px 8px; border-radius: 999px; z-index: 2; }
        .visibility-pill.public { background: rgba(94,230,197,0.18); color: var(--flow); }
        .visibility-pill.private { background: rgba(255,255,255,0.1); color: var(--ink-dim); }
        .file-meta { display: flex; flex-direction: column; gap: 2px; padding-right: 24px; }
        .file-name { font-size: 0.92rem; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .file-date { font-size: 0.76rem; color: var(--ink-dim); }
        .file-menu-btn { position: absolute; top: 14px; right: 12px; background: none; color: var(--ink-dim); padding: 4px; border-radius: 6px; z-index: 3; }
        .file-menu-btn:hover { color: var(--ink); background: var(--surface-2); }
        .file-menu { position: absolute; top: 42px; right: 12px; z-index: 10; background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 6px; min-width: 170px; box-shadow: 0 14px 30px rgba(0,0,0,0.4); }
        .file-menu-item { width: 100%; text-align: left; padding: 8px 10px; border-radius: 6px; font-size: 0.85rem; background: none; color: var(--ink); display: flex; align-items: center; gap: 9px; }
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

const ACTION_PATHS = {
  open: 'M14 5h5v5M19 5l-7 7M9 5H6a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1v-3',
  download: 'M12 4v11M12 15l-4-4M12 15l4-4M5 18h14',
  copy: 'M8 8V5a1 1 0 011-1h9a1 1 0 011 1v9a1 1 0 01-1 1h-3M6 8h9a1 1 0 011 1v9a1 1 0 01-1 1H6a1 1 0 01-1-1V9a1 1 0 011-1z',
  share: 'M6 12v6a1 1 0 001 1h10a1 1 0 001-1v-6M12 15V3M8 7l4-4 4 4',
  rename: 'M4 20h4l10.5-10.5a1.5 1.5 0 000-2L16.5 5.5a1.5 1.5 0 00-2 0L4 16v4z',
  reupload: 'M4 12a8 8 0 0113.66-5.66L20 8M20 4v4h-4M20 12a8 8 0 01-13.66 5.66L4 16M4 20v-4h4',
  move: 'M4 7a1 1 0 011-1h4.6l1.6 2H19a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1V7zM9 15l3-3 3 3',
  delete: 'M5 7h14M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-8 0v12a1 1 0 001 1h8a1 1 0 001-1V7',
}

function ActionIcon({ name }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path d={ACTION_PATHS[name]} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
