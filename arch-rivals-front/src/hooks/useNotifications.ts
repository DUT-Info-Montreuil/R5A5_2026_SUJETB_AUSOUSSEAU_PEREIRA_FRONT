import { useContext } from 'react'
import { NotificationsContext } from '../context/notificationsContext'

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications doit être utilisé dans <NotificationsProvider>.')
  const unreadTotal = Object.values(ctx.unread).reduce((sum, n) => sum + n, 0)
  return { ...ctx, unreadTotal, total: unreadTotal + ctx.pendingRequests }
}
