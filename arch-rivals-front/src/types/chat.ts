export type ChatMessage = {
  id: string
  /** Membre de l'équipe qui a écrit le message. */
  authorId: string
  author: string
  text: string
  /** Date d'envoi (ISO 8601), fixée par le serveur. */
  sentAt: string
}
