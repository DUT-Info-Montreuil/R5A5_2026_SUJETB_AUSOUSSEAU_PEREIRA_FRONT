import type { Team } from './tournament'

export type TeamVisibility = 'open' | 'closed'

export type TeamMember = {
  id: string
  username: string
  /** Rôle de jeu (voir GAME_ROLES). */
  role: string
}

/** Demande d'un joueur pour rejoindre l'équipe, que seul le capitaine voit et traite. */
export type IncomingRequest = {
  id: string
  username: string
  /** Présentation libre : rôle visé, IUT… */
  note: string
}

/** Équipe du joueur connecté dans un tournoi, vue de l'intérieur. */
export type MyTeam = {
  tournamentId: string
  name: Team
  captainId: string
  members: TeamMember[]
  /** Une équipe fermée n'accepte aucune demande et n'apparaît pas parmi celles qui recrutent. */
  visibility: TeamVisibility
  /** Demandes en attente (vides si le joueur n'est pas capitaine). */
  requests: IncomingRequest[]
  /** Le membre qui correspond au joueur connecté (fourni par le serveur). */
  myMemberId: string
}
