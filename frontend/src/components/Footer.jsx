import { BrowserMark } from './Header.jsx'

const COLUMNS = [
  { title: 'Product', links: ['Gallery', 'How it works', 'Safety', 'FAQ'] },
  { title: 'Company', links: ['About', 'Contact'] },
  { title: 'Legal', links: ['Privacy', 'Terms of Condition'] },
]

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="brand">
            <BrowserMark size={26} />
            <span className="brand-name">Upflow</span>
          </div>
          <p className="footer-desc">
            Turn any HTML file into a live link you can preview, test, and share in seconds.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title} className="footer-col">
            <span className="footer-col-title">{col.title}</span>
            {col.links.map((link) => (
              <a key={link} href="#" className="footer-link">{link}</a>
            ))}
          </div>
        ))}
      </div>

      <div className="container footer-bottom">
        <span>© 2026 Upflow. All rights reserved.</span>
      </div>

      <style>{`
        .site-footer { border-top: 1px solid var(--border); padding: 56px 0 28px; margin-top: 40px; }
        .footer-grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; gap: 32px; }
        .footer-brand { display: flex; flex-direction: column; gap: 14px; max-width: 280px; }
        .brand { display: flex; align-items: center; gap: 10px; }
        .brand-name { font-family: var(--font-display); font-weight: 700; font-size: 1.1rem; }
        .footer-desc { color: var(--ink-dim); font-size: 0.88rem; }
        .footer-col { display: flex; flex-direction: column; gap: 12px; }
        .footer-col-title { font-family: var(--font-mono); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--ink-dim); }
        .footer-link { font-size: 0.9rem; color: var(--ink); }
        .footer-link:hover { color: var(--flow); }
        .footer-bottom { margin-top: 40px; padding-top: 20px; border-top: 1px solid var(--border); font-size: 0.82rem; color: var(--ink-dim); }
        @media (max-width: 700px) {
          .footer-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </footer>
  )
}
