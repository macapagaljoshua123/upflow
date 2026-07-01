import { useState } from 'react'

const ITEMS = [
  { key: 'home', label: 'Home', icon: HomeIcon },
  { key: 'uploads', label: 'My uploads', icon: FolderIcon },
]

const COLLAPSE_KEY = 'upflow_sidebar_collapsed'

export default function Sidebar({ active, onChange }) {
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
          padding: 20px 14px; position: relative; overflow: hidden;
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

        .sidebar-collapse-btn {
          position: absolute; top: 18px; right: -13px; width: 26px; height: 26px; border-radius: 50%;
          background: var(--surface-2); border: 1px solid var(--border); color: var(--ink-dim);
          display: flex; align-items: center; justify-content: center; z-index: 5;
          transition: background 0.15s ease, color 0.15s ease, transform 0.15s ease;
        }
        .sidebar-collapse-btn:hover { color: var(--flow); background: var(--surface); transform: scale(1.08); }
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

function ChevronIcon({ flipped }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ transform: flipped ? 'rotate(180deg)' : 'none' }}>
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
