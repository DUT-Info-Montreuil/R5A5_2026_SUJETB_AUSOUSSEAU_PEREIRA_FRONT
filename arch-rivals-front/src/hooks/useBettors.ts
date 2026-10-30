import { useEffect, useState } from 'react'
import { fetchTournamentBettors, fetchWeeklyBettors } from '../services/bets'
import type { BettorPage, BetWeek } from '../types/bet'

/** Classement d'un tournoi, ou de la semaine (tous tournois). */
export type BettorBoard = { tournamentId: number } | { week: BetWeek }

type Loaded = { key: string; page: BettorPage | null }

/**
 * Une page d'un classement de parieurs, à partir de `offset`. `version` change quand des paris
 * sont réglés (résultat saisi) : la page est relue.
 */
export function useBettors(board: BettorBoard, offset: number, version = 0) {
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const tournamentId = 'tournamentId' in board ? board.tournamentId : null
  const week = 'week' in board ? board.week : null
  const key = `${tournamentId ?? week}:${offset}:${version}`
  const current = loaded?.key === key ? loaded : null

  useEffect(() => {
    let cancelled = false
    const request =
      tournamentId !== null
        ? fetchTournamentBettors(tournamentId, offset)
        : fetchWeeklyBettors(week ?? 'current', offset)
    request
      .then((page) => {
        if (!cancelled) setLoaded({ key, page })
      })
      .catch(() => {
        if (!cancelled) setLoaded({ key, page: null })
      })
    return () => {
      cancelled = true
    }
  }, [key, tournamentId, week, offset])

  return {
    page: current?.page ?? null,
    status: !current ? 'loading' : current.page ? 'ready' : 'error',
  } as const
}
