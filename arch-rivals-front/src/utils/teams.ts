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
 * Tournois où une équipe hors tournoi peut demander son inscription : même jeu, inscriptions
 * ouvertes, place libre. Un conflit de joueurs n'exclut pas le tournoi : il est signalé
 * (voir registrationConflicts).
 */
export function registrableTournaments(
  tournaments: readonly Tournament[],
  gameId: number,
): Tournament[] {
  return tournaments.filter(
    (t) => t.gameId === gameId && t.state === 'ouvertes' && t.teams.length < TEAMS_PER_TOURNAMENT,
  )
}

/** Un membre de l'équipe déjà engagé dans le tournoi avec une autre équipe (B-07). */
export type RegistrationConflict = { username: string; teamName: string }

export function registrationConflicts(
  tournament: Tournament,
  team: TournamentTeam,
): RegistrationConflict[] {
  const members = new Set(team.members.map((m) => m.userId))
  return tournament.teams.flatMap((other) =>
    other.members
      .filter((m) => members.has(m.userId))
      .map((m) => ({ username: m.username, teamName: other.name })),
  )
}

/** « Gauvain joue déjà avec « Table Ronde » », plusieurs joueurs séparés par des virgules. */
export function conflictText(conflicts: readonly RegistrationConflict[]) {
  const who = conflicts.map((c) => `${c.username} (« ${c.teamName} »)`)
  const list = who.length > 1 ? `${who.slice(0, -1).join(', ')} et ${who.at(-1)}` : who[0]
  return conflicts.length > 1
    ? `${list} sont déjà engagés dans ce tournoi`
    : `${conflicts[0]?.username} joue déjà avec « ${conflicts[0]?.teamName} » dans ce tournoi`
}
