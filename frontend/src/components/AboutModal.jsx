import Modal from './Modal.jsx'
import { BrowserMark } from './Header.jsx'

const FEATURES = [
  {
    icon: <BoltIcon />,
    title: 'Instant preview links',
    body: 'Upload an .html file and Upflow immediately hands you a live, shareable link — no build step, no deploy pipeline.',
  },
  {
    icon: <FolderIcon />,
    title: 'Folders that work like a drive',
    body: 'Organize pages into folders, drag work between them with Move to, and upload a whole folder from your computer at once.',
  },
  {
    icon: <ShareIcon />,
    title: 'Share your way',
    body: 'Keep a page private, make it public with a link, or invite specific people by email — they get notified automatically.',
  },
  {
    icon: <ShieldIcon />,
    title: 'Sandboxed by default',
    body: 'Every preview renders inside a locked-down iframe with no access to your session or other people\u2019s files, and uploads are screened before they\u2019re stored.',
  },
]

export default function AboutModal({ onClose }) {
  return (
    <Modal title="About Upflow" onClose={onClose} width={560} labelledBy="about-upflow-title">
      <div className="about-hero">
        <BrowserMark size={40} />
        <div>
          <h4 className="about-tagline">A lightweight home for your HTML previews</h4>
          <p className="about-sub">
            Upflow turns any HTML file into a live link in seconds — like a drive built
            specifically for the pages you want to preview and share, not store forever.
          </p>
        </div>
      </div>

      <div className="about-grid">
        {FEATURES.map((f) => (
          <div className="about-card" key={f.title}>
            <div className="about-card-icon">{f.icon}</div>
            <h5>{f.title}</h5>
            <p>{f.body}</p>
          </div>
        ))}
      </div>

      <p className="about-footnote">
        Built by LightWeight Solutions · Upflow © 2026
      </p>

      <style>{`
        .about-hero { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 22px; }
        .about-tagline { font-size: 1.05rem; margin: 2px 0 8px; }
        .about-sub { color: var(--ink-dim); font-size: 0.9rem; line-height: 1.55; margin: 0; }
        .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .about-card {
          border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 16px;
          background: var(--surface-2);
        }
        .about-card-icon { color: var(--flow); margin-bottom: 10px; }
        .about-card h5 { font-size: 0.92rem; margin: 0 0 6px; }
        .about-card p { font-size: 0.82rem; color: var(--ink-dim); line-height: 1.5; margin: 0; }
        .about-footnote { text-align: center; font-size: 0.78rem; color: var(--ink-dim); margin: 22px 0 0; }
        @media (max-width: 520px) {
          .about-grid { grid-template-columns: 1fr; }
          .about-hero { flex-direction: column; }
        }
      `}</style>
    </Modal>
  )
}

function BoltIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

function FolderIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 6.5a1 1 0 011-1h4.6l1.6 2h7.2a1 1 0 011 1v9.5a1 1 0 01-1 1H5a1 1 0 01-1-1V6.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="6" cy="12" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17" cy="6" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17" cy="18" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.2 10.9L14.9 7.1M8.2 13.1l6.7 3.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 3l7 3v5.5c0 4.6-3 8.3-7 9.5-4-1.2-7-4.9-7-9.5V6l7-3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
