import { useEffect, useState } from 'react'
import { getUploadHistory } from '../api/client.js'

const ACTION_LABEL = {
  uploaded: 'Uploaded',
  renamed: 'Renamed',
  moved: 'Moved',
  shared: 'Shared',
  reuploaded: 'Re-uploaded',
  deleted: 'Deleted',
}

const ACTION_ICON = {
  uploaded: UploadIcon,
  renamed: PencilIcon,
  moved: MoveIcon,
  shared: ShareIcon,
  reuploaded: UploadIcon,
  deleted: TrashIcon,
}

export default function UploadsView() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getUploadHistory()
      .then((data) => !cancelled && setEntries(data))
      .catch(() => !cancelled && setError('Could not load your uploads. Try again.'))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [])

  return (
    <section className="uploads-view">
      <div className="uploads-view-head">
        <h2>My uploads</h2>
        <p>Every file you've uploaded, renamed, moved, shared, or replaced — newest first.</p>
      </div>

      {error && <div className="uploads-error">{error}</div>}

      {loading ? (
        <div className="uploads-empty"><p>Loading your uploads…</p></div>
      ) : entries.length === 0 ? (
        <div className="uploads-empty">
          <p>Nothing here yet. Upload a file to see it show up in this list.</p>
        </div>
      ) : (
        <div className="uploads-list">
          {entries.map((entry, i) => {
            const Icon = ACTION_ICON[entry.action] || UploadIcon
            return (
              <div className="uploads-row" key={i}>
                <span className="uploads-row-icon"><Icon /></span>
                <div className="uploads-row-main">
                  <span className="uploads-row-file">
                    {ACTION_LABEL[entry.action] || entry.action} <strong>&ldquo;{entry.file_name}&rdquo;</strong>
                  </span>
                  <span className="uploads-row-email">{entry.user_email}</span>
                </div>
                <span className="uploads-row-time" title={formatFull(entry.created_at)}>
                  {formatRelative(entry.created_at)}
                </span>
              </div>
            )
          })}
        </div>
      )}

      <style>{`
        .uploads-view-head { margin-bottom: 22px; }
        .uploads-view-head h2 { font-size: 1.2rem; margin: 0 0 6px; }
        .uploads-view-head p { color: var(--ink-dim); font-size: 0.88rem; margin: 0; }
        .uploads-error { background: rgba(255,107,107,0.12); color: var(--coral); border: 1px solid rgba(255,107,107,0.3); border-radius: var(--radius-sm); padding: 12px 14px; margin-bottom: 18px; font-size: 0.87rem; }
        .uploads-empty { text-align: center; padding: 60px 20px; color: var(--ink-dim); }
        .uploads-list { display: flex; flex-direction: column; border: 1px solid var(--border); border-radius: var(--radius-sm); overflow: hidden; background: var(--surface); }
        .uploads-row {
          display: flex; align-items: center; gap: 14px; padding: 14px 16px;
          border-bottom: 1px solid var(--border);
        }
        .uploads-row:last-child { border-bottom: none; }
        .uploads-row:hover { background: var(--surface-2); }
        .uploads-row-icon {
          flex-shrink: 0; width: 34px; height: 34px; border-radius: 8px; background: var(--surface-2);
          color: var(--flow); display: flex; align-items: center; justify-content: center;
        }
        .uploads-row-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
        .uploads-row-file { font-size: 0.9rem; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .uploads-row-file strong { font-weight: 600; }
        .uploads-row-email { font-size: 0.78rem; color: var(--ink-dim); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .uploads-row-time { flex-shrink: 0; font-size: 0.8rem; color: var(--ink-dim); white-space: nowrap; }
        @media (max-width: 560px) {
          .uploads-row { flex-wrap: wrap; }
          .uploads-row-time { margin-left: 48px; }
        }
      `}</style>
    </section>
  )
}

// Relative time down to seconds, scaling smoothly up through minutes, hours,
// days, months, and years -- e.g. "12s ago", "5m ago", "3h ago", "2d ago",
// "4mo ago", "2y ago".
function formatRelative(isoString) {
  const then = new Date(isoString).getTime()
  const diffSec = Math.max(0, Math.floor((Date.now() - then) / 1000))

  if (diffSec < 5) return 'Just now'
  if (diffSec < 60) return `${diffSec}s ago`

  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`

  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour}h ago`

  const diffDay = Math.floor(diffHour / 24)
  if (diffDay < 30) return `${diffDay}d ago`

  const diffMonth = Math.floor(diffDay / 30)
  if (diffMonth < 12) return `${diffMonth}mo ago`

  const diffYear = Math.floor(diffMonth / 12)
  return `${diffYear}y ago`
}

function formatFull(isoString) {
  const d = new Date(isoString)
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}

function UploadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 16V4M12 4l-4 4M12 4l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 16v3a2 2 0 002 2h10a2 2 0 002-2v-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M4 20l1-4.2L15.6 5.2a1.5 1.5 0 012.1 0l1.1 1.1a1.5 1.5 0 010 2.1L8.2 19l-4.2 1z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

function MoveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M4 6.5a1 1 0 011-1h4.6l1.6 2h7.2a1 1 0 011 1v9.5a1 1 0 01-1 1H5a1 1 0 01-1-1V6.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9.5 12.5h5M12.2 9.8l3 2.7-3 2.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="6" cy="12" r="2.2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17" cy="6" r="2.2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17" cy="18" r="2.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.1 10.9L14.9 7.1M8.1 13.1l6.8 3.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M5 7h14M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-8 0l1 12a1 1 0 001 1h6a1 1 0 001-1l1-12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
