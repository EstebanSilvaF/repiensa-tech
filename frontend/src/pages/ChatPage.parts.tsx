import type { Dispatch, KeyboardEvent, SetStateAction } from 'react'
import ArrowRightIcon from '../components/icons/ArrowRightIcon'
import SearchIcon from '../components/icons/SearchIcon'
import type { Chat } from '../types/api'
import {
  getAvatarColor,
  getContactSubtitle,
  type ChatMessageView,
  type ConversationSummary,
} from '../utils/mapChat'

type MessageDateGroup = { dateLabel: string; items: ChatMessageView[] }
import {
  getAppointmentBubbleModifier,
  getComposerPlaceholder,
  getConversationEmptyMessage,
  renderMessageContent,
} from '../utils/chatPageHelpers'

export function getInitials(name: string): string {
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

type ConversationSidebarProps = Readonly<{
  search: string
  onSearchChange: (value: string) => void
  isLoadingChats: boolean
  conversations: ConversationSummary[]
  activeCounterpartyId: string
  onSelectConversation: (counterpartyId: string) => void
}>

export function ConversationSidebar({
  search,
  onSearchChange,
  isLoadingChats,
  conversations,
  activeCounterpartyId,
  onSelectConversation,
}: ConversationSidebarProps) {
  return (
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
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Buscar conversación"
          />
        </div>
      </div>

      <ul className="chat-sidebar__list">
        <ConversationListContent
          isLoadingChats={isLoadingChats}
          conversations={conversations}
          search={search}
          activeCounterpartyId={activeCounterpartyId}
          onSelectConversation={onSelectConversation}
        />
      </ul>
    </aside>
  )
}

type ConversationListContentProps = Readonly<{
  isLoadingChats: boolean
  conversations: ConversationSummary[]
  search: string
  activeCounterpartyId: string
  onSelectConversation: (counterpartyId: string) => void
}>

function ConversationListContent({
  isLoadingChats,
  conversations,
  search,
  activeCounterpartyId,
  onSelectConversation,
}: ConversationListContentProps) {
  if (isLoadingChats) {
    return <li className="chat-page__status">Cargando conversaciones...</li>
  }

  if (conversations.length === 0) {
    return (
      <li className="chat-page__status">{getConversationEmptyMessage(search)}</li>
    )
  }

  return (
    <>
      {conversations.map((conversation) => (
        <ConversationListItem
          key={conversation.counterpartyId}
          conversation={conversation}
          isActive={conversation.counterpartyId === activeCounterpartyId}
          onSelect={() => onSelectConversation(conversation.counterpartyId)}
        />
      ))}
    </>
  )
}

type ConversationListItemProps = Readonly<{
  conversation: ConversationSummary
  isActive: boolean
  onSelect: () => void
}>

function ConversationListItem({
  conversation,
  isActive,
  onSelect,
}: ConversationListItemProps) {
  return (
    <li>
      <button
        type="button"
        className={`chat-sidebar__item${isActive ? ' chat-sidebar__item--active' : ''}`}
        onClick={onSelect}
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
            <span className="chat-sidebar__name">{conversation.contactName}</span>
            <span className="chat-sidebar__time">{conversation.lastMessageAt}</span>
          </div>
          <p className="chat-sidebar__preview">{conversation.lastMessage}</p>
        </div>
      </button>
    </li>
  )
}

type AppointmentBubbleProps = Readonly<{
  message: ChatMessageView
  respondingMessageId: string | null
  onRespond: (message: ChatMessageView, action: 'accept' | 'reject') => void
}>

function AppointmentBubble({
  message,
  respondingMessageId,
  onRespond,
}: AppointmentBubbleProps) {
  const modifier = getAppointmentBubbleModifier(message)
  const isResponding = respondingMessageId === message.id

  return (
    <div className={`chat-panel__bubble chat-panel__bubble--appointment${modifier}`}>
      <span className="chat-panel__appointment-icon">
        <LocationPinIcon />
      </span>
      <div className="chat-panel__appointment-body">
        <span>{message.content}</span>
        {message.isOutgoing && message.appointmentStatus === 'pending' && (
          <span className="chat-panel__appointment-hint">Esperando respuesta…</span>
        )}
        {message.canRespondToAppointment && (
          <div className="chat-panel__appointment-response">
            <button
              type="button"
              className="chat-panel__appointment-accept"
              onClick={() => onRespond(message, 'accept')}
              disabled={isResponding}
            >
              {isResponding ? '...' : 'Aceptar'}
            </button>
            <button
              type="button"
              className="chat-panel__appointment-reject"
              onClick={() => onRespond(message, 'reject')}
              disabled={isResponding}
            >
              Rechazar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

type ChatMessageItemProps = Readonly<{
  message: ChatMessageView
  showProductName: boolean
  respondingMessageId: string | null
  onRespondToAppointment: (message: ChatMessageView, action: 'accept' | 'reject') => void
}>

function ChatMessageItem({
  message,
  showProductName,
  respondingMessageId,
  onRespondToAppointment,
}: ChatMessageItemProps) {
  const direction = message.isOutgoing ? 'outgoing' : 'incoming'

  return (
    <div className={`chat-panel__message chat-panel__message--${direction}`}>
      {showProductName && (
        <span className="chat-panel__message-product">{message.productName}</span>
      )}
      {message.type === 'appointment' ? (
        <AppointmentBubble
          message={message}
          respondingMessageId={respondingMessageId}
          onRespond={onRespondToAppointment}
        />
      ) : (
        <div className={`chat-panel__bubble chat-panel__bubble--${direction}`}>
          {renderMessageContent(message.content)}
        </div>
      )}
      <time className="chat-panel__timestamp">{message.sentAt}</time>
    </div>
  )
}

type ChatMessageListProps = Readonly<{
  isLoadingMessages: boolean
  messageGroups: MessageDateGroup[]
  showProductName: boolean
  respondingMessageId: string | null
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  onRespondToAppointment: (message: ChatMessageView, action: 'accept' | 'reject') => void
}>

function ChatMessageList({
  isLoadingMessages,
  messageGroups,
  showProductName,
  respondingMessageId,
  messagesEndRef,
  onRespondToAppointment,
}: ChatMessageListProps) {
  if (isLoadingMessages) {
    return <p className="chat-page__status">Cargando mensajes...</p>
  }

  if (messageGroups.length === 0) {
    return (
      <p className="chat-page__status">Aún no hay mensajes. ¡Envía el primero!</p>
    )
  }

  return (
    <>
      {messageGroups.map((group) => (
        <div
          key={group.dateLabel + group.items[0]?.id}
          className="chat-panel__message-group"
        >
          <div className="chat-panel__date-separator">{group.dateLabel}</div>
          {group.items.map((message) => (
            <ChatMessageItem
              key={message.id}
              message={message}
              showProductName={showProductName}
              respondingMessageId={respondingMessageId}
              onRespondToAppointment={onRespondToAppointment}
            />
          ))}
        </div>
      ))}
      <div ref={messagesEndRef} aria-hidden="true" />
    </>
  )
}

type AppointmentFormState = Readonly<{ day: string; time: string; location: string }>

type AppointmentFormProps = Readonly<{
  productName: string
  appointment: AppointmentFormState
  setAppointment: Dispatch<SetStateAction<AppointmentFormState>>
  minDate: string
  isSending: boolean
  onSend: () => void
  onCancel: () => void
}>

function AppointmentForm({
  productName,
  appointment,
  setAppointment,
  minDate,
  isSending,
  onSend,
  onCancel,
}: AppointmentFormProps) {
  return (
    <div className="chat-panel__appointment-form">
      <p className="chat-panel__appointment-title">
        Proponer encuentro — {productName}
      </p>
      <div className="chat-panel__appointment-fields">
        <label className="chat-panel__appointment-field">
          <span className="chat-panel__appointment-label">Fecha</span>
          <input
            type="date"
            className="chat-panel__appointment-input"
            value={appointment.day}
            min={minDate}
            onChange={(e) =>
              setAppointment((prev) => ({ ...prev, day: e.target.value }))
            }
          />
        </label>
        <label className="chat-panel__appointment-field">
          <span className="chat-panel__appointment-label">Hora</span>
          <input
            type="time"
            className="chat-panel__appointment-input"
            value={appointment.time}
            step={900}
            onChange={(e) =>
              setAppointment((prev) => ({ ...prev, time: e.target.value }))
            }
          />
        </label>
        <label className="chat-panel__appointment-field">
          <span className="chat-panel__appointment-label">Lugar</span>
          <input
            type="text"
            className="chat-panel__appointment-input"
            placeholder="Ej. Bloque E, cafetería"
            value={appointment.location}
            onChange={(e) =>
              setAppointment((prev) => ({ ...prev, location: e.target.value }))
            }
          />
        </label>
      </div>
      <div className="chat-panel__appointment-actions">
        <button
          type="button"
          className="chat-panel__appointment-send"
          onClick={onSend}
          disabled={isSending}
        >
          Enviar propuesta
        </button>
        <button
          type="button"
          className="chat-panel__appointment-cancel"
          onClick={onCancel}
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

type ChatComposerProps = Readonly<{
  draft: string
  placeholder: string
  isProductChatClosed: boolean
  isSending: boolean
  onDraftChange: (value: string) => void
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  onSubmit: () => void
  onToggleAppointmentForm: () => void
}>

function ChatComposer({
  draft,
  placeholder,
  isProductChatClosed,
  isSending,
  onDraftChange,
  onKeyDown,
  onSubmit,
  onToggleAppointmentForm,
}: ChatComposerProps) {
  const composerClass = isProductChatClosed
    ? 'chat-panel__composer chat-panel__composer--disabled'
    : 'chat-panel__composer'

  return (
    <form
      className={composerClass}
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      {!isProductChatClosed && (
        <button
          type="button"
          className="chat-panel__appointment-btn"
          onClick={onToggleAppointmentForm}
          aria-label="Proponer encuentro"
        >
          📍
        </button>
      )}
      <div className="chat-panel__input-wrap">
        <input
          type="text"
          className="chat-panel__input"
          placeholder={placeholder}
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={onKeyDown}
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
  )
}

type ActiveChatPanelProps = Readonly<{
  userId: string
  activeConversation: ConversationSummary
  activeProductChat: Chat
  activeProductChatId: string
  isLoadingMessages: boolean
  isProductChatClosed: boolean
  isConfirming: boolean
  isSending: boolean
  showAppointmentForm: boolean
  appointment: AppointmentFormState
  draft: string
  error: string | null
  messageGroups: MessageDateGroup[]
  respondingMessageId: string | null
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  minAppointmentDate: string
  setActiveProductChatId: (chatId: string) => void
  setSearchParams: (params: { chatId: string }, options: { replace: boolean }) => void
  setAppointment: Dispatch<SetStateAction<AppointmentFormState>>
  onConfirmDelivery: () => void
  onRespondToAppointment: (message: ChatMessageView, action: 'accept' | 'reject') => void
  onSendAppointment: () => void
  onCancelAppointment: () => void
  onDraftChange: (value: string) => void
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  onSend: () => void
  onToggleAppointmentForm: () => void
}>

export function ActiveChatPanel({
  userId,
  activeConversation,
  activeProductChat,
  activeProductChatId,
  isLoadingMessages,
  isProductChatClosed,
  isConfirming,
  isSending,
  showAppointmentForm,
  appointment,
  draft,
  error,
  messageGroups,
  respondingMessageId,
  messagesEndRef,
  minAppointmentDate,
  setActiveProductChatId,
  setSearchParams,
  setAppointment,
  onConfirmDelivery,
  onRespondToAppointment,
  onSendAppointment,
  onCancelAppointment,
  onDraftChange,
  onKeyDown,
  onSend,
  onToggleAppointmentForm,
}: ActiveChatPanelProps) {
  const hasMultipleProducts = activeConversation.products.length > 1
  const placeholder = getComposerPlaceholder(
    isProductChatClosed,
    hasMultipleProducts,
    activeProductChat.product_name ?? 'Producto',
  )

  return (
    <>
      <header className="chat-panel__header">
        <div className="chat-panel__header-main">
          <span
            className="chat-panel__avatar"
            style={{ background: getAvatarColor(activeConversation.contactName) }}
            aria-hidden="true"
          >
            {getInitials(activeConversation.contactName)}
          </span>
          <div>
            <p className="chat-panel__contact-name">{activeConversation.contactName}</p>
            <p className="chat-panel__contact-subtitle">
              {getContactSubtitle(activeProductChat, userId)}
            </p>
          </div>
        </div>
        <div className="chat-panel__header-actions">
          <ProductSelector
            hasMultipleProducts={hasMultipleProducts}
            activeProductChatId={activeProductChatId}
            activeProductChat={activeProductChat}
            products={activeConversation.products}
            onProductChange={(chatId) => {
              setActiveProductChatId(chatId)
              setSearchParams({ chatId }, { replace: true })
            }}
          />
          {!isProductChatClosed && (
            <button
              type="button"
              className="chat-panel__confirm-btn"
              onClick={onConfirmDelivery}
              disabled={isConfirming}
            >
              {isConfirming ? 'Confirmando...' : 'Confirmar entrega'}
            </button>
          )}
        </div>
      </header>

      {isProductChatClosed && (
        <output className="chat-panel__closed-notice">
          Entrega confirmada para {activeProductChat.product_name}. Elige otro producto
          para seguir escribiendo.
        </output>
      )}

      <div className="chat-panel__messages">
        <ChatMessageList
          isLoadingMessages={isLoadingMessages}
          messageGroups={messageGroups}
          showProductName={hasMultipleProducts}
          respondingMessageId={respondingMessageId}
          messagesEndRef={messagesEndRef}
          onRespondToAppointment={onRespondToAppointment}
        />
      </div>

      {error && (
        <p className="chat-page__status chat-page__status--error" role="alert">
          {error}
        </p>
      )}

      {showAppointmentForm && !isProductChatClosed && (
        <AppointmentForm
          productName={activeProductChat.product_name ?? 'Producto'}
          appointment={appointment}
          setAppointment={setAppointment}
          minDate={minAppointmentDate}
          isSending={isSending}
          onSend={onSendAppointment}
          onCancel={onCancelAppointment}
        />
      )}

      <ChatComposer
        draft={draft}
        placeholder={placeholder}
        isProductChatClosed={isProductChatClosed}
        isSending={isSending}
        onDraftChange={onDraftChange}
        onKeyDown={onKeyDown}
        onSubmit={onSend}
        onToggleAppointmentForm={onToggleAppointmentForm}
      />
    </>
  )
}

type ProductOption = Readonly<{
  chatId: string
  productName: string
  status: string
}>

type ProductSelectorProps = Readonly<{
  hasMultipleProducts: boolean
  activeProductChatId: string
  activeProductChat: Chat
  products: ProductOption[]
  onProductChange: (chatId: string) => void
}>

function ProductSelector({
  hasMultipleProducts,
  activeProductChatId,
  activeProductChat,
  products,
  onProductChange,
}: ProductSelectorProps) {
  if (hasMultipleProducts) {
    return (
      <label className="chat-panel__product-select-wrap">
        <span className="chat-panel__product-select-label">Sobre:</span>
        <select
          className="chat-panel__product-select"
          value={activeProductChatId}
          onChange={(e) => onProductChange(e.target.value)}
        >
          {products.map((product) => (
            <option key={product.chatId} value={product.chatId}>
              {product.productName}
              {product.status === 'delivery_confirmed' ? ' (entregado)' : ''}
            </option>
          ))}
        </select>
      </label>
    )
  }

  return (
    <span className="chat-panel__product-chip" title={activeProductChat.product_name}>
      <span className="chat-panel__product-chip-dot" aria-hidden="true" />
      {activeProductChat.product_name}
    </span>
  )
}

type ChatPanelEmptyProps = Readonly<{
  isLoadingChats: boolean
}>

export function ChatPanelEmpty({ isLoadingChats }: ChatPanelEmptyProps) {
  const message = isLoadingChats
    ? 'Cargando...'
    : 'Selecciona una conversación para ver los mensajes.'

  return (
    <p className="chat-panel__empty">
      <span className="chat-panel__empty-icon" aria-hidden="true">
        💬
      </span>
      {message}
    </p>
  )
}

export type { AppointmentFormState }
