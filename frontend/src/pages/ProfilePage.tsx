import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import AppNavbar from '../components/layout/AppNavbar'
import { authService } from '../api/authService'
import { useAuth } from '../hooks/useAuth'
import { paths } from '../routes/paths'
import './ProfilePage.css'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!user) {
    return (
      <div className="profile-page">
        <AppNavbar />
        <main className="profile-page__main">
          <p className="profile-page__error">Debes iniciar sesión para ver tu perfil.</p>
          <Link to={paths.login} className="profile-page__login-link">
            Ir a Iniciar sesión
          </Link>
        </main>
      </div>
    )
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setStatus(null)

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Completa todos los campos de contraseña.')
      return
    }

    if (newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await authService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      })
      setStatus(response.message ?? 'Contraseña actualizada con éxito.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cambiar la contraseña.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="profile-page">
      <AppNavbar />

      <main className="profile-page__main">
        <header className="profile-page__header">
          <div>
            <p className="profile-page__welcome">Bienvenido estudiante</p>
            <h1 className="profile-page__name">{user.full_name}</h1>
            <p className="profile-page__email">{user.email}</p>
          </div>
        </header>

        <section className="profile-page__actions" aria-label="Acciones de perfil">
          <Link to={paths.favorites} className="profile-page__button">
            Productos favoritos
          </Link>
          <Link to={paths.history} className="profile-page__button profile-page__button--secondary">
            Historial
          </Link>
          <button
            type="button"
            className="profile-page__button profile-page__button--logout"
            onClick={logout}
          >
            Cerrar sesión
          </button>
        </section>

        <section className="profile-page__settings">
          <div className="profile-page__settings-header">
            <h2>Configuración de perfil</h2>
            <p>Cambia tu contraseña de acceso de manera segura.</p>
          </div>

          <form className="profile-page__form" onSubmit={handlePasswordSubmit}>
            <div className="profile-page__field">
              <label htmlFor="currentPassword">Contraseña actual</label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder="Ingresa tu contraseña actual"
                autoComplete="current-password"
                required
              />
            </div>

            <div className="profile-page__field">
              <label htmlFor="newPassword">Nueva contraseña</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Nueva contraseña"
                autoComplete="new-password"
                required
                minLength={8}
              />
            </div>

            <div className="profile-page__field">
              <label htmlFor="confirmPassword">Confirmar nueva contraseña</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repite la nueva contraseña"
                autoComplete="new-password"
                required
                minLength={8}
              />
            </div>

            {error && <p className="profile-page__error">{error}</p>}
            {status && <p className="profile-page__status">{status}</p>}

            <button type="submit" className="profile-page__submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Cambiar contraseña'}
            </button>
          </form>
        </section>
      </main>
    </div>
  )
}
