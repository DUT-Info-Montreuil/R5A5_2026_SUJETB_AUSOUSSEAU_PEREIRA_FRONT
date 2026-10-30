import type { GameRole } from './game'

/** Podium d'un tournoi terminé : sans petite finale, les deux demi-finalistes battus sont 3es. */
export type Podium = {
  tournament: string
  first: string
  second: string
  third: string[]
}

/** Les quatre états d'un tournoi : ce qui est permis dépend de l'état. */
export type TournamentState = 'ouvertes' | 'closes' | 'cours' | 'termine'

export type TeamMember = {
  userId: number
  username: string
  /** null tant que le capitaine n'a pas attribué de rôle (équipe incomplète au lancement). */
  role: GameRole | null
  isCaptain: boolean
  joinedAt: string
}

/** private : l'équipe n'accepte plus de nouvelles demandes (les demandes en attente restent). */
export type TeamVisibility = 'open' | 'private'

export type TournamentTeam = {
  id: number
  /** null : équipe hors tournoi, pas encore inscrite. */
  tournamentId: number | null
  name: string
  isEliminated: boolean
  visibility: TeamVisibility
  createdAt: string
  members: TeamMember[]
}

/** pending : équipes pas encore connues ; ready : jouable ; finished : résultat validé. */
export type MatchStatus = 'pending' | 'ready' | 'finished'

export type Match = {
  id: number
  /** 1 = quarts, 2 = demies, 3 = finale. */
  round: number
  position: number
  teamAId: number | null
  teamBId: number | null
  scoreA: number | null
  scoreB: number | null
  winnerId: number | null
  isForfeit: boolean
  status: MatchStatus
  /** Horaire prévu, indicatif ; null tant que l'admin ne l'a pas fixé. */
  scheduledAt: string | null
}

export type Tournament = {
  id: number
  name: string
  gameId: number
  game: string
  /** Rôles de jeu proposés dans les équipes de ce tournoi (GET /api/games). */
  roles: GameRole[]
  state: TournamentState
  /** Clôture prévue des inscriptions, indicative. */
  registrationClosesAt: string | null
  createdAt: string
  closedAt: string | null
  startedAt: string | null
  finishedAt: string | null
  teams: TournamentTeam[]
  /** Vide tant que les inscriptions sont ouvertes : l'arbre est tiré à la clôture. */
  matches: Match[]
}

/** Demande d'adhésion envoyée par le joueur connecté (une seule par tournoi). */
export type MyJoinRequest = {
  id: number
  /** null : demande vers une équipe hors tournoi. */
  tournamentId: number | null
  teamId: number
  teamName: string
}
