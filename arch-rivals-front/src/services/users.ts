import type { FeatResult, ProfileStats } from '../types/profile'
import { api } from './api'

// Contrat du back (api-routes.md), profil public d'un joueur :
//   GET /users/:id/stats?limit= → { tournaments, matchesPlayed, matchesWon, titles,
//                                   history: [{ tournament, finishedAt, result }], pagination }
// `tournaments` compte les tournois lancés ou terminés ; `history` ne garde que les terminés,
// du plus récent au plus ancien. Un forfait compte comme un match joué. 404 USER_NOT_FOUND.

type StatsDto = {
  tournaments: number
  matchesPlayed: number
  matchesWon: number
  titles: number
  history: {
    tournament: { id: number; name: string; game: { id: number; name: string } }
    finishedAt: string | null
    result: FeatResult
  }[]
}

export async function fetchProfileStats(
  userId: number,
  historyLimit: number,
): Promise<ProfileStats> {
  const dto = await api.get<StatsDto>(`/users/${userId}/stats?limit=${historyLimit}`)
  return {
    tournaments: dto.tournaments,
    winRate: dto.matchesPlayed ? Math.round((dto.matchesWon / dto.matchesPlayed) * 100) : null,
    titles: dto.titles,
    history: dto.history.map((h) => ({
      tournamentId: h.tournament.id,
      name: `${h.tournament.name} · ${h.tournament.game.name}`,
      result: h.result,
    })),
  }
}
