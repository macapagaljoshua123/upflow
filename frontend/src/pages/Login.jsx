import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AuthShell from '../components/AuthShell.jsx'
import LoadingOverlay from '../components/LoadingOverlay.jsx'
import { login } from '../api/client.js'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [enteringDashboard, setEnteringDashboard] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login({ email, password })
      setLoading(false)
      if (data.requires_verification) {
        navigate('/verify', { state: { email: data.email } })
        return
      }
      // Trusted device + already verified: go straight in, with a brief
      // loading transition instead of an instant, jarring redirect.
      setEnteringDashboard(true)
      setTimeout(() => navigate('/dashboard'), 900)
    } catch (err) {
      setLoading(false)
      setError(err.response?.data?.detail || 'We couldn\u2019t log you in. Check your details and try again.')
    }
  }

  if (enteringDashboard) {
    return <LoadingOverlay label="Logging you in..." />
  }

  return (
    <AuthShell
      title="Log in to Upflow"
      subtitle="Pick up where you left off with your uploads."
      footer={<p className="auth-footer">New here? <Link to="/signup">Create an account</Link></p>}
    >
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div className="form-field">
          <div className="password-row">
            <label htmlFor="password">Password</label>
            <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
          </div>
          <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" />
        </div>
        {error && <p style={{ color: 'var(--coral)', fontSize: '0.86rem', marginBottom: 12 }}>{error}</p>}
        <button className="btn btn-primary auth-submit" disabled={loading}>{loading ? 'Logging in...' : 'Log in'}</button>
      </form>

      <style>{`
        .password-row { display: flex; align-items: baseline; justify-content: space-between; }
        .forgot-link { font-size: 0.82rem; color: var(--flow); }
      `}</style>
    </AuthShell>
  )
}
