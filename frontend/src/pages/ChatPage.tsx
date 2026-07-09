import AppNavbar from '../components/layout/AppNavbar'
import { useChatPage } from '../hooks/useChatPage'
import {
  ActiveChatPanel,
  ChatPanelEmpty,
  ConversationSidebar,
} from './ChatPage.parts'
import './ChatPage.css'

export default function ChatPage() {
  const chat = useChatPage()

  if (chat.isAuthLoading || !chat.isAuthenticated) {
    return (
      <div className="chat-page">
        <AppNavbar />
        <p className="chat-page__status">Cargando...</p>
      </div>
    )
  }

  const { activeConversation, activeProductChat, user } = chat

  return (
    <div className="chat-page">
      <AppNavbar />

      <main className="chat-page__main">
        <div className="chat-page__shell">
          <ConversationSidebar
            search={chat.search}
            onSearchChange={chat.setSearch}
            isLoadingChats={chat.isLoadingChats}
            conversations={chat.filteredConversations}
            activeCounterpartyId={chat.activeCounterpartyId}
            onSelectConversation={chat.selectConversation}
          />

          <section className="chat-panel" aria-label="Conversación activa">
            {activeConversation && activeProductChat && user ? (
              <ActiveChatPanel
                userId={user.id}
                activeConversation={activeConversation}
                activeProductChat={activeProductChat}
                activeProductChatId={chat.activeProductChatId}
                isLoadingMessages={chat.isLoadingMessages}
                isProductChatClosed={chat.isProductChatClosed}
                isConfirming={chat.isConfirming}
                isSending={chat.isSending}
                showAppointmentForm={chat.showAppointmentForm}
                appointment={chat.appointment}
                draft={chat.draft}
                error={chat.error}
                messageGroups={chat.messageGroups}
                respondingMessageId={chat.respondingMessageId}
                messagesEndRef={chat.messagesEndRef}
                minAppointmentDate={chat.minAppointmentDate}
                setActiveProductChatId={chat.setActiveProductChatId}
                setSearchParams={chat.setSearchParams}
                setAppointment={chat.setAppointment}
                onConfirmDelivery={() => void chat.handleConfirmDelivery()}
                onRespondToAppointment={(message, action) =>
                  void chat.handleRespondToAppointment(message, action)
                }
                onSendAppointment={() => void chat.handleSendAppointment()}
                onCancelAppointment={chat.cancelAppointment}
                onDraftChange={chat.setDraft}
                onKeyDown={chat.handleKeyDown}
                onSend={() => void chat.handleSend()}
                onToggleAppointmentForm={chat.toggleAppointmentForm}
              />
            ) : (
              <ChatPanelEmpty isLoadingChats={chat.isLoadingChats} />
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
