import type { ChatMessage } from '../types/chat'
import { api } from './api'
import { listOf, type MessageDto } from './dto'
import { follow, listen } from './realtime'

// Contrat du back (api-routes.md), salle du conseil d'une équipe :
//   GET  /teams/:id/messages              → { messages, pagination }  du plus récent au plus ancien
//   POST /teams/:id/messages  { content } → 201 { message }
//   POST /teams/:id/messages/read { messageId } → 204  (le repère ne recule jamais)
//   GET  /me/unread                       → { teams: [{ teamId, unread, lastReadMessageId }] }
//   Temps réel : salon `team:join` (mêmes droits que la lecture), événement `message:new`,
//   qui pousse chaque nouveau message, y compris ceux du joueur lui-même.
// L'espace d'une équipe éliminée est fermé en lecture et en écriture (409 TEAM_CHAT_CLOSED, B-18).
// Un joueur exclu est retiré du salon côté serveur et reçoit `member:kicked` (B-17).

export const MESSAGE_MAX = 500
/** Historique chargé à l'ouverture. */
const HISTORY_LIMIT = 100

export const CHAT_CLOSED = 'TEAM_CHAT_CLOSED'

function toMessage(dto: MessageDto): ChatMessage {
  return {
    id: dto.id,
    authorId: dto.author?.id ?? null,
    author: dto.author?.username ?? 'Ancien membre',
    text: dto.content,
    sentAt: dto.createdAt,
  }
}

/** Historique dans l'ordre de lecture (le back le renvoie du plus récent au plus ancien). */
export async function fetchMessages(teamId: number): Promise<ChatMessage[]> {
  const data = await api.get(`/teams/${teamId}/messages?limit=${HISTORY_LIMIT}`)
  return listOf<MessageDto>(data, 'messages').map(toMessage).reverse()
}

export async function sendMessage(teamId: number, text: string): Promise<ChatMessage> {
  const { message } = await api.post<{ message: MessageDto }>(`/teams/${teamId}/messages`, {
    content: text.trim(),
  })
  return toMessage(message)
}

/** Messages non lus par équipe (équipes encore en lice). */
export async function fetchUnread(): Promise<Record<number, number>> {
  const { teams } = await api.get<{ teams: { teamId: number; unread: number }[] }>('/me/unread')
  return Object.fromEntries(teams.map((t) => [t.teamId, t.unread]))
}

/** Marque lus les messages de l'équipe jusqu'à `messageId` inclus. */
export async function markRead(teamId: number, messageId: number): Promise<void> {
  await api.post(`/teams/${teamId}/messages/read`, { messageId })
}

/** S'abonne aux nouveaux messages de l'équipe ; renvoie la fonction qui coupe l'abonnement. */
export function subscribeToMessages(
  teamId: number,
  onMessage: (message: ChatMessage) => void,
): () => void {
  const stopListening = listen('message:new', (dto) => {
    if (dto.teamId === teamId) onMessage(toMessage(dto))
  })
  const leave = follow('team', teamId)
  return () => {
    stopListening()
    leave()
  }
}

/** Le joueur perd l'accès à l'équipe (exclusion ou suppression) ; renvoie la fonction qui coupe l'écoute. */
export function onTeamLost(onLost: (teamId: number) => void): () => void {
  const offKicked = listen('member:kicked', ({ teamId }) => onLost(teamId))
  const offDeleted = listen('team:deleted', ({ teamId }) => onLost(teamId))
  return () => {
    offKicked()
    offDeleted()
  }
}
