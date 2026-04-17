import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail]       = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await register(email, password, username)
      navigate('/profile')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error has occurred'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main>
      <h1>Create an account</h1>

      <form onSubmit={handleSubmit} noValidate aria-label="Registration Form">

        {error && (
          <div role="alert" aria-live="assertive">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            required
            aria-required="true"
            aria-describedby={error ? 'form-error' : undefined}
          />
        </div>

        <div>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoComplete="username"
            required
            aria-required="true"
            minLength={3}
            maxLength={30}
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            aria-required="true"
            aria-describedby="password-hint"
            minLength={8}
          />
          <span id="password-hint">At least 8 characters</span>
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Create my account'}
        </button>

      </form>

      <p>
        Already have an account? {' '}
        <Link to="/login">Login</Link>
      </p>
    </main>
  )
}