import { useEffect, useMemo, useState } from 'react'
import { listFiles } from '../api/client.js'

// Which field to sort by, and which direction.
// Matches the columns shown in the table: name, owner, modified date, size.
const SORT_FIELDS = {
  name: (f) => (getName(f) || '').toLowerCase(),
  owner: (f) => (getOwner(f) || '').toLowerCase(),
  modified: (f) => new Date(getModified(f)).getTime() || 0,
  size: (f) => getSize(f) || 0,
}

export default function UploadsView() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sortField, setSortField] = useState('modified')
  const [sortDir, setSortDir] = useState('desc') // 'asc' | 'desc'

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    listFiles({ sort: 'new' })
      .then((data) => !cancelled && setFiles(Array.isArray(data) ? data : data.files || []))
      .catch(() => !cancelled && setError('Could not load your uploads. Try again.'))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [])

  const sortedFiles = useMemo(() => {
    const getValue = SORT_FIELDS[sortField]
    const copy = [...files]
    copy.sort((a, b) => {
      const va = getValue(a)
      const vb = getValue(b)
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return copy
  }, [files, sortField, sortDir])

  function handleSort(field) {
    if (field === sortField) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  return (
    <section className="uploads-view">
      <div className="uploads-view-head">
        <h2>My uploads</h2>
        <p>Every file you've uploaded — newest first.</p>
      </div>

      {error && <div className="uploads-error">{error}</div>}

      {loading ? (
        <div className="uploads-empty"><p>Loading your uploads…</p></div>
      ) : sortedFiles.length === 0 ? (
        <div className="uploads-empty">
          <p>Nothing here yet. Upload a file to see it show up in this list.</p>
        </div>
      ) : (
        <div className="uploads-table">
          <div className="uploads-table-row uploads-table-head">
            <SortableHeader
              label="Name"
              field="name"
              active={sortField === 'name'}
              dir={sortDir}
              onClick={handleSort}
              className="col-name"
            />
            <SortableHeader
              label="Owner"
              field="owner"
              active={sortField === 'owner'}
              dir={sortDir}
              onClick={handleSort}
              className="col-owner"
            />
            <SortableHeader
              label="Date modified"
              field="modified"
              active={sortField === 'modified'}
              dir={sortDir}
              onClick={handleSort}
              className="col-modified"
            />
            <SortableHeader
              label="File size"
              field="size"
              active={sortField === 'size'}
              dir={sortDir}
              onClick={handleSort}
              className="col-size"
            />
          </div>

          {sortedFiles.map((file) => (
            <div className="uploads-table-row" key={file.id ?? getName(file)}>
              <div className="col-name">
                <span className="uploads-row-icon"><FileIcon /></span>
                <span className="uploads-row-filename">{getName(file)}</span>
              </div>
              <div className="col-owner">{getOwner(file) || '—'}</div>
              <div className="col-modified" title={formatFull(getModified(file))}>
                {formatDate(getModified(file))}
              </div>
              <div className="col-size">{formatSize(getSize(file))}</div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .uploads-view-head { margin-bottom: 22px; }
        .uploads-view-head h2 { font-size: 1.2rem; margin: 0 0 6px; }
        .uploads-view-head p { color: var(--ink-dim); font-size: 0.88rem; margin: 0; }
        .uploads-error { background: rgba(255,107,107,0.12); color: var(--coral); border: 1px solid rgba(255,107,107,0.3); border-radius: var(--radius-sm); padding: 12px 14px; margin-bottom: 18px; font-size: 0.87rem; }
        .uploads-empty { text-align: center; padding: 60px 20px; color: var(--ink-dim); }

        .uploads-table {
          display: flex; flex-direction: column;
          border: 1px solid var(--border); border-radius: var(--radius-sm);
          overflow: hidden; background: var(--surface);
        }
        .uploads-table-row {
          display: grid;
          grid-template-columns: minmax(0, 2.4fr) minmax(0, 1.4fr) minmax(0, 1.1fr) minmax(0, 0.8fr);
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border);
        }
        .uploads-table-row:last-child { border-bottom: none; }
        .uploads-table-row:not(.uploads-table-head):hover { background: var(--surface-2); }

        .uploads-table-head {
          background: var(--surface-2);
          padding-top: 8px; padding-bottom: 8px;
        }
        .uploads-table-head .sortable-header {
          display: flex; align-items: center; gap: 5px;
          background: none; border: none; padding: 0; margin: 0;
          font: inherit; font-size: 0.78rem; font-weight: 600;
          color: var(--ink-dim); text-transform: uppercase; letter-spacing: 0.02em;
          cursor: pointer;
        }
        .uploads-table-head .sortable-header:hover { color: var(--ink); }
        .uploads-table-head .sortable-header.active { color: var(--flow); }
        .sort-arrow { font-size: 0.7rem; opacity: 0.7; }

        .col-name { display: flex; align-items: center; gap: 10px; min-width: 0; }
        .uploads-row-icon {
          flex-shrink: 0; width: 28px; height: 28px; border-radius: 6px; background: var(--surface-2);
          color: var(--flow); display: flex; align-items: center; justify-content: center;
        }
        .uploads-row-filename {
          font-size: 0.9rem; color: var(--ink); font-weight: 500;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .col-owner, .col-modified, .col-size {
          font-size: 0.85rem; color: var(--ink-dim);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        @media (max-width: 720px) {
          .uploads-table-row { grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); }
          .col-owner { display: none; }
        }
        @media (max-width: 480px) {
          .uploads-table-row { grid-template-columns: 1fr; gap: 4px; }
          .col-modified, .col-size { display: none; }
        }
      `}</style>
    </section>
  )
}

function SortableHeader({ label, field, active, dir, onClick, className }) {
  return (
    <div className={className}>
      <button
        type="button"
        className={`sortable-header${active ? ' active' : ''}`}
        onClick={() => onClick(field)}
      >
        {label}
        {active && <span className="sort-arrow">{dir === 'asc' ? '▲' : '▼'}</span>}
      </button>
    </div>
  )
}

// --- Field accessors -------------------------------------------------
// Backend field names weren't confirmed, so each accessor tries a few
// likely candidates. Trim this once the real shape from /api/files is known.

function getName(f) {
  return f.name ?? f.file_name ?? f.filename ?? ''
}

function getOwner(f) {
  return f.owner ?? f.owner_name ?? f.user_email ?? f.email ?? ''
}

function getModified(f) {
  return f.updated_at ?? f.modified_at ?? f.created_at ?? null
}

function getSize(f) {
  return f.size ?? f.file_size ?? f.bytes ?? 0
}

// --- Formatting --------------------------------------------------------

function formatSize(bytes) {
  if (!bytes || bytes <= 0) return '—'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let value = bytes
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex++
  }
  const precision = unitIndex === 0 ? 0 : 1
  return `${value.toFixed(precision)} ${units[unitIndex]}`
}

function formatDate(isoString) {
  if (!isoString) return '—'
  const d = new Date(isoString)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatFull(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}

function FileIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}
