/** Demande reçue par l'équipe (GET /api/teams/:id/join-requests, réservée au capitaine). */
export type IncomingRequest = {
  id: number
  userId: number
  username: string
  createdAt: string
}
