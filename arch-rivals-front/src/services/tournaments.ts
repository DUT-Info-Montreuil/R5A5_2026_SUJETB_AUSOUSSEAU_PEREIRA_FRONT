import type { Tournament } from '../types/tournament'
import { api } from './api'
import { listOf, type TeamDto, type TournamentDetailDto, type TournamentDto } from './dto'
import { fetchGames } from './games'
import { toTournament } from './mappers'
import { follow, listen } from './realtime'

// Contrat du back (api-routes.md, routes publiques) :
//   GET /tournaments?search=&status=&limit=&offset=  → { tournaments: TournamentDto[], pagination }
//   GET /tournaments/:id                             → { tournament: TournamentDetailDto }  (404)
//   GET /me/teams                                    → { teams: (TeamDto & { tournament })[], pagination }
// La liste ne contient ni les équipes ni l'arbre. On lit le détail des tournois qui en ont besoin :
// ceux pas encore terminés (équipes qui recrutent, « Toutes les équipes », prochain match) et ceux
// où le joueur a joué (son résultat). Les autres tournois terminés restent un simple résumé.
// Une page = 100 tournois au plus.
// Temps réel (B-19, ouvert à tous) : salon `tournament:join`, événements `tournament:updated`
// (état, nouvelle équipe, résultat) et `match:updated` (résultat saisi, forfait).

const PAGE_SIZE = 100

export async function fetchTournament(id: number): Promise<Tournament> {
  const [{ tournament }, games] = await Promise.all([
    api.get<{ tournament: TournamentDetailDto }>(`/tournaments/${id}`),
    fetchGames(),
  ])
  return toTournament(tournament, games)
}

/** Tournois où le joueur a (ou a eu) une équipe. */
async function fetchMyTournamentIds(): Promise<Set<number>> {
  const data = await api.get<unknown>(`/me/teams?limit=${PAGE_SIZE}`)
  return new Set(listOf<TeamDto>(data, 'teams').map((team) => team.tournamentId))
}

export async function fetchTournaments(): Promise<Tournament[]> {
  const [data, mine, games] = await Promise.all([
    api.get<unknown>(`/tournaments?limit=${PAGE_SIZE}`),
    fetchMyTournamentIds(),
    fetchGames(),
  ])
  return Promise.all(
    listOf<TournamentDto>(data, 'tournaments').map((summary) =>
      summary.status !== 'finished' || mine.has(summary.id)
        ? fetchTournament(summary.id)
        : toTournament({ ...summary, teams: [], matches: [] }, games),
    ),
  )
}

/**
 * Prévient à chaque changement du tournoi poussé par le back ; renvoie la fonction qui coupe
 * l'abonnement. Le front relit alors le tournoi : le back reste la seule source de vérité.
 */
export function subscribeToTournament(id: number, onChange: () => void): () => void {
  const offTournament = listen('tournament:updated', (t) => {
    if (t.id === id) onChange()
  })
  const offMatch = listen('match:updated', (m) => {
    if (m.tournamentId === id) onChange()
  })
  const leave = follow('tournament', id)
  return () => {
    offTournament()
    offMatch()
    leave()
  }
}
