import { useState } from 'react'
import Modal from './Modal.jsx'
import {
  updateName, requestEmailChange, confirmEmailChange,
  requestPasswordChange, confirmPasswordChange,
} from '../api/client.js'

/**
 * Settings modal reachable from the UserMenu (Dashboard + Landing header).
 * Name changes save immediately. Email and password changes are two-step:
 * request a code (sent by SMTP) -> confirm with that code before anything
 * actually changes.
 */
export default function SettingsModal({ user, onClose, onUpdated }) {
  return (
    <Modal title="Settings" onClose={onClose} width={480} labelledBy="settings-modal-title">
      <NameSection user={user} onUpdated={onUpdated} />
      <div className="settings-divider" />
      <EmailSection user={user} onUpdated={onUpdated} />
      <div className="settings-divider" />
      <PasswordSection />

      <style>{`
        .settings-divider { height: 1px; background: var(--border); margin: 20px 0; }
        .settings-section { display: flex; flex-direction: column; gap: 10px; }
        .settings-label { font-size: 0.78rem; color: var(--ink-dim); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.05em; }
        .settings-current { font-size: 0.85rem; color: var(--ink-dim); }
        .settings-row { display: flex; gap: 8px; }
        .settings-row input {
          flex: 1; background: var(--canvas); border: 1px solid var(--border); border-radius: var(--radius-sm);
          padding: 10px 12px; color: var(--ink); font-size: 0.88rem; min-width: 0;
        }
        .settings-btn-sm { padding: 9px 16px; font-size: 0.82rem; white-space: nowrap; }
        .settings-banner { font-size: 0.82rem; border-radius: var(--radius-sm); padding: 10px 12px; margin: 0; }
        .settings-banner.success { color: var(--flow); background: rgba(52, 211, 153, 0.12); border: 1px solid rgba(52, 211, 153, 0.3); }
        .settings-banner.error { color: var(--coral); background: rgba(255,107,107,0.12); border: 1px solid rgba(255,107,107,0.3); }
        .settings-hint { font-size: 0.78rem; color: var(--ink-dim); margin: 0; }
        .settings-cancel { background: none; color: var(--ink-dim); font-size: 0.8rem; align-self: flex-start; padding: 4px 0; }
        .settings-cancel:hover { color: var(--ink); }
      `}</style>
    </Modal>
  )
}

function Banner({ banner }) {
  if (!banner) return null
  return <p className={`settings-banner ${banner.type}`}>{banner.text}</p>
}

function NameSection({ user, onUpdated }) {
  const [name, setName] = useState(user?.name || '')
  const [saving, setSaving] = useState(false)
  const [banner, setBanner] = useState(null)

  const dirty = name.trim() && name.trim() !== user?.name

  async function handleSave() {
    if (!dirty || saving) return
    setSaving(true)
    setBanner(null)
    try {
      const updated = await updateName(name.trim())
      onUpdated?.(updated)
      setBanner({ type: 'success', text: 'Name updated.' })
    } catch (err) {
      setBanner({ type: 'error', text: err?.response?.data?.detail || "Couldn't update your name." })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="settings-section">
      <span className="settings-label">Name</span>
      <div className="settings-row">
        <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }} />
        <button className="btn btn-primary settings-btn-sm" onClick={handleSave} disabled={!dirty || saving}>
          {saving ? 'Saving\u2026' : 'Save'}
        </button>
      </div>
      <Banner banner={banner} />
    </div>
  )
}

function EmailSection({ user, onUpdated }) {
  const [step, setStep] = useState('idle') // idle | requesting | code
  const [newEmail, setNewEmail] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [banner, setBanner] = useState(null)

  async function handleRequest() {
    if (!newEmail || busy) return
    setBusy(true)
    setBanner(null)
    try {
      const res = await requestEmailChange(newEmail)
      setBanner({ type: 'success', text: res.message })
      setStep('code')
    } catch (err) {
      setBanner({ type: 'error', text: err?.response?.data?.detail || "Couldn't send that code. Try again." })
    } finally {
      setBusy(false)
    }
  }

  async function handleConfirm() {
    if (!code || busy) return
    setBusy(true)
    setBanner(null)
    try {
      const updated = await confirmEmailChange(code)
      onUpdated?.(updated)
      setBanner({ type: 'success', text: 'Email updated.' })
      setStep('idle')
      setNewEmail('')
      setCode('')
    } catch (err) {
      setBanner({ type: 'error', text: err?.response?.data?.detail || 'Invalid or expired code.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="settings-section">
      <span className="settings-label">Email</span>
      <p className="settings-current">Current: {user?.email}</p>

      {step === 'idle' && (
        <button className="btn btn-ghost settings-btn-sm" style={{ alignSelf: 'flex-start' }} onClick={() => setStep('requesting')}>
          Change email
        </button>
      )}

      {step === 'requesting' && (
        <>
          <div className="settings-row">
            <input
              type="email"
              placeholder="New email address"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleRequest() }}
            />
            <button className="btn btn-primary settings-btn-sm" onClick={handleRequest} disabled={!newEmail || busy}>
              {busy ? 'Sending\u2026' : 'Send code'}
            </button>
          </div>
          <p className="settings-hint">We'll email a verification code to the new address to confirm you own it.</p>
          <button className="settings-cancel" onClick={() => { setStep('idle'); setBanner(null) }}>Cancel</button>
        </>
      )}

      {step === 'code' && (
        <>
          <div className="settings-row">
            <input
              placeholder="6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleConfirm() }}
              maxLength={6}
            />
            <button className="btn btn-primary settings-btn-sm" onClick={handleConfirm} disabled={!code || busy}>
              {busy ? 'Confirming\u2026' : 'Confirm'}
            </button>
          </div>
          <p className="settings-hint">Enter the code sent to {newEmail}.</p>
          <button className="settings-cancel" onClick={() => { setStep('idle'); setCode(''); setBanner(null) }}>Cancel</button>
        </>
      )}

      <Banner banner={banner} />
    </div>
  )
}

function PasswordSection() {
  const [step, setStep] = useState('idle') // idle | requesting | code
  const [currentPassword, setCurrentPassword] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [banner, setBanner] = useState(null)

  async function handleRequest() {
    if (!currentPassword || busy) return
    setBusy(true)
    setBanner(null)
    try {
      const res = await requestPasswordChange(currentPassword)
      setBanner({ type: 'success', text: res.message })
      setStep('code')
    } catch (err) {
      setBanner({ type: 'error', text: err?.response?.data?.detail || "Couldn't send that code. Try again." })
    } finally {
      setBusy(false)
    }
  }

  async function handleConfirm() {
    if (!code || newPassword.length < 8 || busy) return
    setBusy(true)
    setBanner(null)
    try {
      await confirmPasswordChange(code, newPassword)
      setBanner({ type: 'success', text: 'Password updated.' })
      setStep('idle')
      setCurrentPassword('')
      setCode('')
      setNewPassword('')
    } catch (err) {
      setBanner({ type: 'error', text: err?.response?.data?.detail || 'Invalid or expired code.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="settings-section">
      <span className="settings-label">Password</span>

      {step === 'idle' && (
        <button className="btn btn-ghost settings-btn-sm" style={{ alignSelf: 'flex-start' }} onClick={() => setStep('requesting')}>
          Change password
        </button>
      )}

      {step === 'requesting' && (
        <>
          <div className="settings-row">
            <input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleRequest() }}
            />
            <button className="btn btn-primary settings-btn-sm" onClick={handleRequest} disabled={!currentPassword || busy}>
              {busy ? 'Sending\u2026' : 'Send code'}
            </button>
          </div>
          <p className="settings-hint">We'll email a verification code to your current address to confirm the change.</p>
          <button className="settings-cancel" onClick={() => { setStep('idle'); setBanner(null) }}>Cancel</button>
        </>
      )}

      {step === 'code' && (
        <>
          <div className="settings-row">
            <input
              placeholder="6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
            />
          </div>
          <div className="settings-row">
            <input
              type="password"
              placeholder="New password (min. 8 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleConfirm() }}
            />
            <button className="btn btn-primary settings-btn-sm" onClick={handleConfirm} disabled={!code || newPassword.length < 8 || busy}>
              {busy ? 'Confirming\u2026' : 'Confirm'}
            </button>
          </div>
          <button className="settings-cancel" onClick={() => { setStep('idle'); setCode(''); setNewPassword(''); setBanner(null) }}>Cancel</button>
        </>
      )}

      <Banner banner={banner} />
    </div>
  )
}
