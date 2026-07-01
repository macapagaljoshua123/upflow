import { useEffect, useState } from 'react'
import Modal from './Modal.jsx'
import { listFolders } from '../api/client.js'

/**
 * Replaces the "type a folder name" window.prompt for Move-to with a real
 * folder browser: drill into subfolders, breadcrumb back up, and land on
 * "Move here".
 *
 * excludeFolderId: when moving a folder, its own id is filtered out of every
 * level so you can't drop it directly inside itself.
 */
export default function MoveToModal({ itemName, currentParentId, excludeFolderId, onMove, onClose }) {
  const [trail, setTrail] = useState([{ id: null, name: 'Home' }])
  const [subfolders, setSubfolders] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const here = trail[trail.length - 1]

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    listFolders(here.id)
      .then((data) => {
        if (cancelled) return
        const list = data
          .filter((f) => f.id !== excludeFolderId)
          .map((f) => ({ id: f.id, name: f.name }))
        setSubfolders(list)
      })
      .catch(() => !cancelled && setError('Could not load folders.'))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [here.id])

  function openFolder(folder) {
    setTrail((t) => [...t, folder])
  }

  function jumpTo(index) {
    setTrail((t) => t.slice(0, index + 1))
  }

  async function handleMoveHere() {
    setSubmitting(true)
    setError('')
    try {
      await onMove(here.id)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Could not move it there. Try again.')
      setSubmitting(false)
    }
  }

  const alreadyHere = here.id === (currentParentId ?? null)

  return (
    <Modal title={`Move \u201c${itemName}\u201d`} onClose={onClose} width={460}>
      <div className="uf-move-breadcrumb">
        {trail.map((step, i) => (
          <span key={step.id ?? 'root'} className="uf-move-crumb-group">
            <button className="uf-move-crumb" onClick={() => jumpTo(i)} disabled={i === trail.length - 1}>
              {step.name}
            </button>
            {i < trail.length - 1 && <span className="uf-move-crumb-sep">/</span>}
          </span>
        ))}
      </div>

      <div className="uf-move-list">
        {loading ? (
          <p className="uf-move-hint">Loading folders\u2026</p>
        ) : subfolders.length === 0 ? (
          <p className="uf-move-hint">No subfolders here.</p>
        ) : (
          subfolders.map((folder) => (
            <button key={folder.id} className="uf-move-row" onClick={() => openFolder(folder)}>
              <FolderIcon />
              <span>{folder.name}</span>
              <ChevronIcon />
            </button>
          ))
        )}
      </div>

      {error && <p className="uf-move-error">{error}</p>}

      <div className="uf-move-actions">
        <span className="uf-move-dest">
          Move to: <strong>{here.name}</strong>
        </span>
        <div className="uf-move-buttons">
          <button className="btn btn-ghost btn-sm" onClick={onClose} disabled={submitting}>Cancel</button>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleMoveHere}
            disabled={submitting || alreadyHere}
            title={alreadyHere ? 'Already here' : ''}
          >
            {submitting ? 'Moving\u2026' : 'Move here'}
          </button>
        </div>
      </div>

      <style>{`
        .uf-move-breadcrumb { display: flex; flex-wrap: wrap; align-items: center; gap: 2px; margin-bottom: 14px; font-size: 0.85rem; }
        .uf-move-crumb-group { display: inline-flex; align-items: center; gap: 2px; }
        .uf-move-crumb { background: none; color: var(--flow); padding: 2px 4px; border-radius: 4px; }
        .uf-move-crumb:disabled { color: var(--ink); font-weight: 600; cursor: default; }
        .uf-move-crumb:not(:disabled):hover { background: var(--surface-2); }
        .uf-move-crumb-sep { color: var(--ink-dim); margin: 0 2px; }
        .uf-move-list {
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          min-height: 140px;
          max-height: 260px;
          overflow-y: auto;
          background: var(--canvas);
        }
        .uf-move-hint { color: var(--ink-dim); font-size: 0.85rem; padding: 18px 14px; text-align: center; margin: 0; }
        .uf-move-row {
          width: 100%; display: flex; align-items: center; gap: 10px;
          padding: 11px 14px; background: none; color: var(--ink);
          border-bottom: 1px solid var(--border); text-align: left; font-size: 0.88rem;
        }
        .uf-move-row:last-child { border-bottom: none; }
        .uf-move-row:hover { background: var(--surface-2); }
        .uf-move-row span { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .uf-move-error { color: var(--coral); font-size: 0.8rem; margin: 10px 0 0; }
        .uf-move-actions {
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          margin-top: 16px; flex-wrap: wrap;
        }
        .uf-move-dest { font-size: 0.82rem; color: var(--ink-dim); }
        .uf-move-buttons { display: flex; gap: 10px; }
        @media (max-width: 480px) {
          .uf-move-actions { flex-direction: column; align-items: stretch; }
          .uf-move-buttons { justify-content: flex-end; }
        }
      `}</style>
    </Modal>
  )
}

function FolderIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path d="M4 6.5a1 1 0 011-1h4.6l1.6 2h7.2a1 1 0 011 1v9.5a1 1 0 01-1 1H5a1 1 0 01-1-1V6.5z" fill="var(--flow)" fillOpacity="0.18" stroke="var(--flow)" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, opacity: 0.5 }}>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
