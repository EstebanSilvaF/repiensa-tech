import './AppFooter.css'

interface AppFooterProps {
  variant?: 'light' | 'dark'
}

export default function AppFooter({ variant = 'light' }: AppFooterProps) {
  return (
    <footer className={`app-footer app-footer--${variant}`}>
      <span>© 2026 Re-Pensa Tech</span>
      <span>Economía circular universitaria</span>
    </footer>
  )
}
