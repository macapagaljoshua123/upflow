import { useEffect, useRef, useState } from 'react'

/**
 * Shows the signed-in user's name as a pill. Click reveals a small dropdown
 * with Settings and Sign out — it only opens on click, not on hover, so
 * hovering over it or moving the cursor across it doesn't pop it open.
 * Used in the Dashboard topbar and in the marketing Header when a session
 * is active.
 *
 * extraItems: optional [{ label, onClick, icon? }] rendered above the
 * built-in Settings/Sign out rows (e.g. "Back to Dashboard" on the landing page).
 */
export default function UserMenu({ name, email, onSignOut, extraItems = [] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    function handleKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [])

  const initial = (name || email || '?').trim().charAt(0).toUpperCase()

  return (
    <div className="user-menu" ref={ref}>
      <button
        type="button"
        className="user-menu-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="user-avatar">{initial}</span>
        <span className="user-menu-name">{name || email || 'Account'}</span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div className="user-menu-dropdown" role="menu">
          <div className="user-menu-head">
            <span className="user-menu-head-name">{name || 'Account'}</span>
            {email && <span className="user-menu-head-email">{email}</span>}
          </div>

          {extraItems.map((item) => (
            <button key={item.label} className="user-menu-item" role="menuitem" onClick={() => { setOpen(false); item.onClick?.() }}>
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}

          <button className="user-menu-item" role="menuitem" onClick={() => { setOpen(false) }}>
            <SettingsIcon />
            <span>Settings</span>
          </button>
          <button className="user-menu-item danger" role="menuitem" onClick={() => { setOpen(false); onSignOut?.() }}>
            <SignOutIcon />
            <span>Sign out</span>
          </button>
        </div>
      )}

      <style>{`
        .user-menu { position: relative; }
        .user-menu-trigger {
          display: flex; align-items: center; gap: 9px; background: var(--surface); border: 1px solid var(--border);
          border-radius: 999px; padding: 6px 12px 6px 6px; color: var(--ink); font-size: 0.86rem; font-weight: 500;
          transition: border-color 0.15s ease, background 0.15s ease;
          max-width: 220px;
        }
        .user-menu-trigger:hover, .user-menu-trigger[aria-expanded="true"] { border-color: var(--flow); background: var(--surface-2); }
        .user-avatar {
          flex-shrink: 0; width: 26px; height: 26px; border-radius: 50%; background: var(--flow); color: #06231C;
          display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.78rem;
        }
        .user-menu-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .user-menu-dropdown {
          position: absolute; top: calc(100% + 8px); right: 0; z-index: 30; min-width: 210px;
          background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--radius-sm);
          padding: 6px; box-shadow: 0 14px 30px rgba(0,0,0,0.4);
          animation: userMenuIn 0.16s cubic-bezier(0.16, 1, 0.3, 1);
          transform-origin: top right;
        }
        @keyframes userMenuIn {
          from { opacity: 0; transform: scale(0.96) translateY(-4px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .user-menu-head { padding: 8px 10px 10px; border-bottom: 1px solid var(--border); margin-bottom: 6px; display: flex; flex-direction: column; gap: 2px; }
        .user-menu-head-name { font-size: 0.9rem; font-weight: 600; color: var(--ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .user-menu-head-email { font-size: 0.76rem; color: var(--ink-dim); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .user-menu-item {
          width: 100%; text-align: left; padding: 9px 10px; border-radius: 6px; font-size: 0.86rem;
          background: none; color: var(--ink); display: flex; align-items: center; gap: 10px;
        }
        .user-menu-item:hover { background: var(--surface); }
        .user-menu-item.danger { color: var(--coral); }
      `}</style>
    </div>
  )
}

function ChevronIcon({ open }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, transition: 'transform 0.18s ease', transform: open ? 'rotate(180deg)' : 'none' }}>
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
      <path d="M19.4 13.5a7.6 7.6 0 000-3l2-1.5-2-3.5-2.4 1a7.6 7.6 0 00-2.6-1.5L14 2.5h-4l-.4 2.5a7.6 7.6 0 00-2.6 1.5l-2.4-1-2 3.5 2 1.5a7.6 7.6 0 000 3l-2 1.5 2 3.5 2.4-1a7.6 7.6 0 002.6 1.5l.4 2.5h4l.4-2.5a7.6 7.6 0 002.6-1.5l2.4 1 2-3.5-2-1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  )
}

function SignOutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path d="M9 4H6a1 1 0 00-1 1v14a1 1 0 001 1h3M15 16l4-4-4-4M19 12H8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
