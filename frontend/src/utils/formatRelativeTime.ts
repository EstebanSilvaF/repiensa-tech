export function formatRelativeTime(isoDate: string): string {
  const now = Date.now()
  const date = new Date(isoDate).getTime()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) return 'Hoy'
  if (diffDays === 1) return 'Hace 1 día'
  return `Hace ${diffDays} días`
}
