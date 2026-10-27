import type { MyTeam } from '../types/team'
import { PLAYERS_PER_TEAM } from './tournaments'

/** Nombre de places libres dans l'effectif. */
export function missingPlayers(team: MyTeam) {
  return Math.max(0, PLAYERS_PER_TEAM - team.members.length)
}
