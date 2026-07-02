import { useState } from 'react'

const ITEMS = [
  { key: 'home', label: 'Home', icon: HomeIcon },
  { key: 'uploads', label: 'My uploads', icon: FolderIcon },
]

const COLLAPSE_KEY = 'upflow_sidebar_collapsed'

export default function Sidebar({ active, onChange, onSignOut }) {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === '1')

  function toggleCollapsed() {
    setCollapsed((v) => {
      const next = !v
      localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0')
      return next
    })
  }

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <nav className="sidebar-nav">
        {ITEMS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`sidebar-item ${active === key ? 'active' : ''}`}
            onClick={() => onChange(key)}
            title={collapsed ? label : undefined}
          >
            <Icon />
            <span className="sidebar-item-label">{label}</span>
          </button>
        ))}

        {/* Sign out sits right under the nav items, not pinned to the very
            bottom of the sidebar, so it's still easy to spot without
            crowding the empty space below. */}
        <div className="sidebar-divider" />
        <button
          className="sidebar-item sidebar-signout"
          onClick={onSignOut}
          title={collapsed ? 'Sign out' : undefined}
        >
          <SignOutIcon />
          <span className="sidebar-item-label">Sign out</span>
        </button>
      </nav>

      <button
        className="sidebar-collapse-btn"
        onClick={toggleCollapsed}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <ChevronIcon flipped={collapsed} />
      </button>

      <style>{`
        .sidebar {
          width: 230px; flex-shrink: 0; border-right: 1px solid var(--border);
          padding: 20px 14px; position: relative; overflow: visible;
          transition: width 0.28s cubic-bezier(0.16, 1, 0.3, 1), padding 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .sidebar.collapsed { width: 68px; padding: 20px 10px; }

        .sidebar-nav { display: flex; flex-direction: column; gap: 4px; }
        .sidebar-item {
          display: flex; align-items: center; gap: 12px; padding: 11px 14px; border-radius: var(--radius-sm);
          background: transparent; color: var(--ink-dim); font-size: 0.92rem; text-align: left; white-space: nowrap;
          width: 100%; transition: background 0.15s ease, color 0.15s ease;
        }
        .sidebar.collapsed .sidebar-item { justify-content: center; padding: 11px; }
        .sidebar-item svg { flex-shrink: 0; }
        .sidebar-item:hover { background: var(--surface-2); color: var(--ink); }
        .sidebar-item.active { background: var(--surface-2); color: var(--flow); }
        .sidebar-item-label { transition: opacity 0.18s ease; opacity: 1; }
        .sidebar.collapsed .sidebar-item-label { opacity: 0; width: 0; overflow: hidden; }

        .sidebar-divider { height: 1px; background: var(--border); margin: 10px 4px; }
        .sidebar-signout:hover { background: rgba(255, 138, 101, 0.12); color: var(--coral); }

        .sidebar-collapse-btn {
          position: absolute; top: 18px; right: -15px; width: 30px; height: 30px; border-radius: 50%;
          background: var(--flow); border: 3px solid var(--canvas); color: #06231C;
          display: flex; align-items: center; justify-content: center; z-index: 5;
          box-shadow: 0 2px 10px rgba(0,0,0,0.45);
          transition: background 0.15s ease, color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
        }
        .sidebar-collapse-btn:hover { transform: scale(1.12); box-shadow: 0 4px 14px rgba(94,230,197,0.4); }
        .sidebar-collapse-btn svg { transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1); }

        @media (max-width: 880px) {
          .sidebar { width: 68px; padding: 20px 10px; }
          .sidebar-item { justify-content: center; padding: 11px; }
          .sidebar-item-label { opacity: 0; width: 0; overflow: hidden; }
          .sidebar-collapse-btn { display: none; }
        }
      `}</style>
    </aside>
  )
}

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 11.5L12 4l8 7.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10v9h12v-9" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  )
}

function FolderIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 6.5a1 1 0 011-1h4.6l1.6 2h7.2a1 1 0 011 1v9.5a1 1 0 01-1 1H5a1 1 0 01-1-1V6.5z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  )
}

function SignOutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M9 4H6a1 1 0 00-1 1v14a1 1 0 001 1h3M15 16l4-4-4-4M19 12H8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronIcon({ flipped }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ transform: flipped ? 'rotate(180deg)' : 'none' }}>
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
