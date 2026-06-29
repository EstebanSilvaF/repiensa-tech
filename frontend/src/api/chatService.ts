import type {
  AppointmentPayload,
  Chat,
  ConfirmDeliveryResponse,
  Message,
  OpenChatRequest,
} from '../types/api'
import { apiClient } from './client'

export const chatService = {
  getChats: () => apiClient.get<Chat[]>('/chats'),

  getChat: (id: string) => apiClient.get<Chat>(`/chats/${id}`),

  openChat: (body: OpenChatRequest) =>
    apiClient.post<Chat>('/chats', { body }),

  getMessages: (chatId: string) =>
    apiClient.get<Message[]>(`/chats/${chatId}/messages`),

  sendMessage: (chatId: string, content: string) =>
    apiClient.post<Message>(`/chats/${chatId}/messages`, {
      body: { content, type: 'text' },
    }),

  sendAppointment: (chatId: string, appointment: AppointmentPayload) =>
    apiClient.post<Message>(`/chats/${chatId}/messages`, {
      body: { type: 'appointment', appointment },
    }),

  respondToAppointment: (
    chatId: string,
    messageId: string,
    action: 'accept' | 'reject',
  ) =>
    apiClient.patch<Message>(`/chats/${chatId}/messages/${messageId}/appointment`, {
      body: { action },
    }),

  confirmDelivery: (chatId: string) =>
    apiClient.patch<ConfirmDeliveryResponse>(`/chats/${chatId}/confirm-delivery`),
}
