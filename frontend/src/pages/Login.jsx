import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AuthShell from '../components/AuthShell.jsx'
import { login } from '../api/client.js'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ email, password })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'We couldn\u2019t log you in. Check your details and try again.')
    } finally {
      setLoading(false)
    }
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
          <label htmlFor="password">Password</label>
          <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" />
        </div>
        {error && <p style={{ color: 'var(--coral)', fontSize: '0.86rem', marginBottom: 12 }}>{error}</p>}
        <button className="btn btn-primary auth-submit" disabled={loading}>{loading ? 'Logging in...' : 'Log in'}</button>
      </form>
    </AuthShell>
  )
}
