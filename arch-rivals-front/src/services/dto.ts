// Formes JSON renvoyées par le back, relevées sur son /openapi.json (dépôt BACK, commit eb70249).
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
  tournamentId: number
  name: string
  isEliminated: boolean
  createdAt: string
  members: MemberDto[]
}

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
  validatedAt: string | null
}

/** GET /api/tournaments/:id → { tournament }, événement tournament:updated (sans enveloppe). */
export type TournamentDetailDto = TournamentDto & {
  teams: TeamDto[]
  matches: MatchDto[]
}

export type JoinRequestDto = {
  id: number
  teamId: number
  user: { id: number; username: string }
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled'
  createdAt: string
  decidedAt: string | null
}
