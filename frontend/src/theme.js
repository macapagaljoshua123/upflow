const THEME_KEY = 'upflow_theme'

export function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || 'dark'
  } catch {
    return 'dark'
  }
}

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    // ignore storage errors (e.g. private browsing)
  }
}

// Call once on app start so the correct theme is set before first paint.
export function initTheme() {
  applyTheme(getStoredTheme())
}
