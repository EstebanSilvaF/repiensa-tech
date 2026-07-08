import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { paths } from '../../routes/paths'
import ChatIcon from '../icons/ChatIcon'
import UserIcon from '../icons/UserIcon'
import logoMark from '../../assets/logo-mark.svg'
import './AppNavbar.css'

const navLinks = [
  { label: 'Inicio', to: paths.gallery },
  { label: 'Publicar producto', to: paths.publish },
  { label: 'Historial', to: paths.history },
]

function getVisibleNavLinks(userRole?: string) {
  if (userRole === 'library') {
    return [
      { label: 'Inicio', to: paths.gallery },
      { label: 'Biblioteca', to: paths.library },
      { label: 'Entregados', to: paths.libraryDelivered },
    ]
  }

  return navLinks
}

export default function AppNavbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, logout, user } = useAuth()
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleLogoutConfirm() {
    setShowLogoutConfirm(true)
    setIsProfileMenuOpen(false)
  }

  function handleLogout() {
    logout()
    setShowLogoutConfirm(false)
    setIsProfileMenuOpen(false)
    navigate(paths.login, { replace: true })
  }

  return (
    <header className="app-navbar">
      <Link
        to={paths.gallery}
        className="app-navbar__logo"
        aria-label="Re-Pensa Tech inicio"
      >
        <img src={logoMark} alt="Re-Pensa Tech" className="app-navbar__logo-img" />
      </Link>

      <nav className="app-navbar__nav" aria-label="Navegación principal">
        {getVisibleNavLinks(user?.role).map((link) => {
          const isActive = pathname === link.to

          return (
            <Link
              key={link.to}
              to={link.to}
              className={`app-navbar__link${isActive ? ' app-navbar__link--active' : ''}`}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="app-navbar__actions">
        <Link
          to={paths.chat}
          className={`app-navbar__icon-btn${
            pathname === paths.chat ? ' app-navbar__icon-btn--active' : ''
          }`}
          aria-label="Mensajes"
        >
          <ChatIcon />
        </Link>
        {isAuthenticated ? (
          <div className="app-navbar__profile" ref={profileMenuRef}>
            <button
              type="button"
              className={`app-navbar__icon-btn app-navbar__profile-button${
                pathname === paths.profile ? ' app-navbar__icon-btn--active' : ''
              }`}
              aria-label={user ? `Perfil de ${user.full_name}` : 'Perfil'}
              aria-expanded={isProfileMenuOpen}
              aria-haspopup="menu"
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
            >
              <UserIcon />
            </button>

            {isProfileMenuOpen && (
              <div className="app-navbar__profile-menu" role="menu">
                <Link
                  to={paths.profile}
                  className="app-navbar__profile-item"
                  role="menuitem"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  Mi perfil
                </Link>
                <Link
                  to={paths.favorites}
                  className="app-navbar__profile-item"
                  role="menuitem"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  Favoritos
                </Link>
                <Link
                  to={paths.history}
                  className="app-navbar__profile-item"
                  role="menuitem"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  Historial
                </Link>
                <button
                  type="button"
                  className="app-navbar__profile-item app-navbar__profile-item--danger"
                  role="menuitem"
                  onClick={handleLogoutConfirm}
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            to={paths.login}
            className="app-navbar__icon-btn"
            aria-label="Iniciar sesión"
          >
            <UserIcon />
          </Link>
        )}
      </div>

      {showLogoutConfirm && (
        <div className="app-navbar__confirm-overlay" role="presentation">
          <div className="app-navbar__confirm-dialog" role="dialog" aria-modal="true" aria-label="Confirmar cierre de sesión">
            <h3>¿Seguro que quieres cerrar sesión?</h3>
            <p>Perderás el acceso a tu sesión actual.</p>
            <div className="app-navbar__confirm-actions">
              <button
                type="button"
                className="app-navbar__confirm-btn app-navbar__confirm-btn--secondary"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="app-navbar__confirm-btn app-navbar__confirm-btn--primary"
                onClick={handleLogout}
              >
                Sí, cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
