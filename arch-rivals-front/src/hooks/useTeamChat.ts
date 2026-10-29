import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../services/api'
import {
  CHAT_CLOSED,
  fetchMessages,
  markRead,
  sendMessage,
  subscribeToMessages,
} from '../services/chat'
import type { ChatMessage } from '../types/chat'

type Loaded = { teamId: number; messages: ChatMessage[]; failed: boolean; closed: boolean }

/** Ajoute des messages sans doublon (un même message vient de l'envoi et du flux). */
function merge(list: ChatMessage[], incoming: ChatMessage[]) {
  const known = new Set(list.map((m) => m.id))
  const fresh = incoming.filter((m) => !known.has(m.id))
  if (!fresh.length) return list
  return [...list, ...fresh].toSorted((a, b) => a.sentAt.localeCompare(b.sentAt) || a.id - b.id)
}

const isClosedError = (err: unknown) => err instanceof ApiError && err.code === CHAT_CLOSED

/** Salle du conseil d'une équipe : historique, puis messages reçus en direct (B-16). */
export function useTeamChat(teamId: number, eliminated: boolean) {
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const current = loaded?.teamId === teamId ? loaded : null
  // Le back peut fermer l'espace avant que la fiche de l'équipe ne soit relue (409).
  const closed = eliminated || current?.closed === true
  const status = closed ? 'closed' : !current ? 'loading' : current.failed ? 'error' : 'ready'

  const add = useCallback(
    (incoming: ChatMessage[]) =>
      setLoaded((prev) =>
        prev?.teamId === teamId ? { ...prev, messages: merge(prev.messages, incoming) } : prev,
      ),
    [teamId],
  )

  useEffect(() => {
    // Équipe éliminée : l'espace est fermé, on ne charge rien et on ne s'abonne pas.
    if (eliminated) return
    let cancelled = false

    fetchMessages(teamId)
      .then((messages) => {
        if (!cancelled) setLoaded({ teamId, messages, failed: false, closed: false })
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setLoaded({ teamId, messages: [], failed: true, closed: isClosedError(err) })
      })

    // Le nettoyage quitte le salon : changement d'équipe ou départ de la page.
    const unsubscribe = subscribeToMessages(teamId, (message) => add([message]))
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [teamId, eliminated, add])

  // Ce qui est affiché est lu : on avance le repère du back jusqu'au dernier message.
  const lastId = current?.messages.at(-1)?.id ?? null
  useEffect(() => {
    if (closed || lastId === null) return
    markRead(teamId, lastId).catch(() => {
      /* le badge se corrigera au prochain chargement */
    })
  }, [teamId, lastId, closed])

  const send = useCallback(
    async (text: string) => {
      try {
        add([await sendMessage(teamId, text)])
      } catch (err) {
        if (isClosedError(err))
          setLoaded((prev) => (prev?.teamId === teamId ? { ...prev, closed: true } : prev))
        throw err
      }
    },
    [teamId, add],
  )

  return { messages: current?.messages ?? [], status, send }
}
