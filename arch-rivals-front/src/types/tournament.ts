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

/** Place du joueur connecté dans un tournoi (null s'il n'a pas d'équipe). */
export type MyTeamSummary = {
  name: Team
  role: string
  isCaptain: boolean
}

export type Tournament = {
  id: string
  name: string
  /** Nom du jeu (voir GET /api/games). */
  game: string
  state: TournamentState
  /** Date affichée telle quelle (« Depuis le 18 oct. », « 6 déc. · 18h00 »…). */
  date: string
  /** Nombre d'équipes engagées (sur 8). */
  registeredTeams: number
  /** Fin des inscriptions, uniquement tant qu'elles sont ouvertes. */
  closing?: string
  myTeam: MyTeamSummary | null
  /** Demande en attente du joueur (une seule par tournoi), null s'il n'en a pas. */
  myRequest: JoinRequest | null
}

export type JoinRequest = {
  teamId: string
  teamName: Team
}

/** Équipe telle qu'on la voit de l'extérieur (annuaire, équipes qui recrutent). */
export type TeamListing = {
  id: string
  name: Team
  tournamentId: string
  captain: string
  memberCount: number
  /** Une équipe fermée n'accepte aucune demande et n'apparaît pas parmi celles qui recrutent. */
  visibility: 'open' | 'closed'
}

/** Résultat (ou programmation) d'un match, saisi par l'administrateur. */
export type MatchResult =
  /** `time` est affiché tel quel ; `startsAt` (ISO 8601) sert au compte à rebours. */
  | { kind: 'scheduled'; time: string; startsAt?: string }
  | { kind: 'live'; score: [number, number] }
  | { kind: 'done'; score: [number, number] }
  /** `forfeit` : côté de l'équipe déclarée forfait, son adversaire est qualifié. */
  | { kind: 'forfeit'; forfeit: Side }

export type TournamentDetail = Tournament & {
  /** Les 8 équipes dans l'ordre du tirage, absentes tant que les inscriptions sont ouvertes. */
  teams: Team[] | null
  /** Clé "tour-match" (ex. "0-3" = 4e quart, "2-0" = finale), comme dans useBracket. */
  results: Record<string, MatchResult>
}
