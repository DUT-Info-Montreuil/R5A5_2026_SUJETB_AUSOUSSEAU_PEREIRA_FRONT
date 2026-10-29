// Formes JSON renvoyées par le back, relevées sur son /openapi.json (dépôt BACK, commit 1f716d1).
// Les événements Socket.IO réutilisent les mêmes formes (src/realtime/socketIoNotifier.ts du back).
// Si le back change une réponse, seuls ce fichier et les fonctions de conversion des services changent.

/** Collection paginée : { "<liste>": [...], "pagination": { limit, offset, total } }. */
export type Page<K extends string, T> = { [key in K]: T[] } & {
  pagination: { limit: number; offset: number; total: number }
}

/** Extrait la liste d'une réponse, qu'elle soit paginée ({ games: [...] }) ou un tableau nu. */
export function listOf<T>(data: unknown, key: string): T[] {
  if (Array.isArray(data)) return data as T[]
  const list = (data as Record<string, unknown> | null)?.[key]
  return Array.isArray(list) ? (list as T[]) : []
}

export type GameRoleDto = {
  id: number
  name: string
}

/** GET /api/games */
export type GameDto = {
  id: number
  name: string
  roles: GameRoleDto[]
}

export type TournamentStatus =
  | 'registration_open'
  | 'registration_closed'
  | 'in_progress'
  | 'finished'

/** Élément de GET /api/tournaments. */
export type TournamentDto = {
  id: number
  name: string
  status: TournamentStatus
  game: { id: number; name: string }
  teamCount: number
  /** Date de clôture prévue des inscriptions, indicative (fixée par l'admin). */
  registrationClosesAt: string | null
  createdAt: string
  closedAt: string | null
  startedAt: string | null
  finishedAt: string | null
}

export type MemberDto = {
  userId: number
  username: string
  role: GameRoleDto | null
  isCaptain: boolean
  joinedAt: string
}

/** GET /api/teams/:id, élément de GET /api/tournaments/:id/teams, événement team:updated. */
export type TeamDto = {
  id: number
  /** null : équipe hors tournoi. */
  tournamentId: number | null
  /** Jeu de l'équipe ; pour une équipe inscrite, celui du tournoi. */
  game: { id: number; name: string }
  name: string
  isEliminated: boolean
  /** Équipe privée : les nouvelles demandes sont refusées (409 TEAM_PRIVATE). */
  visibility: TeamVisibility
  createdAt: string
  members: MemberDto[]
}

export type TeamVisibility = 'open' | 'private'

/** Élément de GET /api/tournaments/:id/matches, événement match:updated. */
export type MatchDto = {
  id: number
  tournamentId: number
  round: number
  position: number
  teamAId: number | null
  teamBId: number | null
  scoreA: number | null
  scoreB: number | null
  winnerId: number | null
  isForfeit: boolean
  status: 'pending' | 'ready' | 'finished'
  /** Horaire prévu, indicatif (fixé par l'admin). */
  scheduledAt: string | null
  validatedAt: string | null
}

/** GET /api/tournaments/:id → { tournament }, événement tournament:updated (sans enveloppe). */
export type TournamentDetailDto = TournamentDto & {
  teams: TeamDto[]
  matches: MatchDto[]
}

/** Élément de GET /api/teams/:id/join-requests et /api/me/join-requests, événements joinRequest:*. */
export type JoinRequestDto = {
  id: number
  teamId: number
  /** null : demande vers une équipe hors tournoi. */
  tournamentId: number | null
  team: { id: number; name: string }
  user: { id: number; username: string }
  /** rejected : refus du capitaine ou clôture ; cancelled : par le joueur, ou entré dans une autre équipe. */
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled'
  createdAt: string
  decidedAt: string | null
}

/** Auteur à null : compte supprimé depuis. */
export type MessageDto = {
  id: number
  teamId: number
  author: { id: number; username: string } | null
  content: string
  createdAt: string
}

/** Élément de GET /api/me/teams : `tournament` à null pour une équipe hors tournoi. */
export type MyTeamDto = TeamDto & { tournament: TournamentDto | null }
