import { useEffect, useState } from 'react'
import { fetchMessages, subscribeToMessages } from '../services/chat'
import type { ChatMessage } from '../types/chat'

type Loaded = { teamId: number; messages: ChatMessage[]; failed: boolean }

/**
 * Lecture de la salle du conseil d'une équipe par l'administrateur, même éliminée (B-18) :
 * historique, puis messages en direct. Ni envoi ni repère de lecture (réservés aux membres).
 */
export function useTeamChatReader(teamId: number) {
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const current = loaded?.teamId === teamId ? loaded : null
  const status = !current ? 'loading' : current.failed ? 'error' : 'ready'

  useEffect(() => {
    let cancelled = false
    fetchMessages(teamId)
      .then((messages) => {
        if (!cancelled) setLoaded({ teamId, messages, failed: false })
      })
      .catch(() => {
        if (!cancelled) setLoaded({ teamId, messages: [], failed: true })
      })

    const unsubscribe = subscribeToMessages(teamId, (message) =>
      setLoaded((prev) =>
        prev?.teamId === teamId && !prev.messages.some((m) => m.id === message.id)
          ? { ...prev, messages: [...prev.messages, message] }
          : prev,
      ),
    )
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [teamId])

  return { messages: current?.messages ?? [], status }
}
