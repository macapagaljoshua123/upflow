import { Link } from 'react-router-dom'
import { BrowserMark } from './Header.jsx'

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <Link to="/" className="auth-close" aria-label="Close and return to home">
          <CloseIcon />
        </Link>
        <Link to="/" className="auth-brand">
          <BrowserMark size={26} />
          <span>Upflow</span>
        </Link>
        <h1 className="auth-title">{title}</h1>
        <p className="auth-subtitle">{subtitle}</p>
        {children}
        {footer}
      </div>
      <style>{`
        .auth-shell { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .auth-card { position: relative; width: 100%; max-width: 400px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 36px; }
        .auth-close {
          position: absolute; top: 16px; right: 16px; width: 32px; height: 32px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center; color: var(--ink-dim);
          transition: background 0.15s ease, color 0.15s ease;
        }
        .auth-close:hover { background: var(--surface-2); color: var(--ink); }
        .auth-brand { display: flex; align-items: center; gap: 10px; font-family: var(--font-display); font-weight: 700; margin-bottom: 28px; }
        .auth-title { font-size: 1.5rem; margin-bottom: 6px; }
        .auth-subtitle { color: var(--ink-dim); font-size: 0.9rem; margin-bottom: 26px; }
        .form-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
        .form-field label { font-size: 0.84rem; color: var(--ink-dim); }
        .form-field input {
          background: var(--canvas); border: 1px solid var(--border); border-radius: var(--radius-sm);
          padding: 12px 14px; color: var(--ink); font-size: 0.95rem;
        }
        .form-field input:focus-visible { outline: 2px solid var(--flow); outline-offset: 1px; }
        .auth-submit { width: 100%; margin-top: 8px; }
        .auth-footer { margin-top: 22px; font-size: 0.88rem; color: var(--ink-dim); text-align: center; }
        .auth-footer a { color: var(--flow); }
      `}</style>
    </div>
  )
}
