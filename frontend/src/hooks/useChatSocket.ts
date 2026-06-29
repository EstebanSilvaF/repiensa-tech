import { useEffect, useRef } from 'react'
import { io, type Socket } from 'socket.io-client'
import { WS_URL, TOKEN_KEY } from '../config/env'
import type { ChatStatus, ChatUpdatedPayload, Message } from '../types/api'

interface DeliveryConfirmedPayload {
  chatId: string
  status: ChatStatus
}

interface UseChatSocketOptions {
  enabled: boolean
  activeChatIds: string[]
  onMessage: (message: Message) => void
  onMessageUpdated: (message: Message) => void
  onChatUpdated: (payload: ChatUpdatedPayload) => void
  onDeliveryConfirmed: (payload: DeliveryConfirmedPayload) => void
}

export function useChatSocket({
  enabled,
  activeChatIds,
  onMessage,
  onMessageUpdated,
  onChatUpdated,
  onDeliveryConfirmed,
}: UseChatSocketOptions) {
  const socketRef = useRef<Socket | null>(null)
  const joinedChatsRef = useRef<Set<string>>(new Set())
  const activeChatIdsRef = useRef(activeChatIds)
  const callbacksRef = useRef({
    onMessage,
    onMessageUpdated,
    onChatUpdated,
    onDeliveryConfirmed,
  })

  useEffect(() => {
    activeChatIdsRef.current = activeChatIds
  }, [activeChatIds])

  useEffect(() => {
    callbacksRef.current = {
      onMessage,
      onMessageUpdated,
      onChatUpdated,
      onDeliveryConfirmed,
    }
  }, [onMessage, onMessageUpdated, onChatUpdated, onDeliveryConfirmed])

  function syncChatRooms(socket: Socket, chatIds: string[]) {
    const next = new Set(chatIds)
    const joined = joinedChatsRef.current

    for (const chatId of joined) {
      if (!next.has(chatId)) {
        socket.emit('chat:leave', chatId)
        joined.delete(chatId)
      }
    }

    for (const chatId of next) {
      if (!joined.has(chatId)) {
        socket.emit('chat:join', chatId)
        joined.add(chatId)
      }
    }
  }

  useEffect(() => {
    if (!enabled) return

    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return

    const socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    socketRef.current = socket

    socket.on('message:new', (message: Message) => {
      callbacksRef.current.onMessage(message)
    })

    socket.on('message:updated', (message: Message) => {
      callbacksRef.current.onMessageUpdated(message)
    })

    socket.on('chat:updated', (payload: ChatUpdatedPayload) => {
      callbacksRef.current.onChatUpdated(payload)
    })

    socket.on('chat:delivery_confirmed', (payload: DeliveryConfirmedPayload) => {
      callbacksRef.current.onDeliveryConfirmed(payload)
    })

    socket.on('connect', () => {
      syncChatRooms(socket, activeChatIdsRef.current)
    })

    return () => {
      for (const chatId of joinedChatsRef.current) {
        socket.emit('chat:leave', chatId)
      }
      joinedChatsRef.current.clear()
      socket.disconnect()
      socketRef.current = null
    }
  }, [enabled])

  useEffect(() => {
    const socket = socketRef.current
    if (!socket?.connected) return
    syncChatRooms(socket, activeChatIds)
  }, [activeChatIds])
}
