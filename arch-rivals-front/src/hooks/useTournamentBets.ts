import { useCallback, useEffect, useState } from 'react'
import { cancelBet, fetchBetPools, fetchMyBets, placeBet, subscribeToBets } from '../services/bets'
import type { BetPool, MyBet } from '../types/bet'
import { useWallet } from './useWallet'

/** `version` : nombre de mises à jour reçues, pour relire ce qui en dépend (classement). */
type Loaded = { tournamentId: number; pools: BetPool[]; failed: boolean; version: number }

/**
 * Paris d'un tournoi : cagnottes de chaque match (publiques, en direct) et, pour un parieur
 * connecté, ses paris. Les cagnottes poussées par le back signalent aussi un match réglé : on
 * relit alors mes paris (gagné, perdu, remboursé).
 */
export function useTournamentBets(tournamentId: number, bettor: boolean) {
  const { setBalance } = useWallet()
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [myBets, setMyBets] = useState<MyBet[]>([])
  const current = loaded?.tournamentId === tournamentId ? loaded : null

  const loadMine = useCallback(() => {
    if (!bettor) return Promise.resolve()
    return fetchMyBets(tournamentId).then(setMyBets)
  }, [tournamentId, bettor])

  useEffect(() => {
    let cancelled = false
    fetchBetPools(tournamentId)
      .then((pools) => {
        if (!cancelled) setLoaded({ tournamentId, pools, failed: false, version: 0 })
      })
      .catch(() => {
        if (!cancelled) setLoaded({ tournamentId, pools: [], failed: true, version: 0 })
      })
    loadMine().catch(() => {})

    const unsubscribe = subscribeToBets(tournamentId, (pools) => {
      setLoaded((prev) => ({
        tournamentId,
        pools,
        failed: false,
        version: (prev?.tournamentId === tournamentId ? prev.version : 0) + 1,
      }))
      loadMine().catch(() => {})
    })
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [tournamentId, loadMine])

  // Les erreurs remontent à l'appelant, qui les affiche sous le formulaire du match.
  const place = useCallback(
    async (matchId: number, teamId: number, amount: number) => {
      setBalance(await placeBet(matchId, teamId, amount))
      await loadMine()
    },
    [setBalance, loadMine],
  )

  const cancel = useCallback(
    async (matchId: number) => {
      setBalance(await cancelBet(matchId))
      await loadMine()
    },
    [setBalance, loadMine],
  )

  return {
    pools: current?.pools ?? [],
    status: !current ? 'loading' : current.failed ? 'error' : 'ready',
    version: current?.version ?? 0,
    myBets: bettor ? myBets : [],
    place,
    cancel,
  } as const
}
