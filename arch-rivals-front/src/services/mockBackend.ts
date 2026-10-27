import { BRACKETS } from '../data/brackets'
import { TEAM_DIRECTORY } from '../data/teamDirectory'
import { TOURNAMENTS } from '../data/tournaments'
import type { TeamListing, Tournament, TournamentDetail } from '../types/tournament'
import { ApiError } from './api'

// Faux back en mémoire : les écritures (création d'équipe, demandes…) survivent d'une requête
// à l'autre, jusqu'au rechargement de la page. Il disparaît quand les vraies routes arrivent :
// seuls services/tournaments.ts et services/teams.ts l'utilisent.

export const db = {
  tournaments: TOURNAMENTS.map((t) => ({ ...t })) as Tournament[],
  teams: TEAM_DIRECTORY.map((t) => ({ ...t })) as TeamListing[],
}

/** Copie renvoyée au front, comme le ferait une réponse JSON. */
export function toDetail(tournament: Tournament): TournamentDetail {
  const bracket = BRACKETS[tournament.id]
  return structuredClone({
    ...tournament,
    teams: bracket?.teams ?? null,
    results: bracket?.results ?? {},
  })
}

export function findTournament(id: string): Tournament {
  const tournament = db.tournaments.find((t) => t.id === id)
  if (!tournament) throw new ApiError(404, 'Tournoi introuvable.')
  return tournament
}
