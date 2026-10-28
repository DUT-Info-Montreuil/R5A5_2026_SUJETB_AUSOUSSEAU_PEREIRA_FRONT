import type { Tournament } from '../types/tournament'
import { api } from './api'
import { listOf, type TournamentDetailDto, type TournamentDto } from './dto'
import { fetchGames } from './games'
import { toTournament } from './mappers'
import { follow, listen } from './realtime'

// Contrat du back (api-routes.md, routes publiques) :
//   GET /tournaments?search=&status=&limit=&offset=  → { tournaments: TournamentDto[], pagination }
//   GET /tournaments/:id                             → { tournament: TournamentDetailDto }  (404)
// La liste ne contient ni les équipes ni l'arbre : on charge le détail de chaque tournoi pour
// savoir où en est le joueur (son équipe, son prochain match). Une page = 100 tournois au plus.
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

export async function fetchTournaments(): Promise<Tournament[]> {
  const data = await api.get<unknown>(`/tournaments?limit=${PAGE_SIZE}`)
  const ids = listOf<TournamentDto>(data, 'tournaments').map((t) => t.id)
  return Promise.all(ids.map(fetchTournament))
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
