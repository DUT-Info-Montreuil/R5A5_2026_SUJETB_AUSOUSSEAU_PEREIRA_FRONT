import type { Game } from '../types/game'
import type { FreeTeam } from '../types/team'
import type { MyJoinRequest } from '../types/tournament'
import { api, isMissingRoute } from './api'
import { listOf, type JoinRequestDto, type MyTeamDto, type TeamDto } from './dto'
import { fetchGames } from './games'
import { toTeam } from './mappers'
import { listen } from './realtime'

// Contrat du back (api-routes.md), actions lancées depuis la liste des tournois :
//   POST   /tournaments/:id/teams  { name }  → 201 { team }         (le joueur devient capitaine)
//   POST   /teams/:id/join-requests          → 201 { joinRequest }  (sans corps)
//   DELETE /join-requests/:id                → 204                  (l'auteur annule sa demande)
//   GET    /me/join-requests?status=pending  → { joinRequests, pagination }  (mes demandes)
//   GET    /me/teams                         → { teams: (TeamDto & { tournament })[], pagination }
// Équipes hors tournoi (pas encore dans le back, voir BACK-ATTENDU.md § 7) :
//   POST   /teams  { name, gameId }          → 201 { team }   (tournamentId: null, capitaine)
//   GET    /teams?free=true                  → { teams, pagination }  (équipes hors tournoi)
//   POST   /teams/:id/register { tournamentId } → { team }   (capitaine : inscrit l'équipe)
//   Temps réel : joinRequest:updated, reçu par l'auteur quand sa demande est acceptée, refusée
//   (par le capitaine ou à la clôture) ou annulée (entré dans une autre équipe du tournoi).
// Erreurs : 409 si une règle refuse (déjà une équipe, équipe complète, inscriptions closes…),
// avec le message du back. Après une écriture, le front relit le tournoi plutôt que de
// reconstruire l'état à partir de la réponse.

export async function createTeam(tournamentId: number, name: string): Promise<void> {
  await api.post(`/tournaments/${tournamentId}/teams`, { name })
}

const PAGE_SIZE = 100

function toFreeTeams(dtos: TeamDto[], games: readonly Game[]): FreeTeam[] {
  return dtos.flatMap((dto) => {
    const game = games.find((g) => g.id === dto.game?.id)
    return dto.tournamentId === null && game ? [{ team: toTeam(dto), game }] : []
  })
}

/** Mes équipes : tournois où j'en ai une, et mes équipes hors tournoi. */
export async function fetchMyTeams(): Promise<{
  tournamentIds: Set<number>
  freeTeams: FreeTeam[]
}> {
  const [data, games] = await Promise.all([
    api.get<unknown>(`/me/teams?limit=${PAGE_SIZE}`),
    fetchGames(),
  ])
  const teams = listOf<MyTeamDto>(data, 'teams')
  return {
    tournamentIds: new Set(teams.flatMap((t) => (t.tournamentId === null ? [] : [t.tournamentId]))),
    freeTeams: toFreeTeams(teams, games),
  }
}

/** Route absente du back : on ne la redemande pas avant le prochain chargement de l'app. */
let freeTeamsRouteMissing = false

/** Équipes hors tournoi de tous les joueurs ; aucune tant que le back n'a pas la route. */
export async function fetchFreeTeams(): Promise<FreeTeam[]> {
  if (freeTeamsRouteMissing) return []
  try {
    const [data, games] = await Promise.all([
      api.get<unknown>(`/teams?free=true&limit=${PAGE_SIZE}`),
      fetchGames(),
    ])
    return toFreeTeams(listOf<TeamDto>(data, 'teams'), games)
  } catch (err) {
    if (!isMissingRoute(err)) throw err
    freeTeamsRouteMissing = true
    return []
  }
}

/** Crée une équipe hors tournoi ; renvoie son identifiant. */
export async function createFreeTeam(name: string, gameId: number): Promise<number> {
  const { team } = await api.post<{ team: TeamDto }>('/teams', { name, gameId })
  return team.id
}

/** Inscrit une équipe hors tournoi à un tournoi aux inscriptions ouvertes (capitaine). */
export async function registerTeam(teamId: number, tournamentId: number): Promise<void> {
  await api.post(`/teams/${teamId}/register`, { tournamentId })
}

/** Renvoie l'identifiant de la demande, seul moyen de l'annuler ensuite. */
export async function requestToJoin(teamId: number): Promise<number> {
  const { joinRequest } = await api.post<{ joinRequest: JoinRequestDto }>(
    `/teams/${teamId}/join-requests`,
  )
  return joinRequest.id
}

export async function cancelJoinRequest(requestId: number): Promise<void> {
  await api.delete(`/join-requests/${requestId}`)
}

const toMyRequest = (dto: JoinRequestDto): MyJoinRequest => ({
  id: dto.id,
  tournamentId: dto.tournamentId,
  teamId: dto.team.id,
  teamName: dto.team.name,
})

/** Demandes en attente du joueur connecté (une seule par tournoi côté front). */
export async function fetchMyPendingRequests(): Promise<MyJoinRequest[]> {
  const data = await api.get<unknown>('/me/join-requests?status=pending&limit=100')
  return listOf<JoinRequestDto>(data, 'joinRequests').map(toMyRequest)
}

/** Une de mes demandes n'est plus en attente ; renvoie la fonction qui coupe l'écoute. */
export function onMyRequestDecided(
  onDecided: (request: MyJoinRequest, status: JoinRequestDto['status']) => void,
): () => void {
  return listen('joinRequest:updated', (dto) => {
    if (dto.status !== 'pending') onDecided(toMyRequest(dto), dto.status)
  })
}
