import type { TournamentTeam } from '../types/tournament'
import { PLAYERS_PER_TEAM } from './tournaments'

export function isCaptain(team: TournamentTeam, userId: number | null) {
  return team.members.some((m) => m.userId === userId && m.isCaptain)
}

/** Nombre de places libres dans l'effectif. */
export function missingPlayers(team: TournamentTeam) {
  return Math.max(0, PLAYERS_PER_TEAM - team.members.length)
}

/** Membres sans rôle : l'équipe compte comme incomplète au lancement (B-08). */
export function membersWithoutRole(team: TournamentTeam) {
  return team.members.filter((m) => m.role === null).length
}
