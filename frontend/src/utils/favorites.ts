const FAVORITES_KEY = 'repensa_favorites'

export function getLikedProductIds(): string[] {
  const raw = localStorage.getItem(FAVORITES_KEY)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []
  } catch {
    return []
  }
}

export function isProductLiked(productId: string): boolean {
  return getLikedProductIds().includes(productId)
}

export function toggleProductLike(productId: string): string[] {
  const current = getLikedProductIds()
  const next = current.includes(productId)
    ? current.filter((id) => id !== productId)
    : [...current, productId]

  localStorage.setItem(FAVORITES_KEY, JSON.stringify(next))
  return next
}
