import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { universityService } from '../api/universityService'
import CheckCircleIcon from '../components/icons/CheckCircleIcon'
import { useAuth } from '../hooks/useAuth'
import type { University } from '../types/api'
import { paths } from '../routes/paths'
import './Register.css'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [universities, setUniversities] = useState<University[]>([])
  const [universitiesError, setUniversitiesError] = useState<string | null>(null)
  const [isLoadingUniversities, setIsLoadingUniversities] = useState(true)
  const [universityId, setUniversityId] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedUniversity = universities.find((u) => u.id === universityId)

  useEffect(() => {
    let cancelled = false

    async function loadUniversities() {
      setIsLoadingUniversities(true)
      setUniversitiesError(null)

      try {
        const data = await universityService.getAll()
        if (cancelled) return

        const active = data.filter((u) => u.subscription_status === 'active')
        setUniversities(active)
      } catch (err) {
        if (cancelled) return
        setUniversitiesError(
          err instanceof Error
            ? err.message
            : 'No se pudieron cargar las universidades',
        )
      } finally {
        if (!cancelled) setIsLoadingUniversities(false)
      }
    }

    loadUniversities()
    return () => {
      cancelled = true
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!universityId) {
      setError('Selecciona tu universidad')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (!termsAccepted) {
      setError('Debes aceptar los Términos y Condiciones')
      return
    }

    setIsSubmitting(true)

    try {
      await register({
        university_id: universityId,
        full_name: fullName,
        email,
        password,
      })
      navigate(paths.login)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="register-page">
      <aside className="register-brand" aria-label="Re-Pensa Tech">
        <div className="register-brand__curve" aria-hidden="true" />
        <Link to={paths.home} className="register-brand__logo">
          Re-Pensa Tech
        </Link>
        <p className="register-brand__headline">
          Únete a la
          <br />
          comunidad de
          <br />
          Re-Pensa Tech
          <br />
          y dale una
          <br />
          segunda vida al
          <br />
          hardware de
          <br />
          tu{' '}
          <span className="register-brand__headline-accent">semestre</span>
        </p>
      </aside>

      <main className="register-form-panel">
        <div className="register-form-wrapper">
          <Link to={paths.home} className="register-page__back">
            ← Volver
          </Link>

          <h1 className="register-form__title">Crea tu cuenta</h1>

          <form className="register-form" onSubmit={handleSubmit}>
            <div className="register-form__field">
              <label htmlFor="university" className="register-form__label">
                Universidad
              </label>
              <select
                id="university"
                className="register-form__input register-form__select"
                value={universityId}
                onChange={(e) => setUniversityId(e.target.value)}
                required
                disabled={isLoadingUniversities || universities.length === 0}
              >
                <option value="">
                  {isLoadingUniversities
                    ? 'Cargando universidades...'
                    : 'Selecciona tu universidad'}
                </option>
                {universities.map((university) => (
                  <option key={university.id} value={university.id}>
                    {university.name}
                  </option>
                ))}
              </select>
              {universitiesError && (
                <p className="register-form__hint register-form__hint--error">
                  {universitiesError}
                </p>
              )}
            </div>

            <div className="register-form__field">
              <label htmlFor="name" className="register-form__label">
                Nombre completo
              </label>
              <input
                id="name"
                className="register-form__input"
                type="text"
                placeholder="Tu nombre completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>

            <div className="register-form__field">
              <label htmlFor="email" className="register-form__label">
                Correo institucional
              </label>
              <input
                id="email"
                className="register-form__input"
                type="email"
                placeholder={
                  selectedUniversity
                    ? `usuario@${selectedUniversity.email_domain}`
                    : 'user@universidad.edu.co'
                }
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              {selectedUniversity && (
                <p className="register-form__hint">
                  Debe terminar en @{selectedUniversity.email_domain}
                </p>
              )}
            </div>

            <div className="register-form__field">
              <label htmlFor="password" className="register-form__label">
                Contraseña
              </label>
              <input
                id="password"
                className="register-form__input"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            <div className="register-form__field">
              <label htmlFor="confirmPassword" className="register-form__label">
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                className="register-form__input"
                type="password"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            <label className="register-form__terms">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              <span>
                Acepto los{' '}
                <a href="#" className="register-form__terms-link">
                  Términos y Condiciones
                </a>{' '}
                y la{' '}
                <a href="#" className="register-form__terms-link">
                  Política de Privacidad
                </a>{' '}
                de Re-Pensa Tech
              </span>
            </label>

            {error && (
              <p className="register-form__error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="register-form__submit"
              disabled={
                isSubmitting || isLoadingUniversities || universities.length === 0
              }
            >
              {isSubmitting ? 'Registrando...' : 'Registrarse'}
              {!isSubmitting && <CheckCircleIcon />}
            </button>
          </form>

          <p className="register-form__footer">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="register-form__footer-link">
              Inicia sesión
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
