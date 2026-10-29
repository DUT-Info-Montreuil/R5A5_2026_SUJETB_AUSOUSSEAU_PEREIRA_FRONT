import type { Tournament, TournamentTeam } from '../types/tournament'
import { PLAYERS_PER_TEAM, TEAMS_PER_TOURNAMENT } from './tournaments'

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

/**
 * Tournois où une équipe hors tournoi peut s'inscrire : même jeu, inscriptions ouvertes, place
 * libre, et aucun de ses membres déjà engagé dans une autre équipe du tournoi (B-07).
 */
export function registrableTournaments(
  tournaments: readonly Tournament[],
  team: TournamentTeam,
  gameId: number,
): Tournament[] {
  const members = new Set(team.members.map((m) => m.userId))
  return tournaments.filter(
    (t) =>
      t.gameId === gameId &&
      t.state === 'ouvertes' &&
      t.teams.length < TEAMS_PER_TOURNAMENT &&
      !t.teams.some((other) => other.members.some((m) => members.has(m.userId))),
  )
}
