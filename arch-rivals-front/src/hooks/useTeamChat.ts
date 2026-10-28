import { useCallback, useEffect, useState } from 'react'
import { fetchMessages, sendMessage, subscribeToMessages } from '../services/chat'
import type { ChatMessage } from '../types/chat'

type Loaded = { tournamentId: string; messages: ChatMessage[]; failed: boolean }

/** Ajoute des messages sans doublon (un même message peut venir de l'envoi et du flux). */
function merge(list: ChatMessage[], incoming: ChatMessage[]) {
  const known = new Set(list.map((m) => m.id))
  const fresh = incoming.filter((m) => !known.has(m.id))
  if (!fresh.length) return list
  return [...list, ...fresh].toSorted((a, b) => a.sentAt.localeCompare(b.sentAt))
}

/** Salle du conseil d'une équipe : historique, puis messages reçus en direct (B-16). */
export function useTeamChat(tournamentId: string, closed: boolean) {
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const current = loaded?.tournamentId === tournamentId ? loaded : null
  const status = closed ? 'closed' : !current ? 'loading' : current.failed ? 'error' : 'ready'

  const add = useCallback(
    (incoming: ChatMessage[]) =>
      setLoaded((prev) =>
        prev?.tournamentId === tournamentId
          ? { ...prev, messages: merge(prev.messages, incoming) }
          : prev,
      ),
    [tournamentId],
  )

  useEffect(() => {
    // Équipe éliminée : l'espace est fermé, on ne charge rien et on ne s'abonne pas.
    if (closed) return
    let cancelled = false

    fetchMessages(tournamentId)
      .then((messages) => {
        if (!cancelled) setLoaded({ tournamentId, messages, failed: false })
      })
      .catch(() => {
        if (!cancelled) setLoaded({ tournamentId, messages: [], failed: true })
      })

    // Le nettoyage coupe l'abonnement : changement d'équipe ou départ de la page.
    const unsubscribe = subscribeToMessages(tournamentId, (message) => add([message]))
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [tournamentId, closed, add])

  const send = useCallback(
    async (text: string) => {
      add([await sendMessage(tournamentId, text)])
    },
    [tournamentId, add],
  )

  return { messages: current?.messages ?? [], status, send }
}
