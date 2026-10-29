import type { GameRole } from './game'

/** Nom d'équipe (arbre interactif de la page d'accueil). */
export type Team = string

export type BracketSize = 4 | 8 | 16

export type Side = 'a' | 'b'

export type Podium = {
  first: Team
  second: Team
  third: Team
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

export type TournamentTeam = {
  id: number
  tournamentId: number
  name: string
  isEliminated: boolean
  /** private : l'équipe n'accepte plus de nouvelles demandes. */
  visibility: 'open' | 'private'
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
  tournamentId: number
  teamId: number
  teamName: string
}
