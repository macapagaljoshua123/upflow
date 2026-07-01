import { useState } from 'react'
import Modal from './Modal.jsx'

/**
 * Replaces window.confirm() for destructive actions ("Delete file",
 * "Delete folder") with a proper in-page modal.
 */
export default function ConfirmModal({
  title,
  message,
  confirmLabel = 'Delete',
  danger = true,
  onConfirm,
  onClose,
}) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleConfirm() {
    setSubmitting(true)
    setError('')
    try {
      await onConfirm()
    } catch (err) {
      setError(err?.response?.data?.detail || 'Something went wrong. Try again.')
      setSubmitting(false)
    }
  }

  return (
    <Modal title={title} onClose={onClose} width={400}>
      <div className="uf-confirm-body">
        {danger && (
          <div className="uf-confirm-icon">
            <WarnIcon />
          </div>
        )}
        <p className="uf-confirm-message">{message}</p>
        {error && <p className="uf-confirm-error">{error}</p>}
      </div>

      <div className="uf-confirm-actions">
        <button className="btn btn-ghost btn-sm" onClick={onClose} disabled={submitting}>
          Cancel
        </button>
        <button
          className={`btn btn-sm ${danger ? 'btn-danger' : 'btn-primary'}`}
          onClick={handleConfirm}
          disabled={submitting}
          autoFocus
        >
          {submitting ? 'Please wait\u2026' : confirmLabel}
        </button>
      </div>

      <style>{`
        .uf-confirm-body { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px; padding: 6px 4px 4px; }
        .uf-confirm-icon {
          width: 46px; height: 46px; border-radius: 50%;
          background: rgba(255,107,107,0.14);
          display: flex; align-items: center; justify-content: center;
        }
        .uf-confirm-message { color: var(--ink); font-size: 0.92rem; line-height: 1.5; margin: 0; }
        .uf-confirm-error { color: var(--coral); font-size: 0.8rem; margin: 0; }
        .uf-confirm-actions { display: flex; justify-content: center; gap: 10px; margin-top: 18px; }
        .btn-danger {
          background: var(--coral);
          color: #2a0d0d;
          font-weight: 600;
        }
        .btn-danger:hover { filter: brightness(1.05); }
      `}</style>
    </Modal>
  )
}

function WarnIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 9v4M12 16.5h.01" stroke="var(--coral)" strokeWidth="2" strokeLinecap="round" />
      <path d="M10.9 3.6a1.25 1.25 0 012.2 0l8.2 14.6a1.25 1.25 0 01-1.1 1.85H2.8a1.25 1.25 0 01-1.1-1.85l8.2-14.6z" stroke="var(--coral)" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}
