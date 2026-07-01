import { useState, useRef, useEffect } from 'react'

const ACTIONS = ['Rename', 'Move to', 'Delete']

export default function FolderCard({ folder, onOpen, onAction }) {
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
    <div className="folder-card" ref={ref} onDoubleClick={() => onOpen(folder)}>
      <FolderIcon />
      <span className="folder-name" title={folder.name}>{folder.name}</span>
      <button className="folder-menu-btn" onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v) }} aria-label="Folder actions">
        <DotsIcon />
      </button>

      {menuOpen && (
        <div className="folder-menu">
          {ACTIONS.map((action) => (
            <button
              key={action}
              className={`folder-menu-item ${action === 'Delete' ? 'danger' : ''}`}
              onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onAction(action, folder) }}
            >
              {action}
            </button>
          ))}
        </div>
      )}

      <style>{`
        .folder-card { position: relative; display: flex; align-items: center; gap: 10px; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 12px 14px; background: var(--surface); cursor: pointer; transition: border-color 0.15s ease; }
        .folder-card:hover { border-color: var(--flow); }
        .folder-name { flex: 1; font-size: 0.88rem; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .folder-menu-btn { background: none; color: var(--ink-dim); padding: 4px; border-radius: 6px; flex-shrink: 0; }
        .folder-menu-btn:hover { color: var(--ink); background: var(--surface-2); }
        .folder-menu { position: absolute; top: 40px; right: 8px; z-index: 10; background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 6px; min-width: 140px; box-shadow: 0 14px 30px rgba(0,0,0,0.4); }
        .folder-menu-item { width: 100%; text-align: left; padding: 8px 10px; border-radius: 6px; font-size: 0.85rem; background: none; color: var(--ink); }
        .folder-menu-item:hover { background: var(--surface); }
        .folder-menu-item.danger { color: var(--coral); }
      `}</style>
    </div>
  )
}

function FolderIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path d="M4 6.5a1 1 0 011-1h4.6l1.6 2h7.2a1 1 0 011 1v9.5a1 1 0 01-1 1H5a1 1 0 01-1-1V6.5z" fill="var(--flow)" fillOpacity="0.18" stroke="var(--flow)" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

function DotsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="6" r="1.6" fill="currentColor" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
      <circle cx="12" cy="18" r="1.6" fill="currentColor" />
    </svg>
  )
}
