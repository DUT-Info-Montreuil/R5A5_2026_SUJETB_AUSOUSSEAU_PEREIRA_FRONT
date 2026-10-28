import { api } from './api'
import type { JoinRequestDto } from './dto'

// Contrat du back (api-routes.md), actions lancées depuis la liste des tournois :
//   POST   /tournaments/:id/teams  { name }  → 201 { team }         (le joueur devient capitaine)
//   POST   /teams/:id/join-requests          → 201 { joinRequest }  (sans corps)
//   DELETE /join-requests/:id                → 204                  (l'auteur annule sa demande)
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
