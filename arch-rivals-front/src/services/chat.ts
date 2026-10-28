import { CHATS, INCOMING_POOL } from '../data/chats'
import type { ChatMessage } from '../types/chat'
import { ApiError } from './api'
import { db, findTournament } from './mockBackend'

// Contrat prévu avec le back (le joueur est identifié par son token) :
//   GET  /teams/:id/messages            → ChatMessage[]   (403 si le joueur n'est pas membre)
//   POST /teams/:id/messages  { text }  → 201 ChatMessage (409 si l'espace est fermé)
//   Temps réel : WebSocket (ou SSE) sur /teams/:id/messages/stream, qui pousse chaque nouveau
//   message, y compris ceux du joueur lui-même.
// Un joueur exclu perd aussitôt l'accès (B-17) : le back refuse ses requêtes et coupe son flux.
// L'espace d'une équipe éliminée est fermé (B-18) ; seul l'administrateur peut le relire.
// Ici, le faux back simule l'arrivée de messages des coéquipiers avec un minuteur.

export const MESSAGE_MAX = 500

/** Délai entre deux messages simulés des coéquipiers. */
const MOCK_INCOMING_MS = 8_000

const messages: Record<string, ChatMessage[]> = structuredClone(CHATS)
const incoming = structuredClone(INCOMING_POOL)
const listeners = new Map<string, Set<(message: ChatMessage) => void>>()
const timers = new Map<string, ReturnType<typeof setInterval>>()
let nextId = 1

function assertMember(tournamentId: string) {
  if (!db.myTeams.some((t) => t.tournamentId === tournamentId))
    throw new ApiError(403, 'Cet espace est réservé aux membres de l’équipe.')
}

/** L'espace d'une équipe éliminée est fermé. */
function isChatClosed(tournamentId: string) {
  return findTournament(tournamentId).eliminated === true
}

function publish(tournamentId: string, message: ChatMessage) {
  ;(messages[tournamentId] ??= []).push(message)
  listeners.get(tournamentId)?.forEach((listener) => listener(structuredClone(message)))
}

export async function fetchMessages(tournamentId: string): Promise<ChatMessage[]> {
  assertMember(tournamentId)
  if (isChatClosed(tournamentId)) throw new ApiError(403, 'L’espace de ton équipe est fermé.')
  return structuredClone(messages[tournamentId] ?? [])
}

export async function sendMessage(tournamentId: string, text: string): Promise<ChatMessage> {
  assertMember(tournamentId)
  if (isChatClosed(tournamentId)) throw new ApiError(409, 'L’espace de ton équipe est fermé.')
  const body = text.trim()
  if (!body) throw new ApiError(422, 'Le message est vide.')
  if (body.length > MESSAGE_MAX) throw new ApiError(422, `${MESSAGE_MAX} caractères maximum.`)

  const team = db.myTeams.find((t) => t.tournamentId === tournamentId)!
  const me = team.members.find((m) => m.id === team.myMemberId)!
  const message: ChatMessage = {
    id: `sent-${nextId++}`,
    authorId: me.id,
    author: me.username,
    text: body,
    sentAt: new Date().toISOString(),
  }
  publish(tournamentId, message)
  return structuredClone(message)
}

/** S'abonne aux nouveaux messages de l'équipe ; renvoie la fonction qui coupe l'abonnement. */
export function subscribeToMessages(
  tournamentId: string,
  onMessage: (message: ChatMessage) => void,
): () => void {
  const set = listeners.get(tournamentId) ?? new Set()
  set.add(onMessage)
  listeners.set(tournamentId, set)

  // Un seul minuteur par équipe, quel que soit le nombre d'abonnés.
  if (!timers.has(tournamentId) && incoming[tournamentId]?.length) {
    const timer = setInterval(() => {
      const next = incoming[tournamentId]?.shift()
      if (!next) {
        clearInterval(timer)
        return
      }
      publish(tournamentId, { ...next, id: `in-${nextId++}`, sentAt: new Date().toISOString() })
    }, MOCK_INCOMING_MS)
    timers.set(tournamentId, timer)
  }

  return () => {
    set.delete(onMessage)
    if (set.size === 0) {
      clearInterval(timers.get(tournamentId))
      timers.delete(tournamentId)
    }
  }
}
