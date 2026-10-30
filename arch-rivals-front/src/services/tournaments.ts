import type { Tournament } from '../types/tournament'
import { api } from './api'
import { listOf, type TournamentDetailDto, type TournamentDto } from './dto'
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

/** `mine` : tournois où le joueur a (ou a eu) une équipe (voir fetchMyTeams). */
export async function fetchTournaments(mine: ReadonlySet<number>): Promise<Tournament[]> {
  const [data, games] = await Promise.all([
    api.get<unknown>(`/tournaments?limit=${PAGE_SIZE}`),
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

/**
 * Tournoi mis en avant sur la page d'accueil : le plus récent en cours, sinon un tournoi à venir
 * (inscriptions closes, puis ouvertes). null s'il n'y en a aucun.
 */
export async function fetchFeaturedTournamentId(): Promise<number | null> {
  for (const status of ['in_progress', 'registration_closed', 'registration_open']) {
    const data = await api.get<unknown>(`/tournaments?status=${status}&limit=1`)
    const [first] = listOf<TournamentDto>(data, 'tournaments')
    if (first) return first.id
  }
  return null
}

/** Dernier tournoi terminé (la liste du back est triée par date de création), ou null. */
export async function fetchLastFinishedTournament(): Promise<Tournament | null> {
  const data = await api.get<unknown>(`/tournaments?status=finished&limit=${PAGE_SIZE}`)
  const [last] = listOf<TournamentDto>(data, 'tournaments').toSorted((a, b) =>
    (b.finishedAt ?? '').localeCompare(a.finishedAt ?? ''),
  )
  return last ? fetchTournament(last.id) : null
}
