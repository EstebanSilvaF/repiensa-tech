import type { MessageResponse, NotificationsResponse } from '../types/api'
import { apiClient } from './client'

export const notificationService = {
  getNotifications: () =>
    apiClient.get<NotificationsResponse>('/notifications'),

  markAllRead: () =>
    apiClient.patch<MessageResponse>('/notifications/read-all'),

  markOneRead: (id: string) =>
    apiClient.patch<MessageResponse>(`/notifications/${id}/read`),
}
