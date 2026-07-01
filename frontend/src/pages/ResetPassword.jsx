import { useState, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import AuthShell from '../components/AuthShell.jsx'
import LoadingOverlay from '../components/LoadingOverlay.jsx'
import { resetPassword, forgotPassword } from '../api/client.js'

export default function ResetPassword() {
  const location = useLocation()
  const navigate = useNavigate()
  const email = location.state?.email

  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resent, setResent] = useState(false)
  const [enteringDashboard, setEnteringDashboard] = useState(false)
  const resendTimer = useRef(null)

  if (!email) {
    // Someone landed here directly without going through "Forgot password".
    navigate('/forgot-password')
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords don\u2019t match.')
      return
    }

    setLoading(true)
    try {
      await resetPassword({ email, code, newPassword })
      setLoading(false)
      setEnteringDashboard(true)
      setTimeout(() => navigate('/dashboard'), 900)
    } catch (err) {
      setLoading(false)
      setError(err.response?.data?.detail || 'That code didn\u2019t work. Double-check it and try again.')
    }
  }

  async function handleResend() {
    setError('')
    setResent(false)
    try {
      await forgotPassword(email)
      setResent(true)
      clearTimeout(resendTimer.current)
      resendTimer.current = setTimeout(() => setResent(false), 4000)
    } catch {
      setError('Could not resend the code. Try again in a moment.')
    }
  }

  if (enteringDashboard) {
    return <LoadingOverlay label="Signing you in..." />
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle={`Enter the 6-digit code we sent to ${email}, then choose a new password.`}
      footer={<p className="auth-footer">Wrong email? <Link to="/forgot-password">Start over</Link></p>}
    >
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="code">Reset code</label>
          <input
            id="code"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            required
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            style={{ letterSpacing: '0.4em', fontSize: '1.2rem', textAlign: 'center' }}
          />
        </div>
        <div className="form-field">
          <label htmlFor="newPassword">New password</label>
          <input
            id="newPassword"
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
          />
        </div>
        <div className="form-field">
          <label htmlFor="confirmPassword">Confirm new password</label>
          <input
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
          />
        </div>
        {error && <p style={{ color: 'var(--coral)', fontSize: '0.86rem', marginBottom: 12 }}>{error}</p>}
        <button className="btn btn-primary auth-submit" disabled={loading || code.length !== 6}>
          {loading ? 'Resetting...' : 'Reset password'}
        </button>
        <button type="button" className="btn btn-ghost auth-submit resend-btn" onClick={handleResend}>
          {resent ? 'Code sent!' : 'Resend code'}
        </button>
      </form>

      <style>{`
        .resend-btn { margin-top: 10px; }
      `}</style>
    </AuthShell>
  )
}
