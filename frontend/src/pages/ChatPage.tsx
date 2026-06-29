import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { chatService } from '../api/chatService'
import { ApiError } from '../api/client'
import AppNavbar from '../components/layout/AppNavbar'
import ArrowRightIcon from '../components/icons/ArrowRightIcon'
import SearchIcon from '../components/icons/SearchIcon'
import { useAuth } from '../hooks/useAuth'
import { useChatSocket } from '../hooks/useChatSocket'
import { paths } from '../routes/paths'
import type { Chat, ChatUpdatedPayload, Message } from '../types/api'
import {
  buildConversationSummaries,
  filterConversationSummaries,
  getAvatarColor,
  getChatsForCounterparty,
  getContactSubtitle,
  getCounterpartyId,
  groupMessagesByDate,
  mapMessageToView,
  sortChatsByActivity,
  type ChatMessageView,
  type ConversationSummary,
} from '../utils/mapChat'
import './ChatPage.css'

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function LocationPinIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11" r="2.25" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  )
}

function renderMessageContent(content: string) {
  const linkMatch = content.match(/(https?:\/\/\S+)/)
  if (!linkMatch) return content

  const [before, after] = content.split(linkMatch[0])
  return (
    <>
      {before}
      <a
        href={linkMatch[0]}
        className="chat-panel__bubble-link"
        target="_blank"
        rel="noreferrer"
      >
        {linkMatch[0]}
      </a>
      {after}
    </>
  )
}

const EMPTY_APPOINTMENT = { day: '', time: '', location: '' }

export default function ChatPage() {
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
          ? sorted.find((c) => c.id === chatIdFromUrl)
          : sorted[0]

        if (preferredChat) {
          setActiveCounterpartyId(getCounterpartyId(preferredChat, user!.id))
          setActiveProductChatId(preferredChat.id)
        } else {
          setActiveCounterpartyId('')
          setActiveProductChatId('')
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : 'No se pudieron cargar las conversaciones',
          )
          setChats([])
        }
      } finally {
        if (!cancelled) setIsLoadingChats(false)
      }
    }

    loadChats()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, user, chatIdFromUrl])

  const activeConversation = useMemo(() => {
    if (!user || !activeCounterpartyId) return null
    return (
      buildConversationSummaries(chats, user.id).find(
        (s) => s.counterpartyId === activeCounterpartyId,
      ) ?? null
    )
  }, [chats, user, activeCounterpartyId])

  const activeProductChat = useMemo(
    () => chats.find((c) => c.id === activeProductChatId) ?? null,
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

        const merged = personChats
          .flatMap((chat, index) =>
            results[index].map((m) =>
              mapMessageToView(m, user!.id, chat.product_name ?? 'Producto'),
            ),
          )
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          )

        setMessages(merged)
      } catch (err) {
        if (!cancelled) {
          setMessages([])
          setError(
            err instanceof ApiError ? err.message : 'No se pudieron cargar los mensajes',
          )
        }
      } finally {
        if (!cancelled) setIsLoadingMessages(false)
      }
    }

    loadMessages()
    return () => {
      cancelled = true
    }
  }, [activeCounterpartyId, chats, user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeCounterpartyId, messages.length])

  const handleSocketMessage = useCallback(
    (message: Message) => {
      if (!user || !activeCounterpartyId) return

      const personChatIds = getChatsForCounterparty(
        chats,
        activeCounterpartyId,
        user.id,
      ).map((c) => c.id)

      if (!personChatIds.includes(message.chat_id)) return

      const chat = chats.find((c) => c.id === message.chat_id)

      setChats((prev) =>
        sortChatsByActivity(
          prev.map((c) =>
            c.id === message.chat_id
              ? {
                  ...c,
                  last_message: message.content,
                  last_message_at: message.created_at,
                  updated_at: message.created_at,
                }
              : c,
          ),
        ),
      )

      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev
        return [
          ...prev,
          mapMessageToView(
            message,
            user.id,
            chat?.product_name ?? 'Producto',
          ),
        ].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        )
      })
    },
    [activeCounterpartyId, chats, user],
  )

  const applyMessageUpdate = useCallback(
    (message: Message) => {
      if (!user || !activeCounterpartyId) return

      const personChatIds = getChatsForCounterparty(
        chats,
        activeCounterpartyId,
        user.id,
      ).map((c) => c.id)

      if (!personChatIds.includes(message.chat_id)) return

      const chat = chats.find((c) => c.id === message.chat_id)
      const view = mapMessageToView(
        message,
        user.id,
        chat?.product_name ?? 'Producto',
      )

      setMessages((prev) =>
        prev.map((m) => (m.id === view.id ? view : m)),
      )

      setChats((prev) =>
        sortChatsByActivity(
          prev.map((c) =>
            c.id === message.chat_id
              ? {
                  ...c,
                  last_message: message.content,
                  last_message_at: message.created_at,
                  updated_at: message.created_at,
                }
              : c,
          ),
        ),
      )
    },
    [activeCounterpartyId, chats, user],
  )

  const handleSocketMessageUpdated = useCallback(
    (message: Message) => {
      applyMessageUpdate(message)
    },
    [applyMessageUpdate],
  )

  const handleChatUpdated = useCallback((payload: ChatUpdatedPayload) => {
    setChats((prev) =>
      sortChatsByActivity(
        prev.map((c) =>
          c.id === payload.id
            ? {
                ...c,
                status: payload.status,
                last_message: payload.last_message ?? c.last_message,
                last_message_at: payload.last_message_at ?? c.last_message_at,
              }
            : c,
        ),
      ),
    )
  }, [])

  const handleDeliveryConfirmed = useCallback(
    (payload: { chatId: string }) => {
      setChats((prev) =>
        prev.map((c) =>
          c.id === payload.chatId ? { ...c, status: 'delivery_confirmed' } : c,
        ),
      )
    },
    [],
  )

  useChatSocket({
    enabled: isAuthenticated && Boolean(user),
    activeChatIds,
    onMessage: handleSocketMessage,
    onMessageUpdated: handleSocketMessageUpdated,
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

  function appendMessage(sent: Message, content: string, productName: string) {
    if (!user) return

    const view = mapMessageToView(sent, user.id, productName)
    setMessages((prev) => {
      if (prev.some((m) => m.id === view.id)) return prev
      return [...prev, view].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )
    })
    setChats((prev) =>
      sortChatsByActivity(
        prev.map((c) =>
          c.id === sent.chat_id
            ? {
                ...c,
                last_message: content,
                last_message_at: sent.created_at,
                updated_at: sent.created_at,
              }
            : c,
        ),
      ),
    )
  }

  async function handleSend() {
    const content = draft.trim()
    if (
      !content ||
      !activeProductChat ||
      !user ||
      isProductChatClosed ||
      isSending
    )
      return

    setIsSending(true)
    setError(null)

    try {
      const sent = await chatService.sendMessage(activeProductChat.id, content)
      appendMessage(
        sent,
        content,
        activeProductChat.product_name ?? 'Producto',
      )
      setDraft('')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo enviar el mensaje')
    } finally {
      setIsSending(false)
    }
  }

  async function handleSendAppointment() {
    if (!activeProductChat || !user || isProductChatClosed || isSending) return

    const { day, time, location } = appointment
    if (!day.trim() || !time.trim() || !location.trim()) {
      setError('Completa día, hora y lugar del encuentro')
      return
    }

    setIsSending(true)
    setError(null)

    try {
      const sent = await chatService.sendAppointment(activeProductChat.id, {
        day: day.trim(),
        time: time.trim(),
        location: location.trim(),
      })
      appendMessage(
        sent,
        sent.content,
        activeProductChat.product_name ?? 'Producto',
      )
      setAppointment(EMPTY_APPOINTMENT)
      setShowAppointmentForm(false)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo proponer el encuentro')
    } finally {
      setIsSending(false)
    }
  }

  async function handleRespondToAppointment(
    message: ChatMessageView,
    action: 'accept' | 'reject',
  ) {
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
      setError(
        err instanceof ApiError
          ? err.message
          : 'No se pudo responder a la propuesta',
      )
    } finally {
      setRespondingMessageId(null)
    }
  }

  async function handleConfirmDelivery() {
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
        prev.map((c) =>
          c.id === activeProductChat.id
            ? { ...c, status: 'delivery_confirmed' }
            : c,
        ),
      )
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo confirmar la entrega')
    } finally {
      setIsConfirming(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  if (isAuthLoading || !isAuthenticated) {
    return (
      <div className="chat-page">
        <AppNavbar />
        <p className="chat-page__status">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="chat-page">
      <AppNavbar />

      <main className="chat-page__main">
        <div className="chat-page__shell">
          <aside className="chat-sidebar" aria-label="Lista de conversaciones">
            <div className="chat-sidebar__header">
              <h1 className="chat-sidebar__title">Mensajes</h1>
              <div className="chat-sidebar__search">
                <SearchIcon className="chat-sidebar__search-icon" />
                <input
                  type="search"
                  className="chat-sidebar__search-input"
                  placeholder="Busca conversación"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Buscar conversación"
                />
              </div>
            </div>

            <ul className="chat-sidebar__list">
              {isLoadingChats ? (
                <li className="chat-page__status">Cargando conversaciones...</li>
              ) : filteredConversations.length === 0 ? (
                <li className="chat-page__status">
                  {search.trim()
                    ? 'No hay conversaciones con ese criterio.'
                    : 'Aún no tienes conversaciones.'}
                </li>
              ) : (
                filteredConversations.map((conversation: ConversationSummary) => {
                  const isActive =
                    conversation.counterpartyId === activeCounterpartyId

                  return (
                    <li key={conversation.counterpartyId}>
                      <button
                        type="button"
                        className={`chat-sidebar__item${
                          isActive ? ' chat-sidebar__item--active' : ''
                        }`}
                        onClick={() => selectConversation(conversation.counterpartyId)}
                      >
                        <span
                          className="chat-sidebar__avatar"
                          style={{ background: conversation.avatarColor }}
                          aria-hidden="true"
                        >
                          {getInitials(conversation.contactName)}
                        </span>

                        <div className="chat-sidebar__content">
                          <div className="chat-sidebar__row">
                            <span className="chat-sidebar__name">
                              {conversation.contactName}
                            </span>
                            <span className="chat-sidebar__time">
                              {conversation.lastMessageAt}
                            </span>
                          </div>
                          <p className="chat-sidebar__preview">
                            {conversation.lastMessage}
                          </p>
                        </div>
                      </button>
                    </li>
                  )
                })
              )}
            </ul>
          </aside>

          <section className="chat-panel" aria-label="Conversación activa">
            {activeConversation && activeProductChat && user ? (
              <>
                <header className="chat-panel__header">
                  <div className="chat-panel__header-main">
                    <span
                      className="chat-panel__avatar"
                      style={{
                        background: getAvatarColor(activeConversation.contactName),
                      }}
                      aria-hidden="true"
                    >
                      {getInitials(activeConversation.contactName)}
                    </span>
                    <div>
                      <p className="chat-panel__contact-name">
                        {activeConversation.contactName}
                      </p>
                      <p className="chat-panel__contact-subtitle">
                        {getContactSubtitle(activeProductChat, user.id)}
                      </p>
                    </div>
                  </div>
                  <div className="chat-panel__header-actions">
                    {activeConversation.products.length > 1 ? (
                      <label className="chat-panel__product-select-wrap">
                        <span className="chat-panel__product-select-label">
                          Sobre:
                        </span>
                        <select
                          className="chat-panel__product-select"
                          value={activeProductChatId}
                          onChange={(e) => {
                            setActiveProductChatId(e.target.value)
                            setSearchParams(
                              { chatId: e.target.value },
                              { replace: true },
                            )
                          }}
                        >
                          {activeConversation.products.map((p) => (
                            <option key={p.chatId} value={p.chatId}>
                              {p.productName}
                              {p.status === 'delivery_confirmed' ? ' (entregado)' : ''}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : (
                      <span
                        className="chat-panel__product-chip"
                        title={activeProductChat.product_name}
                      >
                        <span className="chat-panel__product-chip-dot" aria-hidden="true" />
                        {activeProductChat.product_name}
                      </span>
                    )}
                    {!isProductChatClosed && (
                      <button
                        type="button"
                        className="chat-panel__confirm-btn"
                        onClick={() => void handleConfirmDelivery()}
                        disabled={isConfirming}
                      >
                        {isConfirming ? 'Confirmando...' : 'Confirmar entrega'}
                      </button>
                    )}
                  </div>
                </header>

                {isProductChatClosed && (
                  <p className="chat-panel__closed-notice" role="status">
                    Entrega confirmada para {activeProductChat.product_name}. Elige otro
                    producto para seguir escribiendo.
                  </p>
                )}

                <div className="chat-panel__messages">
                  {isLoadingMessages ? (
                    <p className="chat-page__status">Cargando mensajes...</p>
                  ) : messageGroups.length === 0 ? (
                    <p className="chat-page__status">
                      Aún no hay mensajes. ¡Envía el primero!
                    </p>
                  ) : (
                    messageGroups.map((group) => (
                      <div
                        key={group.dateLabel + group.items[0]?.id}
                        className="chat-panel__message-group"
                      >
                        <div className="chat-panel__date-separator">
                          {group.dateLabel}
                        </div>
                        {group.items.map((message) => (
                          <div
                            key={message.id}
                            className={`chat-panel__message chat-panel__message--${
                              message.isOutgoing ? 'outgoing' : 'incoming'
                            }`}
                          >
                            {activeConversation.products.length > 1 && (
                              <span className="chat-panel__message-product">
                                {message.productName}
                              </span>
                            )}
                            {message.type === 'appointment' ? (
                              <div
                                className={`chat-panel__bubble chat-panel__bubble--appointment${
                                  message.appointmentStatus === 'pending'
                                    ? message.isOutgoing
                                      ? ' chat-panel__bubble--appointment-pending-out'
                                      : ' chat-panel__bubble--appointment-pending'
                                    : message.appointmentStatus === 'rejected'
                                      ? ' chat-panel__bubble--appointment-rejected'
                                      : ''
                                }`}
                              >
                                <span className="chat-panel__appointment-icon">
                                  <LocationPinIcon />
                                </span>
                                <div className="chat-panel__appointment-body">
                                  <span>{message.content}</span>
                                  {message.isOutgoing &&
                                    message.appointmentStatus === 'pending' && (
                                      <span className="chat-panel__appointment-hint">
                                        Esperando respuesta…
                                      </span>
                                    )}
                                  {message.canRespondToAppointment && (
                                    <div className="chat-panel__appointment-response">
                                      <button
                                        type="button"
                                        className="chat-panel__appointment-accept"
                                        onClick={() =>
                                          void handleRespondToAppointment(
                                            message,
                                            'accept',
                                          )
                                        }
                                        disabled={respondingMessageId === message.id}
                                      >
                                        {respondingMessageId === message.id
                                          ? '...'
                                          : 'Aceptar'}
                                      </button>
                                      <button
                                        type="button"
                                        className="chat-panel__appointment-reject"
                                        onClick={() =>
                                          void handleRespondToAppointment(
                                            message,
                                            'reject',
                                          )
                                        }
                                        disabled={respondingMessageId === message.id}
                                      >
                                        Rechazar
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div
                                className={`chat-panel__bubble chat-panel__bubble--${
                                  message.isOutgoing ? 'outgoing' : 'incoming'
                                }`}
                              >
                                {renderMessageContent(message.content)}
                              </div>
                            )}
                            <time className="chat-panel__timestamp">
                              {message.sentAt}
                            </time>
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} aria-hidden="true" />
                </div>

                {error && (
                  <p className="chat-page__status chat-page__status--error" role="alert">
                    {error}
                  </p>
                )}

                {showAppointmentForm && !isProductChatClosed && (
                  <div className="chat-panel__appointment-form">
                    <p className="chat-panel__appointment-title">
                      Proponer encuentro — {activeProductChat.product_name}
                    </p>
                    <div className="chat-panel__appointment-fields">
                      <input
                        type="text"
                        className="chat-panel__appointment-input"
                        placeholder="Día (ej. Miércoles)"
                        value={appointment.day}
                        onChange={(e) =>
                          setAppointment((prev) => ({ ...prev, day: e.target.value }))
                        }
                      />
                      <input
                        type="text"
                        className="chat-panel__appointment-input"
                        placeholder="Hora (ej. 2:00 PM)"
                        value={appointment.time}
                        onChange={(e) =>
                          setAppointment((prev) => ({ ...prev, time: e.target.value }))
                        }
                      />
                      <input
                        type="text"
                        className="chat-panel__appointment-input"
                        placeholder="Lugar (ej. Bloque E)"
                        value={appointment.location}
                        onChange={(e) =>
                          setAppointment((prev) => ({
                            ...prev,
                            location: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="chat-panel__appointment-actions">
                      <button
                        type="button"
                        className="chat-panel__appointment-send"
                        onClick={() => void handleSendAppointment()}
                        disabled={isSending}
                      >
                        Enviar propuesta
                      </button>
                      <button
                        type="button"
                        className="chat-panel__appointment-cancel"
                        onClick={() => {
                          setShowAppointmentForm(false)
                          setAppointment(EMPTY_APPOINTMENT)
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                <form
                  className={`chat-panel__composer${
                    isProductChatClosed ? ' chat-panel__composer--disabled' : ''
                  }`}
                  onSubmit={(e) => {
                    e.preventDefault()
                    void handleSend()
                  }}
                >
                  {!isProductChatClosed && (
                    <button
                      type="button"
                      className="chat-panel__appointment-btn"
                      onClick={() => setShowAppointmentForm((v) => !v)}
                      aria-label="Proponer encuentro"
                    >
                      📍
                    </button>
                  )}
                  <div className="chat-panel__input-wrap">
                    <input
                      type="text"
                      className="chat-panel__input"
                      placeholder={
                        isProductChatClosed
                          ? 'Selecciona un producto activo'
                          : activeConversation.products.length > 1
                            ? `Mensaje sobre ${activeProductChat.product_name}...`
                            : 'Escribe un mensaje...'
                      }
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={isProductChatClosed || isSending}
                      aria-label="Escribe un mensaje"
                    />
                  </div>
                  <button
                    type="submit"
                    className="chat-panel__send-btn"
                    disabled={!draft.trim() || isProductChatClosed || isSending}
                    aria-label="Enviar mensaje"
                  >
                    <ArrowRightIcon />
                  </button>
                </form>
              </>
            ) : (
              <p className="chat-panel__empty">
                <span className="chat-panel__empty-icon" aria-hidden="true">
                  💬
                </span>
                {isLoadingChats
                  ? 'Cargando...'
                  : 'Selecciona una conversación para ver los mensajes.'}
              </p>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
