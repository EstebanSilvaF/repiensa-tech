import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { chatService } from '../api/chatService'
import { ApiError } from '../api/client'
import { useAuth } from './useAuth'
import { useChatSocket } from './useChatSocket'
import { paths } from '../routes/paths'
import type { AppointmentFormState } from '../pages/ChatPage.parts'
import type { Chat, ChatUpdatedPayload, Message } from '../types/api'
import {
  mergePersonChatMessages,
  sortMessageViews,
  updateChatsWithMessage,
} from '../utils/chatPageHelpers'
import {
  buildConversationSummaries,
  filterConversationSummaries,
  getChatsForCounterparty,
  getCounterpartyId,
  groupMessagesByDate,
  mapMessageToView,
  sortChatsByActivity,
  type ChatMessageView,
} from '../utils/mapChat'

const EMPTY_APPOINTMENT: AppointmentFormState = { day: '', time: '', location: '' }

function formatAppointmentDay(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00`)
  return new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date)
}

function formatAppointmentTime(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return new Intl.DateTimeFormat('es-CO', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

export function getTodayIsoDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function isMessageInConversation(
  message: Message,
  chats: Chat[],
  counterpartyId: string,
  userId: string,
): boolean {
  const personChatIds = getChatsForCounterparty(chats, counterpartyId, userId).map(
    (chat) => chat.id,
  )
  return personChatIds.includes(message.chat_id)
}

function getApiErrorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message : fallback
}

export function useChatPage() {
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [chats, setChats] = useState<Chat[]>([])
  const [messages, setMessages] = useState<ChatMessageView[]>([])
  const [activeCounterpartyId, setActiveCounterpartyId] = useState('')
  const [activeProductChatId, setActiveProductChatId] = useState('')
  const [search, setSearch] = useState('')
  const [draft, setDraft] = useState('')
  const [showAppointmentForm, setShowAppointmentForm] = useState(false)
  const [appointment, setAppointment] = useState(EMPTY_APPOINTMENT)
  const [isLoadingChats, setIsLoadingChats] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [respondingMessageId, setRespondingMessageId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const chatIdFromUrl = searchParams.get('chatId')

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate(paths.login)
    }
  }, [isAuthenticated, isAuthLoading, navigate])

  useEffect(() => {
    if (!isAuthenticated || !user) return

    let cancelled = false

    async function loadChats() {
      setIsLoadingChats(true)
      setError(null)

      try {
        const data = await chatService.getChats()
        if (cancelled) return

        const sorted = sortChatsByActivity(data)
        setChats(sorted)

        const preferredChat = chatIdFromUrl
          ? sorted.find((chat) => chat.id === chatIdFromUrl)
          : sorted[0]

        if (!preferredChat) {
          setActiveCounterpartyId('')
          setActiveProductChatId('')
          return
        }

        setActiveCounterpartyId(getCounterpartyId(preferredChat, user!.id))
        setActiveProductChatId(preferredChat.id)
      } catch (err) {
        if (cancelled) return
        setError(getApiErrorMessage(err, 'No se pudieron cargar las conversaciones'))
        setChats([])
      } finally {
        if (!cancelled) setIsLoadingChats(false)
      }
    }

    void loadChats()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, user, chatIdFromUrl])

  const activeConversation = useMemo(() => {
    if (!user || !activeCounterpartyId) return null
    return (
      buildConversationSummaries(chats, user.id).find(
        (summary) => summary.counterpartyId === activeCounterpartyId,
      ) ?? null
    )
  }, [chats, user, activeCounterpartyId])

  const activeProductChat = useMemo(
    () => chats.find((chat) => chat.id === activeProductChatId) ?? null,
    [chats, activeProductChatId],
  )

  const activeChatIds = activeConversation?.chatIds ?? []

  useEffect(() => {
    if (!activeCounterpartyId || !user) {
      setMessages([])
      return
    }

    let cancelled = false

    async function loadMessages() {
      setIsLoadingMessages(true)
      setError(null)

      try {
        const personChats = getChatsForCounterparty(
          chats,
          activeCounterpartyId,
          user!.id,
        )
        const results = await Promise.all(
          personChats.map((chat) => chatService.getMessages(chat.id)),
        )

        if (cancelled) return

        setMessages(mergePersonChatMessages(personChats, results, user!.id))
      } catch (err) {
        if (cancelled) return
        setMessages([])
        setError(getApiErrorMessage(err, 'No se pudieron cargar los mensajes'))
      } finally {
        if (!cancelled) setIsLoadingMessages(false)
      }
    }

    void loadMessages()
    return () => {
      cancelled = true
    }
  }, [activeCounterpartyId, chats, user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeCounterpartyId, messages.length])

  const appendMessage = useCallback(
    (sent: Message, productName: string) => {
      if (!user) return

      const view = mapMessageToView(sent, user.id, productName)
      setMessages((prev) => {
        if (prev.some((message) => message.id === view.id)) return prev
        return sortMessageViews([...prev, view])
      })
      setChats((prev) => updateChatsWithMessage(prev, sent))
    },
    [user],
  )

  const applyMessageUpdate = useCallback(
    (message: Message) => {
      if (!user || !activeCounterpartyId) return
      if (!isMessageInConversation(message, chats, activeCounterpartyId, user.id)) {
        return
      }

      const chat = chats.find((item) => item.id === message.chat_id)
      const view = mapMessageToView(
        message,
        user.id,
        chat?.product_name ?? 'Producto',
      )

      setMessages((prev) => prev.map((item) => (item.id === view.id ? view : item)))
      setChats((prev) => updateChatsWithMessage(prev, message))
    },
    [activeCounterpartyId, chats, user],
  )

  const handleSocketMessage = useCallback(
    (message: Message) => {
      if (!user || !activeCounterpartyId) return
      if (!isMessageInConversation(message, chats, activeCounterpartyId, user.id)) {
        return
      }

      const chat = chats.find((item) => item.id === message.chat_id)
      setChats((prev) => updateChatsWithMessage(prev, message))
      setMessages((prev) => {
        if (prev.some((item) => item.id === message.id)) return prev
        return sortMessageViews([
          ...prev,
          mapMessageToView(message, user.id, chat?.product_name ?? 'Producto'),
        ])
      })
    },
    [activeCounterpartyId, chats, user],
  )

  const handleChatUpdated = useCallback((payload: ChatUpdatedPayload) => {
    setChats((prev) =>
      sortChatsByActivity(
        prev.map((chat) =>
          chat.id === payload.id
            ? {
                ...chat,
                status: payload.status,
                last_message: payload.last_message ?? chat.last_message,
                last_message_at: payload.last_message_at ?? chat.last_message_at,
              }
            : chat,
        ),
      ),
    )
  }, [])

  const handleDeliveryConfirmed = useCallback((payload: { chatId: string }) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === payload.chatId ? { ...chat, status: 'delivery_confirmed' } : chat,
      ),
    )
  }, [])

  useChatSocket({
    enabled: isAuthenticated && Boolean(user),
    activeChatIds,
    onMessage: handleSocketMessage,
    onMessageUpdated: applyMessageUpdate,
    onChatUpdated: handleChatUpdated,
    onDeliveryConfirmed: handleDeliveryConfirmed,
  })

  const conversations = useMemo(() => {
    if (!user) return []
    return buildConversationSummaries(chats, user.id)
  }, [chats, user])

  const filteredConversations = useMemo(
    () => filterConversationSummaries(conversations, search),
    [conversations, search],
  )

  const messageGroups = useMemo(() => groupMessagesByDate(messages), [messages])
  const isProductChatClosed = activeProductChat?.status === 'delivery_confirmed'

  const selectConversation = useCallback(
    (counterpartyId: string, productChatId?: string) => {
      if (!user) return

      const personChats = getChatsForCounterparty(chats, counterpartyId, user.id)
      const targetChatId = productChatId ?? personChats[0]?.id ?? ''

      setActiveCounterpartyId(counterpartyId)
      setActiveProductChatId(targetChatId)
      setDraft('')
      setShowAppointmentForm(false)
      setAppointment(EMPTY_APPOINTMENT)
      setSearchParams(targetChatId ? { chatId: targetChatId } : {}, { replace: true })
    },
    [chats, setSearchParams, user],
  )

  const handleSend = useCallback(async () => {
    const content = draft.trim()
    if (!content || !activeProductChat || !user || isProductChatClosed || isSending) {
      return
    }

    setIsSending(true)
    setError(null)

    try {
      const sent = await chatService.sendMessage(activeProductChat.id, content)
      appendMessage(sent, activeProductChat.product_name ?? 'Producto')
      setDraft('')
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo enviar el mensaje'))
    } finally {
      setIsSending(false)
    }
  }, [
    activeProductChat,
    appendMessage,
    draft,
    isProductChatClosed,
    isSending,
    user,
  ])

  const handleSendAppointment = useCallback(async () => {
    if (!activeProductChat || !user || isProductChatClosed || isSending) return

    const { day, time, location } = appointment
    if (!day.trim() || !time.trim() || !location.trim()) {
      setError('Completa fecha, hora y lugar del encuentro')
      return
    }

    setIsSending(true)
    setError(null)

    try {
      const sent = await chatService.sendAppointment(activeProductChat.id, {
        day: formatAppointmentDay(day.trim()),
        time: formatAppointmentTime(time.trim()),
        location: location.trim(),
      })
      appendMessage(sent, activeProductChat.product_name ?? 'Producto')
      setAppointment(EMPTY_APPOINTMENT)
      setShowAppointmentForm(false)
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo proponer el encuentro'))
    } finally {
      setIsSending(false)
    }
  }, [activeProductChat, appointment, appendMessage, isProductChatClosed, isSending, user])

  const handleRespondToAppointment = useCallback(
    async (message: ChatMessageView, action: 'accept' | 'reject') => {
      if (!user || isProductChatClosed || respondingMessageId) return

      setRespondingMessageId(message.id)
      setError(null)

      try {
        const updated = await chatService.respondToAppointment(
          message.chatId,
          message.id,
          action,
        )
        applyMessageUpdate(updated)
      } catch (err) {
        setError(getApiErrorMessage(err, 'No se pudo responder a la propuesta'))
      } finally {
        setRespondingMessageId(null)
      }
    },
    [applyMessageUpdate, isProductChatClosed, respondingMessageId, user],
  )

  const handleConfirmDelivery = useCallback(async () => {
    if (!activeProductChat || isConfirming || isProductChatClosed) return

    const confirmed = window.confirm(
      `¿Confirmar entrega de "${activeProductChat.product_name}"? Esto cerrará la negociación de ese producto y registrará la venta.`,
    )
    if (!confirmed) return

    setIsConfirming(true)
    setError(null)

    try {
      await chatService.confirmDelivery(activeProductChat.id)
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeProductChat.id
            ? { ...chat, status: 'delivery_confirmed' }
            : chat,
        ),
      )
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo confirmar la entrega'))
    } finally {
      setIsConfirming(false)
    }
  }, [activeProductChat, isConfirming, isProductChatClosed])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        void handleSend()
      }
    },
    [handleSend],
  )

  const cancelAppointment = useCallback(() => {
    setShowAppointmentForm(false)
    setAppointment(EMPTY_APPOINTMENT)
  }, [])

  const toggleAppointmentForm = useCallback(() => {
    setShowAppointmentForm((value) => !value)
  }, [])

  return {
    isAuthLoading,
    isAuthenticated,
    user,
    search,
    setSearch,
    isLoadingChats,
    filteredConversations,
    activeCounterpartyId,
    selectConversation,
    activeConversation,
    activeProductChat,
    activeProductChatId,
    setActiveProductChatId,
    setSearchParams,
    isLoadingMessages,
    isProductChatClosed,
    isConfirming,
    isSending,
    showAppointmentForm,
    appointment,
    setAppointment,
    draft,
    setDraft,
    error,
    messageGroups,
    respondingMessageId,
    messagesEndRef,
    minAppointmentDate: getTodayIsoDate(),
    handleConfirmDelivery,
    handleRespondToAppointment,
    handleSendAppointment,
    cancelAppointment,
    handleKeyDown,
    handleSend,
    toggleAppointmentForm,
  }
}
