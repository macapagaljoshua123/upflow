import { useState } from 'react'
import Modal from './Modal.jsx'

/**
 * Replaces window.prompt() for "Create folder", "Rename file" and
 * "Rename folder" with a proper in-page modal.
 */
export default function PromptModal({
  title,
  label,
  initialValue = '',
  confirmLabel = 'Save',
  placeholder = '',
  onConfirm,
  onClose,
}) {
  const [value, setValue] = useState(initialValue)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) {
      setError('This field can\u2019t be empty.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await onConfirm(trimmed)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Something went wrong. Try again.')
      setSubmitting(false)
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={handleSubmit} className="uf-prompt-form">
        <label className="uf-prompt-label" htmlFor="uf-prompt-input">{label}</label>
        <input
          id="uf-prompt-input"
          className="uf-prompt-input"
          value={value}
          placeholder={placeholder}
          onChange={(e) => { setValue(e.target.value); setError('') }}
          onFocus={(e) => e.target.select()}
          autoFocus
          maxLength={120}
        />
        {error && <p className="uf-prompt-error">{error}</p>}

        <div className="uf-prompt-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
            {submitting ? 'Saving\u2026' : confirmLabel}
          </button>
        </div>
      </form>

      <style>{`
        .uf-prompt-form { display: flex; flex-direction: column; gap: 8px; }
        .uf-prompt-label { font-size: 0.82rem; color: var(--ink-dim); }
        .uf-prompt-input {
          background: var(--canvas);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 11px 13px;
          color: var(--ink);
          font-size: 0.94rem;
          width: 100%;
        }
        .uf-prompt-input:focus-visible { outline: 2px solid var(--flow); }
        .uf-prompt-error { color: var(--coral); font-size: 0.8rem; margin: 0; }
        .uf-prompt-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; }
      `}</style>
    </Modal>
  )
}
