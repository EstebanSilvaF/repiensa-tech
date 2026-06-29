import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CheckCircleIcon from '../components/icons/CheckCircleIcon'
import { useAuth } from '../hooks/useAuth'
import { paths } from '../routes/paths'
import './LoginPage.css'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    navigate(paths.login, { replace: true })
  }, [navigate])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await login({ email, password })
      navigate(paths.gallery)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <aside className="login-brand" aria-label="Re-Pensa Tech">
        <div className="login-brand__curve" aria-hidden="true" />
        <Link to={paths.home} className="login-brand__logo">
          Re-Pensa Tech
        </Link>
        <p className="login-brand__headline">
          Dale una segunda vida al hardware de tu{' '}
          <span className="login-brand__headline-accent">semestre</span>
        </p>
      </aside>

      <main className="login-form-panel">
        <div className="login-form-wrapper">
          <Link to={paths.home} className="login-page__back">
            ← Volver
          </Link>

          <h1 className="login-form__title">Bienvenido</h1>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-form__field">
              <label htmlFor="email" className="login-form__label">
                Correo institucional
              </label>
              <input
                id="email"
                className="login-form__input"
                type="email"
                placeholder="user@universidad.edu.co"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="login-form__field">
              <label htmlFor="password" className="login-form__label">
                Contraseña
              </label>
              <input
                id="password"
                className="login-form__input"
                type="password"
                placeholder="************"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <a href="#" className="login-form__forgot">
              ¿Olvidaste tu contraseña?
            </a>

            {error && (
              <p className="login-form__error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="login-form__submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
              {!isSubmitting && <CheckCircleIcon />}
            </button>
          </form>

          <p className="login-form__footer">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="login-form__footer-link">
              Regístrate
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
