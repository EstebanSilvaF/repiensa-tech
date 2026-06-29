import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { paths } from '../../routes/paths'
import ChatIcon from '../icons/ChatIcon'
import CubeLogoIcon from '../icons/CubeLogoIcon'
import UserIcon from '../icons/UserIcon'
import './AppNavbar.css'

const navLinks = [
  { label: 'Inicio', to: paths.gallery },
  { label: 'Publicar producto', to: paths.publish },
  { label: 'Historial', to: paths.history },
]

export default function AppNavbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, logout, user } = useAuth()

  function handleLogout() {
    logout()
    navigate(paths.home)
  }

  return (
    <header className="app-navbar">
      <Link
        to={paths.gallery}
        className="app-navbar__logo"
        aria-label="Re-Pensa Tech inicio"
      >
        <CubeLogoIcon />
      </Link>

      <nav className="app-navbar__nav" aria-label="Navegación principal">
        {navLinks.map((link) => {
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
          <Link
            to={paths.profile}
            className={`app-navbar__icon-btn${
              pathname === paths.profile ? ' app-navbar__icon-btn--active' : ''
            }`}
            aria-label={user ? `Perfil de ${user.full_name}` : 'Perfil'}
          >
            <UserIcon />
          </Link>
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
    </header>
  )
}
