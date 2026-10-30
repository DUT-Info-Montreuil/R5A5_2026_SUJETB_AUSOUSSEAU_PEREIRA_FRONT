import { api } from './api'
import { resetGames } from './games'

// Routes réservées à l'administrateur (api-routes.md) ; le back refuse les autres en 403 :
//   POST  /tournaments { name, gameId, registrationClosesAt? } → 201 { tournament }   (B-01)
//   PATCH /tournaments/:id { registrationClosesAt }            → { tournament }  inscriptions ouvertes
//   POST  /tournaments/:id/close                               → { tournament }  8 équipes (B-03, B-12)
//   POST  /tournaments/:id/start                               → { tournament }  (B-04)
//   POST  /matches/:id/result { scoreA, scoreB }               → { match }  pas d'égalité (B-13, B-14)
//   POST  /matches/:id/forfeit { teamId }                      → { match }  (B-15)
//   PATCH /matches/:id { scheduledAt }                         → { match }  null efface l'horaire
//   POST  /games { name, roles }                               → 201 { game }
// Le back pousse ensuite `tournament:updated` / `match:updated` : les écrans abonnés relisent le
// tournoi, on n'utilise donc pas les réponses.

/** Renvoie l'identifiant du tournoi créé. */
export async function createTournament(
  name: string,
  gameId: number,
  registrationClosesAt: string | null,
): Promise<number> {
  const { tournament } = await api.post<{ tournament: { id: number } }>('/tournaments', {
    name,
    gameId,
    registrationClosesAt,
  })
  return tournament.id
}

export async function setRegistrationClosesAt(tournamentId: number, date: string | null) {
  await api.patch(`/tournaments/${tournamentId}`, { registrationClosesAt: date })
}

export async function closeRegistrations(tournamentId: number) {
  await api.post(`/tournaments/${tournamentId}/close`)
}

export async function startTournament(tournamentId: number) {
  await api.post(`/tournaments/${tournamentId}/start`)
}

export async function recordResult(matchId: number, scoreA: number, scoreB: number) {
  await api.post(`/matches/${matchId}/result`, { scoreA, scoreB })
}

/** `teamId` : l'équipe qui déclare forfait ; son adversaire est qualifié. */
export async function declareForfeit(matchId: number, teamId: number) {
  await api.post(`/matches/${matchId}/forfeit`, { teamId })
}

export async function scheduleMatch(matchId: number, scheduledAt: string | null) {
  await api.patch(`/matches/${matchId}`, { scheduledAt })
}

export async function createGame(name: string, roles: string[]) {
  await api.post('/games', { name, roles })
  resetGames()
}
