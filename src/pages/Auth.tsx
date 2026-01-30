import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as apiLogin, register as apiRegister } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

export function Auth() {
  const nav = useNavigate()
  const { login: setToken } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'login') {
        const { token } = await apiLogin(email, password)
        setToken(token)
      } else {
        const { token } = await apiRegister(email, password)
        setToken(token)
      }
      nav('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 style={{ margin: '0 0 0.5rem' }}>{mode === 'login' ? 'Log in' : 'Create account'}</h1>
      <p style={{ color: 'var(--text-muted)', margin: '0 0 1rem' }}>
        {mode === 'login' ? 'Sign in to manage your enrolled family members.' : 'Register to start using VoiceGuard.'}
      </p>
      {error && (
        <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>
      )}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 320 }}>
        <div>
          <label htmlFor="auth-email" style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.9rem' }}>Email</label>
          <input
            id="auth-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--text)',
              fontSize: '1rem',
            }}
          />
        </div>
        <div>
          <label htmlFor="auth-password" style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.9rem' }}>Password</label>
          <input
            id="auth-password"
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={mode === 'register' ? 6 : undefined}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--text)',
              fontSize: '1rem',
            }}
          />
          {mode === 'register' && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>At least 6 characters</p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--accent)',
            color: 'var(--bg)',
            border: 'none',
            borderRadius: 'var(--radius)',
            fontWeight: 600,
            fontSize: '1rem',
          }}
        >
          {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Register'}
        </button>
        <button
          type="button"
          onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
          style={{
            padding: '0.5rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          {mode === 'login' ? 'Need an account? Register' : 'Already have an account? Log in'}
        </button>
      </form>
    </div>
  )
}
