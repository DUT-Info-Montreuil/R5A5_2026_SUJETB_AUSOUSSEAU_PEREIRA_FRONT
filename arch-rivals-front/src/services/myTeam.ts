import type { IncomingRequest } from '../types/team'
import { api } from './api'
import { listOf, type JoinRequestDto } from './dto'
import { listen } from './realtime'

// Contrat du back (api-routes.md), actions sur l'équipe du joueur :
//   PATCH  /teams/:id                       { name }      → { team }   capitaine (B-09)
//   DELETE /teams/:id                                     → 204        capitaine (B-10)
//   POST   /teams/:id/transfer-captaincy    { userId }    → { team }   capitaine (B-09)
//   PATCH  /teams/:id/members/:userId       { roleId }    → { team }   capitaine (B-08, B-09)
//   DELETE /teams/:id/members/:userId                     → { team }   capitaine (B-09, B-17)
//   DELETE /teams/:id/members/me                          → 204        membre, capitaine compris (B-06)
//   GET    /teams/:id/join-requests                       → { joinRequests, pagination }  capitaine
//   POST   /join-requests/:id/accept | /reject            → { joinRequest }               capitaine
//   Temps réel : joinRequest:new, reçu par le capitaine dans son salon personnel.
// Toute modification est refusée (409) une fois les inscriptions closes (B-11). Si le capitaine
// quitte l'équipe, le membre arrivé le plus tôt prend la main ; s'il était seul, l'équipe est
// supprimée. Après une écriture, le front relit le tournoi (useMyTeams).

export async function renameTeam(teamId: number, name: string): Promise<void> {
  await api.patch(`/teams/${teamId}`, { name })
}

export async function deleteTeam(teamId: number): Promise<void> {
  await api.delete(`/teams/${teamId}`)
}

export async function transferCaptaincy(teamId: number, userId: number): Promise<void> {
  await api.post(`/teams/${teamId}/transfer-captaincy`, { userId })
}

export async function setMemberRole(
  teamId: number,
  userId: number,
  roleId: number | null,
): Promise<void> {
  await api.patch(`/teams/${teamId}/members/${userId}`, { roleId })
}

export async function kickMember(teamId: number, userId: number): Promise<void> {
  await api.delete(`/teams/${teamId}/members/${userId}`)
}

export async function leaveTeam(teamId: number): Promise<void> {
  await api.delete(`/teams/${teamId}/members/me`)
}

export async function fetchJoinRequests(teamId: number): Promise<IncomingRequest[]> {
  const data = await api.get<unknown>(`/teams/${teamId}/join-requests?limit=100`)
  return listOf<JoinRequestDto>(data, 'joinRequests').map((r) => ({
    id: r.id,
    userId: r.user.id,
    username: r.user.username,
    createdAt: r.createdAt,
  }))
}

export async function acceptJoinRequest(requestId: number): Promise<void> {
  await api.post(`/join-requests/${requestId}/accept`)
}

export async function rejectJoinRequest(requestId: number): Promise<void> {
  await api.post(`/join-requests/${requestId}/reject`)
}

/**
 * Équipe modifiée par un autre membre (arrivée, départ, rôle, capitaine), poussée sur le salon
 * de l'équipe ; renvoie la fonction qui coupe l'écoute.
 */
export function onTeamUpdated(onUpdate: (tournamentId: number) => void): () => void {
  return listen('team:updated', (team) => onUpdate(team.tournamentId))
}

/** Nouvelle demande reçue par une de mes équipes (capitaine) ; renvoie la fonction qui coupe l'écoute. */
export function onJoinRequestReceived(onReceived: (teamId: number) => void): () => void {
  return listen('joinRequest:new', (request) => onReceived(request.teamId))
}

/** Nombre de demandes en attente (badge « Équipes » du capitaine). */
export async function countJoinRequests(teamId: number): Promise<number> {
  const data = await api.get<{ pagination?: { total?: number } }>(
    `/teams/${teamId}/join-requests?limit=1`,
  )
  return data.pagination?.total ?? 0
}
