import { useState, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import AuthShell from '../components/AuthShell.jsx'
import LoadingOverlay from '../components/LoadingOverlay.jsx'
import { verifyCode, resendCode } from '../api/client.js'

export default function VerifyEmail() {
  const location = useLocation()
  const navigate = useNavigate()
  const email = location.state?.email

  const [code, setCode] = useState('')
  const [rememberDevice, setRememberDevice] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resent, setResent] = useState(false)
  const [enteringDashboard, setEnteringDashboard] = useState(false)
  const resendTimer = useRef(null)

  if (!email) {
    // Someone landed here directly without going through signup/login.
    navigate('/login')
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await verifyCode({ email, code, rememberDevice })
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
      await resendCode(email)
      setResent(true)
      clearTimeout(resendTimer.current)
      resendTimer.current = setTimeout(() => setResent(false), 4000)
    } catch {
      setError('Could not resend the code. Try again in a moment.')
    }
  }

  if (enteringDashboard) {
    return <LoadingOverlay label="Taking you to your dashboard..." />
  }

  return (
    <AuthShell
      title="Verify your email"
      subtitle={`Enter the 6-digit code we sent to ${email}.`}
      footer={<p className="auth-footer">Wrong email? <Link to="/signup">Start over</Link></p>}
    >
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="code">Verification code</label>
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
        <label className="remember-row">
          <input type="checkbox" checked={rememberDevice} onChange={(e) => setRememberDevice(e.target.checked)} />
          <span>Remember this device (skip the code next time you log in here)</span>
        </label>
        {error && <p style={{ color: 'var(--coral)', fontSize: '0.86rem', marginBottom: 12 }}>{error}</p>}
        <button className="btn btn-primary auth-submit" disabled={loading || code.length !== 6}>
          {loading ? 'Verifying...' : 'Verify and continue'}
        </button>
        <button type="button" className="btn btn-ghost auth-submit resend-btn" onClick={handleResend}>
          {resent ? 'Code sent!' : 'Resend code'}
        </button>
      </form>

      <style>{`
        .remember-row { display: flex; align-items: flex-start; gap: 9px; font-size: 0.83rem; color: var(--ink-dim); margin-bottom: 18px; cursor: pointer; }
        .remember-row input { margin-top: 2px; }
        .resend-btn { margin-top: 10px; }
      `}</style>
    </AuthShell>
  )
}
