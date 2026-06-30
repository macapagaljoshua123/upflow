import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AuthShell from '../components/AuthShell.jsx'
import { signup } from '../api/client.js'

export default function Signup() {
  const [name, setName] = useState('')
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
      await signup({ name, email, password })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'We couldn\u2019t create your account. Try a different email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start uploading and sharing HTML previews in minutes."
      footer={<p className="auth-footer">Already have an account? <Link to="/login">Log in</Link></p>}
    >
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="name">Name</label>
          <input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
        </div>
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
        </div>
        {error && <p style={{ color: 'var(--coral)', fontSize: '0.86rem', marginBottom: 12 }}>{error}</p>}
        <button className="btn btn-primary auth-submit" disabled={loading}>{loading ? 'Creating account...' : 'Sign up'}</button>
      </form>
    </AuthShell>
  )
}
