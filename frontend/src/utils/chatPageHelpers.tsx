import type { ReactNode } from 'react'
import type { Chat, Message } from '../types/api'
import {
  mapMessageToView,
  sortChatsByActivity,
  type ChatMessageView,
} from './mapChat'

export const URL_IN_TEXT = /(https?:\/\/\S+)/

export function renderMessageContent(content: string): ReactNode {
  const linkMatch = URL_IN_TEXT.exec(content)
  if (!linkMatch) return content

  const url = linkMatch[0]
  const [before, after] = content.split(url)

  return (
    <>
      {before}
      <a
        href={url}
        className="chat-panel__bubble-link"
        target="_blank"
        rel="noreferrer"
      >
        {url}
      </a>
      {after}
    </>
  )
}

export function mergePersonChatMessages(
  personChats: Chat[],
  results: Message[][],
  userId: string,
): ChatMessageView[] {
  return personChats
    .flatMap((chat, index) =>
      results[index].map((message) =>
        mapMessageToView(message, userId, chat.product_name ?? 'Producto'),
      ),
    )
    .sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
}

export function sortMessageViews(messages: ChatMessageView[]): ChatMessageView[] {
  return [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )
}

export function updateChatsWithMessage(chats: Chat[], message: Message): Chat[] {
  return sortChatsByActivity(
    chats.map((chat) =>
      chat.id === message.chat_id
        ? {
            ...chat,
            last_message: message.content,
            last_message_at: message.created_at,
            updated_at: message.created_at,
          }
        : chat,
    ),
  )
}

export function getConversationEmptyMessage(search: string): string {
  if (search.trim()) {
    return 'No hay conversaciones con ese criterio.'
  }
  return 'Aún no tienes conversaciones.'
}

export function getComposerPlaceholder(
  isProductChatClosed: boolean,
  hasMultipleProducts: boolean,
  productName: string,
): string {
  if (isProductChatClosed) return 'Selecciona un producto activo'
  if (hasMultipleProducts) return `Mensaje sobre ${productName}...`
  return 'Escribe un mensaje...'
}

export function getAppointmentBubbleModifier(message: ChatMessageView): string {
  if (message.appointmentStatus === 'pending') {
    return message.isOutgoing
      ? ' chat-panel__bubble--appointment-pending-out'
      : ' chat-panel__bubble--appointment-pending'
  }

  if (message.appointmentStatus === 'rejected') {
    return ' chat-panel__bubble--appointment-rejected'
  }

  return ''
}
