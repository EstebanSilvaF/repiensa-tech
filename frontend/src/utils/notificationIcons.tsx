import type { ComponentType } from 'react'
import BellIcon from '../components/icons/BellIcon'
import ChatIcon from '../components/icons/ChatIcon'
import CheckCircleIcon from '../components/icons/CheckCircleIcon'
import HeartIcon from '../components/icons/HeartIcon'
import PackageIcon from '../components/icons/PackageIcon'
import type { NotificationType } from '../types/api'

const iconByType: Record<NotificationType, ComponentType<{ className?: string }>> = {
  reservation_confirmed: PackageIcon,
  reservation_expiring: PackageIcon,
  reservation_expired: PackageIcon,
  product_approved: CheckCircleIcon,
  new_message: ChatIcon,
  new_interested: HeartIcon,
  sale_completed: CheckCircleIcon,
  purchase_completed: CheckCircleIcon,
  admin_published: CheckCircleIcon,
}

export function getNotificationIcon(type: NotificationType) {
  return iconByType[type] ?? BellIcon
}
