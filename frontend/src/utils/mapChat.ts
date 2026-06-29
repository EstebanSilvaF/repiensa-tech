import type { Chat, Message } from '../types/api'

const AVATAR_COLORS = [
  '#1a9c6e',
  '#3b82f6',
  '#f97316',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
]

export interface ChatListItem {
  id: string
  contactName: string
  contactSubtitle: string
  productName: string
  lastMessage: string
  lastMessageAt: string
  avatarColor: string
  status: Chat['status']
  activityAt: string
}

export interface ChatSidebarGroup {
  counterpartyId: string
  contactName: string
  avatarColor: string
  chats: ChatListItem[]
}

export interface ChatMessageView {
  id: string
  chatId: string
  type: 'text' | 'appointment'
  content: string
  productName: string
  isOutgoing: boolean
  appointmentStatus: 'pending' | 'accepted' | 'rejected' | null
  canRespondToAppointment: boolean
  sentAt: string
  createdAt: string
  dateKey: string
}

export interface ConversationSummary {
  counterpartyId: string
  contactName: string
  contactSubtitle: string
  avatarColor: string
  lastMessage: string
  lastMessageAt: string
  activityAt: string
  chatIds: string[]
  products: { chatId: string; productName: string; status: Chat['status'] }[]
}

function toDate(iso: string): Date {
  return new Date(iso)
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function dateKeyFromIso(iso: string): string {
  const d = toDate(iso)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

export function getCounterpartyName(chat: Chat, userId: string): string {
  if (userId === chat.buyer_id) {
    return chat.seller_name ?? 'Vendedor'
  }
  return chat.buyer_name ?? 'Comprador'
}

export function getContactSubtitle(chat: Chat, userId: string): string {
  if (userId === chat.buyer_id) {
    return chat.seller_university_name ?? 'Vendedor'
  }
  return chat.buyer_university_name ?? 'Comprador'
}

export function getCounterpartyId(chat: Chat, userId: string): string {
  return userId === chat.buyer_id ? chat.seller_id : chat.buyer_id
}

export function getChatActivityIso(chat: Chat): string {
  return chat.last_message_at ?? chat.updated_at ?? chat.created_at
}

export function sortChatsByActivity(chats: Chat[]): Chat[] {
  return [...chats].sort(
    (a, b) =>
      new Date(getChatActivityIso(b)).getTime() -
      new Date(getChatActivityIso(a)).getTime(),
  )
}

export function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export function formatChatTime(iso: string | null | undefined): string {
  if (!iso) return ''

  const date = toDate(iso)
  const now = new Date()
  const diffDays = Math.floor(
    (startOfDay(now).getTime() - startOfDay(date).getTime()) / (1000 * 60 * 60 * 24),
  )

  if (diffDays === 0) {
    return date.toLocaleTimeString('es-CO', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  if (diffDays === 1) return 'Ayer'

  if (diffDays < 7) {
    return date
      .toLocaleDateString('es-CO', { weekday: 'short' })
      .replace('.', '')
  }

  return date
    .toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
    .replace('.', '')
}

export function formatMessageTime(iso: string): string {
  return toDate(iso).toLocaleTimeString('es-CO', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function formatDateSeparator(iso: string): string {
  const date = toDate(iso)
  const now = new Date()
  const diffDays = Math.floor(
    (startOfDay(now).getTime() - startOfDay(date).getTime()) / (1000 * 60 * 60 * 24),
  )

  if (diffDays === 0) return 'HOY'
  if (diffDays === 1) return 'AYER'

  return date
    .toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    })
    .replace(/\bde\b/g, '')
    .trim()
}

export function mapMessageToView(
  message: Message,
  userId: string,
  productName = '',
): ChatMessageView {
  const isOutgoing = message.sender_id === userId
  const appointmentStatus =
    message.type === 'appointment'
      ? (message.appointment_status ?? 'accepted')
      : null

  return {
    id: message.id,
    chatId: message.chat_id,
    type: message.type ?? 'text',
    content: message.content,
    productName,
    isOutgoing,
    appointmentStatus,
    canRespondToAppointment:
      message.type === 'appointment' &&
      appointmentStatus === 'pending' &&
      !isOutgoing,
    sentAt: formatMessageTime(message.created_at),
    createdAt: message.created_at,
    dateKey: dateKeyFromIso(message.created_at),
  }
}

export function getChatsForCounterparty(
  chats: Chat[],
  counterpartyId: string,
  userId: string,
): Chat[] {
  return sortChatsByActivity(
    chats.filter((c) => getCounterpartyId(c, userId) === counterpartyId),
  )
}

export function buildConversationSummaries(
  chats: Chat[],
  userId: string,
): ConversationSummary[] {
  const groups = buildSidebarGroups(chats, userId)

  return groups.map((group) => {
    const personChats = getChatsForCounterparty(chats, group.counterpartyId, userId)
    const latest = personChats[0]

    return {
      counterpartyId: group.counterpartyId,
      contactName: group.contactName,
      contactSubtitle: latest ? getContactSubtitle(latest, userId) : 'Usuario',
      avatarColor: group.avatarColor,
      lastMessage: latest?.last_message ?? 'Sin mensajes aún',
      lastMessageAt: latest ? formatChatTime(getChatActivityIso(latest)) : '',
      activityAt: latest ? getChatActivityIso(latest) : '',
      chatIds: personChats.map((c) => c.id),
      products: personChats.map((c) => ({
        chatId: c.id,
        productName: c.product_name ?? 'Producto',
        status: c.status,
      })),
    }
  })
}

export function filterConversationSummaries(
  summaries: ConversationSummary[],
  query: string,
): ConversationSummary[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return summaries

  return summaries.filter(
    (s) =>
      s.contactName.toLowerCase().includes(normalized) ||
      s.lastMessage.toLowerCase().includes(normalized) ||
      s.products.some((p) => p.productName.toLowerCase().includes(normalized)),
  )
}

export function mapChatToListItem(chat: Chat, userId: string): ChatListItem {
  const contactName = getCounterpartyName(chat, userId)
  const activityAt = getChatActivityIso(chat)

  return {
    id: chat.id,
    contactName,
    contactSubtitle: getContactSubtitle(chat, userId),
    productName: chat.product_name ?? 'Producto',
    lastMessage: chat.last_message ?? 'Sin mensajes aún',
    lastMessageAt: formatChatTime(activityAt),
    avatarColor: getAvatarColor(contactName),
    status: chat.status,
    activityAt,
  }
}

export function buildSidebarGroups(
  chats: Chat[],
  userId: string,
): ChatSidebarGroup[] {
  const sorted = sortChatsByActivity(chats)
  const groupMap = new Map<string, ChatSidebarGroup>()

  for (const chat of sorted) {
    const item = mapChatToListItem(chat, userId)
    const counterpartyId = getCounterpartyId(chat, userId)
    const existing = groupMap.get(counterpartyId)

    if (existing) {
      existing.chats.push(item)
    } else {
      groupMap.set(counterpartyId, {
        counterpartyId,
        contactName: item.contactName,
        avatarColor: item.avatarColor,
        chats: [item],
      })
    }
  }

  return [...groupMap.values()].sort(
    (a, b) =>
      new Date(b.chats[0]!.activityAt).getTime() -
      new Date(a.chats[0]!.activityAt).getTime(),
  )
}

export function filterSidebarGroups(
  groups: ChatSidebarGroup[],
  query: string,
): ChatSidebarGroup[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return groups

  return groups
    .map((group) => ({
      ...group,
      chats: group.chats.filter(
        (chat) =>
          group.contactName.toLowerCase().includes(normalized) ||
          chat.productName.toLowerCase().includes(normalized) ||
          chat.lastMessage.toLowerCase().includes(normalized),
      ),
    }))
    .filter((group) => group.chats.length > 0)
}

export function groupMessagesByDate(
  messages: ChatMessageView[],
): { dateLabel: string; items: ChatMessageView[] }[] {
  const groups: { dateLabel: string; items: ChatMessageView[] }[] = []

  for (const message of messages) {
    const lastGroup = groups[groups.length - 1]
    if (lastGroup && lastGroup.items[0]?.dateKey === message.dateKey) {
      lastGroup.items.push(message)
    } else {
      groups.push({
        dateLabel: formatDateSeparator(message.createdAt),
        items: [message],
      })
    }
  }

  return groups
}
