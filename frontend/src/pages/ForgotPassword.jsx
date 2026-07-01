import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AuthShell from '../components/AuthShell.jsx'
import { forgotPassword } from '../api/client.js'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await forgotPassword(email)
      setLoading(false)
      navigate('/reset-password', { state: { email } })
    } catch (err) {
      setLoading(false)
      setError(err.response?.data?.detail || 'Something went wrong. Try again in a moment.')
    }
  }

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your email and we\u2019ll send you a code to reset it."
      footer={<p className="auth-footer">Remembered it? <Link to="/login">Log in</Link></p>}
    >
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        {error && <p style={{ color: 'var(--coral)', fontSize: '0.86rem', marginBottom: 12 }}>{error}</p>}
        <button className="btn btn-primary auth-submit" disabled={loading}>
          {loading ? 'Sending code...' : 'Send reset code'}
        </button>
      </form>
    </AuthShell>
  )
}
