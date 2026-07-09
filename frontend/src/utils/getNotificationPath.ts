import { paths } from '../routes/paths'
import type { Notification } from '../types/api'

export function getNotificationPath(notification: Notification): string | null {
  const { reference_type, reference_id } = notification

  if (!reference_type || !reference_id) {
    return null
  }

  switch (reference_type) {
    case 'product':
      return paths.productDetail(reference_id)
    case 'chat':
      return paths.chatWithId(reference_id)
    case 'reservation':
    case 'transaction':
      return paths.history
    default:
      return null
  }
}
