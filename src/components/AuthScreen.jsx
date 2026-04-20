import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './AuthScreen.css'

export default function AuthScreen() {
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const [mode, setMode] = useState('login') // 'login' or 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'signup') {
        if (!username.trim()) { setError('Please enter a username.'); setLoading(false); return }
        await signUp(email, password, username.trim())
      } else {
        await signIn(email, password)
      }
    } catch (err) {
      // Convert Firebase error codes to friendly messages
      const msgs = {
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/weak-password': 'Password must be at least 6 characters.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/invalid-credential': 'Incorrect email or password.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.',
      }
      setError(msgs[err.code] || 'Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    setError('')
    setLoading(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError('Google sign-in failed. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="auth-screen">
      <div className="auth-hero">
        <div className="auth-hero-icon">⚽</div>
        <div className="auth-hero-title">WorldCup Watch NYC</div>
        <div className="auth-hero-sub">Find your crowd for Summer 2026</div>
      </div>

      <div className="auth-card">
        <div className="auth-tabs">
          <div className={`auth-tab ${mode==='login'?'active':''}`} onClick={() => { setMode('login'); setError('') }}>Sign in</div>
          <div className={`auth-tab ${mode==='signup'?'active':''}`} onClick={() => { setMode('signup'); setError('') }}>Create account</div>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <>
              <label className="auth-label">Your name</label>
              <input
                className="auth-input"
                type="text"
                placeholder="e.g. Juan D."
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </>
          )}

          <label className="auth-label">Email address</label>
          <input
            className="auth-input"
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <label className="auth-label">Password</label>
          <input
            className="auth-input"
            type="password"
            placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          {error && <div className="auth-error">{error}</div>}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'signup' ? 'Create my account' : 'Sign in'}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <button className="google-btn" onClick={handleGoogle} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.8 2.2 30.3 0 24 0 14.7 0 6.8 5.4 2.9 13.3l7.9 6.1C12.6 13 17.9 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.4c-.5 2.8-2.1 5.2-4.5 6.8l7 5.4c4.1-3.8 6.5-9.4 6.5-16.2z"/>
            <path fill="#FBBC05" d="M10.8 28.6A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.6L2.4 13.3A24 24 0 0 0 0 24c0 3.9.9 7.5 2.9 10.7l7.9-6.1z"/>
            <path fill="#34A853" d="M24 48c6.5 0 12-2.1 16-5.8l-7-5.4c-2.1 1.4-4.7 2.2-9 2.2-6.1 0-11.4-3.5-13.2-9l-7.9 6.1C6.8 42.6 14.7 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        {mode === 'login' && (
          <div className="auth-switch">
            Don't have an account?{' '}
            <span onClick={() => { setMode('signup'); setError('') }}>Sign up free</span>
          </div>
        )}
        {mode === 'signup' && (
          <div className="auth-switch">
            Already have an account?{' '}
            <span onClick={() => { setMode('login'); setError('') }}>Sign in</span>
          </div>
        )}
      </div>
    </div>
  )
}
