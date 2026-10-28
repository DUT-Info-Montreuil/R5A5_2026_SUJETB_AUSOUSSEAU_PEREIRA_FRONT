/** Demande reçue par l'équipe (GET /api/teams/:id/join-requests, réservée au capitaine). */
export type IncomingRequest = {
  id: number
  userId: number
  username: string
  createdAt: string
}

// --- Faux back de la salle du conseil (services/chat.ts), retiré au commit suivant ---

export type TeamMemberMock = {
  id: string
  username: string
  role: string
}

export type MyTeam = {
  tournamentId: string
  name: string
  captainId: string
  members: TeamMemberMock[]
  myMemberId: string
}
