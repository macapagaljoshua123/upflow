const ITEMS = [
  { key: 'home', label: 'Home', icon: HomeIcon },
  { key: 'uploads', label: 'My uploads', icon: FolderIcon },
  { key: 'history', label: 'Upload history', icon: HistoryIcon },
]

export default function Sidebar({ active, onChange }) {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {ITEMS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`sidebar-item ${active === key ? 'active' : ''}`}
            onClick={() => onChange(key)}
          >
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <style>{`
        .sidebar { width: 230px; flex-shrink: 0; border-right: 1px solid var(--border); padding: 20px 14px; }
        .sidebar-nav { display: flex; flex-direction: column; gap: 4px; }
        .sidebar-item {
          display: flex; align-items: center; gap: 12px; padding: 11px 14px; border-radius: var(--radius-sm);
          background: transparent; color: var(--ink-dim); font-size: 0.92rem; text-align: left;
        }
        .sidebar-item:hover { background: var(--surface-2); color: var(--ink); }
        .sidebar-item.active { background: var(--surface-2); color: var(--flow); }
        @media (max-width: 880px) {
          .sidebar { width: 72px; }
          .sidebar-item span { display: none; }
          .sidebar-item { justify-content: center; }
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

function HistoryIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 8v4.3l3 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
