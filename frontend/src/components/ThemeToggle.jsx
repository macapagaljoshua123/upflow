import { useEffect, useState } from 'react'
import { applyTheme, getStoredTheme } from '../theme.js'

/**
 * Small pill button that flips between the default dark theme and the
 * white-and-green light theme. Safe to drop into any header/topbar —
 * it reads/writes the shared theme state itself.
 */
export default function ThemeToggle({ className = '' }) {
  const [theme, setTheme] = useState(getStoredTheme)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  function toggle() {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'))
  }

  const isLight = theme === 'light'

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`}
      onClick={toggle}
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {isLight ? <SunIcon /> : <MoonIcon />}

      <style>{`
        .theme-toggle {
          display: inline-flex; align-items: center; justify-content: center;
          width: 36px; height: 36px; flex-shrink: 0;
          background: var(--surface); border: 1px solid var(--border); border-radius: 999px;
          color: var(--ink); transition: border-color 0.15s ease, color 0.15s ease;
        }
        .theme-toggle:hover { border-color: var(--flow); color: var(--flow); }
      `}</style>
    </button>
  )
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 2.5v2.4M12 19.1v2.4M4.6 4.6l1.7 1.7M17.7 17.7l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.6 19.4l1.7-1.7M17.7 6.3l1.7-1.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M20 14.2A8.2 8.2 0 119.8 4a6.6 6.6 0 0010.2 10.2z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  )
}
