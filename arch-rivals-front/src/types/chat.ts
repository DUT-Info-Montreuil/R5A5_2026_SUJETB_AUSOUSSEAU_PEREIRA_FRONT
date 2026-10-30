export type ChatMessage = {
  id: number
  /** Joueur qui a écrit le message (null : compte supprimé depuis). */
  authorId: number | null
  author: string
  text: string
  /** Date d'envoi (ISO 8601), fixée par le serveur. */
  sentAt: string
}

/** État du fil des messages d'une salle du conseil. */
export type ChatStatus = 'loading' | 'error' | 'ready'
