import type { Team } from './tournament'

export type TeamVisibility = 'open' | 'closed'

export type TeamMember = {
  id: string
  username: string
  /** Rôle de jeu (voir GAME_ROLES). */
  role: string
}

/** Équipe du joueur connecté dans un tournoi, vue de l'intérieur. */
export type MyTeam = {
  tournamentId: string
  name: Team
  captainId: string
  members: TeamMember[]
  /** Une équipe fermée n'accepte aucune demande et n'apparaît pas parmi celles qui recrutent. */
  visibility: TeamVisibility
  /** Le membre qui correspond au joueur connecté (fourni par le serveur). */
  myMemberId: string
}
