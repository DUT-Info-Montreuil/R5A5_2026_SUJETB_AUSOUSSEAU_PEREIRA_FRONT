import type { MyJoinRequest } from '../types/tournament'
import { api } from './api'
import { listOf, type JoinRequestDto } from './dto'
import { listen } from './realtime'

// Contrat du back (api-routes.md), actions lancées depuis la liste des tournois :
//   POST   /tournaments/:id/teams  { name }  → 201 { team }         (le joueur devient capitaine)
//   POST   /teams/:id/join-requests          → 201 { joinRequest }  (sans corps)
//   DELETE /join-requests/:id                → 204                  (l'auteur annule sa demande)
//   GET    /me/join-requests?status=pending  → { joinRequests, pagination }  (mes demandes)
//   Temps réel : joinRequest:updated, reçu par l'auteur quand sa demande est acceptée, refusée
//   (par le capitaine ou à la clôture) ou annulée (entré dans une autre équipe du tournoi).
// Erreurs : 409 si une règle refuse (déjà une équipe, équipe complète, inscriptions closes…),
// avec le message du back. Après une écriture, le front relit le tournoi plutôt que de
// reconstruire l'état à partir de la réponse.

export async function createTeam(tournamentId: number, name: string): Promise<void> {
  await api.post(`/tournaments/${tournamentId}/teams`, { name })
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
