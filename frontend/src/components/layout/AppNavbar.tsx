import { useEffect, useRef, useState, type ComponentType } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useNotifications } from '../../hooks/useNotifications'
import { paths } from '../../routes/paths'
import { getNotificationPath } from '../../utils/getNotificationPath'
import { formatNotificationTime } from '../../utils/formatRelativeTime'
import { getNotificationIcon } from '../../utils/notificationIcons'
import BellIcon from '../icons/BellIcon'
import ChatIcon from '../icons/ChatIcon'
import HeartIcon from '../icons/HeartIcon'
import HistoryIcon from '../icons/HistoryIcon'
import LogOutIcon from '../icons/LogOutIcon'
import UserIcon from '../icons/UserIcon'
import type { Notification } from '../../types/api'
import logoMark from '../../assets/logo-mark.svg'
import './AppNavbar.css'

type ProfileMenuIcon = ComponentType<{ className?: string }>

const profileMenuLinks: Array<{
  label: string
  to: string
  icon: ProfileMenuIcon
}> = [
  { label: 'Mi perfil', to: paths.profile, icon: UserIcon },
  { label: 'Favoritos', to: paths.favorites, icon: HeartIcon },
  { label: 'Historial', to: paths.history, icon: HistoryIcon },
]

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

type NotificationsListProps = Readonly<{
  isLoading: boolean
  notifications: Notification[]
  onNotificationClick: (notification: Notification) => void
}>

function NotificationsList({
  isLoading,
  notifications,
  onNotificationClick,
}: NotificationsListProps) {
  if (isLoading && notifications.length === 0) {
    return <p className="app-navbar__notifications-empty">Cargando...</p>
  }

  if (notifications.length === 0) {
    return (
      <p className="app-navbar__notifications-empty">No tienes notificaciones</p>
    )
  }

  return (
    <>
      {notifications.map((notification) => {
        const NotificationTypeIcon = getNotificationIcon(notification.type)
        const itemClass = notification.is_read
          ? 'app-navbar__notification-item'
          : 'app-navbar__notification-item app-navbar__notification-item--unread'

        return (
          <button
            key={notification.id}
            type="button"
            className={itemClass}
            role="menuitem"
            onClick={() => onNotificationClick(notification)}
          >
            <span className="app-navbar__notification-icon" aria-hidden="true">
              <NotificationTypeIcon className="app-navbar__notification-icon-svg" />
            </span>
            <span className="app-navbar__notification-content">
              <span className="app-navbar__notification-title">{notification.title}</span>
              {notification.description && (
                <span className="app-navbar__notification-description">
                  {notification.description}
                </span>
              )}
              <span className="app-navbar__notification-time">
                {formatNotificationTime(notification.created_at)}
              </span>
            </span>
            {!notification.is_read && (
              <span className="app-navbar__notification-dot" aria-hidden="true" />
            )}
          </button>
        )
      })}
    </>
  )
}

export default function AppNavbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, logout, user } = useAuth()
  const {
    notifications,
    unread,
    isLoading,
    refresh,
    markAllRead,
    markOneRead,
  } = useNotifications(isAuthenticated)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const notificationsMenuRef = useRef<HTMLDivElement>(null)
  const logoutDialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node

      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setIsProfileMenuOpen(false)
      }

      if (notificationsMenuRef.current && !notificationsMenuRef.current.contains(target)) {
        setIsNotificationsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const dialog = logoutDialogRef.current
    if (!dialog) return

    if (showLogoutConfirm) {
      if (!dialog.open) dialog.showModal()
      return
    }

    if (dialog.open) dialog.close()
  }, [showLogoutConfirm])

  function closeMenus() {
    setIsProfileMenuOpen(false)
    setIsNotificationsOpen(false)
  }

  function toggleNotifications() {
    setIsProfileMenuOpen(false)
    setIsNotificationsOpen((prev) => {
      const next = !prev
      if (next) {
        void refresh()
      }
      return next
    })
  }

  function toggleProfileMenu() {
    setIsNotificationsOpen(false)
    setIsProfileMenuOpen((prev) => !prev)
  }

  async function handleNotificationClick(notification: Notification) {
    if (!notification.is_read) {
      await markOneRead(notification.id)
    }

    const targetPath = getNotificationPath(notification)
    closeMenus()

    if (targetPath) {
      navigate(targetPath)
    }
  }

  async function handleMarkAllRead() {
    await markAllRead()
  }

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
        {isAuthenticated && (
          <div className="app-navbar__notifications" ref={notificationsMenuRef}>
            <button
              type="button"
              className={`app-navbar__icon-btn app-navbar__icon-btn--badge${
                isNotificationsOpen ? ' app-navbar__icon-btn--active' : ''
              }`}
              aria-label={
                unread > 0
                  ? `Notificaciones, ${unread} sin leer`
                  : 'Notificaciones'
              }
              aria-expanded={isNotificationsOpen}
              aria-haspopup="menu"
              onClick={toggleNotifications}
            >
              <BellIcon />
              {unread > 0 && (
                <span className="app-navbar__badge" aria-hidden="true">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="app-navbar__notifications-panel" role="menu">
                <div className="app-navbar__notifications-header">
                  <h3>Notificaciones</h3>
                  {unread > 0 && (
                    <button
                      type="button"
                      className="app-navbar__notifications-mark-all"
                      onClick={() => void handleMarkAllRead()}
                    >
                      Marcar todas
                    </button>
                  )}
                </div>

                <div className="app-navbar__notifications-list">
                  <NotificationsList
                    isLoading={isLoading}
                    notifications={notifications}
                    onNotificationClick={(notification) =>
                      void handleNotificationClick(notification)
                    }
                  />
                </div>
              </div>
            )}
          </div>
        )}

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
              onClick={toggleProfileMenu}
            >
              <UserIcon />
            </button>

            {isProfileMenuOpen && (
              <div className="app-navbar__profile-menu" role="menu">
                {profileMenuLinks.map((item) => {
                  const ItemIcon = item.icon

                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="app-navbar__profile-item"
                      role="menuitem"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <span className="app-navbar__profile-item-icon" aria-hidden="true">
                        <ItemIcon className="app-navbar__profile-item-svg" />
                      </span>
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
                <button
                  type="button"
                  className="app-navbar__profile-item app-navbar__profile-item--danger"
                  role="menuitem"
                  onClick={handleLogoutConfirm}
                >
                  <span className="app-navbar__profile-item-icon" aria-hidden="true">
                    <LogOutIcon className="app-navbar__profile-item-svg" />
                  </span>
                  <span>Cerrar sesión</span>
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

      <dialog
        ref={logoutDialogRef}
        className="app-navbar__confirm-dialog"
        aria-label="Confirmar cierre de sesión"
        onClose={() => setShowLogoutConfirm(false)}
      >
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
      </dialog>
    </header>
  )
}
