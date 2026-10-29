import type { Game } from './game'
import type { TournamentTeam } from './tournament'

/** Demande reçue par l'équipe (GET /api/teams/:id/join-requests, réservée au capitaine). */
export type IncomingRequest = {
  id: number
  userId: number
  username: string
  createdAt: string
}

/** Équipe hors tournoi : son jeu fixe les rôles et les tournois où elle peut s'inscrire. */
export type FreeTeam = {
  team: TournamentTeam
  game: Game
}
