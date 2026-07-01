import { useEffect, useRef } from 'react'

/**
 * Centered modal shell used by PromptModal, ConfirmModal, and MoveToModal.
 * Renders in the normal document flow with a fixed, full-viewport overlay,
 * so it always appears centered over the page instead of pinned to the top
 * like a native browser prompt/confirm/alert.
 */
export default function Modal({ title, onClose, children, footer, width = 420, labelledBy }) {
  const cardRef = useRef(null)

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', handleKey)
    // Lock page scroll while a modal is open.
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  useEffect(() => {
    // Autofocus the first focusable field inside the modal, so keyboard
    // users can start typing/acting immediately.
    const first = cardRef.current?.querySelector('input, textarea, select, button')
    first?.focus()
  }, [])

  return (
    <div className="uf-modal-overlay" onMouseDown={onClose}>
      <div
        className="uf-modal-card"
        style={{ maxWidth: width }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy || 'uf-modal-title'}
        ref={cardRef}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="uf-modal-head">
          <h3 id={labelledBy || 'uf-modal-title'}>{title}</h3>
          <button className="uf-modal-close" onClick={onClose} aria-label="Close dialog">
            <CloseIcon />
          </button>
        </div>

        <div className="uf-modal-body">{children}</div>

        {footer && <div className="uf-modal-footer">{footer}</div>}
      </div>

      <style>{`
        .uf-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(6, 10, 9, 0.6);
          backdrop-filter: blur(2px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 200;
          padding: 20px;
          animation: uf-fade-in 0.15s ease;
        }
        .uf-modal-card {
          width: 100%;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          box-shadow: 0 24px 60px rgba(0,0,0,0.45);
          display: flex;
          flex-direction: column;
          max-height: min(600px, 86vh);
          animation: uf-pop-in 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .uf-modal-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 18px 20px;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }
        .uf-modal-head h3 {
          font-size: 1.02rem;
          font-weight: 600;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .uf-modal-close {
          background: none;
          color: var(--ink-dim);
          padding: 6px;
          border-radius: 8px;
          flex-shrink: 0;
          display: flex;
        }
        .uf-modal-close:hover { color: var(--ink); background: var(--surface-2); }
        .uf-modal-body {
          padding: 20px;
          overflow-y: auto;
        }
        .uf-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 16px 20px;
          border-top: 1px solid var(--border);
          flex-shrink: 0;
        }
        @keyframes uf-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes uf-pop-in {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .uf-modal-overlay, .uf-modal-card { animation: none; }
        }
        @media (max-width: 480px) {
          .uf-modal-overlay { padding: 12px; align-items: flex-end; }
          .uf-modal-card { max-height: 82vh; border-radius: var(--radius-lg) var(--radius-lg) 0 0; }
        }
      `}</style>
    </div>
  )
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
