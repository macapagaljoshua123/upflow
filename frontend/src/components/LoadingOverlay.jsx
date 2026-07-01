import { BrowserMark } from './Header.jsx'

export default function LoadingOverlay({ label = 'Loading your dashboard...' }) {
  return (
    <div className="loading-overlay">
      <div className="loading-mark">
        <BrowserMark size={34} />
      </div>
      <div className="loading-spinner" />
      <p className="loading-label">{label}</p>

      <style>{`
        .loading-overlay {
          min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 18px; background: var(--canvas);
        }
        .loading-mark { opacity: 0.9; }
        .loading-spinner {
          width: 34px; height: 34px; border-radius: 50%;
          border: 3px solid var(--border); border-top-color: var(--flow);
          animation: loading-spin 0.8s linear infinite;
        }
        .loading-label { color: var(--ink-dim); font-size: 0.9rem; }
        @keyframes loading-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
