import type { Game } from '../types/game'
import type { Match, Tournament, TournamentState, TournamentTeam } from '../types/tournament'
import type { MatchDto, TeamDto, TournamentDetailDto, TournamentStatus } from './dto'

// Conversion des réponses du back vers les types du front : le seul endroit qui connaît dto.ts.

const STATES: Record<TournamentStatus, TournamentState> = {
  registration_open: 'ouvertes',
  registration_closed: 'closes',
  in_progress: 'cours',
  finished: 'termine',
}

export const toTeam = (dto: TeamDto): TournamentTeam => ({
  id: dto.id,
  tournamentId: dto.tournamentId,
  name: dto.name,
  isEliminated: dto.isEliminated,
  visibility: dto.visibility,
  createdAt: dto.createdAt,
  members: dto.members.map((m) => ({
    userId: m.userId,
    username: m.username,
    role: m.role && { id: m.role.id, name: m.role.name },
    isCaptain: m.isCaptain,
    joinedAt: m.joinedAt,
  })),
})

const toMatch = (dto: MatchDto): Match => ({
  id: dto.id,
  round: dto.round,
  position: dto.position,
  teamAId: dto.teamAId,
  teamBId: dto.teamBId,
  scoreA: dto.scoreA,
  scoreB: dto.scoreB,
  winnerId: dto.winnerId,
  isForfeit: dto.isForfeit,
  status: dto.status,
  scheduledAt: dto.scheduledAt,
})

/** `games` fournit les rôles du jeu du tournoi (le détail du tournoi ne les contient pas). */
export const toTournament = (dto: TournamentDetailDto, games: readonly Game[]): Tournament => ({
  id: dto.id,
  name: dto.name,
  gameId: dto.game.id,
  game: dto.game.name,
  roles: games.find((g) => g.id === dto.game.id)?.roles ?? [],
  state: STATES[dto.status],
  registrationClosesAt: dto.registrationClosesAt,
  createdAt: dto.createdAt,
  closedAt: dto.closedAt,
  startedAt: dto.startedAt,
  finishedAt: dto.finishedAt,
  teams: dto.teams.map(toTeam),
  matches: dto.matches.map(toMatch),
})
