import { useEffect, useState } from 'react'
import { ApiError } from '../services/api'
import { fetchTournament } from '../services/tournaments'
import type { TournamentDetail } from '../types/tournament'

type Status = 'loading' | 'ready' | 'not-found' | 'error'

type Loaded = {
  id: string
  tournament: TournamentDetail | null
  status: Exclude<Status, 'loading'>
}

/** Intervalle de rafraîchissement d'un tournoi en cours (en attendant le temps réel). */
const LIVE_REFRESH_MS = 15_000

export function useTournament(id: string) {
  const [loaded, setLoaded] = useState<Loaded | null>(null)

  // Tant que la réponse pour cet id n'est pas arrivée, on est en chargement.
  const current = loaded?.id === id ? loaded : null
  const status: Status = current?.status ?? 'loading'
  const tournament = current?.tournament ?? null
  const live = tournament?.state === 'cours'

  useEffect(() => {
    let cancelled = false

    fetchTournament(id)
      .then((data) => {
        if (!cancelled) setLoaded({ id, tournament: data, status: 'ready' })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const notFound = err instanceof ApiError && err.status === 404
        setLoaded({ id, tournament: null, status: notFound ? 'not-found' : 'error' })
      })

    return () => {
      cancelled = true
    }
  }, [id])

  // Tournoi en cours : on recharge l'arbre régulièrement, sans recharger la page.
  useEffect(() => {
    if (!live) return
    const timer = setInterval(() => {
      fetchTournament(id)
        .then((data) => setLoaded({ id, tournament: data, status: 'ready' }))
        .catch(() => {
          /* on garde le dernier arbre connu */
        })
    }, LIVE_REFRESH_MS)
    return () => clearInterval(timer)
  }, [id, live])

  return { tournament, status, live }
}
