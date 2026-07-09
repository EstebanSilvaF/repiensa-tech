import { useCallback, useEffect, useState } from 'react'
import { notificationService } from '../api/notificationService'
import type { Notification } from '../types/api'

const POLL_INTERVAL_MS = 60_000

export function useNotifications(enabled: boolean) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!enabled) return

    setIsLoading(true)
    try {
      const data = await notificationService.getNotifications()
      setNotifications(data.notifications)
      setUnread(data.unread)
    } catch {
      // Mantener el estado anterior si falla el polling.
    } finally {
      setIsLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) {
      setNotifications([])
      setUnread(0)
      return
    }

    void refresh()
    const intervalId = window.setInterval(() => {
      void refresh()
    }, POLL_INTERVAL_MS)

    return () => window.clearInterval(intervalId)
  }, [enabled, refresh])

  const markAllRead = useCallback(async () => {
    await notificationService.markAllRead()
    setNotifications((current) => current.map((item) => ({ ...item, is_read: true })))
    setUnread(0)
  }, [])

  const markOneRead = useCallback(async (id: string) => {
    await notificationService.markOneRead(id)
    setNotifications((current) =>
      current.map((item) => (item.id === id ? { ...item, is_read: true } : item)),
    )
    setUnread((current) => Math.max(0, current - 1))
  }, [])

  return {
    notifications,
    unread,
    isLoading,
    refresh,
    markAllRead,
    markOneRead,
  }
}
