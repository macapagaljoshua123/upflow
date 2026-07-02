import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAuthToken, getCurrentUser, logout } from '../api/client.js'
import UserMenu from './UserMenu.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import SettingsModal from './SettingsModal.jsx'

const NAV = [
  { label: 'Gallery', href: '#gallery' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Safety', href: '#safety' },
  { label: 'FAQ', href: '#faq' },
]

export function BrowserMark({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="4" width="30" height="24" rx="5" fill="var(--surface-2)" stroke="var(--flow)" strokeWidth="1.4" />
      <line x1="1" y1="11" x2="31" y2="11" stroke="var(--flow)" strokeWidth="1.4" />
      <circle cx="6.5" cy="7.5" r="1.3" fill="var(--coral)" />
      <circle cx="11" cy="7.5" r="1.3" fill="var(--flow)" opacity="0.6" />
      <path d="M9 19l4 4 9-9" stroke="var(--flow)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Header() {
  const [open, setOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [userOverride, setUserOverride] = useState(null) // set after a Settings update so it reflects without a reload
  const navigate = useNavigate()

  const token = getAuthToken()
  const user = token ? (userOverride || getCurrentUser()) : null
  const isSignedIn = Boolean(token)

  function handleSignOut() {
    logout()
    navigate('/')
    window.location.reload()
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <a href="#top" className="brand">
          <BrowserMark size={28} />
          <span className="brand-name">Upflow</span>
        </a>

        <nav className="nav-desktop">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="nav-link">{item.label}</a>
          ))}
        </nav>

        {isSignedIn ? (
          <div className="auth-row">
            <Link to="/dashboard" className="btn btn-ghost btn-sm">Back to Dashboard</Link>
            <ThemeToggle />
            <UserMenu name={user?.name} email={user?.email} onSignOut={handleSignOut} onSettings={() => setSettingsOpen(true)} />
          </div>
        ) : (
          <div className="auth-row">
            <ThemeToggle />
            <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
            <Link to="/signup" className="btn btn-primary btn-sm">Sign up</Link>
          </div>
        )}

        <button
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="burger-btn"
        >
          <span className={`burger-bar ${open ? 'bar-top-open' : ''}`} />
          <span className={`burger-bar ${open ? 'bar-mid-open' : ''}`} />
          <span className={`burger-bar ${open ? 'bar-bot-open' : ''}`} />
        </button>
      </div>

      {open && (
        <div className="mobile-panel">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="mobile-link" onClick={() => setOpen(false)}>
              {item.label}
            </a>
          ))}
          <div className="mobile-auth">
            <div className="mobile-theme-row">
              <span>Appearance</span>
              <ThemeToggle />
            </div>
            {isSignedIn ? (
              <>
                <Link to="/dashboard" className="btn btn-ghost" style={{ width: '100%' }} onClick={() => setOpen(false)}>
                  Back to Dashboard
                </Link>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => { setOpen(false); handleSignOut() }}>
                  Sign out ({user?.name || user?.email})
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost" style={{ width: '100%' }} onClick={() => setOpen(false)}>Log in</Link>
                <Link to="/signup" className="btn btn-primary" style={{ width: '100%' }} onClick={() => setOpen(false)}>Sign up</Link>
              </>
            )}
          </div>
        </div>
      )}

      {settingsOpen && (
        <SettingsModal
          user={user}
          onClose={() => setSettingsOpen(false)}
          onUpdated={(updated) => setUserOverride(updated)}
        />
      )}

      <style>{`
        .site-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: var(--header-bg);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--border);
        }
        .header-inner {
          display: flex; align-items: center; justify-content: space-between; height: 72px; gap: 24px;
          max-width: 1400px; margin: 0 auto; padding: 0 20px;
        }
        .brand { display: flex; align-items: center; gap: 10px; }
        .brand-name { font-family: var(--font-display); font-weight: 700; font-size: 1.15rem; }
        .nav-desktop { display: flex; gap: 28px; flex: 1; justify-content: center; }
        .nav-link { font-size: 0.92rem; color: var(--ink-dim); }
        .nav-link:hover { color: var(--flow); }
        .auth-row { display: flex; align-items: center; gap: 12px; }
        .btn-sm { padding: 10px 18px; font-size: 0.88rem; }
        .burger-btn { display: none; flex-direction: column; justify-content: center; gap: 5px; background: none; width: 36px; height: 36px; }
        .burger-bar { width: 20px; height: 2px; background: var(--ink); border-radius: 2px; transition: all 0.2s ease; }
        .bar-top-open { transform: translateY(7px) rotate(45deg); }
        .bar-mid-open { opacity: 0; }
        .bar-bot-open { transform: translateY(-7px) rotate(-45deg); }
        .mobile-panel { display: flex; flex-direction: column; gap: 18px; padding: 20px 24px 28px; border-top: 1px solid var(--border); }
        .mobile-link { font-size: 1rem; color: var(--ink); }
        .mobile-auth { display: flex; flex-direction: column; gap: 10px; margin-top: 8px; }
        .mobile-theme-row { display: flex; align-items: center; justify-content: space-between; font-size: 0.9rem; color: var(--ink-dim); padding: 4px 0 10px; }

        @media (max-width: 880px) {
          .nav-desktop, .auth-row { display: none; }
          .burger-btn { display: flex; }
        }
      `}</style>
    </header>
  )
}
