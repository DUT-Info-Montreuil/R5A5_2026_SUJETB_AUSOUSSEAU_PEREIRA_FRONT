import { MY_TEAMS } from '../data/myTeams'
import type { MyTeam } from '../types/team'
import { ApiError } from './api'

// Reste du faux back en mémoire : seule la salle du conseil (services/chat.ts) l'utilise encore.
// Il disparaît quand elle passe sur l'API.

const ELIMINATED = new Set(['t2'])

export const db = {
  myTeams: structuredClone(MY_TEAMS) as MyTeam[],
}

export function findTournament(id: string) {
  if (!db.myTeams.some((t) => t.tournamentId === id))
    throw new ApiError(404, 'Tournoi introuvable.')
  return { eliminated: ELIMINATED.has(id) }
}
